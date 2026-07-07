const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    instagramId: {
      type: String
    },

    address: {
      type: String
    },

    orderHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
      }
    ],

    preferences: {
      favoriteColor: {
        type: String
      },
      budget: {
        type: Number
      },
      category: {
        type: String
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);