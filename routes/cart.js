const express = require("express");
const router = express.Router();

const Cart = require("../models/Cart");


// get cart
router.get("/:cartId", async (req, res) => {
  try {
    const cart = await Cart.findOne({
      cartId: req.params.cartId,
    });

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// add to cart
router.post("/", async (req, res) => {
  try {
    const {
      cartId,
      productId,
      name,
      image,
      color,
      price,
      quantity,
    } = req.body;

    let cart = await Cart.findOne({ cartId });

    if (!cart) {
      cart = await Cart.create({
        cartId,
        items: [],
      });
    }

    cart.items.push({
      productId,
      name,
      image,
      color,
      price,
      quantity,
    });

    await cart.save();

    res.status(201).json(cart);
  } catch (error) {
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
      cartId: req.params.cartId,
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