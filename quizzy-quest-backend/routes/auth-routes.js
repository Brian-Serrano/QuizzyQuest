const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { validateLogin, validateSignup, createDateForFile, createImage, userImagePath } = require("../utils");
const { User } = require("../database");

router.post("/log-in", async (req, res) => {
    try {
        const user = await User.findOne({where: {email: req.body.email}});
        const validation = await validateLogin(
            user, req.body.email, req.body.password
        );
        if (validation.isValid) {
            const token = jwt.sign({userId: user.id}, process.env.SECRET_KEY, {expiresIn: "7 days"});
            res.status(201).json({
                token: token,
                id: user.id,
                name: user.name,
                image_path: user.image_path
            }); 
        } else {
            res.status(400).json({message: validation.message});
        }
    } catch (error) {
        res.status(500).json({error: error.toString()});
    }
});

router.post("/sign-up", async (req, res) => {
    try {
        const validation = await validateSignup(
            req.body.name,
            req.body.email,
            req.body.password,
            req.body.confirmPassword
        );
    
        if (validation.isValid) {
            const fileName = `${userImagePath}/${createDateForFile()}.png`;
            createImage(200, 200, fileName, 80, req.body.name.toUpperCase()[0]);

            const user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: await bcrypt.hash(req.body.password, process.env.SALT),
                image_path: fileName
            });
            const token = jwt.sign({userId: user.id}, process.env.SECRET_KEY, {expiresIn: "7 days"});
            res.status(201).json({
                token: token,
                id: user.id,
                name: user.name,
                image_path: fileName
            }); 
        } else {
            res.status(400).json({message: validation.message});
        }
    } catch (error) {
        res.status(500).json({error: error.toString()});
    }
});

router.post("/forgot-password", (req, res) => {
    res.send("POST route on things.");
});

router.post("/change-password", (req, res) => {
    res.send("POST route on things.");
});

module.exports = router;