import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

/**
 * Container fixedly place at the bottom right that is always used for showing errors
 * @param {object} props An object that contains the error/message
 * @returns JSX Element
 */
export default function MyToast(props) {
    return (
        <div className="position-fixed bottom-0 end-0 p-3" style={{zIndex: 11}}>
            <div className="toast d-flex" role="alert" aria-live="assertive" aria-atomic="true">
                <div className="toast-body">{props.error}</div>
            </div>
        </div>
    );
}