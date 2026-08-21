const express = require("express");
const router = express.Router();
const crypto = require("crypto");

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

// 3. إنشاء طلب جديد (Checkout) ومعه إرسال الحدث لـ Meta Conversions API
router.post("/", async (req, res) => {
  try {
    const { cartId, customerName, phone, address, governorate, shippingPrice } = req.body;

    if (!governorate || shippingPrice === undefined) {
      return res.status(400).json({
        message: "Governorate and shipping price are required",
      });
    }

    const cart = await Cart.findOne({ user: cartId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty or not found",
      });
    }

    const calculatedTotalPrice = cart.totalPrice + Number(shippingPrice);

    const order = await Order.create({
      cartId,
      customerName,
      phone,
      address,
      governorate,
      shippingPrice,
      items: cart.items,
      totalPrice: calculatedTotalPrice,
    });

    // تصفير العربة بالكامل بعد نجاح الطلب
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    // 🚀 إرسال حدث الشراء (Purchase) لـ Meta في الخلفية
    try {
      const pixelId = "1071213568930971"; // رقم البيكسل المباشر
      const accessToken = process.env.META_ACCESS_TOKEN; // التوكن السري من Vercel

      if (accessToken) {
        const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

        const hashedPhone = phone ? crypto.createHash('sha256').update(phone.trim()).digest('hex') : undefined;

        const payload = {
          data: [
            {
              event_name: 'Purchase',
              event_time: Math.floor(Date.now() / 1000),
              action_source: 'website',
              user_data: {
                ph: hashedPhone ? [hashedPhone] : undefined,
                client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                client_user_agent: req.headers['user-agent']
              },
              custom_data: {
                currency: 'EGP',
                value: calculatedTotalPrice,
                order_id: order._id.toString()
              }
            }
          ]
        };

        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(err => console.error('Meta CAPI Error:', err));
      }
    } catch (capiError) {
      console.error('CAPI execution error:', capiError);
    }

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