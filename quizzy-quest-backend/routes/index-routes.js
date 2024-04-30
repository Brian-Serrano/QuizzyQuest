const express = require("express");
const router = express.Router();

const accessRoutes = require("./access-routes");
const authRoutes = require("./auth-routes");
const quizRoutes = require("./quiz-routes");
const userRoutes = require("./user-routes");
const quizUnauthRoutes = require("./quiz-unauth-routes");

router.use("/access-routes", accessRoutes);
router.use("/auth-routes", authRoutes);
router.use("/quiz-routes", quizRoutes);
router.use("/user-routes", userRoutes);
router.use("/quiz-unauth-routes", quizUnauthRoutes);

module.exports = router;