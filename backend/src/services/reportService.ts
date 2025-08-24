import ExcelJS from "exceljs";
import prisma from "../config/database";

export class ReportService {
  static async generateVehicleReport(
    vehicleId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const whereClause: any = {};

    if (vehicleId) {
      whereClause.vehicleId = vehicleId;
    }

    if (startDate || endDate) {
      whereClause.startTime = {};
      if (startDate) {
        whereClause.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        // If it's the same day (single day report), include the entire day
        if (startDate === endDate) {
          endDateTime.setDate(endDateTime.getDate() + 1);
          whereClause.startTime.lt = endDateTime;
        } else {
          endDateTime.setHours(23, 59, 59, 999);
          whereClause.startTime.lte = endDateTime;
        }
      }
    }

    const trips = await prisma.vehicleTrip.findMany({
      where: whereClause,
      include: {
        vehicle: true,
      },
      orderBy: { startTime: "desc" },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Vehicle Report");

    worksheet.columns = [
      { header: "Vehicle", key: "vehicle", width: 15 },
      { header: "Plate Number", key: "plateNumber", width: 15 },
      { header: "Status", key: "status", width: 10 },
      { header: "Start Time", key: "startTime", width: 20 },
      { header: "End Time", key: "endTime", width: 20 },
      { header: "Duration (min)", key: "duration", width: 15 },
      { header: "Address", key: "address", width: 30 },
    ];

    trips.forEach((trip) => {
      const duration = trip.endTime
        ? Math.round(
            (trip.endTime.getTime() - trip.startTime.getTime()) / 1000 / 60,
          )
        : "Ongoing";

      worksheet.addRow({
        vehicle: `${trip.vehicle.brand} ${trip.vehicle.model}`,
        plateNumber: trip.vehicle.plateNumber,
        status: trip.status,
        startTime: trip.startTime.toISOString(),
        endTime: trip.endTime?.toISOString() || "Ongoing",
        duration,
        address: trip.address || "N/A",
      });
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };
    });

    return workbook;
  }
}
