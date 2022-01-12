import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { saveUserData } from '../utilities/localStorageUtils';
import axios from 'axios';
import Title from '../common/Title';
import logo from '../assets/images/eISO-logo.png';
import  { toast, ToastContainer } from 'react-toastify';
import config from '../config/config';
import TokenManager from '../utilities/tokenManager';

const Login = () => {
    const history = useHistory();
    const toastTiming = config.toastTiming;
    const [formFilled, setFormFilled] = useState(false);
    const [inputValues, setInputValues] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if user touched both form options
        if (inputValues.username !== '' && inputValues.password !== '') {
            setFormFilled(() => (true));
        } else {
            setFormFilled(() => (false));
        }
    }, [inputValues]);
    
    // Handler for form submission
    const handleFormSubmit = (event) => {
        let username = event.target.username.value;
        let password = event.target.password.value;
        event.preventDefault();
        setLoading(() => (true));
        axios.post(`${process.env.REACT_APP_BASEURL}/login`, {
            "username": username,
            "password": password
    })
            .then((res) => {
                const data = res.data.results;
                console.log(data);
                const accessToken = res.data.results.token;
                TokenManager.setToken(accessToken);
                console.log(TokenManager.getToken());
                axios.defaults.headers.common['Authorization'] = `bearer ${accessToken}`;
                // saveUserData(data.token, data.data.display_name, data.data.display_title, data.data.username, data.data.email, data.data.company_id, data.data.company_alias, data.data.company_name);
                setLoading(() => (false));
                history.push('/dashboard');
            })
            .catch((err) => {
                console.log(err.response);
                let errCode = "Error!";
                let errMsg = "Error!"
                if (err.response !== undefined) {
                    errCode = err.response.status;
                    errMsg = err.response.data.message;
                }
                
                toast.error(<>Error Code: <b>{errCode}</b><br/>Message: <b>{errMsg}</b></>);
                setLoading(() => (false));
            })
    }

    // Handler for input change
    const handleInputChange = (event) => {
        setInputValues((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value
        }))
    }

    return (
        <>
            <ToastContainer
                position="top-center"
                autoClose={toastTiming}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <Title title="Login" />
            <div className="c-Login">
                <div className="l-Login__Card">
                    <div className="c-Login__Card">
                        <form onSubmit={handleFormSubmit}>
                            {/* Logo */}
                            <div className="c-Card__Logo">
                                <img src={logo} alt="logo" />
                            </div>
                            {/* Username */}
                            <div className="c-Card__Username">
                                <label htmlFor="username">Username</label>
                                <input type="text" name="username" value={inputValues.username || ''} onChange={handleInputChange} placeholder="Username" />
                            </div>
                            {/* Password */}
                            <div className="c-Card__Password">
                                <label htmlFor="password">Password</label>
                                <input type="password" name="password" value={inputValues.password || ''} onChange={handleInputChange} placeholder="Password" />
                                <a href="/forgot-password" className="c-Card__Forgot-password">Forgot password?</a>
                            </div>
                            {
                                // Check if user has touched both inputs
                                formFilled ?
                                    <button className="c-Btn c-Btn--login" type="submit" value="submit">{loading ? "Loading..." : "Login"}</button> :
                                    <button className="c-Btn c-Btn--disabled" type="button" disabled={true}>Login</button>
                            }

                        </form>
                    </div>
                </div>

            </div>

        </>


    )
}

export default Login;