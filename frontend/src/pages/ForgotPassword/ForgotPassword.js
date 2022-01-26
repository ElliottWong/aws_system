import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { IconContext } from 'react-icons';
import { BiArrowBack } from 'react-icons/bi';
import OtpInput from 'react-otp-input';
import { useHistory } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import logo from '../../assets/images/eISO-logo.png';
import Title from '../../common/Title';
import config from '../../config/config';

const ForgotPassword = () => {
    const history = useHistory();
    const [formFilled, setFormFilled] = useState(false);
    const [otpFormFilled, setOtpFormFilled] = useState(false);
    const [sentEmail, setSentEmail] = useState(false);
    const [otp, setOtp] = useState(null);
    const [inputValues, setInputValues] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const toastTiming = config.toastTiming;

    useEffect(() => {
        // Check if user touched send otp form
        if (inputValues.username !== '') {
            setFormFilled(() => (true));
        } else {
            setFormFilled(() => (false));
        }
        // Check if user touched submit otp form
        if (otp !== '') {
            setOtpFormFilled(() => (true));
        } else {
            setOtpFormFilled(() => (false));
        }
    }, [inputValues, otp]);

    // Handler for form submission
    // Need change endpoint
    const handleFormSubmit = (event) => {
        let username = event.target.username.value;
        console.log(username);
        event.preventDefault();
        setLoading(() => (true));

        axios.post(`${process.env.REACT_APP_BASEURL}/forget-password/otp/new`, {
            username,
        }, {})
            .then((res) => {
                console.log("Sent OTP successfully!");
                const data = res.data;
                console.log(data);
                setLoading(() => (false));
                setSentEmail(true);
                toast.success(<>Success!<br />Message: <b>OTP has been sent!</b></>);
            })
            .catch((err) => {
                console.log(err.response);
                let errCode = "Error!";
                let errMsg = "Error!"
                if (err.response !== undefined) {
                    errCode = err.response.status;
                    errMsg = err.response.data.message;
                }
                toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                setLoading(() => (false));
            })
    }

    // Handler for OTP submission
    const handleOtpSubmit = (event) => {
        console.log(otp);
        console.log(inputValues.username);

        event.preventDefault();
        setLoading(() => (true));

        // If success redirect to change password form with username & otp as params
        axios.post(`${process.env.REACT_APP_BASEURL}/forget-password/otp/check`, {
            username: inputValues.username,
            otp
        }, {})
            .then((res) => {
                console.log("Checked OTP successfully!");
                const data = res.data;
                console.log(data);
                setLoading(() => (false));
                history.push(`/change-password/${inputValues.username}/${otp}`);
            })
            .catch((err) => {
                console.log(err.response);
                let errCode = "Error!";
                let errMsg = "Error!"
                if (err.response !== undefined) {
                    errCode = err.response.status;
                    errMsg = err.response.data.message;
                }
                toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
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

    // Handler for otp input change
    const handleOtpChange = (otp) => {
        setOtp(() => (otp));
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
                            {/* Title */}
                            <Container>
                                <Row>
                                    <Col className="c-Card__Back-btn" xs={1}>
                                        <IconContext.Provider value={{ size: "21px" }}>
                                            <BiArrowBack onClick={() => history.goBack()}></BiArrowBack>
                                        </IconContext.Provider>
                                    </Col>
                                    <Col xs={11}><h4>Forgot Password</h4></Col>
                                </Row>
                            </Container>
                            {/* Username */}
                            <div className="c-Card__Username">
                                <label htmlFor="username">Username</label>
                                <input type="text" name="username" value={inputValues.username || ''} onChange={handleInputChange} placeholder="username" />
                                <p className="c-Username__Information-message text-muted">We will send a one time password for verification to your email address</p>
                            </div>
                            {
                                // Check if user has touched username input
                                formFilled ?
                                    <button className="c-Btn c-Btn--login" type="submit" value="submit">{loading ? "Loading..." : "Send OTP"}</button> :
                                    <button className="c-Btn c-Btn--disabled" type="button" disabled={true}>Send OTP</button>
                            }
                        </form>

                        {/* Form for OTP submission */}
                        {sentEmail ?
                            <form onSubmit={handleOtpSubmit}>
                                {/* Email */}
                                <div className="c-Card__Username">
                                    <label htmlFor="otp">Key in OTP</label>
                                </div>
                                <OtpInput
                                    value={otp}
                                    onChange={handleOtpChange}
                                    numInputs={6}
                                    inputStyle={""}
                                    className="otpInput"
                                    name="otp"
                                />
                                {
                                    // Check if user has touched both inputs
                                    otpFormFilled ?
                                        <button className="c-Btn c-Btn--login" type="submit" value="submit">{loading ? "Loading..." : "Submit"}</button> :
                                        <button className="c-Btn c-Btn--disabled" type="button" disabled={true}>Submit</button>
                                }
                            </form> : ""
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default ForgotPassword;