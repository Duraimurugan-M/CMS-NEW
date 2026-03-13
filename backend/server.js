import dns from "dns";

// Force DNS servers
dns.setServers(["8.8.8.8", "8.8.4.4"]);


import "dotenv/config.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import ledgerRoutes from "./routes/ledgerRoutes.js";
import circularRoutes from "./routes/circularRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import outpassRoutes from "./routes/outpassRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import libraryRoutes from "./routes/libraryRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";
import canteenRoutes from "./routes/canteenRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import checkInRoutes from "./routes/checkInRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

// Basic middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CMS API is running" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/circulars", circularRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/outpass", outpassRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/canteen", canteenRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/checkin", checkInRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

