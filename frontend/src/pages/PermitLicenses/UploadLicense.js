import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import DateTimePicker from 'react-datetime-picker';
import { IconContext } from 'react-icons';
import * as RiIcons from 'react-icons/ri';
import { useHistory } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import ErrorCard from '../../common/ErrorCard';
import config from '../../config/config';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager';

const UploadLicense = ({ match }) => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const toastTiming = config.toastTiming;
    let history = useHistory();
    const licenseID = match.params.licenseID;
    const fileRef = useRef(null);

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
    const [licenseFile, setLicenseFile] = useState(null);

    const handleBtn = (buttonType) => {
        if (buttonType === "addLicense") {
            // Handler for add button
            console.log(licenseData);
            (async () => {
                try {
                    let newLicenseFormData = new FormData();
                    // Loop through a javascript object and append the fields to the form data variable
                    for (const property in licenseData) {
                        newLicenseFormData.append(property, licenseData[property]);
                    }
                    newLicenseFormData.append("renewal", licenseFile);
                    console.log(newLicenseFormData);
                    console.log(newLicenseFormData.get("renewal"));

                    const resUploadOneLicense = await axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/licence-registry/all-licences/${licenseID}/renewals`,
                        newLicenseFormData, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    console.log(resUploadOneLicense);
                    setTimeout(() => {
                        toast.success(<>Success!<br />Message: <b>New License has been uploaded!</b></>);
                    }, 0);
                    history.push(`/licenses/manage-license/${licenseID}`);
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
        }

        if (buttonType === "cancel") {
            // Handler for cancel button
            history.push(`/licenses/manage-license/${licenseID}`);
        }

        if (buttonType === "upload") {
            // Handler for upload button
            fileRef.current.click();
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
            expires_at: date
        }));
    }

    // Handler for setting last service date 
    const setIssuedDate = (date) => {
        console.log(date);
        setLicenseData((prevState) => ({
            ...prevState,
            issued_at: date
        }));
    }

    const renderInputFieldEditSection = () => {
        return (
            <Container className="l-Manage-equipment__Inputs">
                {/* Row 1 */}
                <Row className="l-Manage-equipment__Inputs--row1 l-Manage-equipment__Inputs--row">
                    {/* Issued On */}
                    <Col className="c-Input c-Input__Reg-no c-Input--edit">
                        <label htmlFor="issued_at">Issued On</label>
                        <DateTimePicker
                            onChange={setIssuedDate}
                            value={licenseData.issued_at}
                            className="c-Form__Date"
                            format="dd/MM/y"
                            onFocus={() => setInputTouched(true)}
                        />
                    </Col>
                    {/* Exp. Date */}
                    <Col className="c-Input c-Input__Reg-no c-Input--edit">
                        <label htmlFor="expires_at">Exp. Date</label>
                        <DateTimePicker
                            onChange={setExpDate}
                            value={licenseData.expires_at}
                            className="c-Form__Date"
                            format="dd/MM/y"
                            onFocus={() => setInputTouched(true)}
                        />
                    </Col>
                </Row>
            </Container>
        )
    }

    // Handler for file input
    const handleFileInputChange = (event) => {
        const fileObj = event.target.files[0];
        console.log(fileObj);
        setLicenseFile(() => fileObj);
    };

    // Handler for deleting file input
    const handleDeleteFile = () => {
        setLicenseFile(() => null);
    };

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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Licenses' activeLink={`/licenses/manage-license/${licenseID}/upload`}>
                <div className="c-Manage-equipment-maintenance c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Equipment-maintenance__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/licenses">Register of Permits, Licenses, Approvals & Certificates</Breadcrumb.Item>
                        <Breadcrumb.Item href={`/licenses/manage-license/${licenseID}`}>Manage Permits/Licenses/Certificates</Breadcrumb.Item>
                        <Breadcrumb.Item active>Upload License</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-equipment__Top c-Main__Top">
                        <h1>Upload License</h1>
                        {/* Add and Cancel button section */}
                        <div className='c-Manage-equipment__Btns'>
                            {
                                inputTouched ?
                                    <button onClick={() => (handleBtn("addLicense"))} type="button" className="c-Btn c-Btn--primary">Upload</button>
                                    :
                                    <button type="button" disabled={true} className="c-Btn c-Btn--disabled">{loading ? "Loading..." : "Upload"}</button>
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
                    {/* File Upload */}
                    {/* Upload Button */}
                    <div className="c-Manage-equipment__Mid c-Main__Top c-File-upload">
                        <div className="c-Manage-equipment__File">
                            {
                                licenseFile ?
                                    <>
                                        <p>{licenseFile.name}</p>
                                        <IconContext.Provider value={{ color: "#DC3545", size: "21px" }}>
                                            <RiIcons.RiDeleteBin7Line className="c-File-upload__Bin" onClick={() => handleDeleteFile()} />
                                        </IconContext.Provider>
                                    </>
                                    : <p>No File Detected.</p>
                            }
                        </div>
                        <button
                            onClick={() => (handleBtn("upload"))}
                            type="button"
                            className={"c-Btn c-Btn--primary"}
                        >
                            Upload File
                        </button>
                        <input className="c-Manage-equipment__File-input c-File-select__Raw" type="file" ref={fileRef} onChange={handleFileInputChange} />
                    </div>
                </div>
            </PageLayout>

        </>
    )
}

export default UploadLicense;