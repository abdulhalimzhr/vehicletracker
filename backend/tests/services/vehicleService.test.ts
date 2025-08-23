// Explicitly import Jest globals to fix TypeScript errors
import { describe, it, expect, beforeEach } from "@jest/globals";
import { VehicleService } from "../../src/services/vehicleService";
import prisma from "../../src/config/database";

describe("VehicleService - Simple Tests", () => {
  beforeEach(async () => {
    // Clean database before each test
    await prisma.vehicleTrip.deleteMany();
    await prisma.vehicle.deleteMany();
  });

  describe("createVehicle", () => {
    it("should create a new vehicle", async () => {
      const vehicleData = {
        plateNumber: "B1234ABC",
        brand: "Toyota",
        model: "Avanza",
        year: 2020,
        color: "White",
      };

      const vehicle = await VehicleService.createVehicle(vehicleData);

      expect(vehicle).toMatchObject(vehicleData);
      expect(vehicle.id).toBeDefined();
      expect(vehicle.createdAt).toBeDefined();
      expect(vehicle.updatedAt).toBeDefined();
    });
  });

  describe("getAllVehicles", () => {
    it("should return paginated vehicles", async () => {
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

      const result = await VehicleService.getAllVehicles({
        page: 1,
        limit: 10,
      });

      expect(result.vehicles).toHaveLength(2);
      expect(result.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });
  });

  describe("getVehicleById", () => {
    it("should return vehicle with trips", async () => {
      const vehicle = await prisma.vehicle.create({
        data: {
          plateNumber: "B3333CCC",
          brand: "Toyota",
          model: "Avanza",
          year: 2020,
          color: "White",
        },
      });

      const result = await VehicleService.getVehicleById(vehicle.id);

      expect(result).toMatchObject({
        id: vehicle.id,
        plateNumber: "B3333CCC",
        brand: "Toyota",
        model: "Avanza",
      });
      expect(result.VehicleTrip).toBeDefined();
      expect(Array.isArray(result.VehicleTrip)).toBe(true);
    });

    it("should throw error for non-existent vehicle", async () => {
      await expect(
        VehicleService.getVehicleById("non-existent-id"),
      ).rejects.toThrow("Vehicle not found");
    });
  });
});
