import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import DateTimePicker from 'react-datetime-picker';
import { IconContext } from 'react-icons';
import * as RiIcons from 'react-icons/ri';
import { useHistory } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import config from '../../config/config';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager.js';

const CreateTrainingRequest = () => {
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;
    const token = TokenManager.getToken();

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [approverList, setApproverList] = useState([]);
    const [newTrainingRequest, setNewTrainingRequest] = useState({
        title: "",
        training_start: new Date(),
        training_end: new Date(),
        training_institution: "",
        training_cost: "",
        justification_text: "",
        approved_by: undefined
    });
    const [newJustificationFile, setNewJustificationFile] = useState(null);
    const fileRef = useRef(null);

    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {

                // Do axios call here to get approval list then set approved by who
                const resApprover = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m07_03a/employees`);
                if (componentMounted) {
                    console.log(resApprover)
                    const approverListData = resApprover.data.results;
                    if (approverListData !== undefined) {
                        setApproverList(() => {
                            if (approverListData.length === 0) {
                                return null;
                            }
                            return approverListData.map((acc) => ({
                                displayName: `${acc.firstname} ${acc.lastname}`,
                                username: `@${acc.account.username}`,
                                approvalID: acc.employee_id
                            }));
                        });
                    }
                }
            } catch (error) {
                console.log(error);
            }
        })();

        return (() => {
            componentMounted = false;
        });
    }, []);

    // Handlers
    const handleSubmitTrainingRequest = async () => {
        try {
            const newTrainingRequestFormData = new FormData();
            // Loop through a javascript object and append the fields to the form data variable
            for (const property in newTrainingRequest) {
                newTrainingRequestFormData.append(property, newTrainingRequest[property]);
            }

            newTrainingRequestFormData.append("justification", newJustificationFile);
            console.log(userCompanyID)
            await axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training/all-requests`, newTrainingRequestFormData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            setTimeout(() => {
                toast.success("Success! Training requets has been submitted for approval!");
            }, 0);
            history.push("/training");

        } catch (err) {
            console.log(err);
            let errCode = "Error!";
            let errMsg = "Error!"
            if (err.response !== undefined) {
                errCode = err.response.status;
                errMsg = err.response.data.message;
            }

            toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
        }
    };

    const handleInputChange = (event) => {
        setNewTrainingRequest((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    };

    const handleDateChange = (date, name) => {
        setNewTrainingRequest((prevState) => ({
            ...prevState,
            [name]: date
        }));
    };

    const handleFileSelect = () => {
        fileRef.current.click();
    };

    const handleFileInputChange = (event) => {
        const fileObj = event.target.files[0];
        console.log(fileObj);
        setNewJustificationFile(() => fileObj);
    };

    const handleDeleteFile = () => {
        setNewJustificationFile(() => null);
    };


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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Create Training Request' activeLink="/training">
                <div className="c-Create-training-request c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Create-training-request__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/training">Trainings</Breadcrumb.Item>
                        <Breadcrumb.Item active>Create Training Request</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Create-training-request__Top c-Main__Top">
                        <h1>Create Training Request</h1>
                        <button type="button" className="c-Btn c-Btn--primary" onClick={() => handleSubmitTrainingRequest()}>Create Training Request</button>
                    </div>

                    {/* Form */}
                    <div className="c-Create-training-request__Form c-Form">
                        {/* Course Title & Start Date */}
                        <div className="c-Form__Row">
                            <div className="c-Form__Left c-Form__Input">
                                <label htmlFor="title">Course Title</label>
                                <input name="title" value={newTrainingRequest.title} type="text" placeholder="Enter Course Title" onChange={handleInputChange} />
                            </div>
                            <div className="c-Form__Right c-Form__Input">
                                <label htmlFor="startDate">Start Date</label>
                                <DateTimePicker
                                    onChange={(date) => handleDateChange(date, "training_start")}
                                    value={newTrainingRequest.training_start}
                                    className="c-Form__Date"
                                    format="dd/MM/y"
                                />
                            </div>
                        </div>
                        {/* Organisation/Institution & End Date */}
                        <div className="c-Form__Row">
                            <div className="c-Form__Left c-Form__Input">
                                <label htmlFor="training_institution">Organisation/Institution</label>
                                <input name="training_institution" value={newTrainingRequest.training_institution} type="text" placeholder="Enter Organisation/Instition" onChange={handleInputChange} />
                            </div>
                            <div className="c-Form__Right c-Form__Input">
                                <label htmlFor="endDate">End Date</label>
                                <DateTimePicker
                                    onChange={(date) => handleDateChange(date, "training_end")}
                                    value={newTrainingRequest.training_end}
                                    className="c-Form__Date"
                                    format="dd/MM/y"
                                />
                            </div>
                        </div>
                        {/* Cost & To be approved by */}
                        <div className="c-Form__Row">
                            <div className="c-Form__Left c-Form__Input">
                                <label htmlFor="training_cost">Cost</label>
                                <input name="training_cost" value={newTrainingRequest.training_cost} type="text" placeholder="Enter training cost S$" onChange={handleInputChange} />
                            </div>
                            <div className="c-Form__Right c-Form__Input">
                                <label htmlFor="approved_by">To be approved by</label>
                                <select name="approved_by" className="c-Form__Approver" value={newTrainingRequest.approved_by} onChange={handleInputChange}>
                                    <option>{!approverList ? "No approver found!" : "Please select an approver"}</option>
                                    {!approverList ? null : approverList.map((approver, index) => (
                                        <option key={index} value={approver.approvalID}>
                                            {approver.displayName}  {approver.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {/* Justification & Recommendations */}
                        <div className="c-Form__Row">
                            <div className="c-Form__Left c-Form__Input c-Form__Justification">
                                <label htmlFor="justification_text">Justification</label>
                                <textarea name="justification_text" value={newTrainingRequest.justification_text} type="text" placeholder="Enter Justification" onChange={handleInputChange} />
                            </div>
                        </div>
                        {/* File Upload (For justification) */}
                        <div className="c-Form__Row">
                            <div className="c-Form__File-upload c-File-upload">
                                <h2>File (For Justification)</h2>
                                <div className="c-File-upload__Display">
                                    {
                                        newJustificationFile ?
                                            <>
                                                <p>{newJustificationFile.name}</p>
                                                <IconContext.Provider value={{ color: "#DC3545", size: "21px" }}>
                                                    <RiIcons.RiDeleteBin7Line className = "c-File-upload__Bin" onClick={() => handleDeleteFile()} />
                                                </IconContext.Provider>
                                            </>
                                            : <p>No File Detected.</p>
                                    }
                                </div>
                                <button type="button" className="c-Btn c-Btn--primary" onClick={() => handleFileSelect()}>Upload File</button>
                                <input className="c-File-select__Raw" type="file" ref={fileRef} onChange={handleFileInputChange} />
                            </div>
                        </div>
                    </div>

                </div>

            </PageLayout>
        </>
    )
}

export default CreateTrainingRequest;