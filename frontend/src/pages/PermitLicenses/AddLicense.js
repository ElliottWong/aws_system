import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import DateTimePicker from 'react-datetime-picker';
import { useHistory } from 'react-router-dom';
import Select from "react-select";
import { toast, ToastContainer } from 'react-toastify';
import ErrorCard from '../../common/ErrorCard';
import config from '../../config/config';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager';

const AddLicense = () => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const toastTiming = config.toastTiming;
    let history = useHistory();

    // State declarations
    const [loading, setLoading] = useState(false);
    const [inputTouched, setInputTouched] = useState(false);
    const [licenseData, setLicenseData] = useState([]);
    const [userList, setUserList] = useState([]);
    const [renderErrorCard, setRenderErrorCard] = useState({
        render: false,
        errMsg: null,
        errStatus: null,
        errStatusText: null
    });
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed

    const handleBtn = (buttonType) => {
        if (buttonType === "addLicense") {
            // Handler for add button
            console.log(licenseData);
            (async () => {
                try {
                    const resInsertOneLicence = await axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/licence-registry/all-licences`,
                        {
                            issued_at: licenseData.issuedOn,
                            licence_name: licenseData.license,
                            licence_number: licenseData.licenseNo,
                            external_organisation: licenseData.externalAgency,
                            expires_at: licenseData.expDate,
                            assignees: (() => {
                                return licenseData.assignees.map((data) => {
                                    return data.value;
                                });
                            })()
                        }, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    console.log(resInsertOneLicence);
                    setTimeout(() => {
                        toast.success(<>Success!<br />Message: <b>New License has been added!</b></>);
                    }, 0);
                    history.push("/licenses");
                } catch (err) {
                    console.log(err);
                    console.log(err.response);
                    let errCode = "Error!";
                    let errMsg = "Error!"
                    if (err.response !== undefined) {
                        errCode = err.response.status;
                        errMsg = err.response.data.message;
                    }
                    toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                }
            })();
        } else if (buttonType === "cancel") {
            // Handler for cancel button
            history.push("/licenses");

        }
    }

    // Handler for input 
    const handleInputChange = (event) => {
        setLicenseData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }

    // Handler for setting last service date 
    const setExpDate = (date) => {
        console.log(date);
        setLicenseData((prevState) => ({
            ...prevState,
            expDate: date
        }));
    }

    // Handler for setting last service date 
    const setIssuedDate = (date) => {
        console.log(date);
        setLicenseData((prevState) => ({
            ...prevState,
            issuedOn: date
        }));
    }

    const renderInputFieldEditSection = () => {
        return (
            <Container className="l-Manage-equipment__Inputs">
                {/* Row 1 */}
                <Row className="l-Manage-equipment__Inputs--row1 l-Manage-equipment__Inputs--row">
                    {/* License */}
                    <Col className="c-Input c-Input__Name c-Input c-Input--edit">
                        <label htmlFor="license">License/Permit/Certificate</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="license" value={licenseData.license} />
                    </Col>
                    {/* License No. */}
                    <Col className="c-Input c-Input__Ref-no c-Input--edit">
                        <label htmlFor="licenseNo">License No.</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="licenseNo" value={licenseData.licenseNo} />
                    </Col>
                    {/* Issued On */}
                    <Col className="c-Input c-Input__Reg-no c-Input--edit">
                        <label htmlFor="issuedOn">Issued On</label>
                        <DateTimePicker
                            onChange={setIssuedDate}
                            value={licenseData.issuedOn}
                            className="c-Form__Date"
                            format="dd/MM/y"
                            onFocus={() => setInputTouched(true)}
                        />
                    </Col>
                    {/* Exp. Date */}
                    <Col className="c-Input c-Input__Reg-no c-Input--edit">
                        <label htmlFor="expDate">Exp. Date</label>
                        <DateTimePicker
                            onChange={setExpDate}
                            value={licenseData.expDate}
                            className="c-Form__Date"
                            format="dd/MM/y"
                            onFocus={() => setInputTouched(true)}
                        />
                    </Col>
                </Row>

                {/* Row 2 */}
                <Row className="l-Manage-equipment__Inputs--row2 l-Manage-equipment__Inputs--row">
                    {/* Responsible External Agency */}
                    <Col className="c-Input c-Input__Model-brand c-Input--edit">
                        <label htmlFor="externalAgency">Responsible External Agency</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="externalAgency" value={licenseData.externalAgency} />
                    </Col>
                    {/* Responsible User */}
                    <Col className="c-Input c-Input__Category c-Input c-Input--edit">
                        <label htmlFor="responsibleUser">Responsible User</label>
                        <Select
                            isMulti
                            options={userList}
                            placeholder="Select Users"
                            onChange={handleInputArrayChange}
                            onFocus={() => setInputTouched(true)}
                        />
                    </Col>
                </Row>
            </Container>
        )
    }

    // Handler for input array
    const handleInputArrayChange = (options) => {
        console.log(options);
        setLicenseData((prevState) => ({
            ...prevState,
            assignees: options
        }));
    }


    useEffect(() => {
        (async () => {
            try {
                let tempUserData = [];
                // Get all users with permission to upload license
                const resClausePermission = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m07_02/employees`);
                console.log(resClausePermission);
                tempUserData = resClausePermission.data.results;
                console.log(tempUserData);

                setUserList(() => {
                    return tempUserData.map((data) => ({
                        label: data.account.username,
                        value: data.employee_id
                    }));
                });
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Licenses' activeLink="/licenses/add-equipment">
                <div className="c-Manage-equipment-maintenance c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Equipment-maintenance__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/licenses">Register of Permits, Licenses, Approvals & Certificates</Breadcrumb.Item>
                        <Breadcrumb.Item active>Add License/Permit/Certificate</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-equipment__Top c-Main__Top">
                        <h1>Add License/Permit/Certificate</h1>
                        {/* Add and Cancel button section */}
                        <div className='c-Manage-equipment__Btns'>
                            {
                                inputTouched ?
                                    <button onClick={() => (handleBtn("addLicense"))} type="button" className="c-Btn c-Btn--primary">Add</button>
                                    :
                                    <button type="button" disabled={true} className="c-Btn c-Btn--disabled">{loading ? "Loading..." : "Add"}</button>
                            }

                            <button onClick={() => (handleBtn("cancel"))} type="button" className="c-Btn c-Btn--cancel">Cancel</button>
                        </div>
                    </div>
                    {
                        renderErrorCard.render ?
                            <ErrorCard errMsg={renderErrorCard.errMsg} errStatus={renderErrorCard.errStatus} errStatusText={renderErrorCard.errStatusText} />
                            :
                            <>
                                {/* Equipment input fields section */}
                                {
                                    renderInputFieldEditSection()
                                }
                            </>
                    }
                </div>
            </PageLayout>

        </>
    )
}

export default AddLicense;