const authRoutes = require("./Routes/authRoutes");
const productRoutes = require("./Routes/productRoutes");
const customerRoutes = require("./Routes/customerRoutes");
const orderRoutes = require("./Routes/orderRoutes");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

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

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error.message);
  });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });