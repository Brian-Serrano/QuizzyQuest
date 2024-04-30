import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

export default function AddItemButton(props) {
    return (
        <div className="m-4">
            <button
                type="button"
                className="btn btn-outline-dark btn-lg col-12"
                onClick={props.onClick}
            ><i className="bi bi-plus"></i>Add Item</button>
        </div>
    );
}