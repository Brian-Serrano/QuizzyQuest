const bcrypt = require("bcrypt");
const { User, Quiz, MultipleChoice, Identification, TrueOrFalse, QuizAnswer } = require("./database");
const fs = require("fs");
const Canvas = require('canvas');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

const NAME_REGEX = new RegExp(process.env.NAME_REGEX);
const EMAIL_REGEX = new RegExp(process.env.EMAIL_REGEX);
const PASSWORD_REGEX = new RegExp(process.env.PASSWORD_REGEX);
const userImagePath = "user-images";
const quizImagePath = "quiz-images";
const relativePath = "../quizzy-quest-backend/images/";

/**
 * Match the entire string with the pattern
 * @param {RegExp} regex The pattern to use
 * @param {string} string The string to check for matches
 * @returns Whether pattern matches string
 */
function matchExact(regex, string) {
    const match = string.match(regex);
    return match && string === match[0];
}

/**
 * Add the zero to the beginning of digits and get the last two numbers
 * @param {number} number The number to transform
 * @returns Two digit number
 */
function toTwoDigits(number) {
    return ("0" + number).slice(-2);
}

/**
 * Create file name as date for images
 * @returns String date when the file was created
 */
function createDateForFile() {
    const date = new Date();
    return `${
        toTwoDigits(date.getDate())
    }_${
        toTwoDigits(date.getMonth())
    }_${
        toTwoDigits(date.getFullYear())
    }_${
        toTwoDigits(date.getHours())
    }_${
        toTwoDigits(date.getMinutes())
    }_${
        toTwoDigits(date.getSeconds())
    }`;
}

/**
 * Format date as string, commonly used for quiz, answer, account created/updated date
 * @param {Date} date The date to format
 * @returns Formatted/transformed date as string
 */
function formatDate(date) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const AmOrPm = date.getHours() >= 12 ? 'PM' : 'AM';
    const currentDate = new Date();

    if (
        date.getFullYear() == currentDate.getFullYear() && 
        date.getMonth() == currentDate.getMonth() && 
        date.getDate() == currentDate.getDate() && 
        date.getHours() == currentDate.getHours() && 
        date.getMinutes() == currentDate.getMinutes()
    ) {
        return "now";
    }

    if (
        date.getFullYear() == currentDate.getFullYear() && 
        date.getMonth() == currentDate.getMonth() && 
        date.getDate() == currentDate.getDate() && 
        date.getHours() == currentDate.getHours()
    ) {
        const minutes = currentDate.getMinutes() - date.getMinutes();
        return `${minutes} minute${minutes == 1 ? "" : "s"} ago`;
    }

    if (
        date.getFullYear() == currentDate.getFullYear() && 
        date.getMonth() == currentDate.getMonth() && 
        date.getDate() == currentDate.getDate()
    ) {
        const hours = currentDate.getHours() - date.getHours();
        return `${hours} hour${hours == 1 ? "" : "s"} ago`;
    }

    return `${
        months[date.getMonth()]
    } ${
        date.getDate()
    }, ${
        date.getFullYear()
    } ${
        (date.getHours() % 12) || 12
    }:${
        ("0" + date.getMinutes()).slice(-2)
    } ${AmOrPm}`;
}

/**
 * Create an image (store in images directory) with width x height size, random background color and a text.
 * @param {number} width Width of image
 * @param {number} height Height of image
 * @param {string} fileName The name of image when stored in images directory
 * @param {number} fontSize The size of text
 * @param {string} text Text for image
 */
function createImage(width, height, fileName, fontSize, text) {
    const randomColor = () => (Math.floor(Math.random() * 100) + 100).toString(16);
    const image = Canvas.createCanvas(width, height);
    const context = image.getContext("2d");
    context.fillStyle = `#${randomColor()}${randomColor()}${randomColor()}`;

    context.fillRect(0, 0, width, height);
    context.fillStyle = "black";
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.font = fontSize + "px serif";
    context.fillText(text, width / 2, height / 2);

    fs.writeFileSync(relativePath + fileName, image.toBuffer());
}

