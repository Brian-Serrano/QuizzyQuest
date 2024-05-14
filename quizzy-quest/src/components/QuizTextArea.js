import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

/**
 * An input field used for data that require long/many text (e.g. description of quiz)
 * @param {object} props An object that contains placeholder, name, value, onChange (responsible for changes in input field value) for the input field
 * @returns JSX Element
 */
export default function QuizTextArea(props) {
    return (
        <div className="col py-2">
            <label className="form-label p-1 h5">{props.placeholder}</label>
            <textarea 
                className="form-control p-2"
                name={props.name}
                placeholder={"Enter " + props.placeholder}
                rows={4}
                required={true}
                value={props.value}
                onChange={props.onChange}
            ></textarea>
        </div>
    );
}