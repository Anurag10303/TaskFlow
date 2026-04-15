import app from "./app.js";
import connectDB from "./config/db.js";
import logger from "./utils/logger.js";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    logger.info(`📘 Swagger docs: http://localhost:${PORT}/api/v1/docs`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    logger.warn(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info("Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (err) => {
    logger.error("Unhandled Promise Rejection:", err);
    server.close(() => process.exit(1));
  });
};

start();
