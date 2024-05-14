import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";
import SpeechSynthesis from "./SpeechSynthesis";

/**
 * A menu in answer quiz page where you can see the timer, question, item, points, explanation of question/item.
 * @param {object} props An object that contains the following properties: item, question, onError, children. item is the item number starting from 0. question is an object where it contains everything about the item (question, timer, answer, user's answer, time remaining etc.). onError is used by the speech synthesis (text to speech) if something error happen. children is a JSX element that will be displayed below question and above explanation and should be MultipleChoiceMenu, IdentificationMenu, TrueOrFalseMenu where the user can provide answer.
 * @returns JSX Element
 */
export default function QuizMenu(props) {
    return (
        <div>
            <div className="card shadow-sm m-2">
                <h2 className="text-center m-0 card-body">
                    <span className="align-middle">Item #{props.item + 1}</span>
                    <SpeechSynthesis question={props.question.question} onError={props.onError} />
                </h2>
            </div>
            <div className="row">
                <div className="col-3 d-flex align-items-center justify-content-center flex-column">
                    <p className="text-center m-0 fs-3 fw-bold">Time</p>
                    <p className="text-center m-0 fs-3">{props.question.timer - props.question.time_spent}</p>
                </div>
                <div className="col-6">
                    <div className="card shadow-sm">
                        <h2 className="text-center m-0 card-body">{props.question.question}</h2>
                    </div>
                </div>
                <div className="col-3 d-flex align-items-center justify-content-center flex-column">
                    <p className="text-center m-0 fs-3 fw-bold">Points</p>
                    <p className="text-center m-0 fs-3">{props.question.points}</p>
                </div>
            </div>
            {props.children}
            {props.question.is_answered ? 
                props.question.explanation.length > 0 ? (
                    <div>
                        <div role="button">
                            <p
                                className={"fs-5 text-" + props.question.answer === props.question.user_answer ? "success" : "danger" + " text-center"}
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseCol"
                                aria-expanded="false"
                                aria-controls="collapseCol"
                            >{props.question.answer.toLowerCase() === props.question.user_answer.toLowerCase() ? "Correct" : "Wrong"} Answer Show Explanation <i className="bi bi-caret-down"></i></p>
                        </div>
                        <div className="collapse" id="collapseCol">
                            <div className="card card-body m-2">
                                {props.question.explanation}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div role="button">
                        <p className={"fs-5 text-" + props.question.answer === props.question.user_answer ? "success" : "danger" + " text-center"}>
                            {props.question.answer.toLowerCase() === props.question.user_answer.toLowerCase() ? "Correct" : "Wrong"} Answer
                        </p>
                    </div>
                )
             : <div></div>}
        </div>
    );
}