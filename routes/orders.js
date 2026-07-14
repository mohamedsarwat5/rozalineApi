const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Cart = require("../models/Cart");

// 1. جلب جميع الطلبات
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().populate("items.product");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. جلب طلب واحد محدد بالتفصيل
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. إنشاء طلب جديد (Checkout) ✨ (تم التحديث)
router.post("/", async (req, res) => {
  try {
    const { cartId, customerName, phone, address, governorate, shippingPrice } = req.body;

    // 👈 التحقق من وجود بيانات المحافظة والشحن
    if (!governorate || shippingPrice === undefined) {
      return res.status(400).json({
        message: "Governorate and shipping price are required",
      });
    }

    // البحث بحقل user لأن هذا هو مكان تخزين الـ ID في العربة
    const cart = await Cart.findOne({ user: cartId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty or not found",
      });
    }

    // 👈 الحساب الآمن للإجمالي: جمع سعر السلة الأصلي + تكلفة شحن المحافظة المحددة
    const calculatedTotalPrice = cart.totalPrice + Number(shippingPrice);

    const order = await Order.create({
      cartId,
      customerName,
      phone,
      address,
      governorate, // 👈 حفظ المحافظة
      shippingPrice, // 👈 حفظ سعر الشحن
      items: cart.items,
      totalPrice: calculatedTotalPrice, // 👈 الإجمالي الجديد شاملاً الشحن
    });

    // تصفير العربة بالكامل بعد نجاح الطلب
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. حذف طلب
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;