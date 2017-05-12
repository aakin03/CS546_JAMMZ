
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
    let breed = req.body.breed;
    let age =  req.body.age;
    let color = req.body.color;
    let weight = req.body.weight;
    
    pets.addPet(req.body.name, req.user.userName, breed, age, color, weight, req.body.cost, "Owned", req.body.info)
        .then((newPetId) => {
            res.redirect("/home?success=true"); 
        })
        .catch((e) => {
            res.redirect("/newpet?success=false");
        });
});

router.post("/update", isLoggedIn, function(req,res) {
    pets.getPet(req.body.name)
    .then((result) => {
        return pets.updatePet(result._id, result)
        .then((updated) => {
            return updated;
        })
        .catch((e) => {
            return Promise.reject('Could not update');
        });
    });
});

module.exports = router;
