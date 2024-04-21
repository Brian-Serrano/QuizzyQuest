import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

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
            {props.children}
        </div>
    )
}