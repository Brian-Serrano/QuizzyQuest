import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import Spinner from "./Spinner";

export default function LoadingState() {
    return (
        <div className="container-fluid">
            <div className="d-flex flex-column min-vh-100">
                <div className="d-flex flex-grow-1 justify-content-center align-items-center">
                    <Spinner />
                </div>
            </div>
        </div>
    );
}