const express = require("express");
const router = express.Router();
const { QuizAnswer, Quiz } = require("../database");

// route that will be requested before accessing answer quiz page
router.get("/access-answer-quiz", async (req, res) => {
    try {
        // get the answer for checking if quiz was answered
        const answer = await QuizAnswer.findOne({
            where: {
                quiz_id: req.query.quiz_id,
                user_id: req.query.user_id
            },
            attributes: ['quiz_answer_id']
        });
        // get the quiz for checking if it exists or public
        const quiz = await Quiz.findOne({
            where: {
                quiz_id: req.query.quiz_id
            },
            attributes: ['visibility', 'user_id']
        });

        // check if quiz do not exist
        if (!quiz) {
            return res.status(400).json({is_allowed: false, message: "Quiz not found."});
        }
        // check if quiz is answered
        if (answer) {
            return res.status(400).json({is_allowed: false, message: "Quiz is already answered."});
        }
        // check if quiz is private
        if (!quiz.visibility) {
            return res.status(400).json({is_allowed: false, message: "Quiz is private."});
        }
        // check if the quiz creator was the user want to access the page
        if (Number(req.query.user_id) === quiz.user_id) {
            return res.status(400).json({is_allowed: false, message: "You can not answer a quiz you have created."});
        }
    
        return res.status(200).json({is_allowed: true, message: "Route is allowed."});
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

// route that will be requested before accessing about quiz and edit quiz page
router.get("/access-about-quiz", async (req, res) => {
    try {
        // get the quiz for verification
        const quiz = await Quiz.findOne({
            where: {
                quiz_id: req.query.quiz_id
            },
            attributes: ['user_id']
        });

        // check if quiz do not exist
        if (!quiz) {
            return res.status(400).json({is_allowed: false, message: "Quiz not found."});
        }
        // check if the quiz creator was not the user want to access the page
        if (Number(req.query.user_id) !== quiz.user_id) {
            return res.status(400).json({is_allowed: false, message: "You can not view the quiz you did not create."});
        }
    
        return res.status(200).json({is_allowed: true, message: "Route is allowed."});
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

module.exports = router;