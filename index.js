require('dotenv').config();
const { connectDB } = require('./config/dbConnection');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const session = require('express-session');
const config = require('./config/config');
app.use(session({ secret: config.sessionSecret, resave: true, saveUninitialized: true }));
app.use(express.static('public'));
const Port = process.env.PORT || 3000;

//DATABASE CONNECTION

connectDB();

// FOR ROUTES

app.use('/', require('./routes/UserRoute'));
app.use('/admin', require('./routes/AdminRoute'));

//SERVER RUNNING PORT

app.listen(Port, () => console.log(`Server is Running on Port : ${Port}`));
