import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

/**
 * A menu shown on the top of menu in answer quiz page. It contains information such as title, topic, type and progress of quiz (number of items answered)
 * @param {object} props An object containing title, topic, type and percentage of answered items over total items.
 * @returns JSX Element
 */
export default function QuizHeader(props) {
    return (
        <div className="m-3">
            <div className="row">
                <div className="col card shadow-sm m-1">
                    <div className="card-body">
                        <p className="fs-4">Title:</p>
                        <p className="fs-5">{props.title}</p>
                    </div>
                </div>
                <div className="col card shadow-sm m-1">
                    <div className="card-body">
                        <p className="fs-4">Topic:</p>
                        <p className="fs-5">{props.topic}</p>
                    </div>
                </div>
                <div className="col card shadow-sm m-1">
                    <div className="card-body">
                        <p className="fs-4">Type:</p>
                        <p className="fs-5">{props.type}</p>
                    </div>
                </div>
            </div>
            <p className="fs-5 m-2 text-center">PROGRESS</p>
            <div className="progress m-2" aria-valuenow={props.percent} aria-valuemin={0} aria-valuemax={100} role="progressbar">
                <div className="progress-bar" style={{width: props.percent + "%"}}>{Math.round(props.percent)}%</div>
            </div>
        </div>
    );
}