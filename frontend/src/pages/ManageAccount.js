import React, { useState, useEffect } from 'react';
import { getSideNavStatus } from '../utilities/sideNavUtils.js';
import profilePic from '../assets/images/default-profile-pic.jpg';
import PageLayout from '../layout/PageLayout';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import axios from 'axios';
import RoleTags from '../common/RoleTags';
import { getToken, getUserCompanyID } from '../utilities/localStorageUtils';
import jwt_decode from "jwt-decode";
import { Container, Row, Col } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import ErrorCard from '../common/ErrorCard.js';
import { confirmAlert } from 'react-confirm-alert';
import CustomConfirmAlert from '../common/CustomConfirmAlert';
import PasswordCriteria from '../common/PasswordCriteria';
import config from '../config/config';
import TokenManager from '../utilities/tokenManager';

const ManageAccount = () => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userID = decodedToken.employee_id;
    const userCompanyID = decodedToken.company_id;
    const toastTiming = config.toastTiming;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [inputTouched, setInputTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const isNumberRegx = /\d/;
    const specialCharacterRegx = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    const [passwordValidity, setPasswordValidity] = useState({
        minChar: false,
        number: false,
        specialChar: false,
        match: false
    });
    const [inputValues, setInputValues] = useState({
        oldpassword: '',
        password: '',
        confirmPassword: ''
    });
    const [userData, setUserData] = useState({
        fullName: 'Error',
        username: 'Error',
        jobTitle: 'Error',
        email: 'Error',
        emailDisplay: 'Error',
        companyName: "Error",
        firstName: 'Error',
        lastName: 'Error',
        address: {
            line1: 'Error',
            line2: 'Error',
            city: 'Error',
            state: 'Error',
            country: 'Error',
            postalCode: 'Error'
        },
        roles: []
    });
    const [renderErrorCard, setRenderErrorCard] = useState({
        render: false,
        errMsg: null,
        errStatus: null,
        errStatusText: null
    });

    useEffect(() => {
        // Endpoint to retrieve details about user
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employees/${userID}?roles=true&address=true&company=true`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res);
                const resDataResults = res.data.results;
                const formattedUserData = {
                    fullName: `${resDataResults.firstname} ${resDataResults.lastname}`,
                    username: resDataResults.account.username,
                    jobTitle: resDataResults.title,
                    email: resDataResults.email,
                    emailDisplay: resDataResults.email,
                    companyName: resDataResults.company.name,
                    firstName: resDataResults.firstname,
                    lastName: resDataResults.lastname,
                    address: {
                        addressID: resDataResults.address_id,
                        line1: resDataResults.address.address_line_one,
                        line2: resDataResults.address.address_line_two,
                        city: resDataResults.address.city,
                        state: resDataResults.address.state,
                        country: resDataResults.address.country,
                        postalCode: resDataResults.address.postal_code
                    },
                    roles: resDataResults.roles,
                };
                setUserData(() => formattedUserData);
            })
            .catch((err) => {
                console.log(err);
                if (err.response.status === 401 || err.response.status === 403 || err.response.status === 404) {
                    console.log("this was ran");
                    // return unauthorised error component
                    setRenderErrorCard((prevState) => ({
                        ...prevState,
                        render: true,
                        errMsg: err.response.data.message,
                        errStatus: err.response.status,
                        errStatusText: err.response.statusText
                    }));
                }
            });

        // Update Password criteria
        setPasswordValidity(() => ({
            minChar: inputValues.password.length >= 8 ? true : false,
            number: isNumberRegx.test(inputValues.password) ? true : false,
            specialChar: specialCharacterRegx.test(inputValues.password) ? true : false,
            match: (inputValues.password === inputValues.confirmPassword) ? true : false,
        }))
    }, [inputValues]);

    // Handler for password input change
    const handlePasswordInputChange = (event) => {
        setInputValues((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value
        }))
    }

    // Handler for input 
    const handleInputChange = (event) => {
        setUserData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }

    const updateEmailDisplay = () => {
        setUserData((prevState) => ({
            ...prevState,
            emailDisplay: userData.email
        }));

    }

    const handleAddressInputChange = (event) => {
        setUserData((prevState) => ({
            ...prevState,
            address: {
                ...prevState.address,
                [event.target.name]: event.target.value
            }
        }));
    }

    // Handler for buttons
    const handleBtn = (buttonType) => {
        if (buttonType === "editAccount" || buttonType === "editAccountCancel") {
            // Handler for edit button
            setIsEditing((prevState) => (!prevState));
        }

        if (buttonType === "editAccountSave") {
            const message = `You are about to save account details. Click confirm to proceed.`;
            const handler = (onClose) => editUserDetails(onClose);
            const heading = `Confirm Save?`;
            const type = "primary"
            const data = {
                message,
                handler,
                heading,
                type
            };

            // Confirmation dialogue for sending invite
            return confirmAlert({
                customUI: ({ onClose }) => {
                    return <CustomConfirmAlert {...data} onClose={onClose} />;
                }
            });
        }

        if (buttonType === "changePassword" || buttonType === "changePasswordCancel") {
            // Handler for change password button
            setIsChangingPassword((prevState) => (!prevState));
        }

        if (buttonType === "changePasswordSave") {
            const message = `You are about to change password. Click confirm to proceed.`;
            const handler = (onClose) => changePassword(onClose);
            const heading = `Confirm Change Password?`;
            const type = "primary"
            const data = {
                message,
                handler,
                heading,
                type
            };

            // Confirmation dialogue for sending invite
            return confirmAlert({
                customUI: ({ onClose }) => {
                    return <CustomConfirmAlert {...data} onClose={onClose} />;
                }
            });
        }
    }

    // Endpoint for changing password
    const changePassword = (onClose) => {
        axios.post(`${process.env.REACT_APP_BASEURL}/forget-password/change`, {
            old_password: inputValues.oldPassword,
            new_password: inputValues.password,
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
            .then((res) => {
                console.log("Changed Password successfully!");
                const data = res.data;
                console.log(data);
                setLoading(() => (false));
                setTimeout(() => {
                    toast.success(<>Success!<br />Message: <b>Changed Password successfully!</b></>);
                }, 0);
                onClose();
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
                onClose();
            })
    }

    // API call for edit user details
    const editUserDetails = (onClose) => {
        setLoading(() => (true));
        axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employees/${userID}`, {
            "firstname": userData.firstName,
            "lastname": userData.lastName,
            "email": userData.email,
            "address": {
                "address_line_one": userData.address.line1,
                "address_line_two": userData.address.line2,
                "city": userData.address.city,
                "state": userData.address.state,
                "country": userData.address.country,
                "postal_code": userData.address.postalCode,
            },
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        )
            .then((res) => {
                console.log("Updated User Details successfully!");
                const data = res.data;
                console.log(data);
                setLoading(() => (false));
                updateEmailDisplay();
                setIsEditing(() => false);
                toast.success(<>Success!<br />Message: <b>Updated User Details successfully!</b></>);
                onClose();
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
                onClose();
            })
    }

    // Only rendered when document is in editing mode
    const renderInputFieldEditSection = () => {
        return (

            <Container className="l-Manage-account__Inputs">
                {/* Row 1 */}
                <Row className="l-Manage-account__Inputs--row1 l-Manage-account__Inputs--row">
                    {/* First name */}
                    <Col className="c-Input c-Input__First-name c-Input c-Input--edit">
                        <label htmlFor="firstName">First Name</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="firstName" value={userData.firstName} />
                    </Col>
                    {/* Last name */}
                    <Col className="c-Input c-Input__Last-name c-Input--edit">
                        <label htmlFor="lastName">Last Name</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="lastName" value={userData.lastName} />
                    </Col>
                </Row>
                {/* Row 2 */}
                <Row className="l-Manage-account__Inputs--row2 l-Manage-account__Inputs--row">
                    {/* Email */}
                    <Col className="c-Input c-Input__Email c-Input--edit">
                        <label htmlFor="email">Email</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="email" value={userData.email} />
                    </Col>
                    {/* Username */}
                    <Col className="c-Input c-Input__Username c-Input--edit">
                        <label htmlFor="username">Username</label>
                        <p>Cannot be edited!</p>
                    </Col>
                </Row>
                {/* Row 3 */}
                <Row className="l-Manage-account__Inputs--row3 l-Manage-account__Inputs--row">
                    {/* Roles */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--edit">
                        <p>Role(s)</p>
                        <p>Cannot be edited!</p>
                    </Col>
                    {/* Organisation */}
                    <Col className="c-Input c-Input__Organisation c-Input--edit">
                        <p>Organisation</p>
                        <p>Cannot be edited!</p>
                    </Col>
                </Row>
                {/* Row 4 */}
                <Row className="l-Manage-account__Inputs--row3 l-Manage-account__Inputs--row">
                    {/* line1 */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--edit">
                        <label htmlFor="line1">Address Line One</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="line1" value={userData.address.line1} />
                    </Col>

                    {/* line2 */}
                    <Col className="c-Input c-Input__Organisation c-Input--edit">
                        <label htmlFor="line2">Address Line Two</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="line2" value={userData.address.line2} />
                    </Col>
                </Row>
                {/* Row 5 */}
                <Row className="l-Manage-account__Inputs--row3 l-Manage-account__Inputs--row">
                    {/* city */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--edit">
                        <label htmlFor="city">City</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="city" value={userData.address.city} />
                    </Col>

                    {/* country */}
                    <Col className="c-Input c-Input__Organisation c-Input--edit">
                        <label htmlFor="country">Country</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="country" value={userData.address.country} />
                    </Col>
                </Row>
                {/* Row 6 */}
                <Row className="l-Manage-account__Inputs--row3 l-Manage-account__Inputs--row">
                    {/* postalCode */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--edit">
                        <label htmlFor="postalCode">Postal Code</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="postalCode" value={userData.address.postalCode} />
                    </Col>

                    {/* state */}
                    <Col className="c-Input c-Input__Organisation c-Input--edit">
                        <label htmlFor="state">State</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="state" value={userData.address.state} />
                    </Col>
                </Row>
                {/* Save & Cancel Buttons */}
                <Row className="c-Manage-account__Btns">
                    {
                        inputTouched ?
                            <button onClick={() => (handleBtn("editAccountSave"))} type="button" className="c-Btn c-Btn--primary">Save</button>
                            :
                            <button type="button" disabled={true} className="c-Btn c-Btn--disabled">{loading ? "Loading..." : "Save"}</button>
                    }

                    <button onClick={() => (handleBtn("editAccountCancel"))} type="button" className="c-Btn c-Btn--cancel">Cancel</button>
                </Row>
            </Container>
        )
    }

    // Rendered when document is not in editing mode
    const renderInputFieldSection = () => {
        return (

            <Container className="l-Manage-account__Inputs">
                {/* Row 1 */}
                <Row className="l-Manage-account__Inputs--row1 l-Manage-account__Inputs--row">
                    {/* First name */}
                    <Col className="c-Input c-Input__First-name c-Input--read-only">
                        <label htmlFor="firstName">First Name</label>
                        <input readOnly type="text" name="firstName" value={userData.firstName} />
                    </Col>
                    {/* Last name */}
                    <Col className="c-Input c-Input__Last-name c-Input--read-only">
                        <label htmlFor="lastName">Last Name</label>
                        <input readOnly type="text" name="lastName" value={userData.lastName} />
                    </Col>
                </Row>
                {/* Row 2 */}
                <Row className="l-Manage-account__Inputs--row2 l-Manage-account__Inputs--row">
                    {/* Email */}
                    <Col className="c-Input c-Input__Email c-Input--read-only">
                        <label htmlFor="email">Email</label>
                        <input readOnly type="text" name="email" value={userData.email} />
                    </Col>
                    {/* Username */}
                    <Col className="c-Input c-Input__Username c-Input--read-only">
                        <label htmlFor="username">Username</label>
                        <input readOnly type="text" name="username" value={userData.username} />
                    </Col>
                </Row>
                {/* Row 3 */}
                <Row className="l-Manage-account__Inputs--row3 l-Manage-account__Inputs--row">
                    {/* Roles */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--read-only">
                        <p>Role(s)</p>
                        {
                            userData.roles.map((role, index) =>
                                <RoleTags key={index} tagListing={`${role.name}`} deletable={false} />
                            )
                        }

                    </Col>
                    {/* Organisation */}
                    <Col className="c-Input c-Input__Organisation c-Input--read-only">
                        <label htmlFor="organisation">Organisation</label>
                        <input readOnly type="text" name="organisation" value={userData.companyName} />
                    </Col>
                </Row>
                {/* Row 4 */}
                <Row className="l-Manage-account__Inputs--row3 l-Manage-account__Inputs--row">
                    {/* address_line_one */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--read-only">
                        <label htmlFor="address_line_one">Address Line One</label>
                        <input readOnly type="text" name="address_line_one" value={userData.address.line1} />
                    </Col>

                    {/* address_line_two */}
                    <Col className="c-Input c-Input__Organisation c-Input--read-only">
                        <label htmlFor="address_line_two">Address Line Two</label>
                        <input readOnly type="text" name="address_line_two" value={userData.address.line2} />
                    </Col>
                </Row>
                {/* Row 5 */}
                <Row className="l-Manage-account__Inputs--row3 l-Manage-account__Inputs--row">
                    {/* city */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--read-only">
                        <label htmlFor="city">City</label>
                        <input readOnly type="text" name="city" value={userData.address.city} />
                    </Col>

                    {/* country */}
                    <Col className="c-Input c-Input__Organisation c-Input--read-only">
                        <label htmlFor="country">Country</label>
                        <input readOnly type="text" name="country" value={userData.address.country} />
                    </Col>
                </Row>
                {/* Row 6 */}
                <Row className="l-Manage-account__Inputs--row3 l-Manage-account__Inputs--row">
                    {/* postal_code */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--read-only">
                        <label htmlFor="postal_code">Postal Code</label>
                        <input readOnly type="text" name="postal_code" value={userData.address.postalCode} />
                    </Col>

                    {/* state */}
                    <Col className="c-Input c-Input__Organisation c-Input--read-only">
                        <label htmlFor="state">State</label>
                        <input readOnly type="text" name="state" value={userData.address.state} />
                    </Col>
                </Row>
            </Container>

        )
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

            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Manage Account' activeLink="/settings">
                <div className="c-Manage-account c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-IP__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/settings">Settings</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Account</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-account__Top c-Main__Top">
                        <h1>Manage Account</h1>
                        {/* Edit button section */}
                        {
                            isEditing || renderErrorCard.render ?
                                null :
                                <button
                                    onClick={() => (handleBtn("editAccount"))}
                                    type="button"
                                    className={isChangingPassword ? "c-Btn c-Btn--primary c-Btn--disabled" : "c-Btn c-Btn--primary"}
                                    disabled={isChangingPassword ? true : false}
                                >
                                    Edit
                                </button>
                        }
                    </div>
                    {
                        renderErrorCard.render ?
                            <ErrorCard errMsg={renderErrorCard.errMsg} errStatus={renderErrorCard.errStatus} errStatusText={renderErrorCard.errStatusText} />
                            :
                            <>
                                {/* Profile card section */}
                                <div className="c-Manage-account__Profile-card c-Profile-card">
                                    <div className="l-Profile-card__Left">
                                        <img src={profilePic} alt="Profile img" />
                                        <span>Change profile picture</span>
                                    </div>
                                    <div className="l-Profile-card__Right">
                                        <h1>{userData.fullName}</h1>
                                        <h2>@{userData.username}</h2>
                                        <p>{userData.jobTitle}</p>
                                        <p>{userData.emailDisplay}</p>
                                        <p>{userData.companyName}</p>
                                    </div>
                                </div>

                                {/* Profile input fields section */}
                                {
                                    isEditing ?
                                        renderInputFieldEditSection()
                                        :
                                        renderInputFieldSection()
                                }

                                {/* Change password section */}
                                <div className="l-Manage-account__Password">
                                    <h1>Password and Authentication</h1>
                                    {
                                        isChangingPassword ?
                                            <div className="c-Change-Password">
                                                <p>Enter your current password and a new password</p>
                                                {/* Current password */}
                                                <div className="c-Change-Password__Current-password">
                                                    <label htmlFor="oldPassword">Current Password</label>
                                                    <input onChange={handlePasswordInputChange} type="password" name="oldPassword" />
                                                </div>
                                                {/* New password */}
                                                <div className="c-Change-Password__New-password">
                                                    <label htmlFor="password">New Password</label>
                                                    <input onChange={handlePasswordInputChange} type="password" name="password" />
                                                </div>
                                                {/* New password */}
                                                <div className="c-Change-Password__New-password">
                                                    <label htmlFor="confirmPassword">Confirm New Password</label>
                                                    <input onChange={handlePasswordInputChange} type="password" name="confirmPassword" />
                                                </div>
                                                {/* Password Criteria */}
                                                <PasswordCriteria
                                                    validity={passwordValidity}
                                                />
                                                {/* Save/Cancel Buttons */}
                                                <div className="c-Change-Password__Btns">
                                                    {
                                                        (passwordValidity.minChar === true && passwordValidity.number === true &&
                                                            passwordValidity.specialChar === true && passwordValidity.match === true) ?
                                                            <button onClick={() => (handleBtn("changePasswordSave"))} type="button" className="c-Btn c-Btn--primary">Save</button>
                                                            :
                                                            <button type="button" disabled={true} className="c-Btn c-Btn--disabled">Save</button>
                                                    }

                                                    <button onClick={() => (handleBtn("changePasswordCancel"))} type="button" className="c-Btn c-Btn--cancel">Cancel</button>
                                                </div>
                                            </div>
                                            :
                                            <div className="c-Change-Password__Btns">
                                                <button
                                                    onClick={() => (handleBtn("changePassword"))}
                                                    type="button"
                                                    className={isEditing ? "c-Btn c-Btn--primary c-Btn--disabled" : "c-Btn c-Btn--primary"}
                                                    disabled={isEditing ? true : false}
                                                >
                                                    Change Password
                                                </button>
                                            </div>
                                    }

                                </div>


                            </>
                    }

                </div>
            </PageLayout>
        </>
    )
}

export default ManageAccount;