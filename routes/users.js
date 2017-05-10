
/* JAMMZ Final
 */

const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt-nodejs");
const data = require("../data");
const users = data.users;


function findUser(givenUser){
    return users.username === givenUser;
}

passport.serializeUser(function (user, done) {
    done(null, user._id);
});


passport.deserializeUser(function (id, done) {
    users.getUserById(id).then((currentUser) =>{
        done(null, currentUser);
    });
});

/* function to pass to the private route to ensure user is logged in */
function isLoggedIn(req, res ,next) {
    if (req.isAuthenticated())
        return next();
    res.sendStatus(401);
}

/* function utilizing bcrypt to check if the password is correct */
function comparePasswords(password, hashedPassword){
    return new Promise((resolve, reject) => {
        var result = bcrypt.compareSync(password, hashedPassword);

        if (result) {
            return resolve();
        } else{
            return reject();
        }
    });
}

passport.use('local', new LocalStrategy(
    function (username, password, done) {
        users.getUser(username).then((currentUser) => {
            comparePasswords(password, currentUser.hashedPassword).then(() =>{
                return done(null, currentUser);
            }).catch(() => {
                return done(null, false, {"message": "Password incorrect"});
            });
        }).catch(() =>{
            return done(null, false, {"message": "User not found."});
        });
    })
);


/* This route loads the homepage. */
router.get("/", (req,res) => {
    if (req.isAuthenticated()){
        return res.render('layouts/private',{user: req.user});
    } else {
        var error = req.flash('error');
        res.render('layouts/login', {errors: error});
    }
});

/* This route processes the login form from the root, delivers back home 
 * if authentication fails or to the private page if it is successful */
router.post('/login', passport.authenticate('local', {
      successRedirect: "/home",
      failureRedirect: "/",
      failureFlash: true}));


router.get("/private", isLoggedIn, function(req, res) {
    res.render("/private", {user: req.user});
});

router.post('/newuser',
    function(req,res){
        users.addUser(req.body.username, req.body.password, req.body.name, req.body.age)
            .then((currentUser) => {
                res.render('layouts/home');
            })
            .catch((e) => {
                res.status(500).json({error: e});
            });
    });

router.get("/home", isLoggedIn, function(req,res) {
    res.render("layouts/home");
});

router.get('/newuser', function(req,res) {
    res.render("layouts/newUser");
});


module.exports = router;