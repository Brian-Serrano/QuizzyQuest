import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState } from "react";

/**
 * This component contains only play/pause button and responsible for providing speech for the questions.
 * @param {object} props An object that contains the question to be used
 * @returns JSX Element
 */
export default function SpeechSynthesis(props) {
    const [speaking, setSpeaking] = useState(false);
    const utterThis = new SpeechSynthesisUtterance(props.question);
    utterThis.onstart = _ => { setSpeaking(true); };
    utterThis.onend = _ => { setSpeaking(false); };
    utterThis.onpause = _ => { setSpeaking(false); };
    utterThis.onresume = _ => { setSpeaking(true); };
    utterThis.onerror = event => {
        props.onError(event.error);
        setSpeaking(false);
    };
    return (
        <i
            className={speaking ? "bi bi-pause-fill align-middle mx-2" : "bi bi-play-fill align-middle mx-2"}
            role="button"
            style={{fontSize: "3rem"}}
            onClick={() => { speechSynthesis.speak(utterThis); }}
        ></i>
    );
}