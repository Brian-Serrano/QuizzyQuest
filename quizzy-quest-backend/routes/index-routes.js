const express = require("express");
const router = express.Router();

const authRoutes = require("./auth-routes");
const quizRoutes = require("./quiz-routes");
const userRoutes = require("./user-routes");

router.use("/auth-routes", authRoutes);
router.use("/quiz-routes", quizRoutes);
router.use("/user-routes", userRoutes);

module.exports = router;