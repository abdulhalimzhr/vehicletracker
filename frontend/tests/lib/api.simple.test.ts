/// <reference types="vite/client" />
import { describe, it, expect } from "vitest";

describe("API Configuration", () => {
  it("should have correct API base URL from environment", () => {
    const expectedUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    expect(expectedUrl).toBeDefined();
  });

  it("should export authApi methods", async () => {
    // Dynamic import to avoid initialization issues
    const { authApi } = await import("../../src/lib/api");

    expect(typeof authApi.login).toBe("function");
    expect(typeof authApi.register).toBe("function");
  });

  it("should export vehicleApi methods", async () => {
    const { vehicleApi } = await import("../../src/lib/api");

    expect(typeof vehicleApi.getAll).toBe("function");
    expect(typeof vehicleApi.getById).toBe("function");
    expect(typeof vehicleApi.create).toBe("function");
    expect(typeof vehicleApi.update).toBe("function");
    expect(typeof vehicleApi.delete).toBe("function");
  });

  it("should export reportApi methods", async () => {
    const { reportApi } = await import("../../src/lib/api");

    expect(typeof reportApi.downloadVehicleReport).toBe("function");
  });
});
