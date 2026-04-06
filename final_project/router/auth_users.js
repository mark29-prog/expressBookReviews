const express = require('express');
const jwt = require('jsonwebtoken');
const books = require("./booksdb.js");
const regd_users = express.Router();

// In-memory users array
let users = [];

// Secret key for JWT
const secretKey = "your_jwt_secret_key";

// ----------------------
// Utility functions
// ----------------------

// Check if username is valid
const isValid = (username) => {
  return typeof username === "string" && username.length > 0;
}

// Check if username/password match
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

// ----------------------
// JWT Authentication middleware
// ----------------------
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization; // Expecting "Bearer <token>"

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1]; // Extract token

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

// ----------------------
// Routes
// ----------------------

// Login endpoint
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

  return res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review (requires authentication)
regd_users.put("/review/:isbn", verifyJWT, (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user?.username;

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews) book.reviews = {};
  book.reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully", reviews: book.reviews });
});

// Delete a book review (requires authentication)
regd_users.delete("/review/:isbn", verifyJWT, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user?.username;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "You have no review to delete for this book" });
  }

  delete book.reviews[username];

  return res.status(200).json({
    message: "Your review has been deleted successfully",
    reviews: book.reviews
  });
});

// ----------------------
// Exports
// ----------------------
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;