import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { useEffect, useState } from "react";
import { ProcessState } from "../utils/enums";
import { BASE_URL, IMAGE_BASE_URL } from "../utils/constants";
import { getHeader } from "../utils/func-utils";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import NavigationBar from "../components/NavigationBar";
import CarouselInsideModal from "../components/CarouselInsideModal";
import { useLoaderData } from "react-router-dom";

export default function Profile() {
    const id = useLoaderData();
    const [profile, setProfile] = useState({});
    const [process, setProcess] = useState({state: ProcessState.Loading, message: ""});
    const [answers, setAnswers] = useState([]);
    const [modalState, setModalState] = useState(0);

    const getUser = async () => {
        try {
            const response = await fetch(`${BASE_URL}/quiz-routes/get-user-answered-quiz?user_id=${id}`, {
                method: "GET",
                headers: getHeader()
            });
            const data = await response.json();
            if (response.ok) {
                setProfile({
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
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
        getUser();
    }, []);

    switch (process.state) {
        case ProcessState.Loading:
            return <div><NavigationBar /><LoadingState /></div>;
        case ProcessState.Error:
            return <div><NavigationBar /><ErrorState error={process.message} onRefresh={() => {
                setProcess({state: ProcessState.Loading, message: ""});
                getUser();
            }} /></div>;
        case ProcessState.Success:
            return (
                <div>
                    <NavigationBar />
                    <div className="p-4 container">
                        <div className="card shadow-sm">
                            <h1 className="m-3 p-0 text-center">Profile</h1>
                            <div className="card-body">
                                <div className="row row-cols-1 row-cols-lg-2 g-2">
                                    <div className="col">
                                        <div className="m-3">
                                            <p className="fs-4 fw-bold m-0">Username:</p>
                                            <p className="fs-5">{profile.name}</p>
                                        </div>
                                        <hr />
                                        <div className="m-3">
                                            <p className="fs-4 fw-bold m-0">Email Address:</p>
                                            <p className="fs-5">{profile.email}</p>
                                        </div>
                                        <hr />
                                        <div className="m-3">
                                            <p className="fs-4 fw-bold m-0">Role:</p>
                                            <p className="fs-5">{profile.role}</p>
                                        </div>
                                        <hr />
                                        <div className="m-3">
                                            <p className="fs-4 fw-bold m-0">Account Created:</p>
                                            <p className="fs-5">{profile.createdAt}</p>
                                        </div>
                                        <hr />
                                        <div className="m-3">
                                            <p className="fs-4 fw-bold m-0">Account Updated:</p>
                                            <p className="fs-5">{profile.updatedAt}</p>
                                        </div>
                                    </div>
                                    <div className="col d-flex justify-content-center align-items-center">
                                        <img src={`${IMAGE_BASE_URL}${profile.image_path}`} width="70%" className="rounded-circle" alt={profile.name} />
                                    </div>
                                </div>
                                {answers.length > 0 ? (
                                    <table className="table text-white mb-0">
                                        <thead>
                                            <tr>
                                            <th scope="col">Type</th>
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
                                                            <span className="ms-2">{answer.type}</span>
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
                                ) : <div><h1 className="text-center">You have not answered any quiz.</h1></div>}
                            </div>
                        </div>
                    </div>
                    {answers.length > 0 ? <CarouselInsideModal quiz={profile} answer={{...answers[modalState], user: profile}} /> : <div></div>}
                </div>
            );
    }
}