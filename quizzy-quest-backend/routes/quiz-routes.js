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
    deleteFile,
    getQuiz,
    isQuizAnswered
} = require("../utils");
const multer = require("multer");
const fs = require("fs");

// StorageEngine implementation configured to store files on the local file system
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, relativePath + quizImagePath);
    },
    filename: (req, file, cb) => {
        cb(null, `${createDateForFile()}.png`);
    }
});

// multer instance that provides several methods for generating middleware that process files uploaded in multipart/form-data format.
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        cb(null, ["image/png", "image/jpeg"].includes(file.mimetype));
    }
});

router.get("/get-quiz", async (req, res) => {
    try {
        return res.status(200).json(await getQuiz(req));
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

router.get("/get-created-quiz", async (req, res) => {
    try {
        // get the quiz information
        const quiz = await Quiz.findOne({where: {quiz_id: req.query.quiz_id}});

        // get all answers of users to the quiz
        const quizAnswers = await Promise.all((await QuizAnswer.findAll({
            where: {quiz_id: req.query.quiz_id}
        })).map(mapAnswer));

        // return the quiz and its answers
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
        // invoked when validation is valid, create the quiz (its image) and return successful response
        const createQuiz = async (body, questions, transaction, user_id) => {
            // file name that will be stored in image path of quiz, used for accessing quiz image by requesting image path
            let fileName = "";

            if (!req.file) {
                fileName = `${quizImagePath}/${createDateForFile()}.png`;
                createImage(300, 200, fileName, 30, "quizzy-quest");
            } else {
                fileName = `${quizImagePath}/${req.file.filename}`;
            }

            // create the quiz and store in database
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

            // commit/apply the created quiz and questions/items
            await transaction.commit();

            // return message
            res.status(201).json({message: "Quiz successfully added"});
        };

        // invoked for error validations and return error response
        const sendError = (validations) => {
            deleteFile(req.file);
            res.status(400).json(validations.filter(v => !v.isValid).map(v => v.message));
        };

        // object that contains callback functions responsible for validation and creation of quiz and its questions/items and return response
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

        // parse JSON string to object
        const data = JSON.parse(req.body.data);

        // get the callback function to invoke base on quiz type
        const action = actions[data.type];
        
        // check if callback function exists (if the entered quiz type is not valid then callback do not exist)
        if (action === undefined) {
            // if not exist return validation error response
            deleteFile(req.file);
            return res.status(400).json(["Invalid quiz type"]);
        } else {
            // invoke the action (responsible for creating quiz and its questions/items)
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
        // get the quizzes not created by the user requesting base on type (should also be public)
        const quizzes = await Quiz.findAll({
            where: {
                type: req.query.type,
                visibility: true,
                user_id: {
                    [Op.not]: res.locals.userId
                }
            }
        });
        // return the quizzes as response
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
                updatedAt: formatDate(quiz.updatedAt),
                is_answered: await isQuizAnswered(quiz.quiz_id, res.locals.userId)
            }))
        );
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({error: error.toString()});
    }
});

