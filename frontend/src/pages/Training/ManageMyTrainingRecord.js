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
import StatusPill from '../../common/StatusPill';
import { confirmAlert } from 'react-confirm-alert';
import FileSelect from '../../common/FileSelect';
import CustomConfirmAlert from '../../common/CustomConfirmAlert';

const ManageMyTrainingRecord = ({ match }) => {
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const trainingRecordID = match.params.trainingRecordID;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [boolCompletedTraining, setBoolCompletedTraining] = useState(false);


    // Handlers
    const handleUploadFileBtn = () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='c-Confirm-alert c-Confirm-alert--training-record-file-upload'>
                        <h1>Upload File</h1>
                        <div className="c-Confirm-alert__File">
                            <FileSelect />
                            <p>This training record's attendance will be updated to completed upon uploading the file</p>
                        </div>
                        <div className='c-Confirm-alert__Buttons'>
                            <button className="c-Btn c-Btn--primary" onClick={() => (confirmUploadFile(onClose))}>Upload</button>
                            <button className="c-Btn c-Btn--cancel" onClick={onClose}> Cancel</button>
                        </div>
                    </div>
                );
            }
        });

        const confirmUploadFile = (onClose) => {

        };
    };

    const handleCompletePostEvaluation = () => {
        history.push(`/training/training-record/manage/${trainingRecordID}/post-training-evaluation`);
    };

    const handleRemoveRecord = () => {
        // Confirmation dialogue for deleting rejected document
        const message = `Deleting this record will remove its respective request permanently. Click confirm to proceed.`;
        const handler = (onClose) => confirmRemoveRecord(onClose);
        const heading = `Confirm Delete?`;
        const type = "alert"
        const data = {
            message,
            handler,
            heading,
            type
        };
        confirmAlert({
            customUI: ({ onClose }) => {
                return <CustomConfirmAlert {...data} onClose={onClose} />;
            }
        });

        const confirmRemoveRecord = () => {

        };
    };

    useEffect(() => {
        setBoolCompletedTraining(() => true); // temporary
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Manage My Training Record' activeLink="/settings">
                <div className="c-Manage-my-training-record c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Manage-my-training-record__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/training">Trainings</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage My Training Record</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-my-training-record__Top c-Main__Top">
                        <h1>Manage my Training Record</h1>
                        {
                            boolCompletedTraining ?
                                <button type="button" className="c-Btn c-Btn--primary" onClick={() => handleCompletePostEvaluation()}>Complete Post Evaluation</button> :
                                <button type="button" className="c-Btn c-Btn--primary" onClick={() => handleUploadFileBtn()}>Upload File</button>
                        }
                    </div>

                    {/* Training records */}
                    <div className="c-Manage-my-training-record__Fields c-Fields">
                        <div className="c-Fields__Left">
                            <div className="c-Field">
                                <h2>Course Title</h2>
                                <p>Housekeeping Essentials Workshop</p>
                            </div>
                            <div className="c-Field">
                                <h2>Organisation/Institution</h2>
                                <p>Samsung Asia Pte Ltd</p>
                            </div>
                            <div className="c-Field">
                                <h2>Cost</h2>
                                <p>S$1599.90</p>
                            </div>
                            <div className="c-Field">
                                <h2>Evaluation Status</h2>
                                <p>Na</p>
                            </div>
                            <div className="c-Field">
                                <h2>File (Evidence for Attendance)</h2>
                                <p>Na</p>
                            </div>
                        </div>
                        <div className="c-Fields__Right">
                            <div className="c-Field">
                                <h2>Start Date</h2>
                                <p>6/1/2022</p>
                            </div>
                            <div className="c-Field">
                                <h2>End Date</h2>
                                <p>7/1/2022</p>
                            </div>
                            <div className="c-Field">
                                <h2>Approver</h2>
                                <p>@AppleKim</p>
                            </div>
                            <div className="c-Field">
                                <h2>Attendance Status</h2>
                                <StatusPill type="pending" />
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="c-Manage-my-training-record__Danger c-Danger">
                        <div className="c-Danger__Top">
                            <h1>Danger Zone</h1>
                        </div>
                        <div className="c-Danger__Contents">
                            <button type="button" className="c-Btn c-Btn--alert-border" onClick={() => handleRemoveRecord()}>Remove record & request</button>
                            <p>Performing this action will remove the record and request permanently. This action cannot be undoned.</p>
                        </div>

                    </div>

                </div>

            </PageLayout>
        </>
    )
}

export default ManageMyTrainingRecord;