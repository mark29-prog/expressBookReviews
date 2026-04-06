const express = require('express');
const books = require("./booksdb.js");
const isValid = require("./auth_users.js").isValid;
const users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); // optional if using external API

// ----------------------
// Register a new user
// ----------------------
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// ----------------------
// Get list of all books (async/await)
// ----------------------
public_users.get("/books", async (req, res) => {
  try {
    const bookList = Object.values(books);
    res.status(200).json({ message: "List of books", books: bookList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching books" });
  }
});

// ----------------------
// Get book details by ISBN (async/await)
// ----------------------
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const book = books[isbn];

    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching book details" });
  }
});

// ----------------------
// Get book details by ISBN (Promise callback)
// ----------------------
public_users.get("/isbn-promise/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) resolve(book);
    else reject(new Error("Book not found"));
  })
  .then(book => res.status(200).json(book))
  .catch(error => res.status(404).json({ message: error.message }));
});

// ----------------------
// Get book details by author (async/await)
// ----------------------
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;
  try {
    const filteredBooks = {};
    Object.keys(books).forEach(key => {
      if (books[key].author === author) filteredBooks[key] = books[key];
    });

    if (Object.keys(filteredBooks).length > 0) {
      res.status(200).json(filteredBooks);
    } else {
      res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

// ----------------------
// Get book details by author (Promise callback)
// ----------------------
public_users.get("/author-promise/:author", (req, res) => {
  const author = req.params.author;

  new Promise((resolve, reject) => {
    const filteredBooks = {};
    Object.keys(books).forEach(key => {
      if (books[key].author === author) filteredBooks[key] = books[key];
    });

    if (Object.keys(filteredBooks).length > 0) resolve(filteredBooks);
    else reject(new Error("No books found for this author"));
  })
  .then(filteredBooks => res.status(200).json(filteredBooks))
  .catch(error => res.status(404).json({ message: error.message }));
});

// ----------------------
// Get book details by title
// ----------------------
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;
  try {
    const filteredBooks = {};
    Object.keys(books).forEach(key => {
      if (books[key].title === title) filteredBooks[key] = books[key];
    });

    if (Object.keys(filteredBooks).length > 0) {
      res.status(200).json(filteredBooks);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

// ----------------------
// Get book reviews by ISBN
// ----------------------
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews || Object.keys(book.reviews).length === 0) {
    return res.status(200).json({ message: "No reviews available for this book" });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;