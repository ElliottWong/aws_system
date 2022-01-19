import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
import TokenManager from '../../utilities/tokenManager.js';
import FileDownload from 'js-file-download';
import { toast } from 'react-toastify';

const ManageTrainingRequest = ({ match }) => {

    const toastTiming = config.toastTiming;
    const history = useHistory();
    const trainingReqID = match.params.trainingReqID;
    const rejectRemarks = useRef("");
    const decodedToken = TokenManager.getDecodedToken();
    const token = TokenManager.getToken();
    const userCompanyID = decodedToken.company_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [trainingRequest, setTrainingRequest] = useState({});


    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                const resTrainingRecord = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training/all-requests/${trainingReqID}`);

                if (componentMounted) {
                    const tempTrainingRecord = resTrainingRecord.data.results;
                    console.log(tempTrainingRecord);
                    setTrainingRequest(() => ({
                        id: tempTrainingRecord.training_id,
                        organisation: tempTrainingRecord.training_institution,
                        course_title: tempTrainingRecord.title,
                        cost: tempTrainingRecord.training_cost,
                        approver: tempTrainingRecord.approved_at,
                        supervisor_evaluation_done: tempTrainingRecord.supervisor_evaluation_done,
                        trainee_evaluation_done: tempTrainingRecord.trainee_evaluation_done,
                        start_date: dayjs(tempTrainingRecord.training_start).format("D MMM YYYY"),
                        end_date: dayjs(tempTrainingRecord.training_end).format("D MMM YYYY"),
                        attendance: (() => {
                            if (tempTrainingRecord.attendance_upload === null) {
                                return false;
                            } else {
                                return true;
                            }
                        })(),
                    }));
                }
            } catch (error) {
                console.log(error);
            }
        })();

        return (() => {
            componentMounted = false;
        })
    }, []);

    // #region Handlers
    const handleApprove = () => {

    };


    const handleReject = () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='c-Confirm-alert c-Confirm-alert--pending-reject'>
                        <h1>Confirm Reject?</h1>
                        <p>Please key in reason for rejection and click on confirm reject.</p>
                        <div className="c-Confirm-alert__Remarks">
                            <h2>Remarks</h2>
                            <textarea name="pendingReject" ref={rejectRemarks}></textarea>
                        </div>
                        <div className='c-Confirm-alert__Buttons'>
                            <button className="c-Btn c-Btn--alert" onClick={() => (confirmReject(onClose))}>Confirm Reject</button>
                            <button className="c-Btn c-Btn--dark" onClick={onClose}> Cancel</button>
                        </div>
                    </div>
                );
            }
        });

        const confirmReject = (onClose) => {

        };
    };

    const handleDownloadFile = async () => {

        try {
            const fileInfoRes = await axios.get(`${process.env.REACT_APP_BASEURL}/file/info/${trainingRequest.justification_upload}`);
            const fileRes = await axios.get(`${process.env.REACT_APP_BASEURL}/file/download/${trainingRequest.justification_upload}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob'
            });
            console.log(fileInfoRes);
            console.log(fileRes);
            FileDownload(fileRes.data, fileInfoRes.data.results.file_name);
            toast.success(<>Success!<br />Message: <b>Document has been downloaded successfully!</b></>);
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

    // #endregion


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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Manage Training Request' activeLink="/training">
                <div className="c-Manage-training-request c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Manage-training-request__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/training/manage">Manage Trainings</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Training Request</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-training-request__Top c-Main__Top">
                        <h1>Manage Training Request</h1>
                        <div className="c-Top__Btns">
                            <button type="button" className="c-Btn c-Btn--ok" onClick={() => handleApprove()}>Approve</button>
                            <button type="button" className="c-Btn c-Btn--alert" onClick={() => handleReject()}>Reject</button>
                        </div>
                    </div>

                    {/* Training records */}
                    <div className="c-Manage-training-request__Fields c-Fields">
                        <div className="c-Fields__Left">
                            <div className="c-Field">
                                <h2>Course Title</h2>
                                <p>{trainingRequest.course_title}</p>
                            </div>
                            <div className="c-Field">
                                <h2>Organisation/Institution</h2>
                                <p>{trainingRequest.organisation}</p>
                            </div>
                            <div className="c-Field">
                                <h2>Cost</h2>
                                <p>{trainingRequest.cost}</p>
         
                            </div>
                            <div className="c-Field">
                                <h2>Justification</h2>
                                <p>{trainingRequest.justification_text}</p>
                            </div>
                            <div className="c-Field">
                                <h2>Rejection Remarks</h2>
                                <p>{trainingRequest.remarks ? trainingRequest.remarks : "Na"}</p>
                            </div>
                        </div>
                        <div className="c-Fields__Right">
                        <div className="c-Field">
                                <h2>Start Date</h2>
                                <p>{trainingRequest.start_date}</p>
                            </div>
                            <div className="c-Field">
                                <h2>End Date</h2>
                                <p>{trainingRequest.end_date}</p>
                            </div>
                            <div className="c-Field">
                                <h2>To be Approved by</h2>
                                <p>@AppleKim</p>
                            </div>
                            <div className="c-Field c-Field__File">
                                <h2>File (For Justification)</h2>
                                {
                                    trainingRequest.justification_upload ?
                                        <button type="button" className="c-Btn c-Btn--primary" onClick = {handleDownloadFile}>Download</button> :
                                        <p>Na</p>
                                }
                            </div>
                            <div className="c-Field">
                                <h2>Approval Status</h2>
                                <StatusPill type={trainingRequest.approval_status} />
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="c-Manage-training-request__Danger c-Danger">
                        <div className="c-Danger__Top">
                            <h1>Danger Zone</h1>
                        </div>
                        <div className="c-Danger__Contents">
                            <button type="button" className="c-Btn c-Btn--alert-border">Remove record & request</button>
                            <p>Performing this action will remove the request and record (if any) permanently. This action cannot be undoned.</p>
                        </div>

                    </div>

                </div>

            </PageLayout>
        </>
    )
}

export default ManageTrainingRequest;