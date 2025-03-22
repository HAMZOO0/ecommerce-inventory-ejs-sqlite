const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const authRoutes = require("./routes/auth");
 
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

app.use(bodyParser.urlencoded({ extended: true })); // ! 

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

app.use("/", authRoutes);

// Home Page (List Products)
app.get("/", (req, res) => {
  console.log(req.session);
  console.log(req.session.id);

  db.all("SELECT * FROM products", [], (err, products) => {
    if (err) return res.send("Error fetching products");
    res.render("home", { user: req.session.user, products });
  });
});

// Start the server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
