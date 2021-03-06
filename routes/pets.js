
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
    
    if (!req.isAuthenticated())
        return res.redirect('/');
    
    pets.addPet(req.body.name, req.user.userName, breed, age, color, weight, req.body.cost, "Available", req.body.info)
        .then((newPetId) => {
			res.redirect("/newpet?success=false");
        })
        .catch((e) => {
            res.redirect("/home?success=true");
    });
});

router.post("/update", isLoggedIn, function(req,res) {
    if (!req.isAuthenticated())
        return res.redirect('/');
    pets.getOnePet(req.body.petName, req.user.userName)
    .then((result) => {
        return pets.updatePet(result[0], req.body, req.user.userName)
        .then((updated) => {
            res.redirect("/updatepet?success=false");
        })
        .catch((e) => {
            res.redirect("/home?success=true");
        });
    });
});

router.post("/adopted", isLoggedIn, function(req, res) {
    if (!req.isAuthenticated())
        return res.redirect('/');
    pets.getOnePet(req.body.petNameAdopt, req.body.ownerNameAdopt)
    .then((result) => {
        result[0].status = "Adopted";
        
        let newInfo = {
            _id: req.body._id,
            petName: req.body.petNameAdopt,
            ownerName: req.user.userName,
            attributes: {
                Breed: req.body.Breed,
                Age: req.body.Age,
                Color: req.body.Color,
                Weight: req.body.Weight
            },
            cost: req.body.cost,
            status: result[0].status,
            extraInfo: req.body.extraInfo
        }
        
        return pets.updatePet(result[0], newInfo, req.body.ownerNameAdopt)
        .then((updated) => {
            res.redirect("/home?success=false");
        })
        .catch((e) => {
            res.redirect("/adopted?success=true");
        });
    });
});


module.exports = router;
