const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

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
      required: true,
      min: 0
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
      type: [String],
      default: []
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);