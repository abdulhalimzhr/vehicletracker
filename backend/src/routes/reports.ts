import { Router } from "express";
import { ReportService } from "../services/reportService";
import { authenticateToken } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/reports/vehicles:
 *   get:
 *     summary: Download vehicle report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vehicleId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Excel file download
 */
router.get("/vehicles", authenticateToken, async (req, res, next) => {
  try {
    const { vehicleId, startDate, endDate } = req.query as {
      vehicleId?: string;
      startDate?: string;
      endDate?: string;
    };

    const workbook = await ReportService.generateVehicleReport(
      vehicleId,
      startDate,
      endDate,
    );

    const filename = `vehicle-report-${new Date().toISOString().split("T")[0]}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
});

export default router;
