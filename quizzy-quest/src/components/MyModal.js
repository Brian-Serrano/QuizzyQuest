import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

/**
 * Commonly used modal on the application
 * @param {object} props An object that contains modalState. modalState is an object that contains the following properties. titleText is the header text for the modal. bodyText is a JSX Element (or text its okay). buttonText is the text of button. onCancelClick is a callback function that should close the modal. onApplyClick is a callback function that should do an action (e.g. request server) and close the modal.
 * @returns JSX Element
 */
export default function MyModal(props) {
    return (
        <div className="modal d-block" tabIndex="-1" style={{backgroundColor: "rgba(0,0,0,0.4)"}}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{props.modalState.titleText}</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={props.modalState.onCancelClick}></button>
                    </div>
                    <div className="modal-body">{props.modalState.bodyText}</div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={props.modalState.onApplyClick}>{props.modalState.buttonText}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}