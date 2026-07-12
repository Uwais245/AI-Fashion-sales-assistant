const Order = require("../Models/Order");
const Customer = require("../Models/Customer");
const Product = require("../Models/Product");
const getNextSequence = require("../Models/counter");

exports.createOrder = async (req, res) => {
  try {
    // Atomic counter instead of countDocuments() + 1 - avoids two orders
    // created at the same time getting the same orderId
    const orderNumber = await getNextSequence("orderId");

    const order = await Order.create({
      ...req.body,
      orderId: `ORD-${1000 + orderNumber}`
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

    // Decrement stock for the specific size/color variant that was ordered
    for (const item of req.body.products) {
      await Product.updateOne(
        { _id: item.productId, "stock.size": item.size, "stock.color": item.color },
        { $inc: { "stock.$.quantity": -item.quantity } }
      );
    }

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
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
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
};

// Lookup by the human-readable orderId ("ORD-1001") - what a customer
// actually types in chat, as opposed to the Mongo _id
exports.getOrderByOrderId = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
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
};

// This function is used to get all orders for a specific customer by their customerId
exports.getOrderByCustomerId = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.params.customerId })
      .populate("products.productId");

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this customer"
      });
    }

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders
    });
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: "Orders fetching failed",
      error: error.message
    });
  }
}

exports.updateOrderStatus = async (req, res) => {
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
};
