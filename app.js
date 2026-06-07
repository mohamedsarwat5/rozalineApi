require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL);

app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.listen(3000, () => {
  console.log("Server running");
});