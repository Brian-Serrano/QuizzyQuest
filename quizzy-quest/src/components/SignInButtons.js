import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import Spinner from "./Spinner";

/**
 * A component that contains two buttons (navigate to login and signup the user, vice versa) and used in signup.
 * @param {object} props An object that contains first (text for first button), second (text for second button), onNavigate (navigate to login or signup), onSignIn (request server for login or signup), enabled (disable second (action that delays) button if there are server request running)
 * @returns JSX Element
 */
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
                    {props.enabled ? props.second : <Spinner />}
                </button>
            </div>
        </div>
    );
}