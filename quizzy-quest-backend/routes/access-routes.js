const express = require("express");
const router = express.Router();
const { QuizAnswer, Quiz } = require("../database");

router.get("/access-answer-quiz", async (req, res) => {
    try {
        const answer = await QuizAnswer.findOne({
            where: {
                quiz_id: req.query.quiz_id,
                user_id: req.query.user_id
            },
            attributes: ['quiz_answer_id']
        });
        const quiz = await Quiz.findOne({
            where: {
                quiz_id: req.query.quiz_id
            },
            attributes: ['visibility', 'user_id']
        });
    
        if (answer) {
            return res.status(400).json({is_allowed: false, message: "Quiz is already answered."});
        }
        if (!quiz.visibility) {
            return res.status(400).json({is_allowed: false, message: "Quiz is private."});
        }
        if (Number(req.query.user_id) === quiz.user_id) {
            return res.status(400).json({is_allowed: false, message: "You can not answer a quiz you have created."});
        }
    
        return res.status(200).json({is_allowed: true, message: "Route is allowed."});
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

router.get("/access-about-quiz", async (req, res) => {
    try {
        const quiz = await Quiz.findOne({
            where: {
                quiz_id: req.query.quiz_id
            },
            attributes: ['user_id']
        });
    
        if (Number(req.query.user_id) !== quiz.user_id) {
            return res.status(400).json({is_allowed: false, message: "You can not view the quiz you did not create."});
        }
    
        return res.status(200).json({is_allowed: true, message: "Route is allowed."});
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

module.exports = router;