/**
 * Validate login of user
 * @param {User?} user The user or null if user not exists
 * @param {string} email Email to validate
 * @param {string} password Password to validate
 * @returns If login was valid with message
 */
async function validateLogin(user, email, password) {
    if (!email || !password) {
        return { isValid: false, message: "Fill up all empty fields" };
    }
    if ((email.length < 15 || email.length > 40) || (password.length < 8 || password.length > 20)) {
        return { isValid: false, message: "Fill up fields with specified length" };
    }
    if (!user) {
        return { isValid: false, message: "User not found" };
    }
    if (!(await bcrypt.compare(password, user.password))) {
        return { isValid: false, message: "Wrong password" };
    }

    return { isValid: true, message: "User Logged In" };
}

/**
 * Validation for email, used in forgot password
 * @param {string} email The email to validate
 * @returns If email was valid with message
 */
function validateEmail(email) {
    if (email.length < 15 || email.length > 40) {
        return { isValid: false, message: "Email should be 15-40 characters" };
    }
    if (!matchExact(EMAIL_REGEX, email)) {
        return { isValid: false, message: "Invalid Email" };
    }

    return { isValid: true, message: "Valid Email" };
}

/**
 * Validate signup of user
 * @param {string} name Name to validate
 * @param {string} email Email to validate
 * @param {string} password Password to validate
 * @param {string} confirmPassword Confirm password to validate
 * @param {boolean} termsAccepted Boolean whether terms and conditions was accepted
 * @returns If signup was valid with message
 */
async function validateSignup(name, email, password, confirmPassword, termsAccepted) {
    if (!termsAccepted) {
        return { isValid: false, message: "You did not accept terms and conditions" };
    }
    if (!name || !email || !password || !confirmPassword) {
        return { isValid: false, message: "Fill up all empty fields" };
    }
    if ((name.length < 5 || name.length > 20) || (email.length < 15 || email.length > 40) || (password.length < 8 || password.length > 20)) {
        return { isValid: false, message: "Fill up fields with specified length" };
    }
    if (password != confirmPassword) {
        return { isValid: false, message: "Passwords do not match" };
    }
    if (!matchExact(NAME_REGEX, name)) {
        return { isValid: false, message: "Invalid Username" };
    }
    if (!matchExact(EMAIL_REGEX, email)) {
        return { isValid: false, message: "Invalid Email" };
    }
    if (!matchExact(PASSWORD_REGEX, password)) {
        return { isValid: false, message: "Invalid Password" };
    }
    if ((await User.findAll({where: {name: name}})).length > 0) {
        return { isValid: false, message: "Username already exist" };
    }
    if ((await User.findAll({where: {email: email}})).length > 0) {
        return { isValid: false, message: "Email already exist" };
    }

    return { isValid: true, message: "User Signed Up" };
}

/**
 * Validation for quiz information
 * @param {string} title Title of quiz
 * @param {string} description Description of quiz
 * @param {string} topic Topic of quiz
 * @returns If quiz information was valid with message
 */
function validateQuiz(title, description, topic) {
    if (title.length < 5 || title.length > 50) {
        return { isValid: false, message: "Title should be 5-50 characters" };
    }
    if (/^\s+$/.test(title)) {
        return { isValid: false, message: "Title should not only contain white spaces" };
    }
    if (description.length < 15 || description.length > 200) {
        return { isValid: false, message: "Description should be 15-200 characters" };
    }
    if (/^\s+$/.test(description)) {
        return { isValid: false, message: "Description should not only contain white spaces" };
    }
    if (topic.length < 5 || topic.length > 50) {
        return { isValid: false, message: "Topic should be 5-50 characters" };
    }
    if (/^\s+$/.test(topic)) {
        return { isValid: false, message: "Topic should not only contain white spaces" };
    }

    return { isValid: true, message: "Quiz is valid" };
}

/**
 * Validate item/question information (question, explanation, timer and points)
 * @param {object} question An object that contains the question/item information that will be validated
 * @param {number} item The item of question/item in a quiz
 * @returns If item/question information was valid with message
 */
