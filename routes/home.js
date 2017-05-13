
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
        res.redirect('/buyPet');
    } else {
        var error = req.flash('error');
        res.render('layouts/login', { errors: error });
    }
});

/* This route processes the login form from the root, delivers home on success 
 * and back to login on fail */
router.post('/login', passport.authenticate('local', {
    successRedirect: "/buyPet",
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
    
    pets.getUsersPets(req.user.userName)
        .then((result) => {
            if (req.query.success == "true") {
                info = "Successfully enrolled a new pet!"
            }
            let petsArray = result;

            res.render("layouts/home.handlebars", {user: req.user.userName, id: req.user._id, name: req.user.profile.name, age: req.user.profile.age, wishlist: req.user.profile.wishlist, preferences: req.user.profile.preferences, petsArray: petsArray});
        })
        .catch((e) => {
            res.render("layouts/home", {user: req.user.userName, id: req.user._id, name: req.user.profile.name, age: req.user.profile.age, wishlist: req.user.profile.wishlist, preferences: req.user.profile.preferences});

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
    res.render("layouts/newPet", { user: req.user.userName, info: errors })
});

router.get('/buypet', function (req, res) {
   if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    var info;
	console.log(req.body);
	
    pets.viewAllPetsByStatus()
        .then((result) => {
            if (req.query.success == "true") {
                info = "Successfully found available pets!"
            }
            let petsArray = result;
            res.render("layouts/buyPet.handlebars", {petsArray: petsArray});
        })
        .catch((e) => {
            res.render("layouts/buyPet", {petsArray: petsArray});
        });
});

router.get('/adopted', function (req, res) {
    var errors;
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    if (req.query.success == "false") {
        errors = "Failed to update pet. Please try again.";
    }
    res.render("layouts/adopted", {user: req.user.userName, info: errors })
});

router.get('/wishlist', function (req, res) {
    var errors;
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    if (req.query.success == "false") {
        errors = "Failed to update wishlist. Please try again.";
    }
    res.render("layouts/home", {user: req.user.userName, info: errors })
});

router.post('/wishlist', isLoggedIn, function (req, res) {
    if (!req.isAuthenticated())
        return res.redirect('/');
    pets.getOnePet(req.body.petName, req.body.ownerName)
    .then((result) => {        
        req.user.profile.wishList.push(result);
                
        let newInfo = {
            _id: req.user._id,
            sessionId: null,
            userName: req.user.userName,
            hashedPassword: req.user.hashedPassword,
            profile: {
                name: req.user.profile.name,
                age: req.user.profile.age,
                wishList: req.user.profile.wishList,
				preferences: req.user.profile.preferences,
                _id: req.user._id
            }
        }
        
        console.log("\nWishlist");
        console.log(req.user.profile.wishList);
        
        return users.updateUser(req.user._id, newInfo)
        .then((updated) => {
            
            console.log("\nupdated");
            console.log(updated);
            
            res.redirect("/home?success=true");
        })
        .catch((e) => {
            res.redirect("/home?success=false"); 
        });
    });
});

router.get('/updatepet', function (req, res) {
    var errors;
    if (!req.isAuthenticated()) {
        return res.redirect("/");
    }
    if (req.query.success == "false") {
        errors = "Failed to update pet. Please try again.";
    }
    res.render("layouts/updatePet", { user: req.user.userName, info: errors })
});


router.get('/preferences', function (req, res) {
    var errors;
    if (!req.isAuthenticated()) {
        return res.redirect("/");
    }
    if (req.query.success == "false") {
        errors = "Failed to update pet. Please try again.";
    }
    res.render("layouts/preferences", { user: req.user.userName, info: errors })
});


router.post("/preferences", isLoggedIn, function(req, res) {
    if (!req.isAuthenticated())
        return res.redirect('/');
    users.getUser(req.user.userName)
    .then((result) => {
		console.log(result);
        req.user.profile.preferences.push(result[0]);
        
        let newInfo = {
            _id: req.user._id,
            sessionId: null,
            userName: req.user.userName,
            hashedPassword: req.user.hashedPassword,
            profile: {
                name: req.user.profile.name,
                age: req.user.profile.age,
                wishList: req.user.profile.wishList,
				preferences:req.user.profile.preferences,
                _id: req.user._id
            },	
        }
               
        return users.updateUser(req.user._id, newInfo)
        .then((updated) => {
            res.redirect("/home?success=false");
        })
        .catch((e) => {
            res.redirect("/adopted?success=true");
        });
    });
});


module.exports = router;