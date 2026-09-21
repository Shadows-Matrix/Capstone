import { prisma } from "@/lib/prisma";
import { bookingRepository } from "@/repositories/booking.repository";
import { reviewRepository } from "@/repositories/review.repository";
import { userRepository } from "@/repositories/user.repository";
import type { AdminDashboardStats, BookingStatus } from "@/types";

const ALL_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export const adminService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const [
      users,
      customers,
      providers,
      services,
      bookings,
      statusGroups,
      revenue,
      reviews,
      recentRows,
      topServiceGroups,
    ] = await Promise.all([
      userRepository.countAll(),
      userRepository.countByRole("CUSTOMER"),
      userRepository.countByRole("PROVIDER"),
      prisma.serviceOffering.count({ where: { isActive: true } }),
      bookingRepository.countAll(),
      bookingRepository.groupByStatus(),
      bookingRepository.revenueCompleted(),
      reviewRepository.platformAverage(),
      bookingRepository.recent(10),
      bookingRepository.topCategories(5),
    ]);

    const bookingsByStatus = Object.fromEntries(
      ALL_STATUSES.map((s) => [s, statusGroups.find((g) => g.status === s)?._count._all ?? 0])
    ) as Record<BookingStatus, number>;

    // Map top booked service ids to their category names
    const serviceIds = topServiceGroups.map((g) => g.serviceId);
    const servicesWithCategory = await prisma.serviceOffering.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, category: { select: { name: true } } },
    });
    const categoryByService = new Map(servicesWithCategory.map((s) => [s.id, s.category.name]));

    const categoryTotals = new Map<string, number>();
    for (const group of topServiceGroups) {
      const name = categoryByService.get(group.serviceId);
      if (!name) continue;
      categoryTotals.set(name, (categoryTotals.get(name) ?? 0) + group._count._all);
    }
    const topCategories = [...categoryTotals.entries()]
      .map(([name, count]) => ({ name, bookings: count }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    return {
      totals: { users, customers, providers, services, bookings },
      bookingsByStatus,
      revenueCompleted: revenue._sum.totalAmount ?? 0,
      avgPlatformRating: Math.round((reviews._avg.rating ?? 0) * 10) / 10,
      recentBookings: recentRows.map((b) => ({
        id: b.id,
        status: b.status,
        scheduledAt: b.scheduledAt.toISOString(),
        totalAmount: b.totalAmount,
        serviceName: b.service.title,
        customerName: b.customer.name,
        providerName: b.provider.user.name,
      })),
      topCategories,
    };
  },
};
