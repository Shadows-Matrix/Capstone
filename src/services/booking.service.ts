import { ApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { bookingRepository } from "@/repositories/booking.repository";
import { providerRepository } from "@/repositories/provider.repository";
import { serviceRepository } from "@/repositories/service.repository";
import type { BookingDto, BookingStatus, Role } from "@/types";
import type { z } from "zod";
import type { bookingCreateSchema } from "@/lib/validation";

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;

/** Allowed transitions between booking statuses. */
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

type BookingDetailRow = {
  id: string;
  status: BookingStatus;
  scheduledAt: Date;
  address: string;
  notes: string | null;
  totalAmount: number;
  createdAt: Date;
  service: { id: string; title: string; durationMins: number };
  customer: { id: string; name: string };
  provider: { id: string; city: string; user: { name: string; phone: string | null } };
  review: { id: string } | null;
};

function toDto(b: BookingDetailRow): BookingDto {
  return {
    id: b.id,
    status: b.status,
    scheduledAt: b.scheduledAt.toISOString(),
    address: b.address,
    notes: b.notes,
    totalAmount: b.totalAmount,
    createdAt: b.createdAt.toISOString(),
    service: b.service,
    customer: b.customer,
    provider: {
      id: b.provider.id,
      name: b.provider.user.name,
      city: b.provider.city,
      phone: b.provider.user.phone,
    },
    hasReview: !!b.review,
  };
}

function canTransition(
  role: Role,
  current: BookingStatus,
  next: BookingStatus,
  isProviderOwner: boolean,
  isCustomerOwner: boolean
): boolean {
  if (!ALLOWED_TRANSITIONS[current].includes(next)) return false;
  if (role === "ADMIN") return true;
  if (next === "CANCELLED") return isProviderOwner || isCustomerOwner;
  // Confirm / start / complete are provider actions
  return role === "PROVIDER" && isProviderOwner;
}

export const bookingService = {
  async create(customerId: string, input: BookingCreateInput): Promise<BookingDto> {
    const offering = await serviceRepository.findById(input.serviceId);
    if (!offering || !offering.isActive) {
      throw new ApiError(404, "Service not found or no longer available", "NOT_FOUND");
    }

    const created = await bookingRepository.create({
      customer: { connect: { id: customerId } },
      provider: { connect: { id: offering.provider.id } },
      service: { connect: { id: offering.id } },
      scheduledAt: input.scheduledAt,
      address: input.address,
      notes: input.notes,
      totalAmount: offering.price,
      status: "CONFIRMED",
    });

    // Auto-confirmed on booking: notify both sides.
    await prisma.notification.createMany({
      data: [
        {
          userId: customerId,
          bookingId: created.id,
          title: "Service booked",
          message: `You have booked "${offering.title}". Your booking is confirmed.`,
          type: "success",
        },
        {
          userId: offering.provider.userId,
          bookingId: created.id,
          title: "New confirmed booking",
          message: `A customer booked "${offering.title}". Please prepare for the scheduled visit.`,
          type: "info",
        },
      ],
    });
    return toDto(created as BookingDetailRow);
  },

  async listForUser(role: Role, userId: string): Promise<BookingDto[]> {
    if (role === "PROVIDER") {
      const profile = await providerRepository.findByUserId(userId);
      if (!profile) throw new ApiError(404, "Provider profile not found", "NOT_FOUND");
      const rows = await bookingRepository.listByProvider(profile.id);
      return rows.map(toDto);
    }
    if (role === "ADMIN") {
      const rows = await bookingRepository.recent(100);
      return rows.map(toDto);
    }
    const rows = await bookingRepository.listByCustomer(userId);
    return rows.map(toDto);
  },

  async updateStatus(bookingId: string, user: { id: string; role: Role }, next: BookingStatus): Promise<BookingDto> {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new ApiError(404, "Booking not found", "NOT_FOUND");

    const isProviderOwner = booking.provider.userId === user.id;
    const isCustomerOwner = booking.customerId === user.id;

    if (!isProviderOwner && !isCustomerOwner && user.role !== "ADMIN") {
      throw new ApiError(403, "You do not have access to this booking", "FORBIDDEN");
    }

    if (!canTransition(user.role, booking.status, next, isProviderOwner, isCustomerOwner)) {
      throw new ApiError(
        409,
        `Cannot change booking from ${booking.status} to ${next}`,
        "INVALID_STATUS_TRANSITION"
      );
    }

    const updated = await bookingRepository.updateStatus(bookingId, next);

    if (next === "COMPLETED") {
      await providerRepository.incrementCompletedJobs(updated.providerId);
    }

    return toDto(updated as BookingDetailRow);
  },
};
