const mongoCollections = require("../config/mongoCollections");
const uuidV4 = require('uuid/v4');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt-nodejs");

let exportedMethods = {
    //getUser
    //addUser
    //deleteUser
    //updateUser
};

module.exports = exportedMethods;