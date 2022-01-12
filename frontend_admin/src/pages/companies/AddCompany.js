import React, { useState } from 'react';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { useHistory } from "react-router-dom";
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { getToken } from '../../utilities/localStorageUtils';
import config from '../../config/config';

const AddCompany = () => {
    const history = useHistory();
    const token = getToken();
    const toastTiming = config.toastTiming;

    // State declaration
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
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

    const handleBtn = (buttonType) => {
        if (buttonType === "addCompany") {
            // Do api call here
            addCompany();
        }
    }

    const addCompany = () => {
        axios.post(`${process.env.REACT_APP_BASEURL}/companies`, {
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
        })
            .then((res) => {
                console.log("Create company successful!");
                const data = res.data;
                console.log(data);
                setLoading(() => (false));
                history.push("/companies");
                setTimeout(function () {
                    toast.success(<>Success!<br />Message: <b>Created company successfully!</b></>);
                }, 0);
                
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

            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title="Add Company" activeLink="/companies">
                <div className="c-Manage-company c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Companies__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/companies">Companies</Breadcrumb.Item>
                        <Breadcrumb.Item active>Add Company</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Top section */}
                    <div className="c-Companies__Top c-Main__Top">
                        <h1>Add Company</h1>
                    </div>

                    {/* Input fields section */}
                    <Container className="l-Manage-company__Inputs">
                        {/* Row 1 */}
                        <Row className="l-Manage-company__Inputs--row1 l-Manage-company__Inputs--row">
                            {/* Company Name */}
                            <Col className="c-Input c-Input__First-name c-Input c-Input--edit">
                                <label htmlFor="companyName">Company Name</label>
                                <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="companyName" />
                            </Col>
                            {/* Business Registration Number */}
                            <Col className="c-Input c-Input__Last-name c-Input--edit">
                                <label htmlFor="businessRegNum">Business Registration Number</label>
                                <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="businessRegNum" />
                            </Col>
                        </Row>
                        {/* Row 2 */}
                        <Row className="l-Manage-company__Inputs--row2 l-Manage-company__Inputs--row">
                            {/* Company Alias */}
                            <Col className="c-Input c-Input__Email c-Input--edit">
                                <label htmlFor="companyAlias">Company Alias</label>
                                <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="companyAlias" />
                            </Col>
                            {/* Created On */}
                            <Col className="c-Input c-Input__Email c-Input--edit">
                                <label htmlFor="createdOn">Created On</label>
                                <p>Cannot be edited!</p>
                            </Col>
                        </Row>
                        {/* Row 3 */}
                        <Row className="l-Manage-company__Inputs--row3 l-Manage-company__Inputs--row">
                            {/* line1 */}
                            <Col className="c-Input l-Manage-account__Roles c-Input--edit">
                                <label htmlFor="line1">Address Line One</label>
                                <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="line1" />
                            </Col>

                            {/* line2 */}
                            <Col className="c-Input c-Input__Organisation c-Input--edit">
                                <label htmlFor="line2">Address Line Two</label>
                                <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="line2" />
                            </Col>
                        </Row>
                        {/* Row 4 */}
                        <Row className="l-Manage-company__Inputs--row3 l-Manage-company__Inputs--row">
                            {/* city */}
                            <Col className="c-Input l-Manage-account__Roles c-Input--edit">
                                <label htmlFor="city">City</label>
                                <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="city" />
                            </Col>

                            {/* country */}
                            <Col className="c-Input c-Input__Organisation c-Input--edit">
                                <label htmlFor="country">Country</label>
                                <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="country" />
                            </Col>
                        </Row>
                        {/* Row 5 */}
                        <Row className="l-Manage-company__Inputs--row3 l-Manage-company__Inputs--row">
                            {/* postalCode */}
                            <Col className="c-Input l-Manage-account__Roles c-Input--edit">
                                <label htmlFor="postalCode">Postal Code</label>
                                <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="postalCode" />
                            </Col>

                            {/* state */}
                            <Col className="c-Input c-Input__Organisation c-Input--edit">
                                <label htmlFor="state">State</label>
                                <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="state" />
                            </Col>
                        </Row>
                        {/* Row 6 */}
                        <Row className="l-Manage-company__Inputs--row3 l-Manage-company__Inputs--row">
                            {/* description */}
                            <Col className="c-Input l-Manage-account__Roles c-Input--edit">
                                <label htmlFor="description">Description</label>
                                <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="description" />
                            </Col>
                        </Row>
                        {/* Save & Cancel Buttons */}
                        <Row className="c-Manage-account__Btns">
                            {
                                inputTouched ?
                                    <button onClick={() => (handleBtn("addCompany"))} type="button" className="c-Btn c-Btn--primary">Add</button>
                                    :
                                    <button type="button" disabled={true} className="c-Btn c-Btn--disabled">{loading ? "Loading..." : "Add"}</button>
                            }

                            <button type="button" onClick={() => history.push('/companies')} className="c-Btn c-Btn--cancel">Cancel</button>
                        </Row>
                    </Container>
                </div>
            </PageLayout>
        </>
    )
}

export default AddCompany;