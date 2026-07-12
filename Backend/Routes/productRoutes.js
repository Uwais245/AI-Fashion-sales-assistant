const express = require("express");
const productController = require("../Controllers/productController");
const { protect, adminOnly } = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, adminOnly, productController.createProduct);
router.get("/", productController.getProducts);

// Must come before "/:id" or Express will treat "search" as an :id value
router.get("/search", productController.searchProducts);
router.get("/:id/availability", productController.checkAvailability);
router.get("/:id", productController.getProductById);

module.exports = router;