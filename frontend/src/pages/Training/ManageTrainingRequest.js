import axios from 'axios';
import dayjs from 'dayjs';
import FileDownload from 'js-file-download';
import React, { useEffect, useRef, useState } from 'react';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { confirmAlert } from 'react-confirm-alert';
import { useHistory } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import StatusPill from '../../common/StatusPill';
import config from '../../config/config';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager.js';

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
    const [rerender, setRerender] = useState(false);


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
                        approver: "@" + tempTrainingRecord.approver.account.username,
                        approval_status: tempTrainingRecord.status,
                        start_date: dayjs(tempTrainingRecord.training_start).format("D MMM YYYY"),
                        end_date: dayjs(tempTrainingRecord.training_end).format("D MMM YYYY"),
                        justification_text: tempTrainingRecord.justification_text,
                        justification_upload: tempTrainingRecord.justification_upload,
                        justification_upload_filename: tempTrainingRecord.justification_file?.file_name,
                        remarks: tempTrainingRecord.remarks,
                        created_by: "@" + tempTrainingRecord.author.account.username
                    }));
                }
            } catch (error) {
                console.log(error);
            }
        })();

        return (() => {
            componentMounted = false;
        })
    }, [rerender]);

    // #region Handlers
    const handleApprove = async () => {
        try {
            await axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training/approve-request/${trainingReqID}`);
            toast.success("Success! Training request has been approved!");
            setRerender((prevState) => !prevState);
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

        const confirmReject = async (onClose) => {
            try {
                await axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training/reject-request/${trainingReqID}`, {
                    remarks: rejectRemarks.current.value
                });
                toast.success("Success! Training request has been rejected!");
                setRerender((prevState) => !prevState);
                onClose();
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
    };

    const handleDownloadFile = async () => {

        try {
            const fileRes = await axios.get(`${process.env.REACT_APP_BASEURL}/file/download/${trainingRequest.justification_upload}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob'
            });
            console.log(fileRes);
            FileDownload(fileRes.data, trainingRequest.justification_upload_filename);
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
                        <Breadcrumb.Item href="/training/manage/requests">Manage Training Requests</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Training Request</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-training-request__Top c-Main__Top">
                        <h1>Manage Training Request</h1>
                        {
                            trainingRequest.approval_status === "pending" ?
                                <div className="c-Top__Btns">
                                    <button type="button" className="c-Btn c-Btn--ok" onClick={() => handleApprove()}>Approve</button>
                                    <button type="button" className="c-Btn c-Btn--alert" onClick={() => handleReject()}>Reject</button>
                                </div>
                                : null
                        }

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
                            <div className = "c-Field">
                                <h2>Trainee</h2>
                                <p>{trainingRequest.created_by}</p>
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
                                <p>{trainingRequest.approver}</p>
                            </div>
                            <div className="c-Field c-Field__File">
                                <h2>File (For Justification)</h2>
                                {
                                    trainingRequest.justification_upload ?
                                        <button type="button" className="c-Btn c-Btn--primary" onClick={handleDownloadFile}>Download</button> :
                                        <p>Na</p>
                                }
                            </div>
                            <div className="c-Field">
                                <h2>Approval Status</h2>
                                <StatusPill type={trainingRequest.approval_status} />
                            </div>
                        </div>
                    </div>

                </div>

            </PageLayout>
        </>
    )
}

export default ManageTrainingRequest;