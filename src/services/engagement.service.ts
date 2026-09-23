import { ApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { serviceRepository } from "@/repositories/service.repository";
import { toServiceListItem } from "@/services/service.service";

/**
 * Saved services, notifications and booking messages.
 * Small, cohesive engagement logic that did not warrant three services.
 */
export const engagementService = {
  // ---------- Saved services ----------
  async listSaved(userId: string) {
    const rows = await prisma.savedService.findMany({
      where: { userId },
      select: { serviceId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    const services = await Promise.all(
      rows.map((r) => serviceRepository.findById(r.serviceId))
    );
    return services
      .filter((s) => s && s.isActive)
      .map((s) => toServiceListItem(s!));
  },

  async saveService(userId: string, serviceId: string) {
    const service = await prisma.serviceOffering.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) throw new ApiError(404, "Service not found", "NOT_FOUND");
    await prisma.savedService.upsert({
      where: { userId_serviceId: { userId, serviceId } },
      update: {},
      create: { userId, serviceId },
    });
    return { saved: true };
  },

  async unsaveService(userId: string, serviceId: string) {
    await prisma.savedService.deleteMany({ where: { userId, serviceId } });
    return { saved: false };
  },

  async savedIds(userId: string): Promise<Set<string>> {
    const rows = await prisma.savedService.findMany({
      where: { userId },
      select: { serviceId: true },
    });
    return new Set(rows.map((r) => r.serviceId));
  },

  // ---------- Notifications ----------
  async listNotifications(userId: string) {
    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      bookingId: n.bookingId,
      createdAt: n.createdAt.toISOString(),
    }));
  },

  async unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, read: false } });
  },

  async markNotificationsRead(userId: string, ids?: string[]) {
    await prisma.notification.updateMany({
      where: { userId, ...(ids?.length ? { id: { in: ids } } : {}) },
      data: { read: true },
    });
    return { updated: true };
  },

  // ---------- Booking messages ----------
  async assertParticipant(bookingId: string, userId: string, role: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { provider: { select: { userId: true } } },
    });
    if (!booking) throw new ApiError(404, "Booking not found", "NOT_FOUND");
    const isCustomer = booking.customerId === userId;
    const isProvider = booking.provider.userId === userId;
    if (!isCustomer && !isProvider && role !== "ADMIN") {
      throw new ApiError(403, "You are not part of this booking", "FORBIDDEN");
    }
    return booking;
  },

  async listMessages(bookingId: string, userId: string, role: string) {
    await this.assertParticipant(bookingId, userId, role);
    const rows = await prisma.message.findMany({
      where: { bookingId },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
    return rows.map((m) => ({
      id: m.id,
      text: m.text,
      senderId: m.senderId,
      senderName: m.sender.name,
      mine: m.senderId === userId,
      createdAt: m.createdAt.toISOString(),
    }));
  },

  async sendMessage(bookingId: string, userId: string, role: string, text: string) {
    await this.assertParticipant(bookingId, userId, role);
    const clean = text.trim().slice(0, 1000);
    if (!clean) throw new ApiError(422, "Message cannot be empty", "VALIDATION_ERROR");
    const msg = await prisma.message.create({
      data: { bookingId, senderId: userId, text: clean },
      include: { sender: { select: { id: true, name: true } } },
    });

    // Notify the other participant.
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { provider: { select: { userId: true } }, customer: { select: { id: true } } },
    });
    if (booking) {
      const otherId =
        booking.customerId === userId ? booking.provider.userId : booking.customerId;
      await prisma.notification.create({
        data: {
          userId: otherId,
          bookingId,
          title: "New message",
          message: `${msg.sender.name}: ${clean.slice(0, 120)}`,
          type: "info",
        },
      });
    }

    return {
      id: msg.id,
      text: msg.text,
      senderId: msg.senderId,
      senderName: msg.sender.name,
      mine: true,
      createdAt: msg.createdAt.toISOString(),
    };
  },
};