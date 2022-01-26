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

const UploadMaintenance = ({ match }) => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const toastTiming = config.toastTiming;
    let history = useHistory();
    const equipmentID = match.params.emID;
    const maintenanceID = match.params.maintenanceID;
    const fileRef = useRef(null);

    // State declarations
    const [loading, setLoading] = useState(false);
    const [inputTouched, setInputTouched] = useState(false);
    const [recordData, setRecordData] = useState({
        serviced_at: new Date(),
        description: ''
    });
    const [userList, setUserList] = useState([]);
    const [renderErrorCard, setRenderErrorCard] = useState({
        render: false,
        errMsg: null,
        errStatus: null,
        errStatusText: null
    });
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [recordFile, setRecordFile] = useState(null);

    const handleBtn = (buttonType) => {
        if (buttonType === "addRecord") {
            // Handler for add button
            console.log(recordData);
            (async () => {
                try {
                    let newRecordFormData = new FormData();
                    // Loop through a javascript object and append the fields to the form data variable
                    for (const property in recordData) {
                        newRecordFormData.append(property, recordData[property]);
                    }
                    newRecordFormData.append("maintenance", recordFile);
                    console.log(newRecordFormData);
                    console.log(newRecordFormData.get("maintenance"));

                    const resUploadOneRecord = await axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment/${equipmentID}/all-maintenance/${maintenanceID}/uploads`,
                        newRecordFormData, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    console.log(resUploadOneRecord);
                    setTimeout(() => {
                        toast.success(<>Success!<br />Message: <b>New maintenance record has been uploaded!</b></>);
                    }, 0);
                    history.push(`/equipment-maintenance/manage-equipment/${equipmentID}/manage-cycle/${maintenanceID}`);
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
            history.push(`/equipment-maintenance/manage-equipment/${equipmentID}/manage-cycle/${maintenanceID}`);
        }

        if (buttonType === "upload") {
            // Handler for upload button
            fileRef.current.click();
        }
    }

    // Handler for input 
    const handleInputChange = (event) => {
        setRecordData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }

    // Handler for setting last service date 
    const setExpDate = (date) => {
        console.log(date);
        setRecordData((prevState) => ({
            ...prevState,
            expires_at: date
        }));
    }

    // Handler for setting last service date 
    const setLastServiceDate = (date) => {
        console.log(date);
        setRecordData((prevState) => ({
            ...prevState,
            serviced_at: date
        }));
    }

    const renderInputFieldEditSection = () => {
        return (
            <Container className="l-Manage-equipment__Inputs">
                {/* Row 1 */}
                <Row className="l-Manage-equipment__Inputs--row1 l-Manage-equipment__Inputs--row">
                    {/* Last Service Date */}
                    <Col className="c-Input c-Input__Reg-no c-Input--edit">
                        <label htmlFor="serviced_at">Update Last Service Date</label>
                        <DateTimePicker
                            onChange={setLastServiceDate}
                            value={recordData.serviced_at}
                            className="c-Form__Date"
                            format="dd/MM/y"
                            onFocus={() => setInputTouched(true)}
                        />
                    </Col>
                    {/* Description */}
                    <Col className="c-Input c-Input__Reg-no c-Input--edit">
                        <label htmlFor="description">Description</label>
                        <textarea onFocus={() => setInputTouched(true)} name="description" value={recordData.description} onChange={handleInputChange}></textarea>
                    </Col>
                </Row>
            </Container>
        )
    }

    // Handler for file input
    const handleFileInputChange = (event) => {
        const fileObj = event.target.files[0];
        console.log(fileObj);
        setRecordFile(() => fileObj);
    };

    // Handler for deleting file input
    const handleDeleteFile = () => {
        setRecordFile(() => null);
    };

    useEffect(() => {
        (async () => {
            try {
                let tempUserData = [];
                // Get all users with permission to upload license
                const resClausePermission = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m07_01/employees`);
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Licenses' activeLink={`/equipment-maintenance/manage-equipment/${equipmentID}`}>
                <div className="c-Manage-equipment-maintenance c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Equipment-maintenance__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/equipment-maintenance">Equipment Maintenance Program</Breadcrumb.Item>
                        <Breadcrumb.Item href={`/equipment-maintenance/manage-equipment/${equipmentID}`}>Manage Equipment</Breadcrumb.Item>
                        <Breadcrumb.Item href={`/equipment-maintenance/manage-equipment/${equipmentID}/manage-cycle/${maintenanceID}`}>Manage Maintenance Cycle</Breadcrumb.Item>
                        <Breadcrumb.Item active>Upload Maintenance Record</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-equipment__Top c-Main__Top">
                        <h1>Upload Maintenance Record</h1>
                        {/* Add and Cancel button section */}
                        <div className='c-Manage-equipment__Btns'>
                            {
                                inputTouched ?
                                    <button onClick={() => (handleBtn("addRecord"))} type="button" className="c-Btn c-Btn--primary">Upload</button>
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
                                recordFile ?
                                    <>
                                        <p>{recordFile.name}</p>
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

export default UploadMaintenance;