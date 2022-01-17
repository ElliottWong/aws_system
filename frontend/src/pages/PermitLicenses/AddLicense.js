import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import jwt_decode from "jwt-decode";
import axios from 'axios';
import config from '../../config/config';
import ErrorCard from '../../common/ErrorCard';
import { Container, Row, Col } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import CustomConfirmAlert from '../../common/CustomConfirmAlert';
import TokenManager from '../../utilities/tokenManager';
import { useHistory, NavLink } from 'react-router-dom';

const AddLicense = () => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const toastTiming = config.toastTiming;
    let history = useHistory();

    // State declarations
    const [loading, setLoading] = useState(false);
    const [inputTouched, setInputTouched] = useState(false);
    const [licenseData, setLicenseData] = useState({
        name: '',
        category: '',
        reference_number: '',
        register_number: '',
        model: '',
        serial_number: '',
    });
    const [userList, setUserList] = useState([]);
    const [renderErrorCard, setRenderErrorCard] = useState({
        render: false,
        errMsg: null,
        errStatus: null,
        errStatusText: null
    });
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed

    const handleBtn = (buttonType) => {
        if (buttonType === "addLicence") {
            // Handler for add button
            console.log(licenseData);
            (async () => {
                try {
                    const resInsertOneLicence = await axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/licence-registry/all-licences`,
                        licenseData, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    console.log(resInsertOneLicence);
                    toast.success(<>Success!<br />Message: <b>New License has been added!</b></>);
                } catch (error) {
                    console.log(error);
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
                    {/* Exp. Date */}
                    <Col className="c-Input c-Input__Reg-no c-Input--edit">
                        <label htmlFor="expDate">Exp. Date</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="expDate" value={licenseData.expDate} />
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
                        <select onFocus={() => setInputTouched(true)} type="text" name="responsibleUser" onChange={handleInputChange} value={licenseData.responsibleUser || 'Error'}>
                            <option>{!userList ? "No users found!" : "Select User"}</option>
                            {!userList ? null : userList.map((user, index) => (
                                <option key={index} value={user.username}>
                                    {user.username}
                                </option>
                            ))}
                        </select>
                    </Col>
                </Row>
            </Container>
        )
    }

    useEffect(() => {
        (async () => {
            try {
                // Get all users with permission to 
                const resClausePermission = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m07_02/employees`);
                console.log(resClausePermission);

                let tempUserData = [];
                // Get all equipment categories
                const resAllCategories = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/categories`);
                console.log(resAllCategories);
                tempUserData = resAllCategories.data.results;
                console.log(tempUserData);

                setUserList(() => {
                    if (tempUserData.length === 0) {
                        return null;
                    }
                    return tempUserData.map((data) => ({
                        name: `${data.name}`
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
                                    <button onClick={() => (handleBtn("addEquipment"))} type="button" className="c-Btn c-Btn--primary">Add</button>
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