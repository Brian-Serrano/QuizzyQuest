const express = require("express");
const router = express.Router();
const { User, Quiz, MultipleChoice, Identification, TrueOrFalse, QuizAnswer, sequelize } = require("../database");
const { Op } = require('sequelize');
const {
    validateMultipleChoice,
    validateIdentification,
    validateTrueOrFalse,
    getValidations,
    getQuestions,
    mapAnswer,
    createImage,
    createDateForFile,
    getUser,
    quizImagePath,
    relativePath,
    formatDate,
    removeQuestions,
    deleteFile
} = require("../utils");
const multer = require("multer");
const fs = require("fs");

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

router.get("/get-created-quiz", async (req, res) => {
    try {
        const quiz = await Quiz.findOne({where: {quiz_id: req.query.quiz_id}});
        const quizAnswers = await Promise.all((await QuizAnswer.findAll({
            where: {quiz_id: req.query.quiz_id}
        })).map(mapAnswer));
        const response = {
            quiz_id: quiz.quiz_id,
            name: quiz.name,
            description: quiz.description,
            topic: quiz.topic,
            type: quiz.type,
            answers: quizAnswers,
            image_path: quiz.image_path,
            createdAt: formatDate(quiz.createdAt),
            updatedAt: formatDate(quiz.updatedAt)
        };
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({error: error.toString()});
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

            await Quiz.create({
                user_id: user_id,
                name: body.name,
                description: body.description,
                topic: body.topic,
                type: body.type,
                questions_id: questions.map(q => q.question_id).join("|"),
                visibility: body.visibility,
                image_path: fileName
            }, { transaction: transaction });

            await transaction.commit();

            res.status(201).json({message: "Quiz successfully added"});
        };

        const sendError = (validations) => {
            deleteFile(req.file);
            res.status(400).json(validations.filter(v => !v.isValid).map(v => v.message));
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
            deleteFile(req.file);
            return res.status(400).json(["Invalid quiz type"]);
        } else {
            return await action(data.questions, data, transaction, res.locals.userId);
        }
    } catch (error) {
        await transaction.rollback();
        deleteFile(req.file);
        return res.status(500).json({error: error.toString()});
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
                items: quiz.questions_id.split("|").length,
                image_path: quiz.image_path,
                updatedAt: formatDate(quiz.updatedAt)
            }))
        );
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({error: error.toString()});
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
            items: quiz.questions_id.split("|").length,
            image_path: quiz.image_path,
            updatedAt: formatDate(quiz.updatedAt)
        }));
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

