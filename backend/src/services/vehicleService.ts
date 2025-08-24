import prisma from "../config/database";
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  PaginationQuery,
} from "../schemas/vehicle";

export class VehicleService {
  static async getAllVehicles(pagination: PaginationQuery) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.vehicle.count(),
    ]);

    return {
      vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getVehicleById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        VehicleTrip: {
          orderBy: { startTime: "desc" },
          take: 10,
        },
      },
    });

    if (!vehicle) {
      const error = new Error("Vehicle not found");
      (error as any).statusCode = 404;
      throw error;
    }

    return vehicle;
  }

  static async createVehicle(data: CreateVehicleInput) {
    return await prisma.vehicle.create({
      data,
    });
  }

  static async updateVehicle(id: string, data: UpdateVehicleInput) {
    return await prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  static async deleteVehicle(id: string) {
    await prisma.vehicle.delete({
      where: { id },
    });
  }

  static async getVehicleStatus(vehicleId: string, date: string) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const trips = await prisma.vehicleTrip.findMany({
      where: {
        vehicleId,
        startTime: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { startTime: "asc" },
    });

    const statusSummary = trips.reduce(
      (acc, trip) => {
        const duration = trip.endTime
          ? trip.endTime.getTime() - trip.startTime.getTime()
          : Date.now() - trip.startTime.getTime();

        acc[trip.status] = (acc[trip.status] || 0) + duration;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      date,
      trips,
      summary: {
        TRIP: Math.round((statusSummary.TRIP || 0) / 1000 / 60),
        IDLE: Math.round((statusSummary.IDLE || 0) / 1000 / 60),
        STOPPED: Math.round((statusSummary.STOPPED || 0) / 1000 / 60),
      },
    };
  }
}