router.get("/get-all-created-quiz", async (req, res) => {
    try {
        // get the quizzes created by the user requesting base on type
        const quizzes = await Quiz.findAll({
            where: {
                type: req.query.type,
                user_id: res.locals.userId
            }
        });
        // return the quizzes as response
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
        // get an answer of the quiz (answered quiz should not be answered again)
        const answer = await QuizAnswer.findOne({
            where: {
                quiz_id: req.body.quiz_id,
                user_id: res.locals.userId
            },
            attributes: ['quiz_answer_id']
        });
        // get the quiz creator (creator of quiz cannot answer that quiz)
        const quizCreator = await Quiz.findOne({
            where: {
                quiz_id: req.body.quiz_id,
                user_id: res.locals.userId
            },
            attributes: ['user_id']
        });

        // check if the user requesting/answering is the creator of quiz
        if (quizCreator) {
            return res.status(400).json({message: "You cannot answer quiz you have created"});
        }

        // check if quiz already answered
        if (answer) {
            return res.status(400).json({message: "Quiz is already answered"});
        }

        // create the quiz answer and store in database
        await QuizAnswer.create({
            user_id: res.locals.userId,
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

router.get("/get-quiz-to-edit", async (req, res) => {
    try {
        // get the callback functions responsible for getting quiz questions/items from id of questions/items base on type
        const actions = getQuestions();

        // get the quiz to edit
        const quiz = await Quiz.findOne({where: {quiz_id: req.query.quiz_id}});
        // get the questions/items to edit
        const questions = await actions[quiz.type](quiz.questions_id.split("|").map(id => Number(id)));

        // return the quiz and its questions/items as response
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
        // object that contains callback functions responsible for adding the new/updated questions/items in the database, each function returns array of id that will be the new questions_id of quiz
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

        // get the callback functions for removing quiz questions/items from id of questions/items base on type
        const deleteActions = removeQuestions();

        // parse JSON string to object
        const quiz = JSON.parse(req.body.quiz);
        const questions = JSON.parse(req.body.questions);

        // check if quiz type is not included in possible types
        if (!Object.keys(actions).includes(quiz.type)) {
            deleteFile(req.file);
            return res.status(400).json(["Invalid quiz type"]);
        }

        // object that contains validators
        const validator = {
            "Multiple Choice": validateMultipleChoice,
            "Identification": validateIdentification,
            "True or False": validateTrueOrFalse
        };

        // validate the quiz and its questions/items
        const validations = getValidations(questions, quiz, validator[quiz.type]);

        // check if there are invalid question/item or quiz
        if (!validations.every(v => v.isValid)) {
            deleteFile(req.file);
            return res.status(400).json(validations.filter(v => !v.isValid).map(v => v.message));
        }

        // get the previous quiz
        const previousQuiz = await Quiz.findOne({where: {quiz_id: quiz.quiz_id}, transaction: transaction});

        // check if the user edited the quiz is not creator of quiz
        if (previousQuiz.user_id != res.locals.userId) {
            deleteFile(req.file);
            return res.status(400).json(["You cannot edit quiz you did not create"]);
        }

        // delete the previous questions/items
        await deleteActions[previousQuiz.type](previousQuiz.questions_id.split("|"), transaction);
        // add the new/updated questions/items
        const newQuestions = await actions[quiz.type](questions, transaction);

        // file name of the new image of the quiz (add to the quiz image path)
        let fileName = "";

        if (!req.file) {
            fileName = `${quizImagePath}/${createDateForFile()}.png`;
            createImage(300, 200, fileName, 30, "quizzy-quest");
        } else {
            fileName = `${quizImagePath}/${req.file.filename}`;
        }
        // delete the previous quiz image
        fs.unlinkSync(relativePath + previousQuiz.image_path);

        // update the quiz
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

        // apply the deletion and addition of questions/items and the updated quiz
        await transaction.commit();
        // return message
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
        // get the callback functions for removing quiz questions/items from id of questions/items base on type
        const deleteActions = removeQuestions();

        // get the quiz to delete
        const quiz = await Quiz.findOne({
            where: {quiz_id: req.body.quiz_id},
            attributes: ['questions_id', 'type', 'user_id', 'image_path'],
            transaction: transaction
        });

        // check if the user want to delete quiz is the quiz creator
        if (quiz.user_id == res.locals.userId) {
            // delete the questions/items
            await deleteActions[quiz.type](quiz.questions_id.split("|"), transaction);
            // delete the quiz
            await Quiz.destroy({where: {quiz_id: req.body.quiz_id}, transaction: transaction});
            // delete the quiz image in images directory
            fs.unlinkSync(`${relativePath}${quiz.image_path}`);

            // commit/apply the deletions
            await transaction.commit();
            // return message
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
        // get the all the answers of user to quizzes
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

        // get the user
        const user = await User.findOne({where: {id: req.query.user_id}});

        // return the user and answers as response
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