import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { useEffect, useState } from "react";
import { ProcessState } from "../utils/enums";
import { BASE_URL, IMAGE_BASE_URL } from "../utils/constants";
import { getHeader, getFormHeader, getImage } from "../utils/func-utils";
import MyToast from "../components/MyToast";
import NavigationBar from "../components/NavigationBar";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import Spinner from "../components/Spinner";
import { secureStorage } from "../utils/secureStorage";

export default function Settings() {
    const [accordions, setAccordions] = useState([true, true, true, true, true, true, true]);
    const [settingsState, setSettingsState] = useState({});
    const [process, setProcess] = useState({state: ProcessState.Loading, message: ""});
    const [message, setMessage] = useState({text: "", visibility: false});
    const [image, setImage] = useState({data: null, src: ""});

    const getUser = async () => {
        try {
            const response = await fetch(`${BASE_URL}/user-routes/get-user`, {
                method: "GET",
                headers: getHeader()
            });
            const data = await response.json();
            if (response.ok) {
                setSettingsState({
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    image_path: data.image_path,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                    currentPasswordVisibility: "password",
                    newPasswordVisibility: "password",
                    confirmPasswordVisibility: "password",
                    nameButtonEnabled: true,
                    roleButtonEnabled: true,
                    passwordButtonEnabled: true,
                    imageButtonEnabled: true
                });
                setProcess({state: ProcessState.Success, message: ""});
            } else {
                setProcess({state: ProcessState.Error, message: data.error});
            }
        } catch (error) {
            setProcess({state: ProcessState.Error, message: error.toString()});
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    const getFileInfo = (event) => {
        getImage(event.target.files[0], (blob, src) => {
            setImage({data: blob, src: src});
        }, {width: 200, height: 200});
    };

    const setToast = (text) => {
        setMessage({text: text, visibility: true});
        setTimeout(() => {
            setMessage({text: message.text, visibility: false});
        }, 10000);
    };

    const setSettings = (event, key) => {
        setSettingsState(prev => {
            return {...prev, [key]: event.target.value};
        });
    };

    const changeName = async () => {
        setSettingsState(prev => ({...prev, nameButtonEnabled: false}));

        try {
            const response = await fetch(`${BASE_URL}/user-routes/change-name`, {
                method: "POST",
                headers: getHeader(),
                body: JSON.stringify({
                    name: settingsState.name
                })
            });
            const data = await response.json();
            if (response.ok) {
                const prevData = secureStorage.getItem('user');
                secureStorage.setItem('user', {...prevData, name: data.name});
                setToast(data.message);
            } else if (response.status >= 400 && response.status <= 499) {
                setToast(data.message);
            } else if (response.status >= 500 && response.status <= 599) {
                setToast(data.error);
            }
        } catch (error) {
            setToast(error.toString());
        }

        setSettingsState(prev => ({...prev, nameButtonEnabled: true}));
    };

    const changeRole = async () => {
        setSettingsState(prev => ({...prev, roleButtonEnabled: false}));

        try {
            const response = await fetch(`${BASE_URL}/user-routes/change-role`, {
                method: "POST",
                headers: getHeader(),
                body: JSON.stringify({
                    role: settingsState.role
                })
            });
            const data = await response.json();
            if (response.ok) {
                setToast(data.message);
            } else if (response.status >= 400 && response.status <= 499) {
                setToast(data.message);
            } else if (response.status >= 500 && response.status <= 599) {
                setToast(data.error);
            }
        } catch (error) {
            setToast(error.toString());
        }

        setSettingsState(prev => ({...prev, roleButtonEnabled: true}));
    };

    const changePassword = async () => {
        setSettingsState(prev => ({...prev, passwordButtonEnabled: false}));

        try {
            const response = await fetch(`${BASE_URL}/user-routes/change-password`, {
                method: "POST",
                headers: getHeader(),
                body: JSON.stringify({
                    currentPassword: settingsState.currentPassword,
                    newPassword: settingsState.newPassword,
                    confirmPassword: settingsState.confirmPassword
                })
            });
            const data = await response.json();
            if (response.ok) {
                setSettingsState(prev => {
                    return {
                        ...prev,
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: ""
                    }
                });
                setToast(data.message);
            } else if (response.status >= 400 && response.status <= 499) {
                setToast(data.message);
            } else if (response.status >= 500 && response.status <= 599) {
                setToast(data.error);
            }
        } catch (error) {
            setToast(error.toString());
        }

        setSettingsState(prev => ({...prev, passwordButtonEnabled: true}));
    };

    const changeImage = async () => {
        setSettingsState(prev => ({...prev, imageButtonEnabled: false}));

        try {
            const formData = new FormData();
            formData.append('file', image.data);

            const response = await fetch(`${BASE_URL}/user-routes/change-image`, {
                method: "POST",
                headers: getFormHeader(),
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                const prevData = secureStorage.getItem('user');
                secureStorage.setItem('user', {...prevData, image_path: data.image_path});
                setSettingsState(prev => {
                    return {
                        ...prev,
                        image_path: data.image_path
                    }
                });
                setToast(data.message);
            } else if (response.status >= 400 && response.status <= 499) {
                setToast(data.message);
            } else if (response.status >= 500 && response.status <= 599) {
                setToast(data.error);
            }
        } catch (error) {
            setToast(error.toString());
        }

        setSettingsState(prev => ({...prev, imageButtonEnabled: true}));
    };

    const accordionData = [
        {
            itemText: <p>
                <strong>Profile Picture: </strong>
                <img
                    src={`${IMAGE_BASE_URL}${settingsState.image_path}`}
                    width={80}
                    alt={settingsState.name}
                    className="rounded-circle"
                />
            </p>,
            accordionBody: (
                <form>
                    <label className="fs-4 my-2">Pick Image</label>
                    {image.src.length > 0 ? <img className=" border border-2 border-primary m-4" src={image.src} width={200} height={200} /> : <span></span>}
                    <input
                        type="file"
                        className="form-control my-2"
                        name="image"
                        onChange={getFileInfo}
                        accept=".png,.jpeg,.jpg,.webp"
                    />
                    <button
                        className="btn btn-primary my-2"
                        type="button"
                        role="button"
                        disabled={!settingsState.imageButtonEnabled}
                        onClick={changeImage}
                    >{settingsState.imageButtonEnabled ? "Upload Image" : <Spinner />}</button>
                </form>
            )
        },
        {
            itemText: <span><strong>Username: </strong>{settingsState.name}</span>,
            accordionBody: (
                <form>
                    <label className="fs-4 my-2">Edit Username</label>
                    <input
                        type="text"
                        className="form-control my-2"
                        name="name"
                        placeholder="New Username"
                        value={settingsState.name}
                        onChange={(event) => { setSettings(event, "name"); }}
                    />
                    <button
                        className="btn btn-primary my-2"
                        type="button"
                        role="button"
                        disabled={!settingsState.nameButtonEnabled}
                        onClick={changeName}
                    >{settingsState.nameButtonEnabled ? "Change Username" : <Spinner />}</button>
                </form>
            )
        },
        {
            itemText: <span><strong>Email: </strong>{settingsState.email}</span>,
            accordionBody: (<p className="my-2">You can not change your email.</p>)
        },
        {
            itemText: <span><strong>Password: </strong>********</span>,
            accordionBody: (
                <form>
                    <label className="fs-4 my-2">Change Password</label>
                    <div className="input-group my-2">
                        <input
                            type={settingsState.currentPasswordVisibility}
                            className="form-control"
                            name="currentPassword"
                            placeholder="Current Password"
                            value={settingsState.currentPassword}
                            onChange={(event) => { setSettings(event, "currentPassword"); }}
                        />
                        <div className="input-group-append">
                            <span className="input-group-text" onClick={() => {
                                setSettingsState(prev => {
                                    return {...prev, currentPasswordVisibility: prev.currentPasswordVisibility === "password" ? "text" : "password"};
                                });
                            }}>
                                <i className={`bi bi-eye${settingsState.currentPasswordVisibility === "password" ? "" : "-slash"}`}></i>
                            </span>
                        </div>
                    </div>
                    <div className="input-group my-2">
                        <input
                            type={settingsState.newPasswordVisibility}
                            className="form-control"
                            name="newPassword"
                            placeholder="New Password"
                            value={settingsState.newPassword}
                            onChange={(event) => { setSettings(event, "newPassword"); }}
                        />
                        <div className="input-group-append">
                            <span className="input-group-text" onClick={() => {
                                setSettingsState(prev => {
                                    return {...prev, newPasswordVisibility: prev.newPasswordVisibility === "password" ? "text" : "password"};
                                });
                            }}>
                                <i className={`bi bi-eye${settingsState.newPasswordVisibility === "password" ? "" : "-slash"}`}></i>
                            </span>
                        </div>
                    </div>
                    <div className="input-group my-2">
                        <input
                            type={settingsState.confirmPasswordVisibility}
                            className="form-control"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={settingsState.confirmPassword}
                            onChange={(event) => { setSettings(event, "confirmPassword"); }}
                        />
                        <div className="input-group-append">
                            <span className="input-group-text" onClick={() => {
                                setSettingsState(prev => {
                                    return {...prev, confirmPasswordVisibility: prev.confirmPasswordVisibility === "password" ? "text" : "password"};
                                });
                            }}>
                                <i className={`bi bi-eye${settingsState.confirmPasswordVisibility === "password" ? "" : "-slash"}`}></i>
                            </span>
                        </div>
                    </div>
                    <button
                        className="btn btn-primary my-2"
                        type="button"
                        role="button"
                        disabled={!settingsState.passwordButtonEnabled}
                        onClick={changePassword}
                    >{settingsState.passwordButtonEnabled ? "Change Password" : <Spinner />}</button>
                </form>
            )
        },
        {
            itemText: <span><strong>Role: </strong>{settingsState.role}</span>,
            accordionBody: (
                <form>
                    <label className="my-2">Edit Role</label>
                    <input
                        type="text"
                        className="form-control my-2"
                        name="role"
                        placeholder="New Role"
                        value={settingsState.role}
                        onChange={(event) => { setSettings(event, "role"); }}
                    />
                    <button
                        className="btn btn-primary my-2"
                        type="button"
                        role="button"
                        disabled={!settingsState.roleButtonEnabled}
                        onClick={changeRole}
                    >{settingsState.roleButtonEnabled ? "Change Role" : <Spinner />}</button>
                </form>
            )
        },
        {
            itemText: <span><strong>Account Created: </strong>{settingsState.createdAt}</span>,
            accordionBody: (<p className="my-2">You can not directly change account created date.</p>)
        },
        {
            itemText: <span><strong>Account Updated: </strong>{settingsState.updatedAt}</span>,
            accordionBody: (<p className="my-2">You can not directly change account updated date.</p>)
        }
    ];

    const getProcess = (process) => {
        switch (process.state) {
            case ProcessState.Loading:
                return <LoadingState />;
            case ProcessState.Error:
                return <ErrorState error={process.message} onRefresh={() => {
                    setProcess({state: ProcessState.Loading, message: ""});
                    getUser();
                }} />;
            case ProcessState.Success:
                return (
                    <div className="p-4 container">
                        <div className="card shadow-sm">
                            <h1 className="m-3 p-0 text-center">Basic Info</h1>
                            <div className="card-body">
                                <div className="accordion" id="accordionExample">
                                    {accordions.map((accordion, idx) => {
                                        return <div className="accordion-item" key={idx}>
                                            <h2 className="accordion-header">
                                                <button
                                                    className={`accordion-button ${accordion ? " collapsed" : ""}`}
                                                    type="button"
                                                    aria-expanded={accordion}
                                                    onClick={() => setAccordions(prev => prev.map((acc, i) => idx === i ? !acc : acc))}
                                                >
                                                    {accordionData[idx].itemText}
                                                </button>
                                            </h2>
                                            <div
                                                className={`accordion-collapse ${accordion ? " collapse" : ""}`}
                                            >
                                                <div className="accordion-body">
                                                    {accordionData[idx].accordionBody}
                                                </div>
                                            </div>
                                        </div>
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div>
            <NavigationBar />
            {getProcess(process)}
            {message.visibility ? <MyToast error={message.text} /> : <div></div>}
        </div>
    );
}