function questionValidationWrapper(question, item) {
    if (question.question.length < 15 || question.question.length > 300) {
        return { isValid: false, message: "Item " + item + ": Question should be 15-300 characters" };
    }
    if (/^\s+$/.test(question.question)) {
        return { isValid: false, message: "Item " + item + ": Question should not only contain white spaces" };
    }
    if (question.explanation.length > 300) {
        return { isValid: false, message: "Item " + item + ": Explanation should be 0-300 characters" };
    }
    if (/^\s+$/.test(question.explanation)) {
        return { isValid: false, message: "Item " + item + ": Explanation should not only contain white spaces" };
    }
    if (!Number(question.timer)) {
        return { isValid: false, message: "Item " + item + ": Timer should be a number" };
    }
    if (question.timer < 10 || question.timer > 120) {
        return { isValid: false, message: "Item " + item + ": Timer should range 10-120" };
    }
    if (!Number(question.points)) {
        return { isValid: false, message: "Item " + item + ": Points should be a number" };
    }
    if (question.points < 50 || question.points > 1000) {
        return { isValid: false, message: "Item " + item + ": Points should range 50-1000" };
    }

    return { isValid: true, message: "Item " + item + ": Valid" };
}

/**
 * Validate information of an item in a multiple choice quiz
 * @param {object} question An object that contains the question/item information that will be validated
 * @param {number} item The item of question/item in a quiz
 * @returns If item/question information was valid with message
 */
function validateMultipleChoice(question, item) {
    const initialValidation = questionValidationWrapper(question, item);
    if (!initialValidation.isValid) {
        return initialValidation;
    }
    const choices = [question.letter_a, question.letter_b, question.letter_c, question.letter_d];
    if (choices.some(l => l.length < 1 || l.length > 200)) {
        return { isValid: false, message: "Item " + item + ": Choices should be 1-200 characters" };
    }
    if (choices.some(l => /^\s+$/.test(l))) {
        return { isValid: false, message: "Item " + item + ": Choices should not only contain white spaces" };
    }
    if (!["a", "b", "c", "d"].includes(question.answer)) {
        return { isValid: false, message: "Item " + item + ": Invalid answer" };
    }

    return { isValid: true, message: "Item " + item + ": Item is valid" };
}

/**
 * Validate information of an item in an identification quiz
 * @param {object} question An object that contains the question/item information that will be validated
 * @param {number} item The item of question/item in a quiz
 * @returns If item/question information was valid with message
 */
function validateIdentification(question, item) {
    const initialValidation = questionValidationWrapper(question, item);
    if (!initialValidation.isValid) {
        return initialValidation;
    }
    if (question.answer.length < 1 || question.answer.length > 200) {
        return { isValid: false, message: "Item " + item + ": Answer should be 1-200 characters" };
    }
    if (/^\s+$/.test(question.answer)) {
        return { isValid: false, message: "Item " + item + ": Answer should not only contain white spaces" };
    }

    return { isValid: true, message: "Item " + item + ": Item is valid" };
}

/**
 * Validate information of an item in a true or false quiz
 * @param {object} question An object that contains the question/item information that will be validated
 * @param {number} item The item of question/item in a quiz
 * @returns If item/question information was valid with message
 */
function validateTrueOrFalse(question, item) {
    const initialValidation = questionValidationWrapper(question, item);
    if (!initialValidation.isValid) {
        return initialValidation;
    }

    return { isValid: true, message: "Item " + item + ": Item is valid" };
}

/**
 * Validate the password when user changes his/her password on settings
 * @param {string} currentPassword The current password from request to validate
 * @param {string} newPassword The new password to validate
 * @param {string} confirmPassword The confirm password to validate
 * @param {string} currentPassword2 The current password of user in database that will be used to check current password from request matches
 * @returns If password change was valid with message
 */
