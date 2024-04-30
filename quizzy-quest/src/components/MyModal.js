import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

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