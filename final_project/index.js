const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

let users = [];
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
app.use("/customer/auth/*", function auth(req,res,next){
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
   if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));