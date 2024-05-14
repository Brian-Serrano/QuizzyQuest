import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { QuizType } from "../utils/enums";
import InputField from "./InputField";
import QuizTextArea from "./QuizTextArea";
import RadioInput from "./RadioInput";

/**
 * A container used in editing the quiz information (visibility, title, image etc.) in add quiz and edit quiz page.
 * @param {object} props an object with the following properties: image, quizState, pickImage, changeQuizInfo and changeVisibility. image contains the blob/file and src of a quiz image. quizState is an object containing the values for the container input fields (title, description, etc.). pickImage is callback function that will invoked when user pick image in file explorer, the callback will received an event that contains information about the file that should be added to state. changeQuizInfo is a callback function that will invoked when the user change text in field (title, description, topic, type), and it receives event containing the information about field and key what input field value should be changed. changeVisibility is a callback function invoked when user select visibility.
 * @returns JSX Element
 */
export default function EditQuizMenu(props) {
    return (
        <div className="card m-4 shadow-sm">
            <div className="card-body m-4">
                <label className="form-label p-1 h5">Pick Quiz Image</label>
                <input
                    type="file"
                    className="form-control"
                    name="image"
                    onChange={props.pickImage}
                    accept=".png,.jpeg,.jpg,.webp"
                />
                {props.image.src.length > 0 ? <img className=" border border-2 border-primary m-4" src={props.image.src} width={300} height={200} /> : <span></span>}
                <InputField
                    name="title"
                    type="text"
                    placeholder="Title"
                    value={props.quizState.title}
                    onChange={(event) => { props.changeQuizInfo(event, "title"); }}
                />
                <div className="row">
                    <QuizTextArea
                        name="description"
                        placeholder="Description"
                        value={props.quizState.description}
                        onChange={(event) => { props.changeQuizInfo(event, "description"); }}
                    />
                    <div className="col">
                        <InputField
                            name="topic"
                            type="text"
                            placeholder="Topic"
                            value={props.quizState.topic}
                            onChange={(event) => { props.changeQuizInfo(event, "topic"); }}
                        />
                        <label className="form-label p-1 h5">Type</label>
                        <select
                            name="type"
                            className="form-select"
                            onChange={(event) => { props.changeQuizInfo(event, "type"); }}
                            value={props.quizState.type}
                        >{
                            Object.values(QuizType).map(l => <option value={l} key={l}>{l}</option>)
                        }</select>
                        <label className="form-label p-1 h5">Visibility</label>
                        <div className="row">
                            <RadioInput
                                name="visibility"
                                value="public"
                                checked={props.quizState.visibility === "public"}
                                onChange={props.changeVisibility}
                            />
                            <RadioInput
                                name="visibility"
                                value="private"
                                checked={props.quizState.visibility === "private"}
                                onChange={props.changeVisibility}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}