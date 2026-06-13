const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Cart = require("../models/Cart");

// 1. جلب جميع الطلبات (مع عمل populate لجلب تفاصيل المنتجات داخل الطلب)
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

// 3. إنشاء طلب جديد (Checkout) ✨
router.post("/", async (req, res) => {
  try {
    const { cartId, customerName, phone, address } = req.body;

    // 👈 إصلاح 1: البحث بحقل user لأن هذا هو مكان تخزين الـ ID في العربة
    const cart = await Cart.findOne({ user: cartId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty or not found",
      });
    }

    // 👈 إصلاح 2: تمرير الـ totalPrice المحسوب وجاهز من العربة مباشرة دون حسابات معقدة
    const order = await Order.create({
      cartId,
      customerName,
      phone,
      address,
      items: cart.items, // سينتقل بالهيكل الجديد المحدث (الألوان والمقاسات) تلقائياً
      totalPrice: cart.totalPrice,
    });

    // 👈 إصلاح 3: تصفير العربة بالكامل (المنتجات والسعر الإجمالي) بعد نجاح الطلب
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