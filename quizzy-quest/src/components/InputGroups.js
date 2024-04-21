import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

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