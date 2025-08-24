import request from "supertest";
import { describe, it, expect, beforeEach, afterAll } from "@jest/globals";
import app from "../../src/app";
import prisma from "../../src/config/database";
import jwt from "jsonwebtoken";

describe("Vehicles API Integration Tests", () => {
  let authToken: string;
  let adminToken: string;

  beforeEach(async () => {
    // Clean database before each test
    await prisma.vehicleTrip.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@example.com",
        password: "hashedpassword",
        name: "Admin User",
        role: "ADMIN",
      },
    });

    const regularUser = await prisma.user.create({
      data: {
        email: "user@example.com",
        password: "hashedpassword",
        name: "Regular User",
        role: "USER",
      },
    });

    // Generate tokens
    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "1h" }
    );

    authToken = jwt.sign(
      { id: regularUser.id, email: regularUser.email, role: regularUser.role },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /api/vehicles", () => {
    it("should return paginated vehicles for authenticated user", async () => {
      // Create test vehicles
      await prisma.vehicle.createMany({
        data: [
          {
            plateNumber: "B1111AAA",
            brand: "Toyota",
            model: "Avanza",
            year: 2020,
            color: "White",
          },
          {
            plateNumber: "B2222BBB",
            brand: "Honda",
            model: "Civic",
            year: 2021,
            color: "Black",
          },
        ],
      });

      const response = await request(app)
        .get("/api/vehicles")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.vehicles).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it("should return 401 for unauthenticated request", async () => {
      const response = await request(app).get("/api/vehicles");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Access token required");
    });

    it("should support pagination parameters", async () => {
      // Create 15 test vehicles
      const vehicles = Array.from({ length: 15 }, (_, i) => ({
        plateNumber: `B${String(i + 1).padStart(4, "0")}AAA`,
        brand: "Toyota",
        model: "Avanza",
        year: 2020,
        color: "White",
      }));

      await prisma.vehicle.createMany({ data: vehicles });

      const response = await request(app)
        .get("/api/vehicles?page=2&limit=5")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.vehicles).toHaveLength(5);
      expect(response.body.pagination).toMatchObject({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
      });
    });
  });

  describe("POST /api/vehicles", () => {
    it("should create vehicle for admin user", async () => {
      const vehicleData = {
        plateNumber: "B1234XYZ",
        brand: "Toyota",
        model: "Avanza",
        year: 2020,
        color: "White",
      };

      const response = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(vehicleData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(vehicleData);
      expect(response.body.id).toBeDefined();
    });

    it("should return 403 for non-admin user", async () => {
      const vehicleData = {
        plateNumber: "B1234XYZ",
        brand: "Toyota",
        model: "Avanza",
        year: 2020,
        color: "White",
      };

      const response = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${authToken}`)
        .send(vehicleData);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Admin access required");
    });
  });

  describe("GET /api/vehicles/:id", () => {
    it("should return vehicle details with trips", async () => {
      const vehicle = await prisma.vehicle.create({
        data: {
          plateNumber: "B5555EEE",
          brand: "Toyota",
          model: "Avanza",
          year: 2020,
          color: "White",
        },
      });

      const response = await request(app)
        .get(`/api/vehicles/${vehicle.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: vehicle.id,
        plateNumber: "B5555EEE",
        brand: "Toyota",
        model: "Avanza",
      });
      expect(response.body.VehicleTrip).toBeDefined();
      expect(Array.isArray(response.body.VehicleTrip)).toBe(true);
    });

    it("should return 404 for non-existent vehicle", async () => {
      const response = await request(app)
        .get("/api/vehicles/non-existent-id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Not found");
    });
  });
});