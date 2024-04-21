import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";
import InputField from '../components/InputField';
import SignInButtons from '../components/SignInButtons';
import { useState } from 'react';
import { BASE_URL } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import { saveCredentialsToBrowserStorage } from "../utils/func-utils";
import PasswordField from "../components/PasswordField";

export default function Signup() {
    const onNavigate = useNavigate();
    const [signupState, setSignupState] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        passwordVisibility: "password",
        confirmPasswordVisibility: "password",
        buttonEnabled: true,
        error: ""
    });
    const [loginState, setLoginState] = useState({
        email: "",
        password: "",
        passwordVisibility: "password",
        buttonEnabled: true,
        error: ""
    });
    const [tab, setTab] = useState(true);

    const signup = async () => {
        try {
            const response = await fetch(BASE_URL + "/auth-routes/sign-up", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: signupState.name,
                    email: signupState.email,
                    password: signupState.password,
                    confirmPassword: signupState.confirmPassword
                })
            });
            const data = await response.json();
            if (response.ok) {
                saveCredentialsToBrowserStorage(data);
                onNavigate("/");
            } else if (response.status >= 400 && response.status <= 499) {
                setSignupState({...signupState, error: data.message});
            } else if (response.status >= 500 && response.status <= 599) {
                setSignupState({...signupState, error: data.error});
            }
        } catch (error) {
            setSignupState({...signupState, error: error});
        }
    };

    const login = async () => {
        try {
            const response = await fetch(BASE_URL + "/auth-routes/log-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: loginState.email,
                    password: loginState.password
                })
            });
            const data = await response.json();
            if (response.ok) {
                saveCredentialsToBrowserStorage(data);
                onNavigate("/");
            } else if (response.status >= 400 && response.status <= 499) {
                setLoginState({...loginState, error: data.message});
            } else if (response.status >= 500 && response.status <= 599) {
                setLoginState({...loginState, error: data.error});
            }
        } catch (error) {
            setLoginState({...loginState, error: error});
        }
    };

    const setSignup = (event, key) => {
        setSignupState(prev => {
            return {...prev, [key]: event.target.value};
        });
    };

    const setLogin = (event, key) => {
        setLoginState(prev => {
            return {...prev, [key]: event.target.value};
        });
    };

    return (
        <div className="d-flex min-vh-100 min-vw-100">
            <div className="d-flex flex-grow-1 justify-content-center align-items-center">
                <div className="card shadow-sm container m-3">
                    {tab ? (
                        <form className="card-body">
                            <h1>Sign Up</h1>
                            <hr />
                            <InputField
                                name="name"
                                placeholder="Username"
                                value={signupState.name}
                                onChange={(event) => { setSignup(event, "name"); }}
                            />
                            <InputField
                                name="email"
                                placeholder="Email"
                                value={signupState.email}
                                onChange={(event) => { setSignup(event, "email"); }}
                            />
                            <PasswordField
                                name="password"
                                type={signupState.passwordVisibility}
                                placeholder="Password"
                                value={signupState.password}
                                onChange={(event) => { setSignup(event, "password"); }}
                                onClick={() => {
                                    setSignupState(prev => {
                                        return {
                                            ...prev,
                                            passwordVisibility: prev.passwordVisibility === "password" ? "text" : "password"
                                        }
                                    });
                                }}
                            />
                            <PasswordField
                                name="confirm-password"
                                type={signupState.confirmPasswordVisibility}
                                placeholder="Confirm Password"
                                value={signupState.confirmPassword}
                                onChange={(event) => { setSignup(event, "confirmPassword"); }}
                                onClick={() => {
                                    setSignupState(prev => {
                                        return {
                                            ...prev,
                                            confirmPasswordVisibility: prev.confirmPasswordVisibility === "password" ? "text" : "password"
                                        }
                                    });
                                }}
                            />
                            <SignInButtons
                                first="Go to Login"
                                second="Signup"
                                enabled={signupState.buttonEnabled}
                                onNavigate={() => {
                                    setTab(false);
                                }}
                                onSignIn={signup}
                            />
                            <p className="text-danger">{signupState.error}</p>
                        </form>
                    ) : (
                        <form className="card-body">
                            <h1>Log In</h1>
                            <hr />
                            <InputField
                                name="email"
                                placeholder="Email"
                                value={loginState.email}
                                onChange={(event) => { setLogin(event, "email"); }}
                            />
                            <PasswordField
                                name="password"
                                type={loginState.passwordVisibility}
                                placeholder="Password"
                                value={loginState.password}
                                onChange={(event) => { setLogin(event, "password"); }}
                                onClick={() => {
                                    setLoginState(prev => {
                                        return {
                                            ...prev,
                                            passwordVisibility: prev.passwordVisibility === "password" ? "text" : "password"
                                        }
                                    });
                                }}
                            />
                            <SignInButtons
                                first="Go to Signup"
                                second="Login"
                                enabled={loginState.buttonEnabled}
                                onNavigate={() => {
                                    setTab(true);
                                }}
                                onSignIn={login}
                            />
                            <p className="text-danger">{loginState.error}</p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}