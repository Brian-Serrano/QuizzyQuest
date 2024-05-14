import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

/**
 * A text input field commonly used by the application
 * @param {object} props An object that contains placeholder, name, value, onChange (responsible for changes in text input field value) for the text field
 * @returns JSX Element
 */
export default function InputField(props) {
    return (
        <div className="py-2">
            <label className="form-label p-1 h5">{props.placeholder}</label>
            <input
                type="text"
                placeholder={"Enter " + props.placeholder}
                name={props.name}
                className="form-control p-2"
                value={props.value}
                onChange={props.onChange}
                required />
        </div>
    )
}