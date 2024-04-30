import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

export default function Spinner() {
    return (
        <div className="spinner-border" role="status">
            <span className="sr-only"></span>
        </div>
    );
}