import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { IMAGE_BASE_URL } from "../utils/constants";

export default function QuizCard(props) {
    return (
        <div>
            <div className="card col shadow-sm" style={{height: "100%"}}>
                <img src={`${IMAGE_BASE_URL}${props.quiz.image_path}`} className="card-img-top" alt={props.quiz.name} />
                <div className="card-body">
                    <div className="d-flex">
                        <div className="flex-grow-1">
                            <h5 className="card-title">{props.quiz.name}</h5>
                            <h6 className="card-subtitle mb-2 text-muted">{props.quiz.topic}</h6>
                            <p className="card-subtitle mb-2 text-muted">{props.quiz.updatedAt}</p>
                        </div>
                        <div onClick={props.onProfileNavigate} className="d-flex flex-column align-items-center justify-content-center">
                            <img src={`${IMAGE_BASE_URL}${props.quiz.user.image_path}`} width={50} className="rounded-circle" alt={props.quiz.user.name} />
                            <span className="fs-6">{props.quiz.user.name}</span>
                        </div>
                    </div>
                    <p className="card-text">{props.quiz.description}</p>
                    <div className="d-flex">
                        <div className="flex-grow-1 d-flex flex-row align-items-center">
                            <button type="button" onClick={props.navigate} className="btn btn-primary">View</button>
                            <p className="text-success my-0 mx-2">{props.quiz.is_answered ? "Answered" : ""}</p>
                        </div>
                        <div>
                            <span className="fs-6 text-warning">Items: {props.quiz.items}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}