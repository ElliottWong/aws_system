import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import DocumentLayout from '../../layout/DocumentLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import { myTrainingRecordsColumns, myTrainingRequestsColumns } from '../../config/tableColumns';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import BootstrapTable from 'react-bootstrap-table-next';
import dayjs from 'dayjs';
import { ToastContainer } from 'react-toastify';
import config from '../../config/config';
import { useHistory } from 'react-router-dom';
import DateTimePicker from 'react-datetime-picker';


const CreateTrainingRequest = () => {
    const toastTiming = config.toastTiming;
    const history = useHistory();

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [testDate, setTestDate] = useState(new Date());

    // Handlers
    const handleSubmitTrainingRequest = () => {

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
                                <label htmlFor="courseTitle">Course Title</label>
                                <input name="courseTitle" type="text" placeholder="Enter Course Title" />
                            </div>
                            <div className="c-Form__Right c-Form__Input">
                                <label htmlFor="startDate">Start Date</label>
                                <DateTimePicker
                                    onChange={setTestDate}
                                    value={testDate}
                                    className="c-Form__Date"
                                />
                            </div>
                        </div>
                        {/* Organisation/Institution & End Date */}
                        <div className="c-Form__Row">
                            <div className="c-Form__Left c-Form__Input">
                                <label htmlFor="organisation">Organisation/Institution</label>
                                <input name="organisation" type="text" placeholder="Enter Organisation/Instition" />
                            </div>
                            <div className="c-Form__Right c-Form__Input">
                                <label htmlFor="endDate">End Date</label>
                                <DateTimePicker
                                    onChange={setTestDate}
                                    value={testDate}
                                    className="c-Form__Date"
                                />
                            </div>
                        </div>
                        {/* Cost & To be approved by */}
                        <div className="c-Form__Row">
                            <div className="c-Form__Left c-Form__Input">
                                <label htmlFor="cost">Cost</label>
                                <input name="cost" type="text" placeholder="Enter training cost S$" />
                            </div>
                            <div className="c-Form__Right c-Form__Input">
                                <label htmlFor="approver">To be approved by</label>
                                <select name = "approver">
                                    <option>Select an approver</option>
                                </select>
                            </div>
                        </div>
                        {/* Justification & Recommendations */}
                        <div className="c-Form__Row">
                            <div className="c-Form__Left c-Form__Input">
                                <label htmlFor="justification">Justification</label>
                                <textarea name="justification" type="text" placeholder="Enter Justification" />
                            </div>
                            <div className="c-Form__Right c-Form__Input">
                                <label htmlFor="recommendations">Recommendations</label>
                                <textarea name="recommendations" type="text" placeholder="Enter Recommendations" />
                            </div>
                        </div>
                        {/* File Upload (For justification) */}
                        <div className="c-Form__Row">
                            <div className="c-Form__File-upload">
                                <h2>File (For Justification)</h2>
                                <p>No File Detected.</p>
                                <button type="button" className="c-Btn c-Btn--primary">Upload File</button>
                            </div>
                        </div>
                    </div>

                </div>

            </PageLayout>
        </>
    )
}

export default CreateTrainingRequest;