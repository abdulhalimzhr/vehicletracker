import { Router } from "express";
import { authenticateToken, requireAdmin, AuthRequest } from "../middleware/auth";
import prisma from "../config/database";

const router = Router();

router.get("/", authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get("/me", authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as AuthRequest).user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
