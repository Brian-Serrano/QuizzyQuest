import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { MIN_ITEMS } from "../utils/constants";
import { QuizType } from "../utils/enums";
import MultipleChoiceInput from "./MultipleChoiceInput";
import IdentificationInput from "./IdentificationInput";
import TrueOrFalseInput from "./TrueOrFalseInput";

export default function GetQuizInput(props) {
    const menu = props.questionsState.map((question, index) => {
        const removeItem = () => {
            if (props.questionsState.length > MIN_ITEMS) {
                props.setQuestionsState(prev => {
                    return prev.filter((_, idx) => index !== idx);
                });
            }
        };
        const changeQuestion = (event) => {
            props.changeQuestions(event, "question", index);
        };
        const changeExplanation = (event) => {
            props.changeQuestions(event, "explanation", index);
        };
        const changeTimer = (event) => {
            props.changeQuestions(event, "timer", index);
        };
        const changePoints = (event) => {
            props.changeQuestions(event, "points", index);
        };
        switch (props.quizState.type) {
            case QuizType.MultipleChoice:
                return <MultipleChoiceInput
                    key={index}
                    item={index}
                    question={question}
                    onQuestionChange={changeQuestion}
                    onChoiceChange={[
                        (event) => { props.changeQuestions(event, "letter_a", index); },
                        (event) => { props.changeQuestions(event, "letter_b", index); },
                        (event) => { props.changeQuestions(event, "letter_c", index); },
                        (event) => { props.changeQuestions(event, "letter_d", index); }
                    ]}
                    onAnswerChange={(event) => { props.changeQuestions(event, "mcAnswer", index); }}
                    onExplanationChange={changeExplanation}
                    onTimerChange={changeTimer}
                    onPointsChange={changePoints}
                    removeItem={removeItem}
                />;
            case QuizType.Identification:
                return <IdentificationInput
                    key={index}
                    item={index}
                    question={question}
                    onQuestionChange={changeQuestion}
                    onAnswerChange={(event) => { props.changeQuestions(event, "iAnswer", index); }}
                    onExplanationChange={changeExplanation}
                    onTimerChange={changeTimer}
                    onPointsChange={changePoints}
                    removeItem={removeItem}
                />;
            case QuizType.TrueOrFalse:
                return <TrueOrFalseInput
                    key={index}
                    item={index}
                    question={question}
                    onQuestionChange={changeQuestion}
                    onAnswerChange={(event) => { props.changeQuestions(event, "tofAnswer", index); }}
                    onExplanationChange={changeExplanation}
                    onTimerChange={changeTimer}
                    onPointsChange={changePoints}
                    removeItem={removeItem}
                />;
        }
    });

    return <div>{menu}</div>;
}