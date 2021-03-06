const mongoCollections = require("../config/mongoCollections");
const uuidV4 = require('uuid/v4');
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
                userName: userName,
                hashedPassword: hash,
                profile: {
                    name: name,
                    age: age,
                    wishList: [],
					preferences: [],
                    _id: uuid
                }
            }

            return userCollection
                .insertOne(newUser)
                .then((newInsertInformation) => {
                    return newInsertInformation.insertedId;
                })
                .then((newId) => {
                    return this.getUserById(newId)
                });
        });
    },
	
    getUserById(id) {
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
	
	
    getUser(userName) {
        if (!userName)
            return Promise.reject("You must provide a username to search for");

        return users().then((userCollection) => {
            return userCollection.findOne({ userName: userName });
        })
            .then((result) => {
                if (result === null) {
                    return Promise.reject(`No user with name ${userName} was found.`);
                }
                else {
                    return result;
                }
            })
    },
	
	updateUser(id, updatedUser) {
        return users().then((userCollection) => {
        return this.getUserById(id)
        .then((currentUser) => {
            let uName, pName, pAge, pWishlist, pPreferences;
            
            if (updatedUser.userName)
                uName = updatedUser.userName;
            else
                uName = currentUser.userName;
            
            if (updatedUser.profile.name)
                pName = updatedUser.profile.name;
            else
                pName = currentUser.profile.name;
            
            if (updatedUser.profile.age)
                pAge = updatedUser.profile.age;
            else
                pAge = currentUser.profile.age;
            
            if (updatedUser.profile.wishList)
                pWishList = updatedUser.profile.wishList;
            else
                pWishList = currentUser.profile.wishList;
			
			if (updatedUser.profile.preferences)
                pPreferences = updatedUser.profile.preferences;
            else
                pPreferences = currentUser.profile.preferences;

            let newInfo = {
                _id: id,
                sessionId: null,
                userName: uName,
                hashedPassword: currentUser.hashedPassword,
                profile: {
                    name: pName,
                    age: pAge,
                    wishList: pWishList,
					preferences: pPreferences,
                    _id: id
                },
				
            }
            
            let updateCommand = { 
                $set: newInfo
            };
            
            return userCollection.updateOne({_id: id}, updateCommand).then((result) => {
                return this.getUserById(id)
                .then((result) => {
                    return result;
                });
            });
            });
        });
        },
	
};

module.exports = exportedMethods;