async function validatePassword(currentPassword, newPassword, confirmPassword, currentPassword2) {
    if (!currentPassword || !newPassword || !confirmPassword) {
        return { isValid: false, message: "Fill up empty fields" };
    }
    if (!(await bcrypt.compare(currentPassword, currentPassword2))) {
        return { isValid: false, message: "Current password do not match" };
    }
    if (!matchExact(PASSWORD_REGEX, newPassword)) {
        return { isValid: false, message: "Invalid new password" };
    }
    if (newPassword != confirmPassword) {
        return { isValid: false, message: "New password do not match" };
    }

    return { isValid: true, message: "Password changed" };
}

/**
 * Validate username when user changes his/her name on settings
 * @param {string} name The name to validate
 * @returns If username was valid with message
 */
function validateUsername(name) {
    if (name.length < 5 || name.length > 20) {
        return { isValid: false, message: "Username should be 5-20 characters" };
    }
    if (!matchExact(NAME_REGEX, name)) {
        return { isValid: false, message: "Invalid username" };
    }

    return { isValid: true, message: "Username changed" };
}

/**
 * Validate role when user changes his/her role on settings
 * @param {string} name The role to validate
 * @returns If role was valid with message
 */
function validateRole(role) {
    if (role.length < 5 || role.length > 50) {
        return { isValid: false, message: "Role should be 5-50 characters" };
    }

    return { isValid: true, message: "Role changed" };
}

/**
 * Validate password change when user forgot password
 * @param {string} userCode The code stored in user's database that used to check for matches in entered code
 * @param {string} code The code to validate
 * @param {string} password The new password to validate
 * @param {string} confirmPassword The confirm password to validate
 * @returns If code and password was valid with message
 */
function validateForgotPassword(userCode, code, password, confirmPassword) {
    if (code != userCode) {
        return { isValid: false, message: "Invalid Code" };
    }
    if (!matchExact(PASSWORD_REGEX, password)) {
        return { isValid: false, message: "Invalid Password" };
    }
    if (password != confirmPassword) {
        return { isValid: false, message: "Passwords do not match" };
    }

    return { isValid: true, message: "Password changed successfully" };
}

/**
 * Validations for quiz and questions/items informations
 * @param {Array<object>} questions An array of item/question objects that will be validated
 * @param {object} quiz An object that contains the quiz information to validate
 * @param {function(object, number): object} validator Callback function validator for items/questions
 * @returns An array of quiz and items/questions validations (is valid) with message
 */
function getValidations(questions, quiz, validator) {
    const itemValidations = questions.map((question, idx) => validator(question, idx + 1));
    const quizValidation = validateQuiz(quiz.name, quiz.description, quiz.topic);
    return [quizValidation, ...itemValidations];
}

/**
 * Get the callback functions for getting quiz questions/items from id of questions/items base on type
 * @returns An object that contains callback functions
 */
