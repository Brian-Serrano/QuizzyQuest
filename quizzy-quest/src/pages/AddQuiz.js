import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";
import InputField from "../components/InputField";
import RadioInput from "../components/RadioInput";
import QuizTextArea from "../components/QuizTextArea";
import MultipleChoiceInput from "../components/MultipleChoiceInput";
import IdentificationInput from "../components/IdentificationInput";
import TrueOrFalseInput from "../components/TrueOrFalseInput";
import { useState } from 'react';
import { QuizType } from "../utils/enums";
import { BASE_URL } from "../utils/constants";
import { MIN_ITEMS, MAX_ITEMS } from "../utils/constants";
import { getFormHeader, getImage } from "../utils/func-utils";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";

export default function AddQuiz() {
    const onNavigate = useNavigate();

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
        errors: []
    });

    const [questionsState, setQuestionsState] = useState(
        [...Array(MIN_ITEMS).keys()].map(_ => createItem())
    );

    const [image, setImage] = useState({data: null, src: ""});

    const addQuiz = async () => {
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

            const response = await fetch(BASE_URL + "/quiz-routes/add-quiz", {
                method: "POST",
                headers: getFormHeader(),
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                onNavigate("/");
            } else if (response.status >= 400 && response.status <= 499) {
                setAddQuizState({...addQuizState, errors: data});
            } else if (response.status >= 500 && response.status <= 599) {
                setAddQuizState({...addQuizState, errors: [data.error]});
            }
        } catch (error) {
            setAddQuizState({...addQuizState, errors: [error.toString()]});
        }
    };

    const changeVisibility = (event) => {
        changeQuizInfo(event, "visibility");
    };

    const changeQuizInfo = (event, key) => {
        setAddQuizState(prev => {
            return {
                ...prev,
                [key]: event.target.value
            };
        });
    };

    const changeQuestions = (event, key, index) => {
        setQuestionsState(prev => {
            return prev.map((q, idx) => index === idx ? {...q, [key]: event.target.value} : q);
        });
    };

    const menu = questionsState.map((question, index) => {
        const removeItem = () => {
            if (questionsState.length > MIN_ITEMS) {
                setQuestionsState(prev => {
                    return prev.filter((_, idx) => index !== idx);
                });
            }
        };
        const changeQuestion = (event) => {
            changeQuestions(event, "question", index);
        };
        const changeExplanation = (event) => {
            changeQuestions(event, "explanation", index);
        };
        const changeTimer = (event) => {
            changeQuestions(event, "timer", index);
        };
        const changePoints = (event) => {
            changeQuestions(event, "points", index);
        };
        switch (addQuizState.type) {
            case QuizType.MultipleChoice:
                return <MultipleChoiceInput
                    key={index}
                    item={index}
                    question={question}
                    onQuestionChange={changeQuestion}
                    onChoiceChange={[
                        (event) => { changeQuestions(event, "letter_a", index); },
                        (event) => { changeQuestions(event, "letter_b", index); },
                        (event) => { changeQuestions(event, "letter_c", index); },
                        (event) => { changeQuestions(event, "letter_d", index); }
                    ]}
                    onAnswerChange={(event) => { changeQuestions(event, "mcAnswer", index); }}
                    onExplanationChange={changeExplanation}
                    onTimerChange={changeTimer}
                    onPointsChange={changePoints}
                    removeItem={removeItem}
                />;
            case QuizType.Identification:
                return <IdentificationInput
                    key={index}
                    item={index}
                    question={question}
                    onQuestionChange={changeQuestion}
                    onAnswerChange={(event) => { changeQuestions(event, "iAnswer", index); }}
                    onExplanationChange={changeExplanation}
                    onTimerChange={changeTimer}
                    onPointsChange={changePoints}
                    removeItem={removeItem}
                />;
            case QuizType.TrueOrFalse:
                return <TrueOrFalseInput
                    key={index}
                    item={index}
                    question={question}
                    onQuestionChange={changeQuestion}
                    onAnswerChange={(event) => { changeQuestions(event, "tofAnswer", index); }}
                    onExplanationChange={changeExplanation}
                    onTimerChange={changeTimer}
                    onPointsChange={changePoints}
                    removeItem={removeItem}
                />;
        }
    });

    return (
        <div>
            <NavigationBar />
            <form className="p-2 m-2">
                <div className="d-flex m-4">
                    <div className="flex-grow-1">
                        <h2 className="m-0">Create New Quiz</h2>
                    </div>
                    <div>
                        <button type="button" className="btn btn-primary" onClick={addQuiz}>Create</button>
                    </div>
                </div>
                <div className="card m-4 shadow-sm">
                    <div className="card-body m-4">
                        <label className="form-label p-1 h5">Pick Quiz Image</label>
                        <input
                            type="file"
                            className="form-control"
                            name="image"
                            onChange={(event) => {
                                getImage(event.target.files[0], (blob, src) => {
                                    setImage({data: blob, src: src});
                                }, {width: 300, height: 200});
                            }}
                            accept=".png,.jpeg,.jpg,.webp"
                        />
                        {image.src.length > 0 ? <img className=" border border-2 border-primary m-4" src={image.src} width={300} height={200} /> : <span></span>}
                        <InputField
                            name="title"
                            type="text"
                            placeholder="Title"
                            value={addQuizState.title}
                            onChange={(event) => { changeQuizInfo(event, "title"); }}
                        />
                        <div className="row">
                            <QuizTextArea
                                name="description"
                                placeholder="Description"
                                value={addQuizState.description}
                                onChange={(event) => { changeQuizInfo(event, "description"); }}
                            />
                            <div className="col">
                                <InputField
                                    name="topic"
                                    type="text"
                                    placeholder="Topic"
                                    value={addQuizState.topic}
                                    onChange={(event) => { changeQuizInfo(event, "topic"); }}
                                />
                                <label className="form-label p-1 h5">Type</label>
                                <select
                                    name="type"
                                    className="form-select"
                                    onChange={(event) => { changeQuizInfo(event, "type"); }}
                                    value={addQuizState.type}
                                >{
                                    Object.values(QuizType).map(l => <option value={l} key={l}>{l}</option>)
                                }</select>
                                <label className="form-label p-1 h5">Visibility</label>
                                <div className="row">
                                    <RadioInput
                                        name="visibility"
                                        value="public"
                                        checked={addQuizState.visibility === "public"}
                                        onChange={changeVisibility}
                                    />
                                    <RadioInput
                                        name="visibility"
                                        value="private"
                                        checked={addQuizState.visibility === "private"}
                                        onChange={changeVisibility}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>{menu}</div>
                <div className="m-4">
                    <button
                        type="button"
                        className="btn btn-outline-dark btn-lg col-12"
                        onClick={() => {
                            if (questionsState.length < MAX_ITEMS) {
                                setQuestionsState(prev => [...prev, createItem()]);
                            }
                        }}
                    ><i className="bi bi-plus"></i>Add Item</button>
                </div>
                <div>{addQuizState.errors.map(err => <p className="text-danger" key={err}>{err}</p>)}</div>
            </form>
        </div>
    );
}