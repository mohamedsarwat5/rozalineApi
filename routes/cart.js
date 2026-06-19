const express = require("express");
const router = express.Router();

const Cart = require("../models/Cart");


// get cart
router.get("/:cartId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.cartId })
      .populate("items.product"); // 👈 جلب تفاصيل المنتج (الاسم، الصورة، إلخ) تلقائياً من الموديل الخاص به

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// add to cart
router.post("/", async (req, res) => {
  try {
    const {
      cartId, // سنفترض أنك تمرر الـ ID الخاص بالمستخدم أو معرّف فريد بصيغة ObjectId
      productId,
      color,
      image,
      price,
      quantity,
      size,   // استقبل الحجم المرسل من الفرونت
      length  // استقبل الطول المرسل من الفرونت
    } = req.body;

    // 1. البحث عن الكارت الخاص بالمسخدم
    // ملاحظة: الـ Schema تتوقع أن يكون حقل user عبارة عن ObjectId صالح في MongoDB
    let cart = await Cart.findOne({ user: cartId });

    // 2. إذا لم يكن الكارت موجوداً، نقوم بإنشائه
    if (!cart) {
      cart = await Cart.create({
        user: cartId, // ربط الكارت بالـ user كما تطلب الـ Schema
        items: [],
      });
    }

    // 3. ترتيب البيانات بالشكل الذي تتوقعه الـ cartItemSchema تماماً
    cart.items.push({
      product: productId,          // مطابق لـ product في الـ Schema
      quantity: quantity || 1,     // مطابق لـ quantity
      selectedColor: {             // كائن فرعي مطابق للـ Schema
        color: color,
        image: image
      },
      selectedWeight: size || null,     // مطابق لـ selectedWeight
      selectedLength: length || null,   // مطابق لـ selectedLength
      priceAtAddition: price            // مطابق لـ priceAtAddition
    });

    // 4. الحفظ (وهنا سيعمل سطر الـ pre save تلقائياً لحساب السعر الإجمالي الكلي)
    await cart.save();

    res.status(201).json(cart);
  } catch (error) {
    console.error("Mongoose Save Error:", error.message); // لكي تراه في سجلات السيرفر
    res.status(500).json({ message: error.message });
  }
});


// update quantity
router.put("/:cartId/:itemId", async (req, res) => {
  try {
    const cart = await Cart.findOne({
      cartId: req.params.cartId,
    });

    const item = cart.items.id(req.params.itemId);

    item.quantity = req.body.quantity;

    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delet item
router.delete("/:cartId/:itemId", async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.params.cartId,
    });

    cart.items.pull(req.params.itemId);

    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// clear cart
router.delete("/:cartId", async (req, res) => {
  try {
    const cart = await Cart.findOne({
      cartId: req.params.cartId,
    });

    cart.items = [];

    await cart.save();

    res.status(200).json({
      message: "Cart cleared",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;