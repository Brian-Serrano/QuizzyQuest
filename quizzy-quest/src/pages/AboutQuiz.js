import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { useEffect, useState } from "react";
import { ProcessState } from "../utils/enums";
import NavigationBar from "../components/NavigationBar";
import CarouselInsideModal from "../components/CarouselInsideModal";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { BASE_URL, IMAGE_BASE_URL } from "../utils/constants";
import { getHeader } from "../utils/func-utils";
import { useLoaderData, useNavigate } from "react-router-dom";

export default function AboutQuiz() {
    const onNavigate = useNavigate();
    const id = useLoaderData();
    const [quiz, setQuiz] = useState({});
    const [answers, setAnswers] = useState([]);
    const [modalState, setModalState] = useState(0);
    const [process, setProcess] = useState({state: ProcessState.Loading, message: ""});

    const getQuiz = async () => {
        try {
            const response = await fetch(`${BASE_URL}/quiz-routes/get-created-quiz?quiz_id=${id}`, {
                method: "GET",
                headers: getHeader()
            });
            const data = await response.json();
            if (response.ok) {
                setQuiz({
                    quiz_id: data.quiz_id,
                    name: data.name,
                    description: data.description,
                    topic: data.topic,
                    type: data.type,
                    image_path: data.image_path,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                });
                setAnswers(data.answers);
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
                return (
                    <div>
                        <h2 className="text-center p-3">About Quiz</h2>
                        <div className="card m-4 shadow-sm">
                            <div className="card-body">
                                <div className="row m-4">
                                    <div className="col d-flex align-items-center justify-content-center">
                                        <img src={`${IMAGE_BASE_URL}${quiz.image_path}`} width="80%" className="border border-primary border-5" alt={quiz.name} />
                                    </div>
                                    <div className="col">
                                        <p className="fs-4 fw-bold">Title:</p>
                                        <p className="fs-5">{quiz.name}</p>
                                        <p className="fs-4 fw-bold">Description:</p>
                                        <p className="fs-5">{quiz.description}</p>
                                        <p className="fs-4 fw-bold">Topic:</p>
                                        <p className="fs-5">{quiz.topic}</p>
                                        <p className="fs-4 fw-bold">Type:</p>
                                        <p className="fs-5">{quiz.type}</p>
                                        <p className="fs-4 fw-bold">Date Created:</p>
                                        <p className="fs-5">{quiz.createdAt}</p>
                                        <p className="fs-4 fw-bold">Date Updated:</p>
                                        <p className="fs-5">{quiz.updatedAt}</p>
                                        <button
                                            role="button"
                                            type="button"
                                            className="btn btn-primary btn-lg"
                                            onClick={() => { onNavigate(`/edit-quiz/${quiz.quiz_id}`) }}
                                        >EDIT</button>
                                    </div>
                                </div>
                                {answers.length > 0 ? (
                                    <table className="table text-white mb-0">
                                        <thead>
                                            <tr>
                                            <th scope="col">Users Answered</th>
                                            <th scope="col">Total Points</th>
                                            <th scope="col">Time Answered</th>
                                            <th scope="col">View</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {answers.map((answer, index) => {
                                                return (
                                                    <tr className="fw-normal" key={index}>
                                                        <th>
                                                            <img src={`${IMAGE_BASE_URL}${answer.user.image_path}`} alt={answer.user.name} width={50} className="rounded-circle" />
                                                            <span className="ms-2">{answer.user.name}</span>
                                                        </th>
                                                        <td className="align-middle">
                                                            <span>{answer.points.reduce((acc, next) => acc + next)}</span>
                                                        </td>
                                                        <td className="align-middle">
                                                            <span>{answer.createdAt}</span>
                                                        </td>
                                                        <td className="align-middle">
                                                            <button
                                                                className="btn btn-primary"
                                                                type="button"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#staticBackdrop"
                                                                onClick={() => { setModalState(index); }}
                                                            >View</button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : <div><h1 className="text-center">No users have answered your quiz.</h1></div>}
                            </div>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div>
            <NavigationBar />
            {getProcess(process)}
            {answers.length > 0 ? <CarouselInsideModal quiz={quiz} answer={answers[modalState]} /> : <div></div>}
        </div>
    );
}