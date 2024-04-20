const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body; // Assuming the username and password are sent in the request body
    const isValidPassword = (password) => {
    
        // Check if the password meets the minimum length requirement
        if (password.length < 8) 
        {
        return false;
        }
        return true;
    };
    // Check if the username is already taken
    if (users.some(user => user.username === username)) {
        return res.status(400).json({ message: "Username is already taken" });
    }

    // Check if the provided username and password are valid
    if (!isValid(username)) {
        return res.status(400).json({ message: "Invalid username" });
    }
    if (!isValidPassword(password)) {
        return res.status(400).json({ message: "Invalid password" });
    }

    // Add the new user to the list of registered users
    users.push({ username, password });

    return res.status(201).json({ message: "Registration successful" });
});
// Task #11
function getBookList()
{
    return new Promise((resolve,reject) => {
        if (books) {
            resolve(books);
        }
        else {
            reject(new Error("Unable to fetch book list!"));
        }
    });
}

// Get the book list available in the shop
public_users.get('/',function (req, res) 
{
    getBookList()
    .then(bookList => { 
res.send(JSON.stringify(books,null,4));
res.status(200).json({ message: "The list of books available in the shop" });
        })
        .catch(error => {
            // Handle any errors that occur during the request
            console.error("Error fetching book list:", error);
            res.status(500).json({ message: "Internal server error" });
        });
});

// Function to get book details based on ISBN
function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject(new Error("Book not found for the provided ISBN"));
        }
    });
}

// Route to get book details based on ISBN
public_users.get('/isbn/:isbn', function(req, res) {
    const isbn = req.params.isbn;
    // Call the getBookByISBN function
    getBookByISBN(isbn)
        .then(book => {
            res.json(book);
        })
        .catch(error => {
            res.status(404).json({ message: error.message });
        });
});
  
// Function to get books by author
function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        const matchingBooks = Object.values(books).filter(book => book.author === author);
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject(new Error("No books found for the author provided"));
        }
    });
}

// Route to get book details based on author
public_users.get('/author/:author', function(req, res) {
    const author = req.params.author;
    // Call the getBooksByAuthor function
    getBooksByAuthor(author)
        .then(matchingBooks => {
            res.json(matchingBooks);
        })
        .catch(error => {
            res.status(404).json({ message: error.message });
        });
});

// Function to get books by Title
function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        const matchingBooks = Object.values(books).filter(book => book.title === title);
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject(new Error("No books found for the title provided"));
        }
    });
}

// Route to get book details based on Title
public_users.get('/title/:title', function(req, res) {
    const title = req.params.title;
    // Call the getBooksByAuthor function
    getBooksByTitle(title)
        .then(matchingBooks => {
            res.json(matchingBooks);
        })
        .catch(error => {
            res.status(404).json({ message: error.message });
        });
});


// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    // Check if the isbn parameter is provided
    if (!isbn) {
        return res.status(400).json({ message: "ISBN parameter is missing in the URL" });
    }

    // Check if the books object and its reviews property are properly initialized
    if (!books || !books.reviews) {
        return res.status(500).json({ message: "Internal server error: Books data is not properly initialized" });
    }

    // Retrieve reviews for the provided ISBN
    const reviews = books.reviews[isbn];

    // Check if reviews are found for the provided ISBN
    if (reviews && reviews.length > 0) {
        // Send the reviews as the response
        res.json(reviews);
    } else {
        // Send a JSON response with a 404 status code if no reviews are found
        return res.status(404).json({ message: "No reviews found for the provided ISBN" });
    }
});


module.exports.general = public_users;

