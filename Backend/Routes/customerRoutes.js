const express = require("express");
const customerController = require("../Controllers/customerController");
const { protect, adminOnly } = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, adminOnly, customerController.createCustomer);
router.get("/", customerController.getCustomers);

// Specific routes must come before "/:id" or Express will treat
// "lookup" as an :id value
router.get("/lookup", customerController.getCustomerByLookup);
router.get("/:id/orders", customerController.getCustomerOrders);
router.get("/:id", customerController.getCustomerById);

module.exports = router;