const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          default: 1
        },
        size: {
          type: String
        },
        color: {
          type: String
        }
      }
    ],

    status: {
      type: String,
      default: "Pending"
    },

    paymentStatus: {
      type: String,
      default: "Pending"
    },

    trackingNumber: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
