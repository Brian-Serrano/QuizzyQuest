import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { useState, useRef } from "react";
import building from "../Administration Building.JPG";
import NavigationBar from "../components/NavigationBar";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function Test() {
    // const toast = useRef(null);
    // const [item, setItem] = useState(0);
    // const [questions, setQuestions] = useState([]);
    // const [quiz, setQuiz] = useState({});
    return (
        <div>
            <NavigationBar /><ErrorState error="The error below sometimes occurs I don't know why. Every code seems to work but only an error occurs." /><LoadingState />
        </div>
    );
}