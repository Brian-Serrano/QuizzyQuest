const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require('cors');

const routes = require("./routes/index-routes");

// create express application
const app = express();
const PORT = 4000;

// add parser for requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// allow react front-end application from CORS
app.use(cors({origin: "http://localhost:3000"}));

// serve static files (images)
app.use(express.static("images"));

// add middleware for authorization of users
app.use((req, res, next) => {
    // only access-routes, quiz-routes and user-routes requires authorization
    const route = /access-routes|quiz-routes|user-routes/;
    if (!route.test(req.path)) {
        return next();
    }

    // get authorization header/token
    const token = req.header("Authorization");

    // check if the token not exists
    if (!token) {
        return res.status(401).json({ error: "A valid token is missing!" });
    }
    try {
        // get the data from token
        const data = jwt.verify(token, process.env.SECRET_KEY);

        // assign to response locals the user id from token that can be used by the routes that requires authorization
        res.locals.userId = data.userId;

        return next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
});

// add the routes to the express application
app.use("/api", routes);

app.listen(PORT, (error) => {
    if (error) {
        console.log("Error occurred, server can't start", error);
    }
    else {
        console.log("Server is Successfully Running, and App is listening on port " + PORT);
    }
});