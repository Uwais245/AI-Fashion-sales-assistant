const Customer = require("../Models/Customer");
const Order = require("../Models/Order");

exports.createCustomer = async (req, res) => {
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
};

exports.getCustomers = async (req, res) => {
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
};

// Lookup by phone or instagramId - used by the chat agent, which only knows
// how the customer identified themselves, not their Mongo _id
exports.getCustomerByLookup = async (req, res) => {
  try {
    const { phone, instagramId } = req.query;

    if (!phone && !instagramId) {
      return res.status(400).json({
        success: false,
        message: "phone or instagramId query param is required"
      });
    }

    const filter = {};
    if (phone) filter.phone = phone;
    if (instagramId) filter.instagramId = instagramId;

    const customer = await Customer.findOne(filter);

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
      message: "Customer lookup failed",
      error: error.message
    });
  }
};

exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.params.id }).populate(
      "products.productId"
    );

    res.status(200).json({
      success: true,
      message: "Customer orders fetched successfully",
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Fetching customer orders failed",
      error: error.message
    });
  }
};

exports.getCustomerById = async (req, res) => {
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
};
