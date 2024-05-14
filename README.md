# QuizzyQuest
Quiz Web Application for Department of Information and Communications Technology workers. I cannot guarantee that I can provide the best documentation for my application. I am only a programmer.

# Features
1. Quizzes:
    1. Title = The title of the quiz, should be 5-50 characters and not only whitespaces.
    2. Description = The information of the quiz, should be 15-200 characters and not only whitespaces.
    3. Topic = The topic of the quiz, should be 5-50 characters and not only whitespaces.
    4. Type = The quiz have only 3 possible types, "Multiple Choice", "Identification", "True or False".
    5. Visibility = When the quiz is public any user can see, access, and answer the quiz. If private, only the user created the quiz can see it.
    6. Image = Image for the quiz. If the user did not provide image when creating the quiz. The default will be a 300x200 pixel image with random background color and a text "quizzy-quest". Same when the user edit the quiz and remove the image, will make default image. The image added by the user will automatically squeezed to 300x200 pixel. The name of the image on the server will be the date it was created.
    7. Questions = The questions are base on the quiz type with a minimum items of 5 and maximum items of 50:
        1. Multiple Choice = Consists of question (15-300 characters and not all whitespace), 4 choices (1-200 characters and not all whitespace), answer (a, b, c or d), explanation (0-300 characters and not all whitespace), timer (10-120), points (50-1000).
        2. Identification = Consists of question (15-300 characters and not all whitespace), answer (1-200 characters and not all whitespace), explanation (0-300 characters and not all whitespace), timer (10-120), points (50-1000).
        3. True or False = Consists of question (15-300 characters and not all whitespace), answer (TRUE or FALSE), explanation (0-300 characters and not all whitespace), timer (10-120), points (50-1000).
    8. Users can edit and delete quizzes created by them.
    9. The users can also see when the quiz created and updated.
2. Speech Synthesis for Questions = Understand the questions faster and easier with this text-to-speech that uses Web Speech API behind the scene.
3. Export Quizzes = Export quiz as text, spreadsheet or csv file. Only the user created the quiz can export it.
4. Import Quizzes = Import spreadsheet and configure it how it will be placed on the items input fields. Multiple worksheets are allowed. Have validations on data in spreadsheet that will not place on input fields if invalid. You can replace the existing items with the spreadsheet data or add it to the existing items.
5. Quiz Creator can see others answers = The user created the quiz can view the users answered his quiz. This includes their information, questions, answers, date answered, points and time remaining. If the user created the quiz edit it, the answers of other users are still shown. The users that will answer that quiz with the updated will also show but differences on users answered before and after the updated quiz will be observed. If the points become greater then the users answered before the updated quiz will be smaller. If the quiz type changes that looks more different. If the quiz is deleted, the answers will not be deleted. The answers of users are also shown in their profile.
6. Access In Answering Quiz for Unauthorized Users = Users that do not have account or not logged in can answer quizzes by providing them link that have "/unauthorized" in the end of link. The id of the quiz the user answered will be added to browser local storage that will be used to avoid spamming answers to a quiz. The user created the quiz can still see the unauthorized users answered it. Their name will be Unknown User with unknown user as an image.
7. User:
    1. Username = Should only have alphanumeric, underscore and space characters. Username can be change in settings.
    2. Email Address = Any domain can be accepted but it should exist, this can be used if you forgot password. Email address cannot be changed.
    3. Password = Should have at least one letter and number, and 8-20 characters. Password can be edited in settings but need to enter the previous password and confirm the password to change it. Password can also be change in login (where the user is unauthorized) by the forgot password. This do not require the previous password but you need additional steps to change it. Make sure the email text field have your valid email address and you can click the forgot password. The application will send the mail to you with the code and you must enter that code in the application and can change the password.
    4. Role = Should be 5-50 characters. The default value is Student. You can edit role in settings.
    5. Image = You can upload any valid image and the application will automatically squeeze it to 200x200 pixel size. The image can be change in settings. A default image is auto generated after signing up with random background color and a letter with the first letter of username in uppercase.
    6. The users can also see when their account was created or updated.
8. Users should agree to terms and agreements to create an account and log in.
9. Users can see the quizzes they answered in their profile.
10. Protection to routes to avoid unallowed access. Answered quiz should not be answered again. Private quizzes should not be accessed. Quizzes you did not create should not be able to edit or see the users answer it. The creator of quiz should not be able to answer it. Quiz that does not exist should not be accessed.

## Frontend Frameworks/Libraries
1. React = JavaScript library for building user interfaces. It is used to build single-page applications. It allows us to create reusable UI components.
2. Bootstrap = Most popular HTML, CSS, and JavaScript framework for developing responsive, mobile-first websites.
3. Bootstrap Icons = Official open source SVG icon library for Bootstrap.
4. Crypto Js = JavaScript library of crypto standards.
5. React JWT = Small library for decoding json web tokens (JWT).
6. React Router DOM = Declarative routing for React web applications.
7. Secure Web Storage = A simple wrapper for localStorage/sessionStorage that allows one to encrypt/decrypt the data being stored.
8. SheetJS = Offers battle-tested open-source solutions for extracting useful data from almost any complex spreadsheet and generating new spreadsheets that will work with legacy and modern software alike.

## Backend Frameworks/Libraries
1. BCrypt = A library to help you hash passwords.
2. Node Canvas = Cairo-backed Canvas implementation for Node.js.
3. CORS = Node JS package for providing a Connect/Express middleware that can be used to enable CORS with various options.
4. Express = Minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
5. jsonwebtoken = JSON Web Token implementation (symmetric and asymmetric).
6. Multer = Node JS middleware for handling multipart/form-data, which is primarily used for uploading files. It is written on top of busboy for maximum efficiency.
7. Nodemailer = Send emails from Node.js
8. Sequelize = Modern TypeScript and Node.js ORM for Oracle, Postgres, MySQL, MariaDB, SQLite and SQL Server, and more.
9. SQLite 3 = Asynchronous, non-blocking SQLite3 bindings for Node.js.

## More Information
1. Programming Language = JavaScript
2. Integrated Development Environment = Visual Studio Code
3. Run Frontend Application = Move to the quizzy-quest directory `cd quizzy-quest`. Run application `npm start`.
4. Run Backend Application = Move to the quizzy-quest-backend directory `cd quizzy-quest-backend`. Run application `nodemon app.js`.
5. Deployment = The application is not deployed to any hosting platform. The frontend is running in localhost on port 3000. The backend is running in localhost on port 4000.

## Environment Variables (make your own)
1. REACT_APP_SECRET_KEY = Secret key used for encrypting data in browser local storage. This is the only environment variable used in frontend.
2. EMAIL_PATTERN = Pattern used for matching emails.
3. NAME_PATTERN = Pattern used for matching usernames.
4. PASSWORD_PATTERN = Pattern used for matching passwords.
5. SECRET_KEY = Used for encoding/decoding json web tokens.
6. SALT = Used for hashing passwords.
7. PASSWORD = Google password for sending mails to users.

## Frontend Architecture
![Frontend](README%20images/Frontend-Architecture.png)

## Backend Architecture
![Backend](README%20images/Backend-Architecture.png)

## Entity Relationship Diagram
![ERD](README%20images/Entity-Relationship-Diagram.png)

## Concepts Need to be Learned
1. JavaScript Programming Language Specific Concepts from Basic to Advance.
2. React
3. Express
4. Image Processing
5. Security
6. Sequelize, Transaction
7. Bootstrap
8. Authorization
9. Database Design, Entity/Model Relationships Design.
10. Multer, FileStorage