function getQuestions() {
    return {
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
}

/**
 * Get the callback functions for removing quiz questions/items from id of questions/items base on type
 * @returns An object that contains callback functions
 */
function removeQuestions() {
    return {
        "Multiple Choice": async (questions_id, transaction) => {
            await MultipleChoice.destroy({
                where: {
                    question_id: {
                        [Op.or]: questions_id
                    }
                },
                transaction: transaction
            });
        },
        "Identification": async (questions_id, transaction) => {
            await Identification.destroy({
                where: {
                    question_id: {
                        [Op.or]: questions_id
                    }
                },
                transaction: transaction
            });
        },
        "True or False": async (questions_id, transaction) => {
            await TrueOrFalse.destroy({
                where: {
                    question_id: {
                        [Op.or]: questions_id
                    }
                },
                transaction: transaction
            });
        }
    };
}

/**
 * Convert MultipleChoice sequelize model to object
 * @param {MultipleChoice} question The model to convert
 * @returns Object with the question/item information
 */
function mapMultipleChoice(question) {
    return {
        question_id: question.question_id,
        question: question.question,
        letter_a: question.letter_a,
        letter_b: question.letter_b,
        letter_c: question.letter_c,
        letter_d: question.letter_d,
        answer: question.answer,
        explanation: question.explanation,
        timer: question.timer,
        points: question.points
    };
}

/**
 * Convert Identification sequelize model to object
 * @param {Identification} question The model to convert
 * @returns Object with the question/item information
 */
function mapIdentification(question) {
    return {
        question_id: question.question_id,
        question: question.question,
        answer: question.answer,
        explanation: question.explanation,
        timer: question.timer,
        points: question.points
    };
}

/**
 * Convert TrueOrFalse sequelize model to object
 * @param {TrueOrFalse} question The model to convert
 * @returns Object with the question/item information
 */
function mapTrueOrFalse(question) {
    return {
        question_id: question.question_id,
        question: question.question,
        answer: question.answer ? "TRUE" : "FALSE",
        explanation: question.explanation,
        timer: question.timer,
        points: question.points
    };
}

/**
 * Convert QuizAnswer sequelize model to object
 * @param {QuizAnswer} answer The model to convert
 * @returns Object with the quiz answer information
 */
async function mapAnswer(answer) {
    return {
        quiz_answer_id: answer.quiz_answer_id,
        user: await getUser(answer.user_id),
        points: answer.points.split("|").map(p => Number(p)),
        answers: answer.answers.split("|"),
        remaining_times: answer.remaining_times.split("|").map(p => Number(p)),
        questions: answer.questions.split("|"),
        createdAt: formatDate(answer.createdAt)
    };
}

/**
 * Get the user information from user id
 * @param {number} userId The id of user
 * @returns User information
 */
async function getUser(userId) {
    if (userId === 0) {
        return {
            id: 0,
            name: "Unknown User",
            image_path: "user-images/anonymous.png"
        }
    } else {
        const user = await User.findOne({where: {id: userId}});
        return {
            id: user.id,
            name: user.name,
            image_path: user.image_path
        };
    }
}

/**
 * Delete/remove the file from the directory
 * @param {Express.Multer.File} file The file to delete
 */
function deleteFile(file) {
    if (file) {
        fs.unlinkSync(`${relativePath}${quizImagePath}/${file.filename}`);
    }
}

/**
 * Get the quiz from request
 * @param {Express.Request} req A server request use for getting the quiz
 * @returns An object that contains the quiz information
 */
async function getQuiz(req) {
    // get the object of callback functions responsible for getting the questions/items base on quiz type
    const actions = getQuestions();
    // get the quiz
    const quiz = await Quiz.findOne({where: {quiz_id: req.query.quiz_id}});
    // get the quiz's questions/items
    const questions = await actions[quiz.type](quiz.questions_id.split("|").map(id => Number(id)));
    // return the quiz and its items/questions
    return {
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
}

/**
 * Send mail with the code to user
 * @param {string} recipient The email address of user that will receive the mail
 * @param {string} code The code that will be send with the mail
 * @returns Information about the sent mail
 */
async function sendEmail(recipient, code) {
    return await nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'Brianserrano503@gmail.com',
            pass: process.env.PASSWORD
        }
    }).sendMail({
        from: 'Brianserrano503@gmail.com',
        to: recipient,
        subject: 'QuizzyQuest Recover Password',
        text: `<p>Use this code to change your password: </p><h3 style="color:blue;">${code}</h3>`
    });
}

/**
 * Check whether the user answered the quiz
 * @param {number} quiz_id Id of the quiz answered
 * @param {number} user_id User answered the quiz
 * @returns Whether the user answered the quiz
 */
async function isQuizAnswered(quiz_id, user_id) {
    return (await QuizAnswer.findOne({where: {quiz_id: quiz_id, user_id: user_id}})) ? true : false;
}

module.exports = {
    formatDate,
    validateLogin,
    validateEmail,
    validateSignup,
    validateMultipleChoice,
    validateIdentification,
    validateTrueOrFalse,
    validateQuiz,
    validatePassword,
    validateUsername,
    validateRole,
    validateForgotPassword,
    getValidations,
    getQuestions,
    removeQuestions,
    mapMultipleChoice,
    mapIdentification,
    mapTrueOrFalse,
    mapAnswer,
    createDateForFile,
    createImage,
    getUser,
    deleteFile,
    getQuiz,
    sendEmail,
    isQuizAnswered,
    userImagePath,
    quizImagePath,
    relativePath
};