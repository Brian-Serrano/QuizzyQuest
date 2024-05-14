import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { IMAGE_BASE_URL } from "../utils/constants";

/**
 * A menu shown before starting to answer quiz
 * @param {object} props An object containing quiz (an object containing all information), onProfile (navigate to creator of quiz profile when image is clicked), onStartClick (start the quiz when the start button clicked)
 * @returns JSX Element
 */
export default function QuizIntro(props) {
    return (
        <div className="p-4 container">
            <div className="card shadow-sm">
                <div className="row row-cols-lg-2 row-cols-1 card-body">
                    <div className="col d-flex align-items-center justify-content-center">
                        <img src={`${IMAGE_BASE_URL}${props.quiz.image_path}`} width="80%" className="border border-primary border-5" alt={props.quiz.name} />
                    </div>
                    <div className="col">
                        <div className="card-body">
                            <p className="fs-4 fw-bold">Title:</p>
                            <p className="fs-5">{props.quiz.name}</p>
                            <p className="fs-4 fw-bold">Description:</p>
                            <p className="fs-5">{props.quiz.description}</p>
                            <p className="fs-4 fw-bold">Topic:</p>
                            <p className="fs-5">{props.quiz.topic}</p>
                            <p className="fs-4 fw-bold">Type:</p>
                            <p className="fs-5">{props.quiz.type}</p>
                            <div className="row">
                                <div className="col-8">
                                    <p className="fs-4 fw-bold">Date Created:</p>
                                    <p className="fs-5">{props.quiz.createdAt}</p>
                                    <p className="fs-4 fw-bold">Date Updated:</p>
                                    <p className="fs-5">{props.quiz.updatedAt}</p>
                                    <button role="button" type="button" className="btn btn-primary btn-lg" onClick={props.onStartClick}>START</button>
                                </div>
                                <div className="col-4 d-flex flex-column align-items-center justify-content-center" onClick={props.onProfile}>
                                    <img src={`${IMAGE_BASE_URL}${props.quiz.user.image_path}`} width="80%" className="rounded-circle" alt={props.quiz.user.name} />
                                    <p className="fs-4">{props.quiz.user.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}