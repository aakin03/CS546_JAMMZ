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

        return users().then((userCollection) => {
            return userCollection.findOne({ _id: id });
        })
            .then((result) => {
                if (result === null) {
                    return Promise.reject(`No user with id ${id} was found.`);
                }
                else {
                    return result;
                }
            })
    },
	
	updateUser(id, updatedUser) {
        return this.getUserById(id).then((currentUser) => {
            let updatedUser = {
                name: updatedUser.name,
                age: updatedUser.age
            };

            let updateCommand = { 
                $set: updatedUser
            };

            return userCollection.updateOne({ _id: id }, updateCommand).then(() => {
                return this.getUserById(id);
            });
        });
    },
	
    removeUser(id) {
        return users().then((userCollection) => {
            return userCollection.removeOne({ _id: id }).then((deletionInfo) => {
                if (deletionInfo.deletedCount === 0) {
                    throw (`Could not delete user with id of ${id}`)
                }
            });
        });
    },
	
};

module.exports = exportedMethods;