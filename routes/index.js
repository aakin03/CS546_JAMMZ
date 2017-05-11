const homeRoutes = require("./home");
const petsRoutes = require("./pets");

const constructorMethod = (app) => {
    app.use("/", homeRoutes);

    app.use("/pets", petsRoutes);

    app.use("*", (req, res) => {
        res.status(404).json({error: "Route Not Found"});
    });

};


module.exports = constructorMethod;