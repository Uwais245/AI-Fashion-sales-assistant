const express = require("express");
const Order = require("../Models/Order");
const Customer = require("../Models/Customer");

const router = express.Router();

// Create order
router.post("/", async (req, res) => {
  try {
    const orderCount = await Order.countDocuments();

    const order = await Order.create({
      ...req.body,
      orderId: `ORD-${1001 + orderCount}`
    });

    await Customer.findByIdAndUpdate(
      req.body.customerId,
      {
        $push: {
          orderHistory: order._id
        }
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: error.message
    });
  }
});

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId")
      .populate("products.productId");

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Orders fetching failed",
      error: error.message
    });
  }
});

// Get single order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customerId")
      .populate("products.productId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Order fetching failed",
      error: error.message
    });
  }
});

// Update order status
router.put("/:id/status", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        paymentStatus: req.body.paymentStatus,
        trackingNumber: req.body.trackingNumber
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Order status update failed",
      error: error.message
    });
  }
});

module.exports = router;