import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

/**
 * Button used for adding quiz items below in add quiz and edit quiz page
 * @param {object} props contains onClick callback that will invoked when the user click the button, usually add item to quiz when clicked
 * @returns JSX Element
 */
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