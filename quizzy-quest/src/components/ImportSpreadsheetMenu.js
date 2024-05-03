import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { useState } from "react";
import * as XLSX from "xlsx";
import { QuizType } from "../utils/enums";
import MyToast from "./MyToast";

export default function ImportSpreadsheetMenu(props) {
    const [result, setResult] = useState([]);
    const [modalState, setModalState] = useState(false);
    const [fileName, setFileName] = useState("");
    const [type, setType] = useState(QuizType.MultipleChoice);
    const [workSheet, setWorksheet] = useState({});
    const [headers, setHeaders] = useState([]);
    const [toast, setToast] = useState({error: "", visibility: false});

    const allowedFormats = [
        "xlsx", "xlsm", "xlsb", "xls", "csv", "txt", "dif", "sylk", "slk",
        "prn", "numbers", "ods", "fods", "dbf", "wk1", "wk3", "eth"
    ];

    const getDefaultValue = () => {
        return {
            question: "",
            letter_a: "",
            letter_b: "",
            letter_c: "",
            letter_d: "",
            mcAnswer: "a",
            iAnswer: "",
            tofAnswer: "TRUE",
            explanation: "",
            timer: 30,
            points: 200
        }
    };

    const validateQuestion = (question) => {
        return !(question.length < 15 || question.length > 300) && !(/^\s+$/.test(question));
    };

    const validateExplanation = (explanation) => {
        return !(explanation.length > 300) && !(/^\s+$/.test(explanation));
    };

    const validateTimer = (timer) => {
        return Number(timer) && !(timer < 10 || timer > 120);
    };

    const validatePoints = (points) => {
        return Number(points) && !(points < 50 || points > 1000) && points % 5 === 0;
    };

    const validateChoice = (choice) => {
        return !(choice.length < 1 || choice.length > 200) && !(/^\s+$/.test(choice));
    };

    const validateMCAnswer = (answer) => {
        return ["a", "b", "c", "d"].includes(answer.toLowerCase());
    };

    const validateIAnswer = (answer) => {
        return !(answer.length < 1 || answer.length > 200) && !(/^\s+$/.test(answer));
    };

    const validateTOFAnswer = (answer) => {
        return ["TRUE", "FALSE"].includes(answer.toUpperCase());
    };

    const multipleChoiceProps = [
        {text: "None", validator: () => {}, name: "none"},
        {text: "Question", validator: validateQuestion, name: "question"},
        {text: "Letter A", validator: validateChoice, name: "letter_a"},
        {text: "Letter B", validator: validateChoice, name: "letter_b"},
        {text: "Letter C", validator: validateChoice, name: "letter_c"},
        {text: "Letter D", validator: validateChoice, name: "letter_d"},
        {text: "Answer", validator: validateMCAnswer, name: "mcAnswer"},
        {text: "Explanation", validator: validateExplanation, name: "explanation"},
        {text: "Points", validator: validatePoints, name: "points"},
        {text: "Timer", validator: validateTimer, name: "timer"}
    ];
    const identificationProps = [
        {text: "None", validator: () => {}, name: "none"},
        {text: "Question", validator: validateQuestion, name: "question"},
        {text: "Answer", validator: validateIAnswer, name: "iAnswer"},
        {text: "Explanation", validator: validateExplanation, name: "explanation"},
        {text: "Points", validator: validatePoints, name: "points"},
        {text: "Timer", validator: validateTimer, name: "timer"}
    ];
    const trueOrFalseProps = [
        {text: "None", validator: () => {}, name: "none"},
        {text: "Question", validator: validateQuestion, name: "question"},
        {text: "Answer", validator: validateTOFAnswer, name: "tofAnswer"},
        {text: "Explanation", validator: validateExplanation, name: "explanation"},
        {text: "Points", validator: validatePoints, name: "points"},
        {text: "Timer", validator: validateTimer, name: "timer"}
    ];

    const showError = (error) => {
        setToast({error: error, visibility: true});
        setTimeout(() => { setToast({visibility: false}); }, 10000);
    };

    const truncate = (str) => {
        return str.length > 50 ? str.substr(0, 50) + '...' : str;
    };

    const getHeaderOptions = (type) => {
        switch (type) {
            case QuizType.MultipleChoice:
                return multipleChoiceProps;
            case QuizType.Identification:
                return identificationProps;
            case QuizType.TrueOrFalse:
                return trueOrFalseProps;
        }
    };

    const mapData = (data, key) => {
        if (key === "mcAnswer") return data.toLowerCase();
        if (key === "tofAnswer") return data.toUpperCase();
        if (key === "timer" || key === "points") return Number(data);
        return data;
    };

    const mapResult = () => {
        return result[workSheet.selected].map((res) => {
            return res.map((v, idx) => {
                const prop = getHeaderOptions(type).find(p => p.name === headers[workSheet.selected][idx]);
                return {
                    [prop.name]: prop.validator(v) ? mapData(v, prop.name) : getDefaultValue()[prop.name],
                    isRemoved: prop.validator(v) === undefined
                };
            }).filter(v => !v.isRemoved).reduce((acc, data) => {
                Object.keys(data).forEach(key => {
                    if (key !== "isRemoved") {
                        acc[key] = data[key];
                    }
                });
                return acc;
            }, {});
        });
    };

    return (
        <div className="mx-2">
            {modalState ? (
                <div className="modal d-block" tabIndex="-1" style={{backgroundColor: "rgba(0,0,0,0.4)"}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{fileName}</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => { setModalState(false); }}></button>
                            </div>
                            <div className="modal-body">
                                <p className="form-label m-2 fs-5">Type: </p>
                                <select
                                    className="form-select m-1"
                                    value={type}
                                    onChange={(event) => {
                                        setHeaders(prev => {
                                            return prev.map(pre => pre.map(_ => "none"));
                                        });
                                        setType(event.target.value);
                                    }}
                                >
                                    {Object.values(QuizType).map(t => <option value={t} key={t}>{t}</option>)}
                                </select>
                                <p className="form-label m-2 fs-5">Worksheet: </p>
                                <select
                                    className="form-select m-1"
                                    value={workSheet.selected}
                                    onChange={(event) => { setWorksheet(prev => ({...prev, selected: Number(event.target.value)})); }}
                                >
                                    {workSheet.names.map((name, idx) => <option value={idx} key={name}>{name}</option>)}
                                </select>
                                <div className="m-2">
                                    <div><svg width={20} height={20} className="m-2"><rect style={{fill: "rgba(0,255,0,0.2)"}} width={20} height={20}></rect></svg>Valid and will be placed in fields.</div>
                                    <div><svg width={20} height={20} className="m-2"><rect style={{fill: "rgba(255,0,0,0.2)"}} width={20} height={20}></rect></svg>Invalid and will not be placed in fields.</div>
                                </div>
                                <div className="m-4 overflow-auto">
                                    <table>
                                        <thead>
                                            <tr>
                                                {headers[workSheet.selected].map((header, index) => {
                                                    return (
                                                        <th style={{border: "1px solid black"}} className="p-2" key={index}>
                                                            <select
                                                                value={header}
                                                                onChange={(event) => {
                                                                    console.log(event.target.value);
                                                                    setHeaders(prev => {
                                                                        return prev.map((pre, idx) => {
                                                                            return idx === workSheet.selected ? pre.map((item, i) => {
                                                                                return i === index ? event.target.value : item;
                                                                            }) : pre;
                                                                        });
                                                                    });
                                                                }}
                                                            >
                                                                {getHeaderOptions(type)
                                                                    .filter((opt, idx) => {
                                                                        return idx === 0 ? true : header === opt.name ? true : 
                                                                        !headers[workSheet.selected].includes(opt.name);
                                                                    }).map(opt => <option value={opt.name} key={opt.name}>{opt.text}</option>)}
                                                            </select>
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result[workSheet.selected].map((res, idx) => {
                                                return (
                                                    <tr key={idx}>
                                                        {res.map((v, idx) => {
                                                            const validator = getHeaderOptions(type).find(p => p.name === headers[workSheet.selected][idx]).validator;
                                                            return <td key={v} style={{
                                                                border: "1px solid black",
                                                                backgroundColor: validator(v) === undefined ? "white" : validator(v) ? "rgba(0,255,0,0.2)" : "rgba(255,0,0,0.2)"
                                                            }} className="p-2">{truncate(v)}</td>;
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => {
                                    props.replaceFields(mapResult(), type);
                                    setModalState(false);
                                }}>Replace</button>
                                <button type="button" className="btn btn-primary" onClick={() => {
                                    props.appendFields(mapResult(), type);
                                    setModalState(false);
                                }}>Append</button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : <div></div>}
            <input
                type="file"
                name="file"
                onChange={(event) => {
                    const fileName = event.target.files[0].name;
                    const splittedFileName = fileName.split(".");
                    if (allowedFormats.includes(splittedFileName[splittedFileName.length - 1])) {
                        const fileReader = new FileReader();
                        fileReader.readAsArrayBuffer(event.target.files[0]);
                        fileReader.onload = (event) => {
                            let workbook = XLSX.read(
                                event.target.result,
                                { type: "binary" },
                                { dateNF: "mm/dd/yyyy" }
                            );
                            const res = workbook.SheetNames.map((sheet) => {
                                return {
                                    name: sheet,
                                    data: XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {raw: false, header: 1, defval: ""})
                                };
                            }).filter(data => data.data.length > 0);
                            setFileName(fileName);
                            setResult(res.map(r => r.data));
                            setHeaders(res.map(r => new Array(r.data[0].length).fill("none")));
                            setWorksheet({names: res.map(r => r.name), selected: 0});
                            setModalState(true);
                        };
                    } else {
                        showError("Unallowed file format");
                    }
                }}
                accept={allowedFormats.join(",")}
                className="form-control btn btn-primary"
            />
            {toast.visibility ? <MyToast error={toast.error} /> : <div></div>}
        </div>
    );
}