import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import InputField from "./InputField";
import SliderInput from "./SliderInput";

/**
 * Component used for questions/items that have a quiz type of identification when adding/editing quiz.
 * @param {object} props An object that contains the following properties: item, question, onQuestionChange, onAnswerChange, onExplanationChange, onTimerChange, onPointsChange and removeItem. item is the item number starting from 0. question is an object, which the properties used as text on input fields. onQuestionChange, onAnswerChange, onExplanationChange, onTimerChange, onPointsChange base on their name changes the value from the input field. removeItem removes this component/item when the user click the remove button.
 * @returns JSX Element
 */
export default function IdentificationInput(props) {
    return (
        <div className="card m-4 shadow-sm">
            <div className="card-body m-4">
                <div className="d-flex">
                    <div className="flex-grow-1">
                        <h2 className="m-0">Item #{props.item + 1}</h2>
                    </div>
                    <div>
                        <button type="button" className="btn btn-primary" onClick={props.removeItem}>Remove</button>
                    </div>
                </div>
                <InputField
                    name="question"
                    type="text"
                    placeholder="Question"
                    value={props.question.question}
                    onChange={props.onQuestionChange}
                />
                <InputField
                    name="answer"
                    type="text"
                    placeholder="Answer"
                    value={props.question.iAnswer}
                    onChange={props.onAnswerChange}
                />
                <InputField
                    name="explanation"
                    type="text"
                    placeholder="Explanation"
                    value={props.question.explanation}
                    onChange={props.onExplanationChange}
                />
                <div className="row">
                    <div className="col">
                        <SliderInput
                            name="timer"
                            text="Timer"
                            min={10}
                            max={120}
                            step={1}
                            value={props.question.timer}
                            onChange={props.onTimerChange}
                        />
                    </div>
                    <div className="col">
                        <SliderInput
                            name="points"
                            text="Points"
                            min={50}
                            max={1000}
                            step={5}
                            value={props.question.points}
                            onChange={props.onPointsChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}