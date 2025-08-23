import { describe, it, expect, beforeEach } from "@jest/globals";
import bcrypt from "bcryptjs";
import { AuthService } from "../../src/services/authService";
import prisma from "../../src/config/database";

// Explicitly import Jest globals to fix TypeScript errors

describe("AuthService - Simple Tests", () => {
  beforeEach(async () => {
    // Clean database before each test
    await prisma.user.deleteMany();
  });

  describe("register", () => {
    it("should create a new user with hashed password", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const user = await AuthService.register(userData);

      expect(user).toMatchObject({
        email: userData.email,
        name: userData.name,
        role: "USER",
      });
      expect(user.id).toBeDefined();

      // Verify password is hashed
      const dbUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(dbUser).toBeTruthy();
      expect(await bcrypt.compare(userData.password, dbUser!.password)).toBe(
        true,
      );
    });
  });

  describe("login", () => {
    it("should login with valid credentials", async () => {
      // First create a user
      const hashedPassword = await bcrypt.hash("password123", 12);
      await prisma.user.create({
        data: {
          email: "test@example.com",
          password: hashedPassword,
          name: "Test User",
        },
      });

      const result = await AuthService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.user).toMatchObject({
        email: "test@example.com",
        name: "Test User",
      });
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it("should throw error with invalid credentials", async () => {
      await expect(
        AuthService.login({
          email: "nonexistent@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Invalid credentials");
    });
  });
});
