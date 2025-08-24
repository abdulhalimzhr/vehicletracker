// Explicitly import Jest globals to fix TypeScript errors
import {
  describe,
  it,
  expect,
  beforeEach,
  afterAll
} from '@jest/globals';
import { VehicleService } from '../../src/services/vehicleService';
import prisma from '../../src/config/database';

describe('VehicleService - Simple Tests', () => {
  beforeEach(async () => {
    // Clean database before each test
    await prisma.vehicleTrip.deleteMany();
    await prisma.vehicle.deleteMany();
    // Add a small delay to ensure database operations complete
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('createVehicle', () => {
    it('should create a new vehicle', async () => {
      const vehicleData = {
        plateNumber: `B${Date.now()}ABC`,
        brand: 'Toyota',
        model: 'Avanza',
        year: 2020,
        color: 'White'
      };

      const vehicle = await VehicleService.createVehicle(vehicleData);

      expect(vehicle).toMatchObject(vehicleData);
      expect(vehicle.id).toBeDefined();
      expect(vehicle.createdAt).toBeDefined();
      expect(vehicle.updatedAt).toBeDefined();
    });
  });

  describe('getAllVehicles', () => {
    it('should return paginated vehicles', async () => {
      // Create test vehicles with unique identifiers
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await prisma.vehicle.createMany({
        data: [
          {
            plateNumber: `B${uniqueId}AAA`,
            brand: 'Toyota',
            model: 'Avanza',
            year: 2020,
            color: 'White'
          },
          {
            plateNumber: `B${uniqueId}BBB`,
            brand: 'Honda',
            model: 'Civic',
            year: 2021,
            color: 'Black'
          }
        ]
      });

      // Add a small delay to ensure database operations complete
      await new Promise(resolve => setTimeout(resolve, 10));

      const result = await VehicleService.getAllVehicles({
        page: 1,
        limit: 10
      });

      // Check that our test vehicles are included (there might be others from other tests)
      expect(result.vehicles.length).toBeGreaterThanOrEqual(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBeGreaterThanOrEqual(2);
      
      // Verify our specific test vehicles exist
      const testVehicles = result.vehicles.filter(v => 
        v.plateNumber.includes(uniqueId)
      );
      expect(testVehicles).toHaveLength(2);
    });
  });

  describe('getVehicleById', () => {
    it('should return vehicle with trips', async () => {
      const plateNumber = `B${Date.now()}CCC`;
      const vehicle = await prisma.vehicle.create({
        data: {
          plateNumber,
          brand: 'Toyota',
          model: 'Avanza',
          year: 2020,
          color: 'White'
        }
      });

      const result = await VehicleService.getVehicleById(vehicle.id);

      expect(result).toMatchObject({
        id: vehicle.id,
        plateNumber,
        brand: 'Toyota',
        model: 'Avanza'
      });
      expect(result.VehicleTrip).toBeDefined();
      expect(Array.isArray(result.VehicleTrip)).toBe(true);
    });

    it('should throw error for non-existent vehicle', async () => {
      await expect(
        VehicleService.getVehicleById('non-existent-id')
      ).rejects.toThrow('Vehicle not found');
    });
  });
});
