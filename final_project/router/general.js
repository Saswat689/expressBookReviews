const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if user already exists
  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username: username, password: password });
  return res
    .status(200)
    .json({ message: "User successfully registered. Now you can login" });
});

// Task 1 & Task 10: Get the book list available in the shop (Using Async / Promise)
public_users.get("/", function (req, res) {
  const getBooks = new Promise((resolve, reject) => {
    resolve(books);
  });

  getBooks
    .then((bookList) => {
      res.status(200).json(bookList);
    })
    .catch((err) => {
      res.status(500).json({ message: "Error fetching book list" });
    });
});

// Task 2 & Task 11: Get book details based on ISBN (Using Async / Promise)
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  getBookByISBN
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((err) => {
      res.status(404).json({ message: err });
    });
});

// Task 3 & Task 12: Get book details based on Author (Using Async / Promise)
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;

  const getBooksByAuthor = new Promise((resolve, reject) => {
    let filteredBooks = [];
    const keys = Object.keys(books);

    keys.forEach((key) => {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        filteredBooks.push(books[key]);
      }
    });

    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("No books found by this author");
    }
  });

  getBooksByAuthor
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(404).json({ message: err });
    });
});

// Task 4 & Task 13: Get all books based on Title (Using Async / Promise)
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;

  const getBooksByTitle = new Promise((resolve, reject) => {
    let filteredBooks = [];
    const keys = Object.keys(books);

    keys.forEach((key) => {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        filteredBooks.push(books[key]);
      }
    });

    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("No books found with this title");
    }
  });

  getBooksByTitle
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(404).json({ message: err });
    });
});

// Task 5: Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
