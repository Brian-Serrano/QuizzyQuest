import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { useState } from "react";
import * as XLSX from "xlsx";

export default function ExportQuizMenu(props) {
    const [menuState, setMenuState] = useState({
        filetype: "xlsx",
        visibility: false
    });

    const changeFileType = (event) => {
        setMenuState(prev => ({...prev, filetype: event.target.value}));
    };

    return (
        <div className="mx-2">
            {menuState.visibility ? (
                <div className="modal d-block" tabIndex="-1" style={{backgroundColor: "rgba(0,0,0,0.4)"}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Export Quiz</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => {
                                    setMenuState(prev => ({...prev, visibility: false}));
                                }}></button>
                            </div>
                            <div className="modal-body">
                                <div className="m-3">
                                    <p className="fs-5 mx-1">File Type: </p>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="filetype"
                                            id="excel"
                                            value="xlsx"
                                            checked={menuState.filetype === "xlsx"}
                                            onChange={changeFileType}
                                        />
                                        <label className="form-check-label" htmlFor="excel">
                                            Excel
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="filetype"
                                            id="csv"
                                            value="csv"
                                            checked={menuState.filetype === "csv"}
                                            onChange={changeFileType}
                                        />
                                        <label className="form-check-label" htmlFor="csv">
                                            CSV
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="filetype"
                                            id="text"
                                            value="txt"
                                            checked={menuState.filetype === "txt"}
                                            onChange={changeFileType}
                                        />
                                        <label className="form-check-label" htmlFor="text">
                                            Text
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => {
                                    const worksheet = XLSX.utils.json_to_sheet(props.data);
                                    const workbook = XLSX.utils.book_new();
                                    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
                                    XLSX.writeFile(workbook, `${props.quizName}.${menuState.filetype}`, {type: "binary", bookType: menuState.filetype});
                                    setMenuState(prev => ({...prev, visibility: false}));
                                }}>Export</button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : <div></div>}
            <div>
                <button 
                    className="btn btn-primary" 
                    onClick={() => {
                        setMenuState(prev => ({...prev, visibility: true}));
                    }}
                    type="button"
                    role="button"
                >Export Quiz</button>
            </div>
        </div>
    );
}