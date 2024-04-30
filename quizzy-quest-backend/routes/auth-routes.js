const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const {
    validateLogin,
    validateEmail,
    validateSignup,
    validateForgotPassword,
    createDateForFile,
    createImage,
    userImagePath,
    sendEmail
} = require("../utils");
const { User, sequelize } = require("../database");

router.post("/log-in", async (req, res) => {
    try {
        const user = await User.findOne({where: {email: req.body.email}});
        const validation = await validateLogin(
            user, req.body.email, req.body.password
        );
        if (validation.isValid) {
            const token = jwt.sign({userId: user.id}, process.env.SECRET_KEY, {expiresIn: "7 days"});
            return res.status(201).json({
                token: token,
                id: user.id,
                name: user.name,
                image_path: user.image_path
            }); 
        } else {
            return res.status(400).json({message: validation.message});
        }
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

router.post("/sign-up", async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const validation = await validateSignup(
            req.body.name,
            req.body.email,
            req.body.password,
            req.body.confirmPassword,
            req.body.termsAccepted
        );
    
        if (validation.isValid) {
            const fileName = `${userImagePath}/${createDateForFile()}.png`;

            const user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: await bcrypt.hash(req.body.password, process.env.SALT),
                image_path: fileName
            }, { transaction: transaction });
            createImage(200, 200, fileName, 120, req.body.name.toUpperCase()[0]);
            const token = jwt.sign({userId: user.id}, process.env.SECRET_KEY, {expiresIn: "7 days"});
            await transaction.commit();
            return res.status(201).json({
                token: token,
                id: user.id,
                name: user.name,
                image_path: fileName
            }); 
        } else {
            return res.status(400).json({message: validation.message});
        }
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({error: error.toString()});
    }
});

router.post("/forgot-password", async (req, res) => {
    try {
        const validation = validateEmail(req.body.email);

        if (validation.isValid) {
            const code = Math.random().toString(36).slice(2, 10).toUpperCase();
            sendEmail(req.body.email, code);
            await User.update(
                {forgot_password_code: code},
                {where: {email: req.body.email}}
            );
            return res.status(201).json({message: "A code was sent to your mail."});
        } else {
            return res.status(400).json({message: validation.message});
        }
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

router.post("/change-password", async (req, res) => {
    try {
        const user = await User.findOne({
            attributes: ['forgot_password_code'],
            where: {email: req.body.email}
        });
        const validation = validateForgotPassword(
            user.forgot_password_code,
            req.body.forgot_password_code,
            req.body.password,
            req.body.confirmPassword
        );

        if (validation.isValid) {
            await User.update(
                {
                    forgot_password_code: "",
                    password: await bcrypt.hash(req.body.password, process.env.SALT)
                },
                {where: {email: req.body.email}}
            );
            return res.status(201).json({message: validation.message});
        } else {
            return res.status(400).json({message: validation.message});
        }
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

module.exports = router;