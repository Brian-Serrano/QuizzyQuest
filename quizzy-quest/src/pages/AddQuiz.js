import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState } from 'react';
import { QuizType } from "../utils/enums";
import { BASE_URL } from "../utils/constants";
import { MIN_ITEMS, MAX_ITEMS } from "../utils/constants";
import { getFormHeader, getImage } from "../utils/func-utils";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import EditQuizMenu from "../components/EditQuizMenu";
import GetQuizInput from "../components/GetQuizInput";
import AddItemButton from "../components/AddItemButton";
import Spinner from "../components/Spinner";
import ImportSpreadsheetMenu from "../components/ImportSpreadsheetMenu";

export default function AddQuiz() {
    const onNavigate = useNavigate();

    // add a new item with empty/default values
    const createItem = () => {
        return {
            question: "",
            letter_a: "",
            letter_b: "",
            letter_c: "",
            letter_d: "",
            mcAnswer: "a",
            iAnswer: "",
            tofAnswer: "TRUE",
            explanation: "",
            timer: 30,
            points: 200
        }
    };

    const [addQuizState, setAddQuizState] = useState({
        title: "",
        description: "",
        topic: "",
        type: QuizType.MultipleChoice,
        visibility: "public",
        errors: [],
        buttonEnabled: true
    });

    const [questionsState, setQuestionsState] = useState(
        [...Array(MIN_ITEMS).keys()].map(_ => createItem())
    );

    const [image, setImage] = useState({data: null, src: ""});

    // function that should be invoked when the user want to create the quiz
    const addQuiz = async () => {
        setAddQuizState(prev => ({...prev, buttonEnabled: false}));

        try {
            const formData = new FormData();
            formData.append('data', JSON.stringify({
                name: addQuizState.title,
                description: addQuizState.description,
                topic: addQuizState.topic,
                type: addQuizState.type,
                visibility: addQuizState.visibility === "public",
                questions: questionsState.map(question => {
                    switch (addQuizState.type) {
                        case QuizType.MultipleChoice:
                            return {
                                question: question.question,
                                letter_a: question.letter_a,
                                letter_b: question.letter_b,
                                letter_c: question.letter_c,
                                letter_d: question.letter_d,
                                answer: question.mcAnswer,
                                explanation: question.explanation,
                                timer: question.timer,
                                points: question.points
                            };
                        case QuizType.Identification:
                            return {
                                question: question.question,
                                answer: question.iAnswer,
                                explanation: question.explanation,
                                timer: question.timer,
                                points: question.points
                            };
                        case QuizType.TrueOrFalse:
                            return {
                                question: question.question,
                                answer: question.tofAnswer === "TRUE",
                                explanation: question.explanation,
                                timer: question.timer,
                                points: question.points
                            };
                    }
                })
            }));
            formData.append('file', image.data);

            const response = await fetch(`${BASE_URL}/quiz-routes/add-quiz`, {
                method: "POST",
                headers: getFormHeader(),
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                onNavigate("/");
            } else if (response.status >= 400 && response.status <= 499) {
                setAddQuizState({...addQuizState, errors: data, buttonEnabled: true});
            } else if (response.status >= 500 && response.status <= 599) {
                setAddQuizState({...addQuizState, errors: [data.error], buttonEnabled: true});
            }
        } catch (error) {
            setAddQuizState({...addQuizState, errors: [error.toString()], buttonEnabled: true});
        }
    };

    // change the quiz visibility
    const changeVisibility = (event) => {
        changeQuizInfo(event, "visibility");
    };

    // change quiz information
    const changeQuizInfo = (event, key) => {
        setAddQuizState(prev => {
            return {
                ...prev,
                [key]: event.target.value
            };
        });
    };

    // change item/question value
    const changeQuestions = (event, key, index) => {
        setQuestionsState(prev => {
            return prev.map((q, idx) => index === idx ? {...q, [key]: event.target.value} : q);
        });
    };

    return (
        <div>
            <NavigationBar />
            <form className="p-2 m-2">
                <div className="d-flex m-4">
                    <div className="flex-grow-1">
                        <h2 className="m-0">Create New Quiz</h2>
                    </div>
                    <div>
                        <ImportSpreadsheetMenu
                            replaceFields={(data, type) => {
                                setQuestionsState(data.map(v => ({...createItem(), ...v})).slice(0, MAX_ITEMS));
                                setAddQuizState(prev => ({...prev, type: type}));
                            }}
                            appendFields={(data, type) => {
                                setQuestionsState([...questionsState, ...data.map(v => ({...createItem(), ...v}))].slice(0, MAX_ITEMS));
                                setAddQuizState(prev => ({...prev, type: type}));
                            }}
                        />
                    </div>
                    <div>
                        <button
                            type="button"
                            disabled={!addQuizState.buttonEnabled}
                            className="btn btn-primary mx-2"
                            onClick={addQuiz}
                        >{addQuizState.buttonEnabled ? "Create" : <Spinner />}</button>
                    </div>
                </div>
                <div>{addQuizState.errors.map(err => <p className="text-danger" key={err}>{err}</p>)}</div>
                <EditQuizMenu
                    image={image}
                    quizState={addQuizState}
                    pickImage={(event) => {
                        getImage(event.target.files[0], (blob, src) => {
                            setImage({data: blob, src: src});
                        }, {width: 300, height: 200});
                    }}
                    changeQuizInfo={changeQuizInfo}
                    changeVisibility={changeVisibility}
                />
                <GetQuizInput
                    questionsState={questionsState}
                    quizState={addQuizState}
                    setQuestionsState={setQuestionsState}
                    changeQuestions={changeQuestions}
                />
                <AddItemButton
                    onClick={() => {
                        if (questionsState.length < MAX_ITEMS) {
                            setQuestionsState(prev => [...prev, createItem()]);
                        }
                    }}
                />
            </form>
        </div>
    );
}