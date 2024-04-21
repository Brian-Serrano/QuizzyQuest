const bcrypt = require("bcrypt");
const { User, MultipleChoice, Identification, TrueOrFalse } = require("./database");
const fs = require("fs");
const Canvas = require('canvas');

const NAME_REGEX = new RegExp(process.env.NAME_REGEX);
const EMAIL_REGEX = new RegExp(process.env.EMAIL_REGEX);
const PASSWORD_REGEX = new RegExp(process.env.PASSWORD_REGEX);
const userImagePath = "user-images";
const quizImagePath = "quiz-images";
const relativePath = "../quizzy-quest-backend/images/";

function matchExact(regex, string) {
    const match = string.match(regex);
    return match && string === match[0];
}

function toTwoDigits(number) {
    return ("0" + number).slice(-2);
}

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

async function validateSignup(name, email, password, confirmPassword) {
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

function validateQuiz(title, description, topic) {
    if (title.length < 15 || title.length > 50) {
        return { isValid: false, message: "Title should be 15-50 characters" };
    }
    if (description.length < 15 || description.length > 200) {
        return { isValid: false, message: "Description should be 15-200 characters" };
    }
    if (topic.length < 15 || topic.length > 50) {
        return { isValid: false, message: "Topic should be 15-50 characters" };
    }

    return { isValid: true, message: "Quiz is valid" };
}

function questionValidationWrapper(question, item) {
    if (question.question.length < 15 || question.question.length > 200) {
        return { isValid: false, message: "Item " + item + ": Question should be 15-200 characters" };
    }
    if (question.explanation.length < 15 || question.explanation.length > 200) {
        return { isValid: false, message: "Item " + item + ": Explanation should be 15-200 characters" };
    }
    if (question.timer < 10 || question.timer > 120) {
        return { isValid: false, message: "Item " + item + ": Timer should range 10-120" };
    }
    if (question.points < 50 || question.points > 1000) {
        return { isValid: false, message: "Item " + item + ": Points should range 50-1000" };
    }

    return { isValid: true, message: "Item " + item + ": Valid" };
}

function validateMultipleChoice(question, item) {
    const initialValidation = questionValidationWrapper(question, item);
    if (!initialValidation.isValid) {
        return initialValidation;
    }
    if ([question.letter_a, question.letter_b, question.letter_c, question.letter_d].some(l => l.length < 1 || l.length > 200)) {
        return { isValid: false, message: "Item " + item + ": Choices should be 1-200 characters" };
    }
    if (!["a", "b", "c", "d"].includes(question.answer)) {
        return { isValid: false, message: "Item " + item + ": Invalid answer" };
    }

    return { isValid: true, message: "Item " + item + ": Item is valid" };
}

function validateIdentification(question, item) {
    const initialValidation = questionValidationWrapper(question, item);
    if (!initialValidation.isValid) {
        return initialValidation;
    }
    if (question.answer.length < 1 || question.answer.length > 200) {
        return { isValid: false, message: "Item " + item + ": Answer should be 1-200 characters" };
    }

    return { isValid: true, message: "Item " + item + ": Item is valid" };
}

function validateTrueOrFalse(question, item) {
    const initialValidation = questionValidationWrapper(question, item);
    if (!initialValidation.isValid) {
        return initialValidation;
    }

    return { isValid: true, message: "Item " + item + ": Item is valid" };
}

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

function validateUsername(name) {
    if (name.length < 5 || name.length > 20) {
        return { isValid: false, message: "Username should be 5-20 characters" };
    }
    if (!matchExact(NAME_REGEX, name)) {
        return { isValid: false, message: "Invalid username" };
    }

    return { isValid: true, message: "Username changed" };
}

function validateRole(role) {
    if (role.length < 5 || role.length > 50) {
        return { isValid: false, message: "Role should be 5-50 characters" };
    }

    return { isValid: true, message: "Role changed" };
}

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

async function mapAnswer(answer) {
    return {
        quiz_answer_id: answer.quiz_answer_id,
        user: await getUser(answer.user_id),
        points: answer.points.split(",").map(p => Number(p)),
        answers: answer.answers.split(","),
        remaining_times: answer.remaining_times.split(",").map(p => Number(p)),
        questions: await Promise.all(
            answer.questions_id.split(",")
                .map(async id => await getQuestion(Number(id), answer.type))
        )
    };
}

async function getQuestion(question_id, type) {
    const question = (q) => {
        return {question_id: q.question_id, question: q.question};
    }

    switch (type) {
        case "Multiple Choice":
            return question(await MultipleChoice.findOne({
                where: {
                    question_id: question_id
                }
            }));
        case "Identification":
            return question(await Identification.findOne({
                where: {
                    question_id: question_id
                }
            }));
        case "True or False":
            return question(await TrueOrFalse.findOne({
                where: {
                    question_id: question_id
                }
            }));
        default:
            throw new Error("Invalid quiz type");
    }
}

async function getUser(userId) {
    const user = await User.findOne({where: {id: userId}});
    return {
        id: user.id,
        name: user.name,
        image_path: user.image_path
    };
}

module.exports = {
    validateLogin,
    validateSignup,
    validateMultipleChoice,
    validateIdentification,
    validateTrueOrFalse,
    validateQuiz,
    validatePassword,
    validateUsername,
    validateRole,
    mapMultipleChoice,
    mapIdentification,
    mapTrueOrFalse,
    mapAnswer,
    createDateForFile,
    createImage,
    getUser,
    userImagePath,
    quizImagePath,
    relativePath
};