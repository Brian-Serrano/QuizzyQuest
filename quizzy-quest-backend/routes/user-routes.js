const express = require("express");
const router = express.Router();
const { User } = require("../database");
const {
    validatePassword,
    validateUsername,
    validateRole,
    createDateForFile,
    userImagePath,
    relativePath
} = require("../utils");
const multer = require("multer");
const bcrypt = require("bcrypt");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, relativePath + userImagePath);
    },
    filename: (req, file, cb) => {
        cb(null, `${createDateForFile()}.png`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        cb(null, ["image/png", "image/jpeg"].includes(file.mimetype));
    }
});

router.post("/change-image", upload.single("file"), async (req, res) => {
    try {
        if (req.file) {
            const filename = `${userImagePath}/${req.file.filename}`
            const user = await User.findOne({where: {id: res.locals.userId}});
            await User.update({
                image_path: filename
            }, {
                where: {
                    id: res.locals.userId
                }
            });
            fs.unlinkSync(relativePath + user.image_path);
            res.status(201).json({message: "Image successfully saved", image_path: filename});
        } else {
            res.status(400).json({message: "Invalid image"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.toString()});
    }
});

router.post("/change-password", async (req, res) => {
    try {
        const user = await User.findOne({where: {id: res.locals.userId}});
        const validation = await validatePassword(
            req.body.currentPassword,
            req.body.newPassword,
            req.body.confirmPassword,
            user.password
        );
        if (validation.isValid) {
            await User.update({
                password: await bcrypt.hash(req.body.newPassword, process.env.SALT)
            }, {
                where: {
                    id: res.locals.userId
                }
            });
            res.status(201).json({message: validation.message});
        } else {
            res.status(400).json({message: validation.message});
        }
    } catch (error) {
        res.status(500).json({error: error.toString()});
    }
});

router.post("/change-name", async (req, res) => {
    try {
        const validation = validateUsername(req.body.name);
        if (validation.isValid) {
            await User.update({
                name: req.body.name
            }, {
                where: {
                    id: res.locals.userId
                }
            });
            res.status(201).json({message: validation.message, name: req.body.name});
        } else {
            res.status(400).json({message: validation.message});
        }
    } catch (error) {
        res.status(500).json({error: error.toString()});
    }
});

router.post("/change-role", async (req, res) => {
    try {
        const validation = validateRole(req.body.role);
        if (validation.isValid) {
            await User.update({
                role: req.body.role
            }, {
                where: {
                    id: res.locals.userId
                }
            });
            res.status(201).json({message: validation.message});
        } else {
            res.status(400).json({message: validation.message});
        }
    } catch (error) {
        res.status(500).json({error: error.toString()});
    }
});

router.get("/get-user", async (req, res) => {
    try {
        const user = await User.findOne({where: {id: req.query.id}});
        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image_path: user.image_path
        });
    } catch (error) {
        res.status(500).json({error: error.toString()});
    }
});

module.exports = router;