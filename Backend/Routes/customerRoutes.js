const express = require("express");
const Customer = require("../Models/Customer");

const router = express.Router();

// Create customer
router.post("/", async (req, res) => {
  try {
    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Customer creation failed",
      error: error.message
    });
  }
});

// Get all customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find();

    res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Customers fetching failed",
      error: error.message
    });
  }
});

// Get single customer by ID
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer fetched successfully",
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Customer fetching failed",
      error: error.message
    });
  }
});

module.exports = router;