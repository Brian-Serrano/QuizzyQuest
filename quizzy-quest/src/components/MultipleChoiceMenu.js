import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function MultipleChoiceMenu(props) {
    const mark = (choice) => {
        return choice === props.question.user_answer ? 
            props.question.user_answer === props.question.answer ? 
            <i className="bi bi-check-lg"></i> : 
            <i className="bi bi-x-lg"></i> : 
            <span></span>;
    }

    return (
        <div>
            <div className="row m-3">
                <div className="col bg-danger m-1">
                    <p
                        className="m-0 p-3 fs-4 text-light text-center"
                        onClick={() => props.selectAnswer("a")}
                    >{mark("a")}a. {props.question.letter_a}</p>
                </div>
                <div className="col bg-primary m-1">
                    <p
                        className="m-0 p-3 fs-4 text-light text-center"
                        onClick={() => props.selectAnswer("b")}
                    >{mark("b")}b. {props.question.letter_b}</p>
                </div>
            </div>
            <div className="row m-3">
                <div className="col bg-warning m-1">
                    <p
                        className="m-0 p-3 fs-4 text-light text-center"
                        onClick={() => props.selectAnswer("c")}
                    >{mark("c")}c. {props.question.letter_c}</p>
                </div>
                <div className="col bg-success m-1">
                    <p
                        className="m-0 p-3 fs-4 text-light text-center"
                        onClick={() => props.selectAnswer("d")}
                    >{mark("d")}d. {props.question.letter_d}</p>
                </div>
            </div>
        </div>
    );
}