const express = require("express");
const router = express.Router();

const Cart = require("../models/Cart");
const Product = require("../models/Product"); // 👈 استدعاء موديل المنتجات

// 1. Get Cart
router.get("/:cartId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.cartId }).populate("items.product");
    res.status(200).json(cart || { user: req.params.cartId, items: [], totalPrice: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Add to Cart
router.post("/", async (req, res) => {
  try {
    const {
      cartId,
      productId,
      color,
      image,
      quantity,
      size,   // selectedWeight
      length  // selectedLength
    } = req.body;

    // جلب المنتج للتأكد من وجوده ولحساب السعر الحقيقي
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }

    // تحديد السعر المخصم أو الأساسي
    const finalPrice = (product.onSale && product.salePrice) ? product.salePrice : product.price;

    let cart = await Cart.findOne({ user: cartId });

    if (!cart) {
      cart = await Cart.create({
        user: cartId,
        items: [],
      });
    }

    // التحقق مما إذا كان نفس المنتج بنفس الخصائص موجوداً مسبقاً
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.selectedColor?.color === color &&
        item.selectedWeight === (size || null) &&
        item.selectedLength === (length || null)
    );

    if (existingItemIndex > -1) {
      // إذا كان موجوداً، يتم زيادة الكمية وتحديث السعر
      cart.items[existingItemIndex].quantity += Number(quantity) || 1;
      cart.items[existingItemIndex].priceAtAddition = finalPrice;
    } else {
      // إذا لم يكن موجوداً، يضاف كعنصر جديد
      cart.items.push({
        product: productId,
        quantity: Number(quantity) || 1,
        selectedColor: {
          color: color,
          image: image,
        },
        selectedWeight: size || null,
        selectedLength: length || null,
        priceAtAddition: finalPrice,
      });
    }

    // حفظ الكارت (يعمل pre-save تلقائياً لحساب totalPrice)
    await cart.save();

    res.status(201).json(cart);
  } catch (error) {
    console.error("Mongoose Save Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// 3. Update Quantity
router.put("/:cartId/:itemId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.cartId });
    if (!cart) return res.status(404).json({ message: "الكارت غير موجود" });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "العنصر غير موجود" });

    item.quantity = Number(req.body.quantity);

    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Delete Item
router.delete("/:cartId/:itemId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.cartId });
    if (!cart) return res.status(404).json({ message: "الكارت غير موجود" });

    cart.items.pull(req.params.itemId);

    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. Clear Cart
router.delete("/:cartId", async (req, res) => {
  try {
    // تم التعديل إلى user بدلاً من cartId ليتوافق مع الـ Schema
    const cart = await Cart.findOne({ user: req.params.cartId });
    if (!cart) return res.status(404).json({ message: "الكارت غير موجود" });

    cart.items = [];

    await cart.save();

    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;