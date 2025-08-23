/// <reference types="jest" />
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:postgres@localhost:5432/vehicle_tracker_test",
    },
  },
});

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up in correct order due to foreign key constraints
  await prisma.vehicleTrip.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
});
