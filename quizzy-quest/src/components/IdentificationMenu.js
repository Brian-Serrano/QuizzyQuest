import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function IdentificationMenu(props) {
    return (
        <div className="d-flex bg-success m-3 p-3">
            <div className="flex-grow-1 p-1">
                <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Answer here"
                    value={props.question.user_answer}
                    onChange={props.onAnswerChange}
                />
            </div>
            <div className="p-1">
                <button role="button" className="btn btn-primary btn-lg" onClick={props.submitAnswer}>SUBMIT</button>
            </div>
        </div>
    );
}