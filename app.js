/*
Short Code Jurnal -> SCJ
Hamza Here,

23-march-25 -> i forgot the year while typing this -> 4th sem - > BSCS -> NUST -> :) 
--> 2nd Day of Writing This Code
Today is the second day of working on this code. I think the project will be completed today, and I will update the README file and make some submissions. After that, I will focus on my pending tasks. I have a 2-week holiday for Eid, and I plan to complete many pending tasks and be more productive. :)

Last but not least, EJS was quite easy to use, and SQLite DB was also very straightforward. If you're reading this and using both technologies, consider using them for simple web applications or small projects. ;)

My internet connection is terrible, so I’m waiting to complete some update and delete operations.
*/

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
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

const app = express();
// templete engien set
app.set("view engine", "ejs");
// path for views(ejs)
app.set("views", path.resolve("./views"));

// ! why
app.use(bodyParser.urlencoded({ extended: true }));
//  Set up session middleware
app.use(
  session({
    secret: "123", // Change this to a strong secret key
    resave: false,
    saveUninitialized: false,
  })
);

//  Middleware to pass user data to views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use("/", authRoutes); // set route for auth
app.use("/", productRoutes); // set route for product listing and CRUD

app.get("/session", (req, res) => {
  console.log(req.session);

  res.send(`Session Data: ${req.session.user}`);
});

// Home Page (List Products)
app.get("/", (req, res) => {
  console.log(req.session);
  console.log(req.session.id);

  db.all("SELECT * FROM products", [], (err, products) => {
    if (err) return res.send("Error fetching products");
    res.render("home", { user: req.session.user, products });
  });
});

app.get("/admin-panel", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin")
    return res.redirect("/");
  db.all("SELECT * FROM products", [], (err, products) => {
    if (err) return res.send("Error fetching products");
    res.render("admin-panel", { products });
  });
});

// Start the server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
