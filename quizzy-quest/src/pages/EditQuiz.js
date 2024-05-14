import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect, useState } from "react";
import { ProcessState, QuizType } from "../utils/enums";
import { getHeader, getFormHeader, getImage } from "../utils/func-utils";
import NavigationBar from "../components/NavigationBar";
import EditQuizMenu from "../components/EditQuizMenu";
import GetQuizInput from "../components/GetQuizInput";
import AddItemButton from "../components/AddItemButton";
import { useLoaderData, useNavigate } from "react-router-dom";
import { BASE_URL, IMAGE_BASE_URL, MAX_ITEMS } from "../utils/constants";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import Spinner from "../components/Spinner";
import MyModal from "../components/MyModal";
import ImportSpreadsheetMenu from "../components/ImportSpreadsheetMenu";
import ExportQuizMenu from "../components/ExportQuizMenu";

export default function EditQuiz() {
    const id = useLoaderData();
    const onNavigate = useNavigate();

    // add an item to quiz with empty/default values
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

    const [quizState, setQuizState] = useState({});
    const [questionsState, setQuestionsState] = useState([]);
    const [image, setImage] = useState({data: null, src: ""});
    const [process, setProcess] = useState({state: ProcessState.Loading, message: ""});
    const [modalState, setModalState] = useState(false);

    // 
    const mapQuestions = (question) => {
        switch (quizState.type) {
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
    };

    // function that will get the quiz and its questions/item that will be edited
    const getQuizToEdit = async () => {
        try {
            const response = await fetch(`${BASE_URL}/quiz-routes/get-quiz-to-edit?quiz_id=${id}`, {
                method: "GET",
                headers: getHeader()
            });
            const data = await response.json();
            if (response.ok) {
                setQuizState({
                    quiz_id: data.quiz_id,
                    title: data.name,
                    description: data.description,
                    topic: data.topic,
                    type: data.type,
                    visibility: data.visibility ? "public" : "private",
                    errors: [],
                    buttonEnabled: true,
                    deleteButtonEnabled: true
                });
                setQuestionsState(data.questions.map(question => {
                    switch (data.type) {
                        case QuizType.MultipleChoice:
                            return {...question, mcAnswer: question.answer, iAnswer: "", tofAnswer: "TRUE"};
                        case QuizType.Identification:
                            return {...question, mcAnswer: "a", iAnswer: question.answer, tofAnswer: "TRUE"};
                        case QuizType.TrueOrFalse:
                            return {...question, mcAnswer: "a", iAnswer: "", tofAnswer: question.answer};
                    }
                }));
                const imageUrl = `${IMAGE_BASE_URL}/${data.image_path}`;
                const imageResponse = await fetch(imageUrl);
                const blob = await imageResponse.blob();
                setImage({data: blob, src: imageUrl});
                setProcess({state: ProcessState.Success, message: ""});
            } else {
                setProcess({state: ProcessState.Error, message: data.error});
            }
        } catch (error) {
            setProcess({state: ProcessState.Error, message: error.toString()});
        }
    };

    // function that should be invoked when the user want to save the edited quiz
    const updateQuiz = async () => {
        setQuizState(prev => ({...prev, buttonEnabled: false}));

        try {
            const formData = new FormData();
            formData.append('quiz', JSON.stringify({
                quiz_id: quizState.quiz_id,
                name: quizState.title,
                description: quizState.description,
                topic: quizState.topic,
                type: quizState.type,
                visibility: quizState.visibility === "public"
            }));
            formData.append('questions', JSON.stringify(questionsState.map(mapQuestions)));
            formData.append('file', image.data);

            const response = await fetch(`${BASE_URL}/quiz-routes/update-quiz`, {
                method: "POST",
                headers: getFormHeader(),
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                onNavigate("/");
            } else if (response.status >= 400 && response.status <= 499) {
                setQuizState({...quizState, errors: data, buttonEnabled: true});
            } else if (response.status >= 500 && response.status <= 599) {
                setQuizState({...quizState, errors: [data.error], buttonEnabled: true});
            }
        } catch (error) {
            setQuizState({...quizState, errors: [error.toString()], buttonEnabled: true});
        }
    }

    // function that should be invoked when the user delete the quiz
    const deleteQuiz = async () => {
        setQuizState(prev => ({...prev, deleteButtonEnabled: false}));

        try {
            const response = await fetch(`${BASE_URL}/quiz-routes/delete-quiz`, {
                method: "POST",
                headers: getHeader(),
                body: JSON.stringify({quiz_id: quizState.quiz_id})
            });
            const data = await response.json();
            if (response.ok) {
                onNavigate("/");
            } else if (response.status >= 400 && response.status <= 499) {
                setQuizState({...quizState, errors: [data.message], deleteButtonEnabled: true});
            } else if (response.status >= 500 && response.status <= 599) {
                setQuizState({...quizState, errors: [data.error], deleteButtonEnabled: true});
            }
        } catch (error) {
            setQuizState({...quizState, errors: [error.toString()], deleteButtonEnabled: true});
        }
    };

    // get the quiz that will be edited on the mount of page
    useEffect(() => {
        getQuizToEdit();
    }, []);

    // change quiz visibility
    const changeVisibility = (event) => {
        changeQuizInfo(event, "visibility");
    };

    // change the value of quiz information
    const changeQuizInfo = (event, key) => {
        setQuizState(prev => {
            return {
                ...prev,
                [key]: event.target.value
            };
        });
    };

    // change the value of an item/question information
    const changeQuestions = (event, key, index) => {
        setQuestionsState(prev => {
            return prev.map((q, idx) => index === idx ? {...q, [key]: event.target.value} : q);
        });
    };

    // get the component to show base on the current process state
    const getProcess = (process) => {
        switch (process.state) {
            case ProcessState.Loading:
                return <LoadingState />;
            case ProcessState.Error:
                return <ErrorState error={process.message} onRefresh={() => {
                    setProcess({state: ProcessState.Loading, message: ""});
                    getQuizToEdit();
                }} />;
            case ProcessState.Success:
                return (
                    <form className="p-2 m-2">
                        <div className="d-flex m-4">
                            <div className="flex-grow-1">
                                <h2 className="m-0">Edit Quiz</h2>
                            </div>
                            <div>
                                <ExportQuizMenu quizName={quizState.title} data={questionsState.map(mapQuestions)} />
                            </div>
                            <div>
                                <ImportSpreadsheetMenu
                                    replaceFields={(data, type) => {
                                        setQuestionsState(data.map(v => ({...createItem(), ...v})).slice(0, MAX_ITEMS));
                                        setQuizState(prev => ({...prev, type: type}));
                                    }}
                                    appendFields={(data, type) => {
                                        setQuestionsState([...questionsState, ...data.map(v => ({...createItem(), ...v}))].slice(0, MAX_ITEMS));
                                        setQuizState(prev => ({...prev, type: type}));
                                    }}
                                />
                            </div>
                            <div>
                                <button
                                    type="button"
                                    disabled={!quizState.buttonEnabled}
                                    className="btn btn-primary mx-2"
                                    onClick={updateQuiz}
                                >{quizState.buttonEnabled ? "Update" : <Spinner />}</button>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    disabled={!quizState.deleteButtonEnabled}
                                    className="btn btn-danger mx-2"
                                    onClick={() => { setModalState(true); }}
                                >{quizState.deleteButtonEnabled ? "Delete" : <Spinner />}</button>
                            </div>
                        </div>
                        <div>{quizState.errors.map(err => <p className="text-danger" key={err}>{err}</p>)}</div>
                        <EditQuizMenu
                            image={image}
                            quizState={quizState}
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
                            quizState={quizState}
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
                );
        }
    };

    return (
        <div>
            <NavigationBar />
            {modalState ? <MyModal modalState={{
                bodyText: <p>Are you sure you want to delete this quiz. You cannot recover the quiz again after deletion.</p>,
                onApplyClick: () => {
                    setModalState(false);
                    deleteQuiz();
                },
                onCancelClick: () => {
                    setModalState(false);
                },
                titleText: "Confirm Deleting Quiz",
                buttonText: "Yes"
            }} /> : <div></div>}
            {getProcess(process)}
        </div>
    );
}