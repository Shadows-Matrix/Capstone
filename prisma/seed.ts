import { PrismaClient, BookingStatus, Role, User, ProviderProfile } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "Password123!";

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.serviceOffering.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.user.deleteMany();

  // ----- Categories -----
  const categories = await Promise.all(
    (
      [
        ["Home Cleaning", "house-cleaning", "Sparkles", "Professional home and office cleaning services."],
        ["Plumbing", "plumbing", "Wrench", "Pipe repair, leaks, water heaters and fixtures."],
        ["Electrical", "electrical", "Zap", "Wiring, switches, panels and lighting repairs."],
        ["AC Repair & Maintenance", "ac-repair", "Snowflake", "Installation, servicing and repair of air conditioners."],
        ["Painting & Home Decor", "painting", "Paintbrush", "Interior and exterior painting plus decor services."],
        ["Pest Control", "pest-control", "Bug", "Safe, effective pest management for homes and offices."],
        ["Appliance Repair", "appliance-repair", "Refrigerator", "Repair of refrigerators, washing machines and more."],
        ["Landscaping & Gardening", "landscaping", "Flower", "Lawn care, garden maintenance and landscaping."],
      ] as const
    ).map(([name, slug, icon, description]) =>
      prisma.serviceCategory.create({ data: { name, slug, icon, description } })
    )
  );
  const cat = (slug: string) => categories.find((c) => c.slug === slug)!;

  // ----- Admin -----
  const adminUser = await prisma.user.create({
    data: { name: "Platform Admin", email: "admin@servex.com", passwordHash, role: Role.ADMIN },
  });

  // ----- Customers -----
  const customerData = [
    ["John Carter", "john@example.com", "+1 212 555 0142", "New York"],
    ["Maria Gomez", "maria@example.com", "+1 415 555 0197", "San Francisco"],
    ["David Kim", "david@example.com", "+1 312 555 0126", "Chicago"],
  ] as const;
  const customers = await Promise.all(
    customerData.map(([name, email, phone, city]) =>
      prisma.user.create({
        data: { name, email, passwordHash, role: Role.CUSTOMER, phone, city },
      })
    )
  );

  // ----- Providers -----
  const providerData = [
    ["Alice Anderson", "alice@servexpro.com", "New York", "Queens", "Deep-cleaning specialist with 5+ years of residential experience.", 60, 5, 350],
    ["Bob Bennett", "bob@servexpro.com", "New York", "Brooklyn", "Licensed plumber handling leaks, drain issues and water heaters.", 75, 8, 520],
    ["Carol Chen", "carol@servexpro.com", "San Francisco", "Mission District", "Certified electrician for safe home wiring and upgrades.", 90, 10, 410],
    ["Daniel Diaz", "daniel@servexpro.com", "San Francisco", "Sunset", "HVAC technician — AC install and repair across the Bay.", 110, 7, 380],
    ["Emma Evans", "emma@servexpro.com", "Austin", "South Congress", "Interior painter who loves bold, tidy finishes.", 70, 4, 300],
    ["Frank Foster", "frank@servexpro.com", "Chicago", "Lincoln Park", "Eco-friendly pest control for homes and small offices.", 65, 6, 280],
    ["Grace Green", "grace@servexpro.com", "Seattle", "Capitol Hill", "Appliance repair expert for fridges, washers and dryers.", 85, 9, 460],
    ["Henry Hall", "henry@servexpro.com", "Miami", "Coconut Grove", "Landscaper and gardener — lawns, hedges and seasonal plantings.", 80, 6, 340],
  ] as const;

  const providers: { user: User; profile: ProviderProfile }[] = [];
  for (const [name, email, city, area, bio, basePrice, xp, jobs] of providerData) {
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: Role.PROVIDER, city, phone: `+1 917 555 01${providers.length}` },
    });
    const profile = await prisma.providerProfile.create({
      data: { userId: user.id, bio, city, area, basePrice, yearsExperience: xp, completedJobs: jobs },
    });
    providers.push({ user, profile });
  }
  const provider = (index: number) => providers[index].profile;

  // ----- Offerings (one per provider within their category) -----
  const offeringSpecs = [
    [0, "house-cleaning", "Deep Home Cleaning", "Thorough 3-hour deep clean of up to 2 bedrooms, 2 baths: kitchen degrease, bathrooms, floors, vacuum and dust.", 140, 180],
    [1, "plumbing", "Leak Repair & Pipe Fix", "Diagnose and repair leaks, dripping taps and burst pipes with a 30-day workmanship guarantee.", 95, 90],
    [2, "electrical", "Home Wiring & Panel Upgrade", "Safe rewiring, outlet installation and circuit breaker panel upgrades with permit support.", 180, 240],
    [3, "ac-repair", "AC Installation & Servicing", "Split/central AC installation, gas top-up, coil cleaning and seasonal servicing.", 150, 120],
    [4, "painting", "Interior Room Painting", "Two-coat premium emulsion painting for one medium room including wall prep and cleanup.", 220, 300],
    [5, "pest-control", "Home Pest Control", "Cockroach, ant and rodent treatment with child- and pet-safe products. Quarterly plans available.", 130, 90],
    [6, "appliance-repair", "Refrigerator & Washer Repair", "On-site repair for fridges, washing machines and dishwashers with genuine parts.", 120, 120],
    [7, "landscaping", "Garden Maintenance Package", "Lawn mowing, hedge trimming, weeding and seasonal cleanup for medium-sized yards.", 110, 180],
  ] as const;

  const offerings = [];
  for (const [pIdx, slug, title, description, price, minutes] of offeringSpecs) {
    offerings.push(
      await prisma.serviceOffering.create({
        data: { providerId: provider(pIdx).id, categoryId: cat(slug).id, title, description, price, durationMins: minutes, isActive: true },
      })
    );
  }

  // ----- Bookings -----
  const now = Date.now();
  const day = 86_400_000;

  const bookingSpecs = [
    // [customerIdx, offeringIdx, status, daysFromNow, address, notes, review?]
    [0, 0, "COMPLETED", -3, "221B Hull Street, New York", "Pets at home, please check before entering.", true],
    [0, 1, "IN_PROGRESS", 0, "221B Hull Street, New York", "Kitchen sink leaking under the counter.", false],
    [0, 6, "PENDING", 1, "221B Hull Street, New York", "Washing machine not spinning.", false],
    [1, 2, "COMPLETED", -5, "12 Valencia Way, San Francisco", "Wants a quote for a full panel upgrade too.", true],
    [1, 3, "CONFIRMED", 2, "12 Valencia Way, San Francisco", "Two window units to service.", false],
    [1, 4, "PENDING", 3, "12 Valencia Way, San Francisco", "Living room only.", false],
    [2, 5, "COMPLETED", -1, "900 W Fullerton Ave, Chicago", "Cockroaches in the kitchen.", true],
    [2, 7, "CANCELLED", 2, "900 W Fullerton Ave, Chicago", "Schedule conflict — will rebook.", false],
    [2, 0, "PENDING", 1, "900 W Fullerton Ave, Chicago", "Move-in clean for a 1BR.", false],
    [1, 5, "CONFIRMED", 4, "12 Valencia Way, San Francisco", "Quarterly pest plan, first visit.", false],
    [0, 3, "COMPLETED", -8, "221B Hull Street, New York", "AC not cooling below 26C.", true],
    [2, 2, "IN_PROGRESS", 0, "900 W Fullerton Ave, Chicago", "Outlets flickering in two rooms.", false],
  ] as const;

  const statusKey = (s: string) => s as BookingStatus;
  const createdBookings = [];
  for (const [cIdx, oIdx, status, daysAway, address, notes, hasReview] of bookingSpecs) {
    const offering = offerings[oIdx];
    const created = await prisma.booking.create({
      data: {
        customerId: customers[cIdx].id,
        providerId: offering.providerId,
        serviceId: offering.id,
        status: statusKey(status),
        scheduledAt: new Date(now + daysAway * day),
        address,
        notes,
        totalAmount: offering.price,
      },
    });
    createdBookings.push(created);

    if (hasReview) {
      await prisma.review.create({
        data: {
          bookingId: created.id,
          customerId: customers[cIdx].id,
          providerId: offering.providerId,
          rating: 4 + ((cIdx + oIdx) % 2),
          comment: cIdx === 1
            ? "Professional, on time and very thorough. Highly recommended."
            : "Great work — fair price and clean finish.",
        },
      });
    }

    if (status === "COMPLETED") {
      await prisma.payment.create({
        data: {
          bookingId: created.id,
          providerId: offering.providerId,
          amount: offering.price,
          platformFee: Math.round(offering.price * 0.08 * 100) / 100,
          status: "SUCCESS",
          method: "simulated",
          transactionId: `txn_seed_${created.id.slice(-8)}`,
        },
      });
    }

    await prisma.notification.create({
      data: {
        userId: status === "COMPLETED" || status === "CANCELLED" ? customers[cIdx].id : customers[cIdx].id,
        bookingId: created.id,
        title: status === "COMPLETED" ? "Booking completed" : "Booking update",
        message: `Your booking for "${offering.title}" is now ${status.toLowerCase().replace("_", " ")}.`,
        type: status === "COMPLETED" ? "success" : "info",
      },
    });
  }

  // Mark completed job counts consistent with seed (compute from completed bookings)
  const completedCounts = new Map<string, number>();
  for (const b of createdBookings) {
    const row = await prisma.booking.findUnique({ where: { id: b.id }, select: { providerId: true, status: true } });
    if (!row) continue;
    if (row.status === "COMPLETED") {
      completedCounts.set(row.providerId, (completedCounts.get(row.providerId) ?? 0) + 1);
    }
  }
  for (const p of providers) {
    await prisma.providerProfile.update({
      where: { id: p.profile.id },
      data: { completedJobs: p.profile.completedJobs + (completedCounts.get(p.profile.id) ?? 0) },
    });
  }

  console.log("Seeded SERVEX:");
  console.log(`  categories: ${categories.length}`);
  console.log(`  users: ${customers.length + providers.length + 1} (admin + ${customers.length} customers + ${providers.length} providers)`);
  console.log(`  offerings: ${offerings.length}`);
  console.log(`  bookings: ${createdBookings.length}`);
  console.log(`  auth: all seeded passwords are "${PASSWORD}"`);
  console.log("  logins: john@example.com | alice@servexpro.com | admin@servex.com");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });