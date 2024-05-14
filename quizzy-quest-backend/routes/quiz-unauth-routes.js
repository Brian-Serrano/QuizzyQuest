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
        // create the quiz answer and store in database
        await QuizAnswer.create({
            user_id: 0,
            quiz_id: req.body.quiz_id,
            type: req.body.type,
            points: req.body.points.join("|"),
            answers: req.body.answers.join("|"),
            remaining_times: req.body.remaining_times.join("|"),
            questions: req.body.questions.join("|")
        });
        // return message
        return res.status(200).json({message: "Quiz successfully finished"});
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

// route that will be requested before accessing unauthorized answer quiz page
router.get("/access-unauth-answer-quiz", async (req, res) => {
    try {
        // get the quiz for verification
        const quiz = await Quiz.findOne({
            where: {
                quiz_id: req.query.quiz_id
            },
            attributes: ['visibility']
        });

        // check if quiz do not exist
        if (!quiz) {
            return res.status(400).json({is_allowed: false, message: "Quiz not found."});
        }
        // check if quiz is private
        if (!quiz.visibility) {
            return res.status(400).json({is_allowed: false, message: "Quiz is private."});
        }

        return res.status(200).json({is_allowed: true, message: "Route is allowed."});
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

module.exports = router;