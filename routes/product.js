const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();
const axios = require("axios");

// db coonection
const db = new sqlite3.Database(
  "./products.db",
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(err.message);
    }
  }
);

const unsplashClient = axios.create({
  // Set the base URL for all requests to the Unsplash API.
  baseURL: "https://api.unsplash.com",
  // Set the headers for all requests, including the Authorization header
  // with the access token from environment variables.
  headers: {
    Authorization: `Client-ID ${process.env.ACCESS_TOKEN}`,
  },
});

async function getPictureForProduct(productName) {
  try {
    // Fetch an image related to the product name
    const response = await unsplashClient.get("/photos/random", {
      params: {
        query: `${productName} product`, // Makes it more specific
        orientation: "squarish", // Ensures better display
      },
    });
    return response.data.urls.regular; // Return the direct image URL
  } catch (error) {
    console.error(
      "Error fetching image:",
      error.response?.data || error.message
    );
    return null;
  }
}

// ! it work like /admin/add-product
// Add Product Page (Only for Admin)
router.get("/add-product", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin")
    return res.redirect("/");
  res.render("add-product");
});

// Handle Add Product
router.post("/add-product", async (req, res) => {
  let { name, price, category, stock, image_url } = req.body;
  // If no image URL is provided, fetch one from Unsplash
  if (!image_url) {
    image_url = await getPictureForProduct(name);
  }
  db.run(
    "INSERT INTO products (name, price, category, stock ,image_url ) VALUES (?, ?, ?, ? , ?)",
    [
      name,
      price,
      category,
      stock,
      (image_url = await getPictureForProduct(name)),
    ],
    () => {
      res.redirect("/");
    }
  );
});

// Edit Product Page
router.get("/edit-product/:id", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin")
    return res.redirect("/");
  db.get(
    "SELECT * FROM products WHERE id = ?",
    [req.params.id],
    (err, product) => {
      res.render("edit-product", { product });
    }
  );
});

// Handle Update Product - foam
router.post("/edit-product/:id", (req, res) => {
  const { name, price, category, stock } = req.body;
  db.run(
    "UPDATE products SET name=?, price=?, category=?, stock=? WHERE id=?",
    [name, price, category, stock, req.params.id],
    () => {
      res.redirect("/");
    }
  );
});

// Handle Delete Product
router.get("/delete-product/:id", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin")
    return res.redirect("/");
  db.run("DELETE FROM products WHERE id=?", [req.params.id], () => {
    res.redirect("/");
  });
});

module.exports = router;
