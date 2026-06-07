const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Cart = require("../models/Cart");

// get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get one order
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// create order
router.post("/", async (req, res) => {
  try {
    const {
      cartId,
      customerName,
      phone,
      address,
    } = req.body;

    const cart = await Cart.findOne({ cartId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const totalPrice = cart.items.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      cartId,
      customerName,
      phone,
      address,
      items: cart.items,
      totalPrice,
    });

    cart.items = [];

    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// delete order
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Order deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;