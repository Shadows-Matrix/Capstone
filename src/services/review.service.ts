import { ApiError } from "@/lib/api";
import { bookingRepository } from "@/repositories/booking.repository";
import { reviewRepository } from "@/repositories/review.repository";
import type { ReviewDto } from "@/types";
import type { z } from "zod";
import type { reviewCreateSchema } from "@/lib/validation";

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;

export const reviewService = {
  async create(customerId: string, input: ReviewCreateInput): Promise<ReviewDto> {
    const booking = await bookingRepository.findById(input.bookingId);
    if (!booking) throw new ApiError(404, "Booking not found", "NOT_FOUND");

    if (booking.customerId !== customerId) {
      throw new ApiError(403, "You can only review your own bookings", "FORBIDDEN");
    }
    if (booking.status !== "COMPLETED") {
      throw new ApiError(409, "You can only review completed bookings", "BOOKING_NOT_COMPLETED");
    }

    const existing = await reviewRepository.findByBookingId(booking.id);
    if (existing) throw new ApiError(409, "This booking has already been reviewed", "REVIEW_EXISTS");

    const created = await reviewRepository.create({
      rating: input.rating,
      comment: input.comment,
      booking: { connect: { id: booking.id } },
      customer: { connect: { id: customerId } },
      provider: { connect: { id: booking.providerId } },
    });

    return {
      id: created.id,
      rating: created.rating,
      comment: created.comment,
      createdAt: created.createdAt.toISOString(),
      customerName: booking.customer.name,
    };
  },

  async listForProvider(providerId: string): Promise<ReviewDto[]> {
    const rows = await reviewRepository.listByProvider(providerId);
    return rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      customerName: r.customer.name,
    }));
  },
};
