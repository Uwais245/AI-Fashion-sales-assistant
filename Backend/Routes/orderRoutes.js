const express = require("express");
const orderController = require("../Controllers/orderController");
const { protect, adminOnly } = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, adminOnly, orderController.createOrder);
router.get("/", orderController.getOrders);

// Must come before "/:id" or Express will treat "lookup" as an :id value
router.get("/:orderId", orderController.getOrderByOrderId);
router.get("/customer/:customerId", orderController.getOrderByCustomerId);
//router.get("/:id", orderController.getOrderById);
router.put("/:id/status", protect, adminOnly, orderController.updateOrderStatus);

module.exports = router;