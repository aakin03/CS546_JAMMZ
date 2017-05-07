const mongoCollections = require("../config/mongoCollections");
const uuidV4 = require('uuid/v4');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt-nodejs");
const users = mongoCollections.users;

let exportedMethods = {
    addUser(userName, password, name, age) {
        if (!userName)
            return Promise.reject("You must supply a username.");
        if (!password)
            return Promise.reject("You must supply a password");
        if (!name)
            return Promise.reject("You must supply a name");
        
        //hash the password here
        var hash = bcrypt.hashSync(password);

        //generate uuid for user here
        let uuid = uuidV4()
        
        return users().then((userCollection) => {
            let newUser = {
                _id: uuid,
                sessionId: null,
                hashedPassword: hash,
                profile: {
                    name: name,
                    age: age,
                    wishList: null,
                    _id: uuid
                }
            }

            return userCollection
                .insertOne(newUser)
                .then((newInsertInformation) => {
                    return newInsertInformation.insertedId;
                })
                .then((newId) => {
                    return this.getUser(newId)
                });
        });



    },
    getUser(id) {
        if (!id)
            return Promise.reject("You must provide an id to search for");

        return users().then((usersCollection) => {
            return usersCollection.findOne({ _id: id });
        })
            .then((result) => {
                if (result === null) {
                    return Promise.reject(`No user with id ${id} was found.`);
                }
                else {
                    return result;
                }
            })
    }


    //deleteUser
    //updateUser
};

module.exports = exportedMethods;