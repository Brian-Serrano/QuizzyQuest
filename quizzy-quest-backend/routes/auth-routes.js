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
        // get the user that will check if account/user exists
        const user = await User.findOne({where: {email: req.body.email}});
        // validate user login request data
        const validation = await validateLogin(
            user, req.body.email, req.body.password
        );

        // check if login request data was valid
        if (validation.isValid) {
            // generate the token that will be used for accessing authorized routes
            const token = jwt.sign({userId: user.id}, process.env.SECRET_KEY, {expiresIn: "7 days"});

            // return the user information and token that should be save to browser local storage for displaying user information and accessing authorized routes
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
        // validate user signup request data
        const validation = await validateSignup(
            req.body.name,
            req.body.email,
            req.body.password,
            req.body.confirmPassword,
            req.body.termsAccepted
        );

        // check if signup request data was valid
        if (validation.isValid) {
            // create file name for the default user image
            const fileName = `${userImagePath}/${createDateForFile()}.png`;

            // create the user account
            const user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: await bcrypt.hash(req.body.password, process.env.SALT),
                image_path: fileName
            }, { transaction: transaction });

            // create the image and save in the directory for user
            createImage(200, 200, fileName, 120, req.body.name.toUpperCase()[0]);

            // generate the token that will be used for accessing authorized routes
            const token = jwt.sign({userId: user.id}, process.env.SECRET_KEY, {expiresIn: "7 days"});

            // commit/apply the created user account
            await transaction.commit();

            // return the user information and token that should be save to browser local storage for displaying user information and accessing authorized routes
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
        // validate the email that will receive a code
        const validation = validateEmail(req.body.email);

        // check if the email was valid
        if (validation.isValid) {
            // create eight random alphanumeric character code
            const code = Math.random().toString(36).slice(2, 10).toUpperCase();
            // send mail to the user with the code
            sendEmail(req.body.email, code);
            // save the code temporarily in user's database that will be soon used for validation of entered user code
            await User.update(
                {forgot_password_code: code},
                {where: {email: req.body.email}}
            );
            // return message
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
        // get the user's code in database that will be used for checking matches in entered code
        const user = await User.findOne({
            attributes: ['forgot_password_code'],
            where: {email: req.body.email}
        });
        // validate the changed password and code
        const validation = validateForgotPassword(
            user.forgot_password_code,
            req.body.forgot_password_code,
            req.body.password,
            req.body.confirmPassword
        );

        // check if the password is valid
        if (validation.isValid) {
            // change the user password and remove the code temporarily created in the database
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