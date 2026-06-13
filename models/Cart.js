const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },

  selectedColor: {
    color: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },

  selectedWeight: {
    type: String,
    enum: [
      "one size",
      "55-85",
      "85-120",
      "55-80 (Bust: 105)",
      "80-120 (Bust: 112)",
    ],
    default: null,
  },

  selectedLength: {
    type: String,
    enum: ["100", "105", "110", "150"],
    default: null,
  },

  priceAtAddition: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: String, //  تم التغيير إلى String ليقبل أي نص عشوائي (مثل cart_xxxxxx)
      required: true,
      unique: true, // يضمن أن كل زائر لديه عربة تسوق واحدة فقط برقمها الفريد
    },

    items: [cartItemSchema],

    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// حساب السعر الكلي تلقائياً قبل الحفظ
cartSchema.pre("save", function () {
  this.totalPrice = this.items.reduce((total, item) => {
    return total + (item.priceAtAddition * item.quantity);
  }, 0);
});

module.exports = mongoose.model("Cart", cartSchema);