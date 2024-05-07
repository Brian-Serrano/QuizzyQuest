import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { useEffect, useState } from "react";
import { ProcessState, QuizType } from "../utils/enums";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { appendAnswerQuizForUnauthUsers, getHeader } from "../utils/func-utils";
import NavigationBar from "../components/NavigationBar";
import QuizIntro from "../components/QuizIntro";
import QuizHeader from "../components/QuizHeader";
import MultipleChoiceMenu from "../components/MultipleChoiceMenu";
import IdentificationMenu from "../components/IdentificationMenu";
import TrueOrFalseMenu from "../components/TrueOrFalseMenu";
import QuizMenu from "../components/QuizMenu";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import MyModal from "../components/MyModal";
import MyToast from "../components/MyToast";
import { useLoaderData } from "react-router-dom";
import Spinner from "../components/Spinner";
import { secureStorage } from "../utils/secureStorage";

export default function AnswerQuiz() {
    const [id, unauth] = useLoaderData();
    const onNavigate = useNavigate();
    const [item, setItem] = useState(0);
    const [inIntro, setInIntro] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [quiz, setQuiz] = useState({});
    const [process, setProcess] = useState({state: ProcessState.Loading, message: ""});

    const [modalState, setModalState] = useState({
        bodyText: <p></p>,
        onApplyClick: () => {},
        onCancelClick: () => {},
        titleText: "",
        buttonText: "",
        visibility: false
    });

    const getQuiz = async () => {
        try {
            const response = await fetch(`${BASE_URL}/quiz${unauth === "unauthorized" ? "-unauth-" : "-"}routes/get-quiz?quiz_id=${id}`, {
                method: "GET",
                headers: unauth === "unauthorized" ? {"Content-Type": "application/json"} : getHeader()
            });
            const data = await response.json();
            if (response.ok) {
                setQuiz({
                    quiz_id: data.quiz_id,
                    user: data.user,
                    name: data.name,
                    description: data.description,
                    topic: data.topic,
                    type: data.type,
                    image_path: data.image_path,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    error: "",
                    visibility: false,
                    buttonEnabled: true
                });
                setQuestions(data.questions.map(question => {
                    return {...question, user_answer: "", points_got: 0, time_spent: 0, is_answered: false};
                }));
                setProcess({state: ProcessState.Success, message: ""});
            } else {
                setProcess({state: ProcessState.Error, message: data.error});
            }
        } catch (error) {
            setProcess({state: ProcessState.Error, message: error.toString()});
        }
    }

    useEffect(() => {
        getQuiz();
    }, []);

    const setToast = (error) => {
        setQuiz({...quiz, error: error, visibility: true, buttonEnabled: true});
        setTimeout(() => {
            setQuiz({...quiz, visibility: false});
        }, 10000);
    };

    const finishQuiz = async (questions) => {
        setQuiz(prev => ({...prev, buttonEnabled: false}));

        if (unauth === "unauthorized") {
            const prevQuiz = secureStorage.getItem('quiz');
            if (prevQuiz && prevQuiz.includes(quiz.quiz_id)) {
                return setToast("Quiz is already answered");
            }
        }

        try {
            const response = await fetch(`${BASE_URL}/quiz${unauth === "unauthorized" ? "-unauth-" : "-"}routes/answer-quiz`, {
                method: "POST",
                headers: unauth === "unauthorized" ? {"Content-Type": "application/json"} : getHeader(),
                body: JSON.stringify({
                    quiz_id: quiz.quiz_id,
                    type: quiz.type,
                    points: questions.map(q => q.points_got),
                    answers: questions.map(q => q.user_answer),
                    remaining_times: questions.map(q => q.timer - q.time_spent),
                    questions: questions.map(q => q.question)
                })
            });
            const data = await response.json();
            if (response.ok) {
                setModalState({
                    bodyText: <p>Congratulations! Your total points is {questions.reduce((acc, next) => acc + next.points_got, 0)}.</p>,
                    onApplyClick: () => {
                        setModalState({...modalState, visibility: false});
                        onNavigate("/");
                    },
                    onCancelClick: () => {
                        setModalState({...modalState, visibility: false});
                    },
                    titleText: "Quiz Completed",
                    buttonText: "Dashboard",
                    visibility: true
                });

                if (unauth === "unauthorized") {
                    appendAnswerQuizForUnauthUsers(quiz.quiz_id);
                }

                setQuiz(prev => ({...prev, buttonEnabled: true}));
            } else if (response.status >= 400 && response.status <= 499) {
                setToast(data.message);
            } else if (response.status >= 500 && response.status <= 599) {
                setToast(data.error);
            }
        } catch (error) {
            setToast(error.toString());
        }
    };
    useEffect(() => {
        if (questions.length > 0 && questions.every(question => question.is_answered)) {
            finishQuiz(questions);
        }
    }, [questions.filter(q => q.is_answered).length]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!inIntro) {
                setQuestions(prev => prev.map((question, idx) => {
                    if (item === idx && !question.is_answered) {
                        if (question.time_spent < question.timer) {
                            return {...question, time_spent: question.time_spent + 1};
                        } else {
                            return {...question, is_answered: true, user_answer: ""};
                        }
                    } else {
                        return question;
                    }
                }));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [item, inIntro]);

    const getMenu = (type) => {
        switch (type) {
            case QuizType.MultipleChoice:
                return (
                    <QuizMenu
                        item={item}
                        question={questions[item]}
                        onError={setToast}>
                        <MultipleChoiceMenu
                            question={questions[item]}
                            selectAnswer={(letter) => {
                                if (!questions[item].is_answered) {
                                    setQuestions(prev => {
                                        return prev.map((question, idx) => {
                                            return item === idx ? {
                                                ...question,
                                                user_answer: letter,
                                                is_answered: true,
                                                points_got: letter === question.answer ? question.points : 0
                                            } : question;
                                        });
                                    });
                                }
                            }}
                        />
                    </QuizMenu>
                );
            case QuizType.Identification:
                return (
                    <QuizMenu
                        item={item}
                        question={questions[item]}
                        onError={setToast}>
                        <IdentificationMenu
                            question={questions[item]}
                            onAnswerChange={(event) => {
                                if (!questions[item].is_answered) {
                                    setQuestions(prev => {
                                        return prev.map((question, idx) => {
                                            return item === idx ? {
                                                ...question,
                                                user_answer: event.target.value
                                            } : question;
                                        });
                                    });
                                }
                            }}
                            submitAnswer={() => {
                                if (!questions[item].is_answered) {
                                    setQuestions(prev => {
                                        return prev.map((question, idx) => {
                                            return item === idx ? {
                                                ...question,
                                                is_answered: true,
                                                points_got: question.user_answer.toLowerCase() === question.answer.toLowerCase() ? question.points : 0
                                            } : question;
                                        });
                                    });
                                }
                            }}
                        />
                    </QuizMenu>
                );
            case QuizType.TrueOrFalse:
                return (
                    <QuizMenu
                        item={item}
                        question={questions[item]}
                        onError={setToast}>
                        <TrueOrFalseMenu
                            question={questions[item]}
                            selectAnswer={(choice) => {
                                if (!questions[item].is_answered) {
                                    setQuestions(prev => {
                                        return prev.map((question, idx) => {
                                            return item === idx ? {
                                                ...question,
                                                user_answer: choice,
                                                is_answered: true,
                                                points_got: choice === question.answer ? question.points : 0
                                            } : question;
                                        });
                                    });
                                }
                            }}
                        />
                    </QuizMenu>
                );
        }
    }

    const getProcess = (process) => {
        switch (process.state) {
            case ProcessState.Loading:
                return <LoadingState />;
            case ProcessState.Error:
                return <ErrorState error={process.message} onRefresh={() => {
                    setProcess({state: ProcessState.Loading, message: ""});
                    getQuiz();
                }} />;
            case ProcessState.Success:
                return inIntro ? 
                <QuizIntro
                    quiz={quiz}
                    onStartClick={() => { setInIntro(false); }}
                    onProfile={() => {
                        onNavigate(`/profile/${quiz.user.id}`);
                    }}
                /> : (
                    <div className="p-4 container">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <QuizHeader
                                    title={quiz.name}
                                    topic={quiz.topic}
                                    type={quiz.type}
                                    percent={(questions.filter(q => q.is_answered).length / questions.length) * 100}
                                />
                                {getMenu(quiz.type)}
                                <div className="row row-cols-1 row-cols-lg-3 g-2">
                                    <div className="col">
                                        <button 
                                            className="btn btn-primary col-12 fs-3" 
                                            type="button" 
                                            onClick={() => {
                                                if (item > 0) {
                                                    setItem(item - 1);
                                                }
                                            }}
                                        >Previous</button>
                                    </div>
                                    <div className="col">
                                        <button 
                                            className="btn btn-success col-12 fs-3" 
                                            type="button" 
                                            onClick={() => {
                                                if (item < questions.length - 1) {
                                                    setItem(item + 1);
                                                }
                                            }}
                                        >Next</button>
                                    </div>
                                    <div className="col">
                                        <button
                                            className="btn btn-warning col-12 fs-3"
                                            type="button"
                                            disabled={!quiz.buttonEnabled}
                                            onClick={() => {
                                                setModalState({
                                                    bodyText: <p>Are you sure, you want to finish the quiz? The answers you enter will save and any unanswered questions will be wrong.</p>,
                                                    onApplyClick: () => {
                                                        setModalState({...modalState, visibility: false});
                                                        finishQuiz(questions);
                                                    },
                                                    onCancelClick: () => {
                                                        setModalState({...modalState, visibility: false});
                                                    },
                                                    titleText: "Confirm Finishing Quiz",
                                                    buttonText: "Yes",
                                                    visibility: true
                                                });
                                            }}
                                        >{quiz.buttonEnabled ? "Finish Quiz" : <Spinner />}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div>
            {unauth === "unauthorized" ? (
                <div>
                    <nav className="navbar navbar-expand-lg navbar-warning bg-warning fixed-top">
                        <div className="container-fluid">
                            <span className="navbar-brand">QuizzyQuest</span>
                        </div>
                    </nav>
                    <div style={{marginTop: "56px"}}></div>
                </div>
            ) : <NavigationBar />}
            {modalState.visibility ? <MyModal modalState={modalState} /> : <div></div>}
            {getProcess(process)}
            {quiz.visibility ? <MyToast error={quiz.error} /> : <div></div>}
        </div>
    );
}