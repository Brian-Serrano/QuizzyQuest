const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database/quizzy-quest.db"
});

const Quiz = sequelize.define(
    "quiz",
    {
        quiz_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Test"
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Test Desc"
        },
        topic: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Python"
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Multiple Choice"
        },
        // a list of ids that joined as string with pipe as delimiter
        questions_id: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ""
        },
        visibility: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: false
        },
        image_path: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "quiz-images/"
        }
    },
);

const MultipleChoice = sequelize.define(
    "multiple_choice",
    {
        question_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        question: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Hello World"
        },
        letter_a: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "a"
        },
        letter_b: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "b"
        },
        letter_c: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "c"
        },
        letter_d: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "d"
        },
        answer: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "a"
        },
        explanation: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Danzwomen vomits milk"
        },
        timer: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 20
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 500
        }
    }
);

const Identification = sequelize.define(
    "identification",
    {
        question_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        question: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Hello World"
        },
        answer: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "test"
        },
        explanation: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Danzwomen vomits milk"
        },
        timer: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 20
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 500
        }
    }
);

const TrueOrFalse = sequelize.define(
    "true_or_false",
    {
        question_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        question: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Hello World"
        },
        answer: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: false
        },
        explanation: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Danzwomen vomits milk"
        },
        timer: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 20
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 500
        }
    }
);

const QuizAnswer = sequelize.define(
    "quiz_answer",
    {
        quiz_answer_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        quiz_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Multiple Choice"
        },
        // a list of points that joined as string with pipe as delimiter
        points: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ""
        },
        // a list of answers (string) that joined as string with pipe as delimiter
        answers: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ""
        },
        // a list of times that joined as string with pipe as delimiter
        remaining_times: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ""
        },
        // a list of questions (string) that joined as string with pipe as delimiter
        questions: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ""
        }
    }
);

const User = sequelize.define(
    "user",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Test"
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "test@gmail.com"
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Test1234"
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Student"
        },
        image_path: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "user-images/"
        },
        forgot_password_code: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ""
        }
    }
);

sequelize.sync();

module.exports = {
    Quiz, MultipleChoice, Identification, TrueOrFalse, QuizAnswer, User, sequelize
};