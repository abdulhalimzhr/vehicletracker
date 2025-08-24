import request from "supertest";
import { describe, it, expect, afterAll } from "@jest/globals";
import app from "../../src/app";
import prisma from "../../src/config/database";

describe("Auth API Integration Tests", () => {
  // Note: Not cleaning database between tests to avoid race conditions
  // Each test uses unique identifiers to ensure isolation

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: "password123",
        name: "Test User",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.user).toMatchObject({
        email: userData.email,
        name: userData.name,
        role: "USER",
      });
      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    it("should return 400 for invalid email", async () => {
      const userData = {
        email: "invalid-email",
        password: "password123",
        name: "Test User",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Validation error");
    });

    it("should return 409 for duplicate email", async () => {
      // Use a completely unique email for this test with multiple entropy sources
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const pid = process.pid;
      const uniqueId = `${timestamp}-${random}-${pid}`;
      const userData = {
        email: `test-duplicate-${uniqueId}@example.com`,
        password: "password123",
        name: "Test User",
      };

      // Clean up any existing user with this email (just in case)
      try {
        await prisma.user.deleteMany({
          where: { email: userData.email }
        });
      } catch (error) {
        // Ignore cleanup errors
      }

      // Create user first
      const firstResponse = await request(app).post("/api/auth/register").send(userData);
      expect(firstResponse.status).toBe(201); // Ensure first creation succeeds

      // Verify user exists in database before attempting duplicate
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      expect(existingUser).toBeTruthy();

      // Try to create same user again
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe("Duplicate entry");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      // Create a test user first
      const email = `test-login-${Date.now()}@example.com`;
      await request(app).post("/api/auth/register").send({
        email,
        password: "password123",
        name: "Test User",
      });

      const loginData = {
        email,
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        email,
        name: "Test User",
      });
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it("should return 401 for invalid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid credentials");
    });
  });
});