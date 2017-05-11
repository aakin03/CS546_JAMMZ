
/* JAMMZ Final
 */

const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt-nodejs");
const data = require("../data");
const users = data.users;
const pets = data.pets;


passport.serializeUser(function (user, done) {
    done(null, user._id);
});


passport.deserializeUser(function (id, done) {
    users.getUserById(id).then((currentUser) => {
        done(null, currentUser);
    });
});

/* function to pass to the private route to ensure user is logged in */
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.sendStatus(401);
}

/* function utilizing bcrypt to check if the password is correct */
function comparePasswords(password, hashedPassword) {
    return new Promise((resolve, reject) => {
        var result = bcrypt.compareSync(password, hashedPassword);

        if (result) {
            return resolve();
        } else {
            return reject();
        }
    });
}

passport.use('local', new LocalStrategy(
    function (username, password, done) {
        users.getUser(username).then((currentUser) => {
            comparePasswords(password, currentUser.hashedPassword).then(() => {
                return done(null, currentUser);
            }).catch(() => {
                return done(null, false, { "message": "Password incorrect" });
            });
        }).catch(() => {
            return done(null, false, { "message": "User not found." });
        });
    })
);


/* This route loads the homepage or renders the login page if not authenticated. */
router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/home');
    } else {
        var error = req.flash('error');
        res.render('layouts/login', { errors: error });
    }
});

/* This route processes the login form from the root, delivers home on success 
 * and back to login on fail */
router.post('/login', passport.authenticate('local', {
    successRedirect: "/home",
    failureRedirect: "/",
    failureFlash: true
}));


router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

/* Adds user, then renders login page */
router.post('/newuser',
    function (req, res) {
        users.addUser(req.body.username, req.body.password, req.body.name, req.body.age)
            .then(() => {
                res.render('layouts/login');
            })
            .catch((e) => {
                res.status(500).json({ error: e });
            });
    });

/* Redirects to login page if not authenticated. If authenticated,
 * renders main page which could display most recent animal listings */
router.get("/home", function (req, res) {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    var info;
    pets.viewAllPets()
        .then((result) => {
            if (req.query.success == "true") {
                info = "Successfully enrolled a new pet!"
            }
            let petsArray = result;
            res.render("layouts/home.handlebars", { user: req.user.userName, id: req.user._id, name: req.user.profile.name, age: req.user.profile.age, wishlist: req.user.profile.wishlist, petsArry: petsArray});
        })
        .catch((e) => {
            res.render("layouts/home", { user: req.user.userName, info: info, petsArray: e });
        });
});

router.get('/newuser', function (req, res) {
    res.render("layouts/newUser");
});

/* Renders pet enrollment page if authenticated, if not redirects to login */
router.get('/newpet', function (req, res) {
    var errors;
    if (!req.isAuthenticated()) {
        return res.redirect("/");
    }
    if (req.query.success == "false") {
        errors = "Failed to create new pet. Please try again.";
    }

    console.log("help!");
    res.render("layouts/newPet", { user: req.user.userName, info: errors })
});


module.exports = router;