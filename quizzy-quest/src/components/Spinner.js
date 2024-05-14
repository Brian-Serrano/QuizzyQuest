import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

/**
 * A rotating arc, represent loading. Used in buttons and when process state is loading when there are server request running.
 * @returns JSX Element
 */
export default function Spinner() {
    return (
        <div className="spinner-border" role="status">
            <span className="sr-only"></span>
        </div>
    );
}