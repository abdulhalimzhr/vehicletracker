export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Vehicle Tracker API",
      version: "1.0.0",
      description: "API for Vehicle Tracker Dashboard",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://vehicletracker.abdulhalimzhr.com"
            : "http://localhost:3000",
        description:
          process.env.NODE_ENV === "production" ? "Production" : "Development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};
