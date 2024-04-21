const express = require("express");
const router = express.Router();
const { Quiz, MultipleChoice, Identification, TrueOrFalse, QuizAnswer, sequelize } = require("../database");
const { Op } = require('sequelize');
const {
    validateMultipleChoice,
    validateIdentification,
    validateTrueOrFalse,
    validateQuiz,
    mapMultipleChoice,
    mapIdentification,
    mapTrueOrFalse,
    mapAnswer,
    createImage,
    createDateForFile,
    getUser,
    quizImagePath,
    relativePath
} = require("../utils");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, relativePath + quizImagePath);
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

router.get("/get-quiz", async (req, res) => {
    try {
        const actions = {
            "Multiple Choice": async (questions_id) => {
                return (await MultipleChoice.findAll({
                    where: {
                        question_id: {
                            [Op.or]: questions_id
                        }
                    }
                })).map(mapMultipleChoice);
            },
            "Identification": async (questions_id) => {
                return (await Identification.findAll({
                    where: {
                        question_id: {
                            [Op.or]: questions_id
                        }
                    }
                })).map(mapIdentification);
            },
            "True or False": async (questions_id) => {
                return (await TrueOrFalse.findAll({
                    where: {
                        question_id: {
                            [Op.or]: questions_id
                        }
                    }
                })).map(mapTrueOrFalse);
            }
        };
        const quiz = await Quiz.findOne({where: {quiz_id: req.query.quiz_id}});
        console.log(quiz);
        const questions = await actions[quiz.type](quiz.questions_id.split(",").map(id => Number(id)));
        const response = {
            quiz_id: quiz.quiz_id,
            user: await getUser(quiz.user_id),
            name: quiz.name,
            description: quiz.description,
            topic: quiz.topic,
            type: quiz.type,
            questions: questions,
            image_path: quiz.image_path
        };
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.toString()});
    }
});

router.get("/get-created-quiz", async (req, res) => {
    try {
        const quiz = await Quiz.findOne({where: {quiz_id: req.query.quiz_id}});
        const quizAnswers = await Promise.all((await QuizAnswer.findAll({
            where: {
                quiz_id: req.query.quiz_id,
                type: req.query.type
            }
        })).map(mapAnswer));
        const response = {
            quiz_id: quiz.quiz_id,
            name: quiz.name,
            description: quiz.description,
            topic: quiz.topic,
            type: quiz.type,
            answers: quizAnswers,
            image_path: quiz.image_path
        };
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.toString()});
    }
});

router.post("/add-quiz", upload.single("file"), async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const createQuiz = async (body, questions, transaction, user_id) => {
            let fileName = "";

            if (!req.file) {
                fileName = `${quizImagePath}/${createDateForFile()}.png`;
                createImage(300, 200, fileName, 30, "quizzy-quest");
            } else {
                fileName = `${quizImagePath}/${req.file.filename}`;
            }

            const quiz = await Quiz.create({
                user_id: user_id,
                name: body.name,
                description: body.description,
                topic: body.topic,
                type: body.type,
                questions_id: questions.map(q => q.question_id).join(),
                visibility: body.visibility,
                image_path: fileName
            }, { transaction: transaction });

            await transaction.commit();

            res.status(201).json({message: "Quiz successfully added"});
        };

        const sendError = (validations) => {
            res.status(400).json(validations.filter(v => !v.isValid).map(v => v.message));
        };

        const getValidations = (questions, body, validator) => {
            const itemValidations = questions.map((question, idx) => validator(question, idx + 1));
            const quizValidation = validateQuiz(body.name, body.description, body.topic);
            return [quizValidation, ...itemValidations];
        };

        const actions = {
            "Multiple Choice": async (questions, body, transaction, id) => {
                const validations = getValidations(questions, body, validateMultipleChoice);
                if (validations.every(v => v.isValid)) {
                    const questionsRes = await MultipleChoice.bulkCreate(questions, { transaction: transaction });
                    await createQuiz(body, questionsRes, transaction, id);
                } else {
                    sendError(validations);
                }
            },
            "Identification": async (questions, body, transaction, id) => {
                const validations = getValidations(questions, body, validateIdentification);
                if (validations.every(v => v.isValid)) {
                    const questionsRes = await Identification.bulkCreate(questions, { transaction: transaction });
                    await createQuiz(body, questionsRes, transaction, id);
                } else {
                    sendError(validations);
                }
            },
            "True or False": async (questions, body, transaction, id) => {
                const validations = getValidations(questions, body, validateTrueOrFalse);
                if (validations.every(v => v.isValid)) {
                    const questionsRes = await TrueOrFalse.bulkCreate(questions, { transaction: transaction });
                    await createQuiz(body, questionsRes, transaction, id);
                } else {
                    sendError(validations);
                }
            }
        };

        const data = JSON.parse(req.body.data);
        const action = actions[data.type];
        
        if (action === undefined) {
            res.status(400).json({ message: "Invalid quiz type" });
        } else {
            await action(data.questions, data, transaction, res.locals.userId);
        }
    } catch (error) {
        await transaction.rollback();

        res.status(500).json({error: error.toString()});
    }
});

router.get("/get-all-quiz", async (req, res) => {
    try {
        const quizzes = await Quiz.findAll({
            where: {
                type: req.query.type,
                visibility: true,
                user_id: {
                    [Op.not]: res.locals.userId
                }
            }
        });
        const response = await Promise.all(
            quizzes.map(async quiz => ({
                quiz_id: quiz.quiz_id,
                user: await getUser(quiz.user_id),
                name: quiz.name,
                description: quiz.description,
                topic: quiz.topic,
                type: quiz.type,
                items: quiz.questions_id.split(",").length,
                image_path: quiz.image_path
            }))
        );
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({error: error.toString()});
    }
});

router.get("/get-all-created-quiz", async (req, res) => {
    try {
        const quizzes = await Quiz.findAll({
            where: {
                type: req.query.type,
                user_id: res.locals.userId
            }
        });
        const response = quizzes.map(quiz => ({
            quiz_id: quiz.quiz_id,
            name: quiz.name,
            description: quiz.description,
            topic: quiz.topic,
            type: quiz.type,
            items: quiz.questions_id.split(",").length,
            image_path: quiz.image_path
        }));
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({error: error.toString()});
    }
});

router.post("/answer-quiz", async (req, res) => {
    try {
        const quizAnswer = await QuizAnswer.create({
            user_id: res.locals.userId,
            quiz_id: req.body.quiz_id,
            type: req.body.type,
            points: req.body.points.join(),
            answers: req.body.answers.join(),
            remaining_times: req.body.remaining_times.join(),
            questions_id: req.body.questions_id.join()
        });
        res.status(200).json({message: "Quiz successfully finished"});
    } catch (error) {
        res.status(500).json({error: error.toString()});
    }
});

module.exports = router;