const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    inStock: {
      type: Boolean,
      default: true,
    },

    colors: [
      {
        color: {
          type: String,
          required: true,
        },

        image: {
          type: String,
          required: true,
        },

        inStock: {
          type: Boolean,
          default: true,
        },
      },
    ],

    availableWeights: [
      {
        type: String,
        enum: [
          "one size",
          "55-85",
          "85-120",
          "55-80 (Bust: 105)",
          "80-120 (Bust: 112)",
        ],
      },
    ],

    availableLengths: [
      {
        type: String,
        enum: [
          "100",
          "105",
          "110",
          "150"
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
