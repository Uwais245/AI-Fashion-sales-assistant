const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: {
      type: String
    },
    sizes: {
      type: [String],
      enum: ["XS", "S", "M", "L", "XL"]
    },
    colors: {
      type: [String]
    },
    stock: [
      {
        size: {
          type: String,
          enum: ["XS", "S", "M", "L", "XL"]
        },
        color: {
          type: String
        },
        quantity: {
          type: Number,
          default: 0
        }
      }
    ]
    ,
    images: {
      type: [String]
    },
    discount: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);