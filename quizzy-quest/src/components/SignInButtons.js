import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

export default function SignInButtons(props) {
    return (
        <div className="row p-3">
            <div className="col p-2">
                <button
                    type="button"
                    onClick={props.onNavigate}
                    className="btn btn-primary col-12">
                    {props.first}
                </button>
            </div>
            <div className="col p-2">
                <button
                    type="button"
                    onClick={props.onSignIn}
                    disabled={!props.enabled}
                    className="btn btn-success col-12">
                    {props.enabled ? props.second : (
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}