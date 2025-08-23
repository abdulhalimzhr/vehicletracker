import request from "supertest";
import express from "express";

// Explicitly import Jest globals to fix TypeScript errors
import { describe, it, expect } from "@jest/globals";

const app = express();

// Simple health check route for testing
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

describe("Health Check Route", () => {
  it("should return health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "OK",
      message: "Server is running",
    });
  });

  it("should return JSON content type", async () => {
    const response = await request(app).get("/health");

    expect(response.headers["content-type"]).toMatch(/json/);
  });
});
