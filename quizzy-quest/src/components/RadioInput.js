import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

export default function RadioInput(props) {
    return (
        <div className="col form-check m-2">
            <input
                type="radio"
                className="form-check-input"
                name={props.name}
                value={props.value}
                checked={props.checked}
                onChange={props.onChange}
            />
            <label className="form-check-label">{props.value.toUpperCase()}</label>
        </div>
    );
}