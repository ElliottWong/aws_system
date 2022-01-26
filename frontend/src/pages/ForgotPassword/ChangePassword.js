import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { IconContext } from 'react-icons';
import { BiArrowBack } from 'react-icons/bi';
import { useHistory } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import logo from '../../assets/images/eISO-logo.png';
import PasswordCriteria from '../../common/PasswordCriteria';
import Title from '../../common/Title';
import config from '../../config/config';


const ChangePassword = ({ match }) => {
    const username = match.params.username;
    const otp = match.params.otp;
    const isNumberRegx = /\d/;
    const specialCharacterRegx = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const [formFilled, setFormFilled] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [inputValues, setInputValues] = useState({
        password: '',
        confirmPassword: ''
    });
    const [passwordValidity, setPasswordValidity] = useState({
        minChar: false,
        number: false,
        specialChar: false,
        match: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if user touched both form options
        if (inputValues.password !== '' && inputValues.confirmPassword !== '') {
            setFormFilled(() => (true));
        } else {
            setFormFilled(() => (false));
        }
        // Update Password criteria
        setPasswordValidity(() => ({
            minChar: inputValues.password.length >= 8 ? true : false,
            number: isNumberRegx.test(inputValues.password) ? true : false,
            specialChar: specialCharacterRegx.test(inputValues.password) ? true : false,
            match: (inputValues.password === inputValues.confirmPassword) ? true : false,
        }))
    }, [inputValues]);

    // Handler for form submission
    const handleFormSubmit = (event) => {
        let password = event.target.password.value;
        event.preventDefault();
        setLoading(() => (true));

        // Endpoint for changing password
        axios.post(`${process.env.REACT_APP_BASEURL}/forget-password/otp/change`, {
            otp,
            password,
            username
        }, {})
            .then((res) => {
                console.log("Changed Password successfully!");
                const data = res.data;
                console.log(data);
                setLoading(() => (false));
                setTimeout(() => {
                    toast.success(<>Success!<br />Message: <b>Changed Password successfully!</b></>);
                }, 0);
                history.push('/login');
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
                                    <Col xs={11}><h4>Change Password</h4></Col>
                                </Row>
                            </Container>
                            {/* New Password */}
                            <div className="c-Card__Username">
                                <label htmlFor="password">New Password</label>
                                <input type="password" onFocus={() => setPasswordFocused(true)} name="password" value={inputValues.password || ''} onChange={handleInputChange} placeholder="Password" />
                            </div>
                            {/* Confirm Password */}
                            <div className="c-Card__Password">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input type="password" name="confirmPassword" value={inputValues.confirmPassword || ''} onChange={handleInputChange} placeholder="Confirm Password" />
                            </div>
                            {/* Password Criteria */}
                            {passwordFocused && (
                                <PasswordCriteria
                                    validity={passwordValidity}
                                />
                            )}
                            {
                                // Check if user has touched both inputs
                                formFilled && (passwordValidity.minChar === true && passwordValidity.number === true &&
                                    passwordValidity.specialChar === true && passwordValidity.match === true) ?
                                    <button className="c-Btn c-Btn--login" type="submit" value="submit">{loading ? "Loading..." : "Change Password"}</button> :
                                    <button className="c-Btn c-Btn--disabled" type="button" disabled={true}>Change Password</button>
                            }
                        </form>
                    </div>
                </div>

            </div>

        </>


    )
}

export default ChangePassword;