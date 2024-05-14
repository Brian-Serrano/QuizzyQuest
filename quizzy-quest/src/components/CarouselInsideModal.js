import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { IMAGE_BASE_URL } from "../utils/constants";
import SpeechSynthesis from "./SpeechSynthesis";

/**
 * Used in about quiz and profile page as a container for showing the user's answer to a quiz
 * @param {object} props an object with two properties (quiz and answer). The quiz is what used for background image with quiz name as the alt name in the carousel inside modal. The answer is the answer of a user to the quiz (includes questions, answers, points, time remainings, and the user)
 * @returns JSX Element
 */
export default function CarouselInsideModal(props) {
    return (
        <div className="modal fade" id="staticBackdrop" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="staticBackdropLabel">{props.answer.user.name}'s Answers</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                <div className="modal-body">
                    <div id="carouselExampleCaptions" className="carousel slide" data-bs-ride="carousel">
                        <div className="carousel-indicators">
                            {props.answer.questions.map((question, index) => {
                                return <button
                                    type="button"
                                    data-bs-target="#carouselExampleCaptions"
                                    data-bs-slide-to={index}
                                    aria-label={"Item " + (index + 1)}
                                    className={index === 0 ? "active" : ""}
                                    aria-current={index === 0}
                                    key={index}
                                ></button>;
                            })}
                        </div>
                        <div className="carousel-inner">
                            {props.answer.questions.map((question, index) => {
                                return (
                                    <div className={`carousel-item${index === 0 ? " active" : ""}`} key={index}>
                                        <img src={`${IMAGE_BASE_URL}${props.quiz.image_path}`} className="d-block w-100" alt={props.quiz.name} />
                                        <div className="carousel-caption d-md-block">
                                            <h5>{props.answer.answers[index]}</h5>
                                            <p><span className="align-middle">{question}</span><SpeechSynthesis question={question} onError={(_) => {}} /></p>
                                            <p>Points: {props.answer.points[index]}, Remaining Time: {props.answer.remaining_times[index]}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                    </div>
                </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}