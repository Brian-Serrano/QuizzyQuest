import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

/**
 * Used for the choices of multiple choice input fields when adding/editing quiz.
 * @param {object} props An object that contains the text, value, onChange (responsible for changes in input field value) for the input field.
 * @returns JSX Element
 */
export default function InputGroups(props) {
    return (
        <div className="input-group py-2">
            <span className="input-group-text">{props.text}</span>
            <input
                type="text"
                className="form-control"
                placeholder={props.text}
                value={props.value}
                onChange={props.onChange}
            />
        </div>
    );
}