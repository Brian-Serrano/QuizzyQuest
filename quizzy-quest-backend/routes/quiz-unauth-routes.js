const express = require("express");
const router = express.Router();
const { Quiz, QuizAnswer } = require("../database");
const { getQuiz } = require("../utils");

router.get("/get-quiz", async (req, res) => {
    try {
        return res.status(200).json(await getQuiz(req));
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

router.post("/answer-quiz", async (req, res) => {
    try {
        await QuizAnswer.create({
            user_id: 0,
            quiz_id: req.body.quiz_id,
            type: req.body.type,
            points: req.body.points.join("|"),
            answers: req.body.answers.join("|"),
            remaining_times: req.body.remaining_times.join("|"),
            questions: req.body.questions.join("|")
        });
        return res.status(200).json({message: "Quiz successfully finished"});
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

router.get("/access-unauth-answer-quiz", async (req, res) => {
    try {
        const quiz = await Quiz.findOne({
            where: {
                quiz_id: req.query.quiz_id
            },
            attributes: ['visibility']
        });

        if (!quiz) {
            return res.status(400).json({is_allowed: false, message: "Quiz not found."});
        }
        if (!quiz.visibility) {
            return res.status(400).json({is_allowed: false, message: "Quiz is private."});
        }

        return res.status(200).json({is_allowed: true, message: "Route is allowed."});
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

module.exports = router;