const express = require("express");
const router = express.Router();
const { User } = require("../database");
const {
    validatePassword,
    validateUsername,
    validateRole,
    createDateForFile,
    userImagePath,
    relativePath,
    formatDate
} = require("../utils");
const multer = require("multer");
const bcrypt = require("bcrypt");
const fs = require("fs");

// StorageEngine implementation configured to store files on the local file system
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, relativePath + userImagePath);
    },
    filename: (req, file, cb) => {
        cb(null, `${createDateForFile()}.png`);
    }
});

// multer instance that provides several methods for generating middleware that process files uploaded in multipart/form-data format.
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        cb(null, ["image/png", "image/jpeg"].includes(file.mimetype));
    }
});

router.post("/change-image", upload.single("file"), async (req, res) => {
    try {
        // check if there is image
        if (req.file) {
            // file name that will be save to image path of user's image in database
            const filename = `${userImagePath}/${req.file.filename}`
            // get the user changes the image
            const user = await User.findOne({where: {id: res.locals.userId}});
            // update user's image path in database
            await User.update({image_path: filename}, {where: {id: res.locals.userId}});
            // delete the previous image saved in image directory
            fs.unlinkSync(relativePath + user.image_path);
            // return message with the image name
            return res.status(201).json({message: "Image successfully saved", image_path: filename});
        } else {
            return res.status(400).json({message: "Invalid image"});
        }
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

router.post("/change-password", async (req, res) => {
    try {
        // get the user change the password
        const user = await User.findOne({where: {id: res.locals.userId}});
        // validate the changed password
        const validation = await validatePassword(
            req.body.currentPassword,
            req.body.newPassword,
            req.body.confirmPassword,
            user.password
        );
        // check if password is valid
        if (validation.isValid) {
            // save the new password in database
            await User.update({
                password: await bcrypt.hash(req.body.newPassword, process.env.SALT)
            }, {where: {id: res.locals.userId}});
            // return message
            return res.status(201).json({message: validation.message});
        } else {
            return res.status(400).json({message: validation.message});
        }
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

router.post("/change-name", async (req, res) => {
    try {
        // validate the user name
        const validation = validateUsername(req.body.name);
        // check if user name is valid
        if (validation.isValid) {
            // save new user name in database
            await User.update({name: req.body.name}, {where: {id: res.locals.userId}});
            // return message and the user name
            return res.status(201).json({message: validation.message, name: req.body.name});
        } else {
            return res.status(400).json({message: validation.message});
        }
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

router.post("/change-role", async (req, res) => {
    try {
        // validate the role
        const validation = validateRole(req.body.role);
        // check if role is valid
        if (validation.isValid) {
            // save new role in database
            await User.update({role: req.body.role}, {where: {id: res.locals.userId}});
            // return message
            return res.status(201).json({message: validation.message});
        } else {
            return res.status(400).json({message: validation.message});
        }
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

router.get("/get-user", async (req, res) => {
    try {
        // get the requested user and return as response
        const user = await User.findOne({where: {id: res.locals.userId}});
        return res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image_path: user.image_path,
            createdAt: formatDate(user.createdAt),
            updatedAt: formatDate(user.updatedAt)
        });
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

module.exports = router;