const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const productRoutes = require("./Routes/productRoutes");
const customerRoutes = require("./Routes/customerRoutes");
const orderRoutes = require("./Routes/orderRoutes");
const authRoutes = require("./Routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json()); // <-- This is required to parse JSON request bodies

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("AI Fashion Sales Assistant Backend is running");
});

// 404 for anything that didn't match a route above
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler - catches anything thrown/passed to next()
// instead of each route repeating its own try/catch boilerplate
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});