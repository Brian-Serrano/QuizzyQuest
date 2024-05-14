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
import MyModal from "../components/MyModal";
import Spinner from "../components/Spinner";

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
        error: "",
        termsAccepted: false,
        termsVisibility: false
    });

    const [loginState, setLoginState] = useState({
        email: "",
        password: "",
        passwordVisibility: "password",
        buttonEnabled: true,
        error: "",
        forgotPasswordVisibility: false,
        forgotLinkEnabled: true
    });

    const [forgotPasswordState, setForgotPasswordState] = useState({
        forgotCode: "",
        forgotPassword: "",
        forgotConfirmPassword: "",
        forgotPasswordVisibility: "password",
        forgotConfirmPasswordVisibility: "password"
    });

    const [tab, setTab] = useState(true);

    // function that should be invoked when the user signup
    const signup = async () => {
        setSignupState(prev => ({...prev, buttonEnabled: false}));

        try {
            const response = await fetch(`${BASE_URL}/auth-routes/sign-up`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: signupState.name,
                    email: signupState.email,
                    password: signupState.password,
                    confirmPassword: signupState.confirmPassword,
                    termsAccepted: signupState.termsAccepted
                })
            });
            const data = await response.json();
            if (response.ok) {
                saveCredentialsToBrowserStorage(data);
                onNavigate("/");
            } else if (response.status >= 400 && response.status <= 499) {
                setSignupState({...signupState, error: data.message, buttonEnabled: true});
            } else if (response.status >= 500 && response.status <= 599) {
                setSignupState({...signupState, error: data.error, buttonEnabled: true});
            }
        } catch (error) {
            setSignupState({...signupState, error: error.toString(), buttonEnabled: true});
        }
    };

    // function that should be invoked when the user login
    const login = async () => {
        setLoginState(prev => ({...prev, buttonEnabled: false}));

        try {
            const response = await fetch(`${BASE_URL}/auth-routes/log-in`, {
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
            console.log(data);
            if (response.ok) {
                saveCredentialsToBrowserStorage(data);
                onNavigate("/");
            } else if (response.status >= 400 && response.status <= 499) {
                setLoginState({...loginState, error: data.message, buttonEnabled: true});
            } else if (response.status >= 500 && response.status <= 599) {
                setLoginState({...loginState, error: data.error, buttonEnabled: true});
            }
        } catch (error) {
            setLoginState({...loginState, error: error.toString(), buttonEnabled: true});
        }
    };

    // function that should be invoked when the user click the forgot password text
    const forgotPassword = async () => {
        setLoginState(prev => ({...prev, forgotLinkEnabled: false}));

        try {
            const response = await fetch(`${BASE_URL}/auth-routes/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email: loginState.email})
            });
            const data = await response.json();
            if (response.ok) {
                setLoginState({...loginState, forgotPasswordVisibility: true, forgotLinkEnabled: true});
            } else if (response.status >= 400 && response.status <= 499) {
                setLoginState({...loginState, error: data.message, forgotLinkEnabled: true});
            } else if (response.status >= 500 && response.status <= 599) {
                setLoginState({...loginState, error: data.error, forgotLinkEnabled: true});
            }
        } catch (error) {
            setLoginState({...loginState, error: error.toString(), forgotLinkEnabled: true});
        }
    };

    // function that should be invoked when the user apply the new/changed password
    const changePassword = async () => {
        try {
            const response = await fetch(`${BASE_URL}/auth-routes/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: loginState.email,
                    forgot_password_code: forgotPasswordState.forgotCode,
                    password: forgotPasswordState.forgotPassword,
                    confirmPassword: forgotPasswordState.forgotConfirmPassword
                })
            });
            const data = await response.json();
            if (response.ok) {
                setForgotPasswordState({
                    forgotCode: "",
                    forgotPassword: "",
                    forgotConfirmPassword: "",
                    forgotPasswordVisibility: "password",
                    forgotConfirmPasswordVisibility: "password"
                });
                setLoginState({...loginState, error: data.message, forgotPasswordVisibility: false});
            } else if (response.status >= 400 && response.status <= 499) {
                setLoginState({...loginState, error: data.message});
            } else if (response.status >= 500 && response.status <= 599) {
                setLoginState({...loginState, error: data.error});
            }
        } catch (error) {
            setLoginState({...loginState, error: error.toString()});
        }
    };

    // change the values on signup fields
    const setSignup = (event, key) => {
        setSignupState(prev => {
            return {...prev, [key]: event.target.value};
        });
    };

    // change the values on login fields
    const setLogin = (event, key) => {
        setLoginState(prev => {
            return {...prev, [key]: event.target.value};
        });
    };

    return (
        <div>
            {signupState.termsVisibility ? <MyModal modalState={{
                bodyText: (
                    <div>
                        <p>These terms and conditions outline the rules and regulations for the use of QuizzyQuest Website, located at quizzyquest.com.</p>
                        <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use QuizzyQuest if you do not agree to take all of the terms and conditions stated on this page.</p>
                        <p>The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the Company's terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves. All terms refer to the offer, acceptance, and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner for the express purpose of meeting the Client's needs in respect of provision of the Company's stated services, in accordance with and subject to, prevailing law of Philippines. Any use of the above terminology or other words in the singular, plural, capitalization and/or he/she or they, are taken as interchangeable and therefore as referring to the same.</p>
                        <h3>Cookies</h3>
                        <p>We employ the use of cookies. By accessing QuizzyQuest, you agreed to use cookies in agreement with the QuizzyQuest's Privacy Policy.</p>
                        <p>Most interactive websites use cookies to let us retrieve the user's details for each visit. Cookies are used by our website to enable the functionality of certain areas to make it easier for people visiting our website. Some of our affiliate/advertising partners may also use cookies.</p>
                        <h3>License</h3>
                        <p>Unless otherwise stated, QuizzyQuest and/or its licensors own the intellectual property rights for all material on QuizzyQuest. All intellectual property rights are reserved. You may access this from QuizzyQuest for your own personal use subjected to restrictions set in these terms and conditions.</p>
                        <h5>You must not:</h5>
                        <ul>
                            <li>Republish material from QuizzyQuest</li>
                            <li>Sell, rent, or sub-license material from QuizzyQuest</li>
                            <li>Reproduce, duplicate or copy material from QuizzyQuest</li>
                            <li>Redistribute content from QuizzyQuest</li>
                        </ul>
                        <p>This Agreement shall begin on the date hereof.</p>
                        <h3>Hyperlinking to our Content</h3>
                        <p>The following organizations may link to our Website without prior written approval:</p>
                        <ul>
                            <li>Government agencies;</li>
                            <li>Search engines;</li>
                            <li>News organizations;</li>
                            <li>Online directory distributors may link to our Website in the same manner as they hyperlink to the Websites of other listed businesses; and</li>
                            <li>Systemwide Accredited Businesses except soliciting non-profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to our Web site.</li>
                        </ul>
                        <p>These organizations may link to our home page, to publications, or to other Website information so long as the link: &#40;a&#41; is not in any way deceptive; &#40;b&#41; does not falsely imply sponsorship, endorsement or approval of the linking party and its products and/or services; and &#40;c&#41; fits within the context of the linking party's site.</p>
                        <p>We may consider and approve other link requests from the following types of organizations:</p>
                        <ul>
                            <li>commonly-known consumer and/or business information sources;</li>
                            <li>dot.com community sites;</li>
                            <li>associations or other groups representing charities;</li>
                            <li>online directory distributors;</li>
                            <li>internet portals;</li>
                            <li>accounting, law and consulting firms; and</li>
                            <li>educational institutions and trade associations.</li>
                        </ul>
                        <p>We will approve link requests from these organizations if we decide that: &#40;a&#41; the link would not make us look unfavorably to ourselves or to our accredited businesses; &#40;b&#41; the organization does not have any negative records with us; &#40;c&#41; the benefit to us from the visibility of the hyperlink compensates the absence of QuizzyQuest; and &#40;d&#41; the link is in the context of general resource information.</p>
                        <p>These organizations may link to our home page so long as the link: &#40;a&#41; is not in any way deceptive; &#40;b&#41; does not falsely imply sponsorship, endorsement or approval of the linking party and its products or services; and &#40;c&#41; fits within the context of the linking party's site.</p>
                        <p>If you are one of the organizations listed in paragraph 2 above and are interested in linking to our website, you must inform us by sending an e-mail to QuizzyQuest. Please include your name, your organization name, contact information as well as the URL of your site, a list of any URLs from which you intend to link to our Website, and a list of the URLs on our site to which you would like to link. Wait 2-3 weeks for a response.</p>
                        <h5>Approved organizations may hyperlink to our Website as follows:</h5>
                        <ul>
                            <li>By use of our corporate name; or</li>
                            <li>By use of the uniform resource locator being linked to; or</li>
                            <li>By use of any other description of our Website being linked to that makes sense within the context and format of content on the linking party's site.</li>
                        </ul>
                        <p>No use of QuizzyQuest's logo or other artwork will be allowed for linking absent a trademark license agreement.</p>
                        <h3>iFrames</h3>
                        <p>Without prior approval and written permission, you may not create frames around our Webpages that alter in any way the visual presentation or appearance of our Website.</p>
                        <h3>Content Liability</h3>
                        <p>We shall not be held responsible for any content that appears on your Website. You agree to protect and defend us against all claims that are rising on your Website. No link&#40;s&#41; should appear on any Website that may be interpreted as libelous, obscene, or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.</p>
                        <h3>Reservation of Rights</h3>
                        <p>We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request. We also reserve the right to amen these terms and conditions and it's linking policy at any time. By continuously linking to our Website, you agree to be bound to and follow these linking terms and conditions.</p>
                        <h3>Removal of links from our website</h3>
                        <p>If you find any link on our Website that is offensive for any reason, you are free to contact and inform us any moment. We will consider requests to remove links but we are not obligated to or so or to respond to you directly.</p>
                        <p>We do not ensure that the information on this website is correct, we do not warrant its completeness or accuracy; nor do we promise to ensure that the website remains available or that the material on the website is kept up to date.</p>
                        <h3>Disclaimer</h3>
                        <p>To the maximum extent permitted by applicable law, we exclude all representations, warranties, and conditions relating to our website and the use of this website. Nothing in this disclaimer will:</p>
                        <ul>
                            <li>limit or exclude our or your liability for death or personal injury;</li>
                            <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
                            <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
                            <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
                        </ul>
                        <p>The limitations and prohibitions of liability set in this Section and elsewhere in this disclaimer: &#40;a&#41; are subject to the preceding paragraph; and &#40;b&#41; govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort, and for breach of statutory duty.</p>
                        <p>As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.</p>
                        <h3>Acceptance of these Terms</h3>
                        <p>You acknowledge that you have read this Agreement and agree to all its terms and conditions. By using QuizzyQuest or its services you agree to be bound by this Agreement. If you do not agree to abide by the terms of this Agreement, you are not authorized to use or access QuizzyQuest and its services.</p>
                        <h3>Contact Information</h3>
                        <p>If you have any questions about these Terms and Conditions, You can contact us:</p>
                        <p>By email: Brianserrano503@gmail.com</p>
                        <p>By visiting this page on our website: quizzyquest.com/support</p>
                    </div>
                ),
                onApplyClick: () => {
                    setSignupState(prev => {
                        return {...prev, termsAccepted: !prev.termsAccepted, termsVisibility: false};
                    });
                },
                onCancelClick: () => {
                    setSignupState({...signupState, termsVisibility: false});
                },
                titleText: "Terms and Conditions of Use",
                buttonText: signupState.termsAccepted ? "Unaccept" : "Accept"
            }} /> : <div></div>}
            {loginState.forgotPasswordVisibility ? <MyModal modalState={{
                bodyText: (
                    <div>
                        <h5>A code was sent to your mail.</h5>
                        <InputField
                            name="code"
                            placeholder="Code"
                            value={forgotPasswordState.forgotCode}
                            onChange={(event) => {
                                setForgotPasswordState(prev => {
                                    return {...prev, forgotCode: event.target.value};
                                });
                            }}
                        />
                        <PasswordField
                            name="password"
                            type={forgotPasswordState.forgotPasswordVisibility}
                            placeholder="Password"
                            value={forgotPasswordState.forgotPassword}
                            onChange={(event) => {
                                setForgotPasswordState(prev => {
                                    return {...prev, forgotPassword: event.target.value};
                                });
                            }}
                            onClick={() => {
                                setForgotPasswordState(prev => {
                                    return {
                                        ...prev,
                                        forgotPasswordVisibility: prev.forgotPasswordVisibility === "password" ? "text" : "password"
                                    };
                                });
                            }}
                        />
                        <PasswordField
                            name="confirmPassword"
                            type={forgotPasswordState.forgotConfirmPasswordVisibility}
                            placeholder="Confirm Password"
                            value={forgotPasswordState.forgotConfirmPassword}
                            onChange={(event) => {
                                setForgotPasswordState(prev => {
                                    return {...prev, forgotConfirmPassword: event.target.value};
                                });
                            }}
                            onClick={() => {
                                setForgotPasswordState(prev => {
                                    return {
                                        ...prev,
                                        forgotConfirmPasswordVisibility: prev.forgotConfirmPasswordVisibility === "password" ? "text" : "password"
                                    };
                                });
                            }}
                        />
                    </div>
                ),
                onApplyClick: () => {
                    setLoginState({...loginState, forgotPasswordVisibility: false});
                    changePassword();
                },
                onCancelClick: () => {
                    setLoginState({...loginState, forgotPasswordVisibility: false});
                },
                titleText: "Enter Code and Change Password",
                buttonText: "Change Password",
                visibility: true
            }} /> : <div></div>}
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
                                <div className="form-check m-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        value="terms"
                                        name="terms"
                                        checked={signupState.termsAccepted}
                                        onChange={() => {
                                            setSignupState({...signupState, termsVisibility: true});
                                        }}
                                    />
                                    <label className="form-check-label">
                                        I accept terms and conditions
                                    </label>
                                </div>
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
                                {loginState.forgotLinkEnabled ? (
                                    <p className="text-center" onClick={forgotPassword}>
                                        <a className="link-underline-primary fs-5">Forgot Password</a>
                                    </p>
                                ) : <Spinner />}
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
        </div>
    );
}