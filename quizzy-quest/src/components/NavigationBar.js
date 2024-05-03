import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { Link } from "react-router-dom";
import { logout } from "../utils/func-utils";
import { IMAGE_BASE_URL } from "../utils/constants";
import { useState } from "react";
import { secureStorage } from "../utils/secureStorage";

export default function NavigationBar() {
    const [dropdown, setDropdown] = useState("hide");
    const user = secureStorage.getItem('user') || {token: "", id: "", name: "", image_path: ""};

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-warning bg-warning fixed-top">
                <div className="container-fluid">
                    <span className="navbar-brand">QuizzyQuest</span>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" to="/">Dashboard</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/add-quiz">Create Quiz</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/settings">Settings</Link>
                            </li>
                        </ul>
                        <div className="d-flex">
                            <div className="nav-item">
                                <span className="nav-link" role="button" onClick={() => {
                                    setDropdown(dropdown === "hide" ? "show" : "hide");
                                }}>
                                    <span>{user.name}</span>
                                    <img
                                        src={`${IMAGE_BASE_URL}${user.image_path}`}
                                        width={30}
                                        className="rounded-circle mx-2"
                                        alt={user.name}
                                    />
                                </span>
                                <ul className={"dropdown-menu " + dropdown}>
                                    <li><Link className="dropdown-item" to={`/profile/${user.id}`}>Profile</Link></li>
                                    <li><Link className="dropdown-item" to="/sign-up" onClick={logout}>Log Out</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <div style={{marginTop: "56px"}}></div>
        </div>
    );
}