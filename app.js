/* JAMMZ - CS 546 Final */


const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const static = express.static(__dirname+'/public');
let app = express();
let configRoutes = require("./routes");
const exphbs = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');

app.use("/public", static);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());
app.engine('handlebars', exphbs({}));
app.set('view engine', 'handlebars');
app.use(session({ secret: 'graduationplz', resave:true, saveUninitialized:true }));
app.use(passport.initialize());
app.use(passport.session());
configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3000");
});