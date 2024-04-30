const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require('cors');

const routes = require("./routes/index-routes");

const app = express();
const PORT = 4000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({origin: "http://localhost:3000"}));
app.use(express.static("images"));

app.use((req, res, next) => {
    const route = /access-routes|quiz-routes|user-routes/;
    if (!route.test(req.path)) {
        return next();
    }

    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "A valid token is missing!" });
    }
    try {
        const data = jwt.verify(token, process.env.SECRET_KEY);
        res.locals.userId = data.userId;
        return next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
});

app.use("/api", routes);

app.listen(PORT, (error) => {
    if (error) {
        console.log("Error occurred, server can't start", error);
    }
    else {
        console.log("Server is Successfully Running, and App is listening on port " + PORT);
    }
});