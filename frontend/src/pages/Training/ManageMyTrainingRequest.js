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

const ManageMyTrainingRequest = ({match}) => {
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const trainingReqID = match.params.trainingReqID;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed

    // Handlers
    const handleRemoveRecord = () => {
        // Confirmation dialogue for deleting rejected document
        const message = `Deleting this record will remove its respective record (if any) permanently. Click confirm to proceed.`;
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
                <div className="c-Manage-my-training-request c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Manage-my-training-request__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/training">Trainings</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage My Training Request</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-my-training-request__Top c-Main__Top">
                        <h1>Manage my Training Request</h1>
                    </div>

                    {/* Training records */}
                    <div className="c-Manage-my-training-request__Fields c-Fields">
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
                            <div className = "c-Field">
                                <h2>Justification</h2>
                                <p>I need to learn how to clean my house better! #wfh #uncondusive_working_environment</p>
                            </div>
                            <div className="c-Field">
                                <h2>File (For Justification)</h2>
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
                                <h2>To be Approved by</h2>
                                <p>@AppleKim</p>
                            </div>
                            <div className = "c-Field">
                                <h2>Other Recommendations</h2>
                                <p>Nil</p>
                            </div>
                            <div className="c-Field">
                                <h2>Approval Status</h2>
                                <StatusPill type="pending" />
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="c-Manage-my-training-request__Danger c-Danger">
                        <div className="c-Danger__Top">
                            <h1>Danger Zone</h1>
                        </div>
                        <div className="c-Danger__Contents">
                            <button type="button" className="c-Btn c-Btn--alert-border" onClick = {() => handleRemoveRecord()}>Remove record & request</button>
                            <p>Performing this action will remove the request and record (if any) permanently. This action cannot be undoned.</p>
                        </div>

                    </div>

                </div>

            </PageLayout>
        </>
    )
}

export default ManageMyTrainingRequest;
