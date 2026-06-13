const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // ربطه بـ cartId (الذي يمثل الـ user الفريد للزائر)
    cartId: {
      type: String,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    // تم تحديث الهيكل هنا ليتطابق تماماً مع الـ cartItemSchema
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        selectedColor: {
          color: { type: String, required: true },
          image: { type: String, required: true },
        },

        selectedWeight: {
          type: String,
          default: null,
        },

        selectedLength: {
          type: String,
          default: null,
        },

        priceAtAddition: {
          type: Number,
          required: true,
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
    },

    // حقل إضافي هام جداً لإدارة المتجر ومتابعة الشحن
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true, // يسجل وقت عمل الطلب تلقائياً (createdAt)
  }
);

module.exports = mongoose.model("Order", orderSchema);