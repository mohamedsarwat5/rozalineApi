const express = require("express");
const router = express.Router();

const Product = require("../models/Product");

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ONE PRODUCT
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE PRODUCT
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      message: "Product added successfully",
      product: product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE PRODUCT
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({
      message: "Product updated successfully",
      product: product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET SITEMAP.XML
router.get("/sitemap.xml", async (req, res) => {
  try {
    // 1. جلب كل المنتجات من الداتابيز (هنجيب فقط الـ _id والـ updatedAt لتسريع الاستعلام)
    const products = await Product.find({}, "_id updatedAt").lean();

    // 2. الصفحات الثابتة في موقعك
    const staticPages = [
      "",
      "/about",
      "/contact",
      "/cart",
    ];

    const baseUrl = "https://www.rozalin-store.com";

    // 3. بناء الـ XML الخاص بالـ Sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // إضافة الصفحات الثابتة
    staticPages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page}</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
      xml += `  </url>\n`;
    });

    // إضافة صفحات المنتجات الديناميكية بالمسار الصحيح (/details/ID)
    products.forEach(product => {
      const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString();

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/details/${product._id}</loc>\n`; // التعديل هنا لتكون /details/ بدلاً من /product/
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    // 4. إرسال الملف كـ XML
    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);

  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
