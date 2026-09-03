const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true,
      unique: true
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"]
    }

    ,

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
      },
      size: {
        type: String,
        enum: ["XS", "S", "M", "L", "XL"]
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);