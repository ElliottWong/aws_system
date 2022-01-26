import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { confirmAlert } from 'react-confirm-alert';
import { toast, ToastContainer } from 'react-toastify';
import CustomConfirmAlert from '../common/CustomConfirmAlert';
import ErrorCard from '../common/ErrorCard.js';
import config from '../config/config';
import PageLayout from '../layout/PageLayout';
import { getSideNavStatus } from '../utilities/sideNavUtils.js';
import TokenManager from '../utilities/tokenManager';

const ManageOrganization = () => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const toastTiming = config.toastTiming;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [isEditing, setIsEditing] = useState(false);
    const [inputTouched, setInputTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [companyData, setCompanyData] = useState({
        companyName: 'Error',
        businessRegNum: 'Error',
        companyAlias: 'Error',
        createdOn: 'Error',
        status: 'Error',
        description: 'Error',
        address: {
            line1: 'Error',
            line2: 'Error',
            city: 'Error',
            state: 'Error',
            country: 'Error',
            postalCode: 'Error'
        },
    });
    const [renderErrorCard, setRenderErrorCard] = useState({
        render: false,
        errMsg: null,
        errStatus: null,
        errStatusText: null
    });

    useEffect(() => {
        // Endpoint to retrieve details about company
        axios.get(`${process.env.REACT_APP_BASEURL}/companies/${userCompanyID}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res);
                const resDataResults = res.data.results;
                const formattedCompanyData = {
                    companyName: resDataResults.name,
                    businessRegNum: resDataResults.business_registration_number,
                    companyAlias: resDataResults.alias,
                    createdOn: resDataResults.created_at,
                    status: resDataResults.status,
                    description: resDataResults.description,
                    address: {
                        addressID: resDataResults.address_id,
                        line1: resDataResults.address.address_line_one,
                        line2: resDataResults.address.address_line_two,
                        city: resDataResults.address.city,
                        state: resDataResults.address.state,
                        country: resDataResults.address.country,
                        postalCode: resDataResults.address.postal_code
                    },
                };
                setCompanyData(() => formattedCompanyData);
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
    }, [token, userCompanyID]);

    // Handler for input 
    const handleInputChange = (event) => {
        setCompanyData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }

    const handleAddressInputChange = (event) => {
        setCompanyData((prevState) => ({
            ...prevState,
            address: {
                ...prevState.address,
                [event.target.name]: event.target.value
            }
        }));
    }

    // Handler for edit button
    const handleBtn = (buttonType) => {
        if (buttonType === "editCompany" || buttonType === "editCompanyCancel") {
            // Handler for edit button
            setIsEditing((prevState) => (!prevState));
        }

        if (buttonType === "editCompanySave") {
            const message = `You are about to save new company details. Click confirm to proceed.`;
            const handler = (onClose) => editCompanyDetails(onClose);
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

        if (buttonType === "deleteCompany") {
            // Do api call here
        }
    }

    // API call for edit user details
    const editCompanyDetails = (onClose) => {
        setLoading(() => (true));
        axios.put(`${process.env.REACT_APP_BASEURL}/companies/${userCompanyID}`, {
            name: companyData.companyName,
            business_registration_number: companyData.businessRegNum,
            alias: companyData.companyAlias,
            status: companyData.status,
            description: companyData.description,
            address: {
                "address_line_one": companyData.address.line1,
                "address_line_two": companyData.address.line2,
                "city": companyData.address.city,
                "state": companyData.address.state,
                "country": companyData.address.country,
                "postal_code": companyData.address.postalCode,
            },
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        )
            .then((res) => {
                console.log("Updated Company Details successfully!");
                const data = res.data;
                console.log(data);
                setLoading(() => (false));
                setIsEditing(() => false);
                toast.success(<>Success!<br />Message: <b>Updated Company Details successfully!</b></>);
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
                    {/* Company Name */}
                    <Col className="c-Input c-Input__First-name c-Input c-Input--edit">
                        <label htmlFor="companyName">Company Name</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="companyName" value={companyData.companyName} />
                    </Col>
                    {/* Business Registration Number */}
                    <Col className="c-Input c-Input__Last-name c-Input--edit">
                        <label htmlFor="businessRegNum">Business Registration Number</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="businessRegNum" value={companyData.businessRegNum} />
                    </Col>
                </Row>
                {/* Row 2 */}
                <Row className="l-Manage-account__Inputs--row2 l-Manage-account__Inputs--row">
                    {/* Company Alias */}
                    <Col className="c-Input c-Input__Email c-Input--edit">
                        <label htmlFor="companyAlias">Company Alias</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="companyAlias" value={companyData.companyAlias} />
                    </Col>
                    {/* Created On */}
                    <Col className="c-Input c-Input__Email c-Input--edit">
                        <label htmlFor="createdOn">Created On</label>
                        <p>Cannot be edited!</p>
                    </Col>
                </Row>
                {/* Row 3 */}
                <Row className="l-Manage-account__Inputs--row3 l-Manage-account__Inputs--row">
                    {/* line1 */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--edit">
                        <label htmlFor="line1">Address Line One</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="line1" value={companyData.address.line1} />
                    </Col>

                    {/* line2 */}
                    <Col className="c-Input c-Input__Organisation c-Input--edit">
                        <label htmlFor="line2">Address Line Two</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="line2" value={companyData.address.line2} />
                    </Col>
                </Row>
                {/* Row 4 */}
                <Row className="l-Manage-account__Inputs--row3 l-Manage-account__Inputs--row">
                    {/* city */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--edit">
                        <label htmlFor="city">City</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="city" value={companyData.address.city} />
                    </Col>

                    {/* country */}
                    <Col className="c-Input c-Input__Organisation c-Input--edit">
                        <label htmlFor="country">Country</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="country" value={companyData.address.country} />
                    </Col>
                </Row>
                {/* Row 5 */}
                <Row className="l-Manage-account__Inputs--row3 l-Manage-account__Inputs--row">
                    {/* postalCode */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--edit">
                        <label htmlFor="postalCode">Postal Code</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="postalCode" value={companyData.address.postalCode} />
                    </Col>

                    {/* state */}
                    <Col className="c-Input c-Input__Organisation c-Input--edit">
                        <label htmlFor="state">State</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="state" value={companyData.address.state} />
                    </Col>
                </Row>
                {/* Row 6 */}
                <Row className="l-Manage-account__Inputs--row3 l-Manage-account__Inputs--row">
                    {/* description */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--edit">
                        <label htmlFor="description">Description</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="description" value={companyData.description} />
                    </Col>
                </Row>
                {/* Save & Cancel Buttons */}
                <Row className="c-Manage-account__Btns">
                    {
                        inputTouched ?
                            <button onClick={() => (handleBtn("editCompanySave"))} type="button" className="c-Btn c-Btn--primary">Save</button>
                            :
                            <button type="button" disabled={true} className="c-Btn c-Btn--disabled">{loading ? "Loading..." : "Save"}</button>
                    }

                    <button onClick={() => (handleBtn("editCompanyCancel"))} type="button" className="c-Btn c-Btn--cancel">Cancel</button>
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
                    {/* Company Name */}
                    <Col className="c-Input c-Input__First-name c-Input c-Input--read-only">
                        <label htmlFor="companyName">Company Name</label>
                        <input readOnly type="text" name="companyName" value={companyData.companyName} />
                    </Col>
                    {/* Business Registration Number */}
                    <Col className="c-Input c-Input__Last-name c-Input--read-only">
                        <label htmlFor="businessRegNum">Business Registration Number</label>
                        <input readOnly type="text" name="businessRegNum" value={companyData.businessRegNum} />
                    </Col>
                </Row>
                {/* Row 2 */}
                <Row className="l-Manage-account__Inputs--row2 l-Manage-account__Inputs--row">
                    {/* Company Alias */}
                    <Col className="c-Input c-Input__Email c-Input--read-only">
                        <label htmlFor="companyAlias">Company Alias</label>
                        <input readOnly type="text" name="companyAlias" value={companyData.companyAlias} />
                    </Col>
                    {/* Created On */}
                    <Col className="c-Input c-Input__Email c-Input--read-only">
                        <label htmlFor="createdOn">Created On</label>
                        <input readOnly type="text" name="createdOn" value={dayjs(new Date(companyData.createdOn)).format("MMMM D, YYYY h:mm A")} />
                    </Col>
                </Row>
                {/* Row 3 */}
                <Row className="l-Manage-account__Inputs--row3 l-Manage-account__Inputs--row">
                    {/* line1 */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--read-only">
                        <label htmlFor="line1">Address Line One</label>
                        <input readOnly type="text" name="line1" value={companyData.address.line1} />
                    </Col>

                    {/* line2 */}
                    <Col className="c-Input c-Input__Organisation c-Input--read-only">
                        <label htmlFor="line2">Address Line Two</label>
                        <input readOnly type="text" name="line2" value={companyData.address.line2} />
                    </Col>
                </Row>
                {/* Row 4 */}
                <Row className="l-Manage-account__Inputs--row3 l-Manage-account__Inputs--row">
                    {/* city */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--read-only">
                        <label htmlFor="city">City</label>
                        <input readOnly type="text" name="city" value={companyData.address.city} />
                    </Col>

                    {/* country */}
                    <Col className="c-Input c-Input__Organisation c-Input--read-only">
                        <label htmlFor="country">Country</label>
                        <input readOnly type="text" name="country" value={companyData.address.country} />
                    </Col>
                </Row>
                {/* Row 5 */}
                <Row className="l-Manage-account__Inputs--row3 l-Manage-account__Inputs--row">
                    {/* postalCode */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--read-only">
                        <label htmlFor="postalCode">Postal Code</label>
                        <input readOnly type="text" name="postalCode" value={companyData.address.postalCode} />
                    </Col>

                    {/* state */}
                    <Col className="c-Input c-Input__Organisation c-Input--read-only">
                        <label htmlFor="state">State</label>
                        <input readOnly type="text" name="state" value={companyData.address.state} />
                    </Col>
                </Row>
                {/* Row 6 */}
                <Row className="l-Manage-account__Inputs--row3 l-Manage-account__Inputs--row">
                    {/* description */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--read-only">
                        <label htmlFor="description">Description</label>
                        <input readOnly type="text" name="description" value={companyData.description} />
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
                        <Breadcrumb.Item active>Manage Organization</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-account__Top c-Main__Top">
                        <h1>Manage Organization</h1>
                        {/* Edit button section */}
                        {
                            isEditing || renderErrorCard.render ?
                                null :
                                <button
                                    onClick={() => (handleBtn("editCompany"))}
                                    type="button"
                                    className="c-Btn c-Btn--primary"
                                >
                                    Edit
                                </button>
                        }
                    </div>

                    {/* Input fields section */}
                    {
                        renderErrorCard.render ?
                            <ErrorCard errMsg={renderErrorCard.errMsg} errStatus={renderErrorCard.errStatus} errStatusText={renderErrorCard.errStatusText} />
                            :
                            isEditing ?
                                renderInputFieldEditSection()
                                :
                                renderInputFieldSection()
                    }
                </div>
            </PageLayout>
        </>
    )
}

export default ManageOrganization;