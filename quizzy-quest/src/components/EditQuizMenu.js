import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { QuizType } from "../utils/enums";
import InputField from "./InputField";
import QuizTextArea from "./QuizTextArea";
import RadioInput from "./RadioInput";

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