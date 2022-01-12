import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import axios from 'axios';
import Title from '../common/Title';
import logo from '../assets/images/eISO-logo.png';
import { toast, ToastContainer } from 'react-toastify';
import PasswordCriteria from '../common/PasswordCriteria';
import jwt_decode from "jwt-decode";
import config from '../config/config';
import TokenManager from '../utilities/tokenManager';

const CreateAccount = ({ match }) => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    console.log("------------Decoded Token-------------");
    console.log(decodedToken);
    const companyName = decodedToken.company_name;
    const adminLevel = decodedToken.admin_level;
    const toastTiming = config.toastTiming;

    // Regex for password criteria
    const isNumberRegx = /\d/;
    const specialCharacterRegx = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    const history = useHistory();
    const [formFilled, setFormFilled] = useState(false);
    const [inputValues, setInputValues] = useState({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        confirmPassword: '',
        addressLineOne: '',
        addressLineTwo: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',

    });
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [passwordValidity, setPasswordValidity] = useState({
        minChar: false,
        number: false,
        specialChar: false,
        match: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if user touched both form options
        if (inputValues.firstName !== '' && inputValues.lastName !== '' && inputValues.username !== '' &&
            inputValues.password !== '' && inputValues.confirmPassword !== '') {
            setFormFilled(() => (true));
        } else {
            setFormFilled(() => (false));
        }
        setPasswordValidity(() => ({
            minChar: inputValues.password.length >= 8 ? true : false,
            number: isNumberRegx.test(inputValues.password) ? true : false,
            specialChar: specialCharacterRegx.test(inputValues.password) ? true : false,
            match: (inputValues.password === inputValues.confirmPassword) ? true : false,
        }))
    }, [inputValues]);

    // Handler for form submission
    const handleFormSubmit = (event) => {
        // Company id set to 1 & email set to abc@gmail.com & title set to placeholder
        // These should be taken from jwt token
        let firstName = event.target.firstName.value;
        let lastName = event.target.lastName.value;
        let username = event.target.username.value;
        let email = decodedToken.email;
        let password = event.target.password.value;
        let addressLineOne = event.target.addressLineOne.value;
        let addressLineTwo = event.target.addressLineTwo.value;
        let city = event.target.city.value;
        let state = event.target.state.value;
        let country = event.target.country.value;
        let postalCode = event.target.postalCode.value;
        let title = "placeholder";
        event.preventDefault();
        setLoading(() => (true));
        if (adminLevel === 2) {
            createAdminUserAccount(firstName, lastName, username, email, password, addressLineOne, addressLineTwo, city, state, country, postalCode, title);
        } else if (adminLevel === 0) {
            createNormalUserAccount(firstName, lastName, username, email, password, addressLineOne, addressLineTwo, city, state, country, postalCode, title);
        }
    }

    // End point for creating normal user account
    const createNormalUserAccount = (firstName, lastName, username, email, password, addressLineOne, addressLineTwo, city, state, country, postalCode, title) => {
        axios.post(`${process.env.REACT_APP_BASEURL}/company/${decodedToken.company_id}/invites/accept/${token}`, {
            "firstname": firstName,
            "lastname": lastName,
            "username": username,
            "email": email,
            "password": password,
            "address": {
                "address_line_one": addressLineOne,
                "address_line_two": addressLineTwo,
                "city": city,
                "state": state,
                "country": country,
                "postal_code": postalCode,
            },
            "title": title,
        })
            .then((res) => {
                console.log("Create account successful!");
                const data = res.data;
                console.log(data);
                setLoading(() => (false));
                setTimeout(() => {
                    toast.success(<>Success!<br />Message: <b>Account has been created!</b></>);
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

    // End point for creating normal user account
    const createAdminUserAccount = (firstName, lastName, username, email, password, addressLineOne, addressLineTwo, city, state, country, postalCode, title) => {
        axios.post(`${process.env.REACT_APP_BASEURL}/company/${decodedToken.company_id}/invites/accept/${token}`, {
            "firstname": firstName,
            "lastname": lastName,
            "username": username,
            "email": email,
            "password": password,
            "address": {
                "address_line_one": addressLineOne,
                "address_line_two": addressLineTwo,
                "city": city,
                "state": state,
                "country": country,
                "postal_code": postalCode,
            },
            "title": title,
        })
            .then((res) => {
                console.log("Create account successful!");
                const data = res.data;
                console.log(data);
                setLoading(() => (false));
                setTimeout(() => {
                    toast.success(<>Success!<br />Message: <b>Account has been created!</b></>);
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
            <Title title="Create Account" />
            <div className="c-Create-account">
                <div className="l-Create-account__Card">
                    <div className="c-Create-account__Card">
                        <form onSubmit={handleFormSubmit}>
                            {/* Logo */}
                            <div className="c-Card__Logo">
                                <img src={logo} alt="logo" />
                            </div >
                            {/* Title */}
                            <div className="c-Card__Form-title">
                                <h5><b>Create Your Account</b></h5>
                                <p>Hello, {decodedToken.name}! You are invited to eISO as a {adminLevel === 2 ? "super admin" : "normal user"} by {adminLevel === 2 ? "the platform admin" : companyName || 'Error'}.</p>
                            </div>
                            {/* Form input first title */}
                            <div className="c-Card__Form-input-title">
                                <b>Basic Details</b>
                            </div>
                            {/* Basic Details First Row */}
                            <div className="c-Card__Basic-details-first-row row">
                                <div className="col-6">
                                    <label htmlFor="firstName">First Name</label>
                                    <input type="text" name="firstName" value={inputValues.firstName || ''} onChange={handleInputChange} placeholder="First Name" />
                                </div>
                                <div className="col-6">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input type="text" name="lastName" value={inputValues.lastName || ''} onChange={handleInputChange} placeholder="Last Name" />
                                </div>
                            </div>
                            {/* Basic Details Second Row */}
                            <div className="c-Card__Basic-details-second-row row">
                                <div className="col-6">
                                    <label htmlFor="addressLineOne">Address Line One</label>
                                    <input type="text" name="addressLineOne" value={inputValues.addressLineOne || ''} onChange={handleInputChange} placeholder="Address Line One" />
                                </div>
                                <div className="col-6">
                                    <label htmlFor="addressLineTwo">Address Line Two</label>
                                    <input type="text" name="addressLineTwo" value={inputValues.addressLineTwo || ''} onChange={handleInputChange} placeholder="Address Line Two" />
                                </div>
                            </div>
                            {/* Basic Details Third Row */}
                            <div className="c-Card__Basic-details-third-row row">
                                <div className="col-6">
                                    <label htmlFor="city">City</label>
                                    <input type="text" name="city" value={inputValues.city || ''} onChange={handleInputChange} placeholder="City" />
                                </div>
                                <div className="col-6">
                                    <label htmlFor="state">State</label>
                                    <input type="text" name="state" value={inputValues.state || ''} onChange={handleInputChange} placeholder="State" />
                                </div>
                            </div>
                            {/* Basic Details Fourth Row */}
                            <div className="c-Card__Basic-details-fourth-row row">
                                <div className="col-6">
                                    <label htmlFor="country">Country</label>
                                    <input type="text" name="country" value={inputValues.country || ''} onChange={handleInputChange} placeholder="Country" />
                                </div>
                                <div className="col-6">
                                    <label htmlFor="postalCode">Postal Code</label>
                                    <input type="text" name="postalCode" value={inputValues.postalCode || ''} onChange={handleInputChange} placeholder="Postal Code" />
                                </div>
                            </div>
                            {/* Basic Details Fifth Row*/}
                            <div className="c-Card__Basic-details-fifth-row row">
                                <div className="col-6">
                                    <label htmlFor="username">Username</label>
                                    <input type="text" name="username" value={inputValues.username || ''} onChange={handleInputChange} placeholder="Username" />
                                </div>
                            </div>
                            {/* Form input second title */}
                            <div className="c-Card__Form-input-title">
                                <b>Password Info</b>
                            </div>
                            {/* Password Info */}
                            <div className="c-Card__Password-info row">
                                <div className="col-6">
                                    <label htmlFor="password">Password</label>
                                    <input onFocus={() => setPasswordFocused(true)} type="password" name="password" value={inputValues.password || ''} onChange={handleInputChange} placeholder="Password" />
                                </div>
                                <div className="col-6">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input type="password" name="confirmPassword" value={inputValues.confirmPassword || ''} onChange={handleInputChange} placeholder="confirmPassword" />
                                </div>
                            </div>
                            {/* Password Criteria */}
                            {passwordFocused && (
                                <PasswordCriteria
                                    validity={passwordValidity}
                                />
                            )}
                            {/* Submit button */}
                            <div className="c-Card__Submit-btn">
                                {
                                    // Check if user has touched both inputs
                                    formFilled && (passwordValidity.minChar === true && passwordValidity.number === true &&
                                        passwordValidity.specialChar === true && passwordValidity.match === true) ?
                                        <button className="c-Btn c-Btn--login" type="submit" value="submit">{loading ? "Loading..." : "Create Account"}</button> :
                                        <button className="c-Btn c-Btn--disabled" type="button" disabled={true}>Create Account</button>
                                }
                            </div>
                            {/* Terms message */}
                            <div className="c-Card__Terms-message">
                                <p>By creating an account, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreateAccount;