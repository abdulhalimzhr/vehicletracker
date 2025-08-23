import bcrypt from "bcryptjs";
import prisma from "../config/database";

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: hashedPassword,
      name: "Regular User",
      role: "USER",
    },
  });

  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where: { plateNumber: "B1234ABC" },
      update: {},
      create: {
        plateNumber: "B1234ABC",
        brand: "Toyota",
        model: "Avanza",
        year: 2020,
        color: "White",
      },
    }),
    prisma.vehicle.upsert({
      where: { plateNumber: "B5678DEF" },
      update: {},
      create: {
        plateNumber: "B5678DEF",
        brand: "Honda",
        model: "Civic",
        year: 2021,
        color: "Black",
      },
    }),
    prisma.vehicle.upsert({
      where: { plateNumber: "B9012GHI" },
      update: {},
      create: {
        plateNumber: "B9012GHI",
        brand: "Suzuki",
        model: "Ertiga",
        year: 2019,
        color: "Silver",
      },
    }),
  ]);

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  for (const vehicle of vehicles) {
    await prisma.vehicleTrip.createMany({
      data: [
        {
          vehicleId: vehicle.id,
          status: "TRIP",
          startTime: new Date(
            yesterday.getTime() + Math.random() * 8 * 60 * 60 * 1000,
          ),
          endTime: new Date(
            yesterday.getTime() +
              Math.random() * 8 * 60 * 60 * 1000 +
              2 * 60 * 60 * 1000,
          ),
          latitude: -6.2 + Math.random() * 0.1,
          longitude: 106.8 + Math.random() * 0.1,
          address: "Jakarta, Indonesia",
        },
        {
          vehicleId: vehicle.id,
          status: "IDLE",
          startTime: new Date(yesterday.getTime() + 10 * 60 * 60 * 1000),
          endTime: new Date(yesterday.getTime() + 11 * 60 * 60 * 1000),
          latitude: -6.2 + Math.random() * 0.1,
          longitude: 106.8 + Math.random() * 0.1,
          address: "Jakarta, Indonesia",
        },
        {
          vehicleId: vehicle.id,
          status: "STOPPED",
          startTime: new Date(
            twoDaysAgo.getTime() + Math.random() * 8 * 60 * 60 * 1000,
          ),
          endTime: new Date(
            twoDaysAgo.getTime() +
              Math.random() * 8 * 60 * 60 * 1000 +
              4 * 60 * 60 * 1000,
          ),
          latitude: -6.2 + Math.random() * 0.1,
          longitude: 106.8 + Math.random() * 0.1,
          address: "Jakarta, Indonesia",
        },
      ],
    });
  }

  console.log("Database seeded successfully!");
  console.log("Admin user:", admin.email);
  console.log("Regular user:", user.email);
  console.log("Password for both:", "password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
