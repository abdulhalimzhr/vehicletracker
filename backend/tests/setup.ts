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

// Note: Removed global beforeEach cleanup to avoid race conditions
// Individual tests should handle their own isolation using unique identifiers
