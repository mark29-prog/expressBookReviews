const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Check if username already exists
    const userExists = users.some((user) => user.username === username);
  
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    // Add new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
  });

  

  const axios = require('axios');

  public_users.get('/', async (req, res) => {
    try {
      const response = await axios.get('http://localhost:5000/booksdb'); // replace with actual API if needed
      res.status(200).json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching book list" });
    }
  });

  const axios = require('axios');

  public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
  
    try {
      const response = await axios.get(`http://localhost:5000/booksdb/${isbn}`); // replace with API URL if needed
      if (response.data) {
        res.status(200).send(JSON.stringify(response.data, null, 2));
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching book details" });
    }
  });


// Get book details based on author
   
const axios = require('axios');

public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;

  try {
    const response = await axios.get('http://localhost:5000/booksdb'); // replace with API URL if needed
    const books = response.data;
    const filteredBooks = {};

    Object.keys(books).forEach((key) => {
      if (books[key].author === author) {
        filteredBooks[key] = books[key];
      }
    });

    if (Object.keys(filteredBooks).length > 0) {
      res.status(200).send(JSON.stringify(filteredBooks, null, 2));
    } else {
      res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching books" });
  }
});



// Get all books based on title

const axios = require('axios');

public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;

  try {
    const response = await axios.get('http://localhost:5000/booksdb'); // replace with actual API if needed
    const books = response.data;
    const filteredBooks = {};

    Object.keys(books).forEach((key) => {
      if (books[key].title === title) {
        filteredBooks[key] = books[key];
      }
    });

    if (Object.keys(filteredBooks).length > 0) {
      res.status(200).send(JSON.stringify(filteredBooks, null, 2));
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching books" });
  }
});


/// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const books = require('./booksdb.js'); // adjust path if needed
    const isbn = req.params.isbn;
  
    const book = books[isbn];
  
    if (book && book.reviews) {
      return res.status(200).send(
        JSON.stringify(book.reviews, null, 2)
      );
    } else if (book && !book.reviews) {
      return res.status(200).json({ message: "No reviews available for this book" });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
module.exports.general = public_users;
