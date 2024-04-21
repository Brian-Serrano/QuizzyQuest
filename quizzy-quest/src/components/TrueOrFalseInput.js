import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import InputField from "./InputField";
import SliderInput from "./SliderInput";

export default function TrueOrFalseInput(props) {
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
                <label className="form-label p-1 h5">Answer</label>
                <select name="answer" className="form-select" onChange={props.onAnswerChange} value={props.question.tofAnswer}>{
                    ["TRUE", "FALSE"].map(l => <option value={l}>{l}</option>)
                }</select>
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