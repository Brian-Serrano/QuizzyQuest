import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";

/**
 * A menu in answer quiz page where the user can provide answer for true or false questions. Should be wrapped inside QuizMenu component.
 * @param {object} props An object that contains question (an object used when user answer quiz), selectAnswer (callback function responsible for selecting answer (mark it as answered, check the answer and add points if correct))
 * @returns JSX Element
 */
export default function TrueOrFalseMenu(props) {
    const mark = (choice) => {
        return choice === props.question.user_answer ? 
            props.question.user_answer === props.question.answer ? 
            <i className="bi bi-check-lg"></i> : 
            <i className="bi bi-x-lg"></i> : 
            <span></span>;
    }

    return (
        <div className="row m-3">
            <div className="col bg-danger m-1">
                <p
                    className="m-0 p-3 fs-4 text-light text-center"
                    onClick={() => props.selectAnswer("FALSE")}
                >{mark("FALSE")}FALSE</p>
            </div>
            <div className="col bg-primary m-1">
                <p
                    className="m-0 p-3 fs-4 text-light text-center"
                    onClick={() => props.selectAnswer("TRUE")}
                >{mark("TRUE")}TRUE</p>
            </div>
        </div>
    );
}