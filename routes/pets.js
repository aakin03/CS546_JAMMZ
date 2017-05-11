
const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const data = require("../data");
const users = data.users;
const pets = data.pets;


/* function to pass to the private route to ensure user is logged in */
function isLoggedIn(req, res ,next) {
    if (req.isAuthenticated())
        return next();
    res.sendStatus(401);
}

/* Takes form input from /newpet page and enrolls new pet in database */
router.post("/create", isLoggedIn, function(req,res) {
    let attributes = {
        breed: req.body.breed,
        age: req.body.age,
        color: req.body.color,
        weight: req.body.weight
    }
    pets.addPet(req.body.name, req.user, attributes, req.body.cost, "Owned", req.body.info)
        .then((newPetId) => {
            res.redirect("/home?success=true"); 
        })
        .catch((e) => {
            res.redirect("/newpet?success=false");
        });
});

module.exports = router;
