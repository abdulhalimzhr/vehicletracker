import { Router } from "express";
import { VehicleService } from "../services/vehicleService";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleStatusQuerySchema,
  paginationSchema,
} from "../schemas/vehicle";

const router = Router();

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of vehicles
 */
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const pagination = paginationSchema.parse(req.query);
    const result = await VehicleService.getAllVehicles(pagination);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehicle details
 */
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const vehicle = await VehicleService.getVehicleById(req.params.id);
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/vehicles/{id}/status:
 *   get:
 *     summary: Get vehicle status by date
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Vehicle status for the specified date
 */
router.get("/:id/status", authenticateToken, async (req, res, next) => {
  try {
    const { date } = vehicleStatusQuerySchema.parse(req.query);
    const status = await VehicleService.getVehicleStatus(req.params.id, date);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

router.post("/", authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const data = createVehicleSchema.parse(req.body);
    const vehicle = await VehicleService.createVehicle(data);
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const data = updateVehicleSchema.parse(req.body);
    const vehicle = await VehicleService.updateVehicle(req.params.id, data);
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      await VehicleService.deleteVehicle(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

export default router;
