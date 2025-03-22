const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/products.db");

// Home Route (List Products)
// router.get("/", (req, res) => {
//   db.all("SELECT * FROM products", [], (err, products) => {
//     res.render("home", { products, user: req.session.user });
//   });
// });

// Add Product Page (Only for Admin)
router.get("/add-product", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin")
    return res.redirect("/");
  res.render("add-product");
});

// Handle Add Product
router.post("/add-product", (req, res) => {
  const { name, price, category, stock } = req.body;
  db.run(
    "INSERT INTO products (name, price, category, stock) VALUES (?, ?, ?, ?)",
    [name, price, category, stock],
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

// Handle Update Product
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
