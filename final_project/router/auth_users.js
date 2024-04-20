const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{  if (!username) {
    return false;
}

// Check if the username contains only alphanumeric characters and underscores
if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return false;
}

// Check if the username is unique (not already used by another user)
if (users.includes(username)) {
    return false;
}

// If all checks pass, the username is considered valid
return true;
};
function getUserByUsername(username) {
    // Find the user with the provided username in the array of users
    return users.find(user => user.username === username);
};

const authenticatedUser = (username,password)=>{ //returns boolean
    const user = getUserByUsername(username);

    // Check if a user with the provided username exists
    if (user) {
        // Check if the provided password matches the password stored for the user
        if (user.password === password) {
            // If the passwords match, return true to indicate successful authentication
            return true;
        } else {
            // If the passwords don't match, return false to indicate authentication failure
            return false;
        }
    } else {
        // If no user with the provided username exists, return false to indicate authentication failure
        return false;
}
};
//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;
  if (authenticatedUser(username, password))
  {return res.status(300).json({message: "Login successful!"});
  }
  else
  {
    return res.status(401).json({message:"Invalid username or password!"})
  }
});

// Function to add a book review
function addBookReview(isbn, review) {
    return new Promise((resolve, reject) => {
        // Perform asynchronous operations to add the review
        // For demonstration purposes, we'll just resolve immediately
        resolve({ isbn, review }); // Resolve with the ISBN and review
    });
}

// Route to add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review; // Assuming the review is sent in the request body
    
    // Call the addBookReview function
    addBookReview(isbn, review)
        .then(result => {
            res.status(200).json({ message: "Review added successfully", review: result });
        })
        .catch(error => {
            console.error("Error adding review:", error);
            res.status(500).json({ message: "Internal server error" });
        });
});

function deleteBookReview(isbn) {
    return new Promise((resolve, reject) => {
        // Resolving the Promise with the provided ISBN
        resolve(isbn); // Resolve with the ISBN of the deleted review
    });
}

// Route to delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    
    // Call the deleteBookReview function
    deleteBookReview(isbn)
        .then(deletedIsbn => {
            res.status(200).json({ message: "Review deleted successfully", deletedIsbn });
        })
        .catch(error => {
            console.error("Error deleting review:", error);
            res.status(500).json({ message: "Internal server error" });
        });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;