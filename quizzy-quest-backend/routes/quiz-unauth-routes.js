const express = require("express");
const router = express.Router();
const { Quiz, QuizAnswer } = require("../database");
const { getQuestions, getUser, formatDate } = require("../utils");

router.get("/get-quiz", async (req, res) => {
    try {
        const actions = getQuestions();
        const quiz = await Quiz.findOne({where: {quiz_id: req.query.quiz_id}});
        const questions = await actions[quiz.type](quiz.questions_id.split("|").map(id => Number(id)));
        const response = {
            quiz_id: quiz.quiz_id,
            user: await getUser(quiz.user_id),
            name: quiz.name,
            description: quiz.description,
            topic: quiz.topic,
            type: quiz.type,
            questions: questions,
            image_path: quiz.image_path,
            createdAt: formatDate(quiz.createdAt),
            updatedAt: formatDate(quiz.updatedAt)
        };
        return res.status(200).json(response);
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

module.exports = router;