const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Check if user exists in the array
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  // Check if username and password match records
  return users.some(
    (user) => user.username === username && user.password === password,
  );
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(404)
      .json({ message: "Error logging in: Missing username or password" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT token using standard secret key
    let accessToken = jwt.sign({ data: password }, "access", {
      expiresIn: 60 * 60,
    });

    // Save token and username in session structure expected by index.js auth middleware
    req.session.authorization = {
      accessToken,
      username,
    };

    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization
    ? req.session.authorization["username"]
    : null;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Please provide a review" });
  }

  // Add or update the review under the user's username key
  books[isbn].reviews[username] = review;
  return res
    .status(200)
    .json({
      message: `The review for the book with ISBN ${isbn} has been added/updated.`,
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization
    ? req.session.authorization["username"]
    : null;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res
      .status(200)
      .json({
        message: `Reviews for the ISBN ${isbn} posted by user ${username} deleted.`,
      });
  } else {
    return res
      .status(404)
      .json({ message: "No review found for this user on this book" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