router.post("/answer-quiz", async (req, res) => {
    try {
        const answer = await QuizAnswer.findOne({
            where: {
                quiz_id: req.body.quiz_id,
                user_id: res.locals.userId
            },
            attributes: ['quiz_answer_id']
        });
        const quizCreator = await Quiz.findOne({
            where: {
                quiz_id: req.body.quiz_id,
                user_id: res.locals.userId
            },
            attributes: ['user_id']
        });

        if (quizCreator) {
            return res.status(400).json({message: "You cannot answer quiz you have created"});
        }

        if (answer) {
            return res.status(400).json({message: "Quiz is already answered"});
        }

        await QuizAnswer.create({
            user_id: res.locals.userId,
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

router.get("/get-quiz-to-edit", async (req, res) => {
    try {
        const actions = getQuestions();

        const quiz = await Quiz.findOne({where: {quiz_id: req.query.quiz_id}});
        const questions = await actions[quiz.type](quiz.questions_id.split("|").map(id => Number(id)));
        const response = {
            quiz_id: quiz.quiz_id,
            name: quiz.name,
            description: quiz.description,
            topic: quiz.topic,
            type: quiz.type,
            questions: questions,
            image_path: quiz.image_path,
            visibility: quiz.visibility
        };
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

router.post("/update-quiz", upload.single("file"), async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const actions = {
            "Multiple Choice": async (questions, transaction) => {
                const data = await MultipleChoice.bulkCreate(questions, {transaction: transaction});
                return data.map(question => question.question_id);
            },
            "Identification": async (questions, transaction) => {
                const data = await Identification.bulkCreate(questions, {transaction: transaction});
                return data.map(question => question.question_id);
            },
            "True or False": async (questions, transaction) => {
                const data = await TrueOrFalse.bulkCreate(questions, {transaction: transaction});
                return data.map(question => question.question_id);
            }
        };

        const deleteActions = removeQuestions();

        const quiz = JSON.parse(req.body.quiz);
        const questions = JSON.parse(req.body.questions);

        if (!Object.keys(actions).includes(quiz.type)) {
            deleteFile(req.file);
            return res.status(400).json(["Invalid quiz type"]);
        }

        const validator = {
            "Multiple Choice": validateMultipleChoice,
            "Identification": validateIdentification,
            "True or False": validateTrueOrFalse
        };
        const validations = getValidations(questions, quiz, validator[quiz.type]);

        if (!validations.every(v => v.isValid)) {
            deleteFile(req.file);
            return res.status(400).json(validations.filter(v => !v.isValid).map(v => v.message));
        }

        const previousQuiz = await Quiz.findOne({where: {quiz_id: quiz.quiz_id}, transaction: transaction});

        if (previousQuiz.user_id != res.locals.userId) {
            deleteFile(req.file);
            return res.status(400).json(["You cannot edit quiz you did not create"]);
        }

        await deleteActions[previousQuiz.type](previousQuiz.questions_id.split("|"), transaction);
        const newQuestions = await actions[quiz.type](questions, transaction);

        let fileName = "";

        if (!req.file) {
            fileName = `${quizImagePath}/${createDateForFile()}.png`;
            createImage(300, 200, fileName, 30, "quizzy-quest");
        } else {
            fileName = `${quizImagePath}/${req.file.filename}`;
        }
        fs.unlinkSync(relativePath + previousQuiz.image_path);

        await Quiz.update(
            {
                name: quiz.name,
                description: quiz.description,
                topic: quiz.topic,
                type: quiz.type,
                visibility: quiz.visibility,
                questions_id: newQuestions.join("|"),
                image_path: fileName
            },
            {
                where: {quiz_id: quiz.quiz_id},
                transaction: transaction
            },
        );

        await transaction.commit();
        return res.status(201).json({message: "Quiz successfully updated."});
    } catch (error) {
        await transaction.rollback();
        deleteFile(req.file);
        return res.status(500).json({error: error.toString()});
    }
});

router.post("/delete-quiz", async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const deleteActions = removeQuestions();

        const quiz = await Quiz.findOne({
            where: {quiz_id: req.body.quiz_id},
            attributes: ['questions_id', 'type', 'user_id'],
            transaction: transaction
        });

        if (quiz.user_id == res.locals.userId) {
            await deleteActions[quiz.type](quiz.questions_id.split("|"), transaction);
            await Quiz.destroy({where: {quiz_id: req.body.quiz_id}, transaction: transaction});
    
            await transaction.commit();
            return res.status(201).json({message: "Quiz successfully deleted."});
        } else {
            return res.status(400).json({message: "You cannot delete quiz you did not create"});
        }
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({error: error.toString()});
    }
});

router.get("/get-user-answered-quiz", async (req, res) => {
    try {
        const answers = (await QuizAnswer.findAll({
            where: {user_id: req.query.user_id}
        })).map(answer => {
            return {
                quiz_answer_id: answer.quiz_answer_id,
                type: answer.type,
                points: answer.points.split("|").map(p => Number(p)),
                answers: answer.answers.split("|"),
                remaining_times: answer.remaining_times.split("|").map(p => Number(p)),
                questions: answer.questions.split("|"),
                createdAt: formatDate(answer.createdAt)
            };
        });

        const user = await User.findOne({where: {id: req.query.user_id}});
        return res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image_path: user.image_path,
            createdAt: formatDate(user.createdAt),
            updatedAt: formatDate(user.updatedAt),
            answers: answers
        });
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

module.exports = router;