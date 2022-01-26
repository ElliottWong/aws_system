import axios from 'axios';
import dayjs from 'dayjs';
import FileDownload from 'js-file-download';
import React, { useEffect, useState } from 'react';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { confirmAlert } from 'react-confirm-alert';
import { useHistory } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import CustomConfirmAlert from '../../common/CustomConfirmAlert';
import StatusPill from '../../common/StatusPill';
import config from '../../config/config';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager.js';

const ManageMyTrainingRequest = ({ match }) => {
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const trainingReqID = match.params.trainingReqID;
    const decodedToken = TokenManager.getDecodedToken();
    const token = TokenManager.getToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [myTrainingRequest, setMyTrainingRequest] = useState({});
    const [rerender, setRerender] = useState(false);

    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                const resMyTrainingRequest = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training/all-requests/${trainingReqID}`);
                if (componentMounted) {
                    const tempMyTrainingRequest = resMyTrainingRequest.data.results;
                    console.log(resMyTrainingRequest);
                    setMyTrainingRequest(() => ({
                        id: tempMyTrainingRequest.training_id,
                        organisation: tempMyTrainingRequest.training_institution,
                        course_title: tempMyTrainingRequest.title,
                        cost: tempMyTrainingRequest.training_cost,
                        approver: "@" + tempMyTrainingRequest.approver.account.username,
                        approval_status: tempMyTrainingRequest.status,
                        start_date: dayjs(tempMyTrainingRequest.training_start).format("D MMM YYYY"),
                        end_date: dayjs(tempMyTrainingRequest.training_end).format("D MMM YYYY"),
                        justification_text: tempMyTrainingRequest.justification_text,
                        justification_upload: tempMyTrainingRequest.justification_upload,
                        justification_upload_filename: tempMyTrainingRequest.justification_file?.file_name,
                        remarks: tempMyTrainingRequest.remarks,
                        attendance_upload: tempMyTrainingRequest.attendance_upload,
                        created_by: "@" + tempMyTrainingRequest.author.account.username
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

    // Handlers
    const handleRemoveOrCancelRequest = () => {
        // Confirmation dialogue for deleting rejected document
        const message = `${myTrainingRequest.approval_status === "rejected" ? "Deleting" : "Removing"} this record will ${myTrainingRequest.approval_status === "rejected" ? "delete" : "remove"} its respective record (if any) permanently. Click confirm to proceed.`;
        const handler = (onClose) => confirmRemoveOrCancelRequest(onClose);
        const heading = `Confirm ${myTrainingRequest.approval_status === "rejected" ? "delete" : "remove"}?`;
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

        const confirmRemoveOrCancelRequest = async (onClose) => {

            try {
                if (myTrainingRequest.approval_status === "rejected") {
                    await axios.delete(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training/rejected-requests/${trainingReqID}`);
                } else {
                    await axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training/cancel-request/${trainingReqID}`);
                }
                setTimeout(() => {
                    toast.success(`Successfully ${myTrainingRequest.approval_status === "rejected" ? "deleted" : "cancelled"}!`);
                }, 0);

                if (myTrainingRequest.approval_status === "rejected") {
                    history.push("/training/requests");
                    return;
                } else {
                    setRerender((prevState) => !prevState);
                }

            } catch (err) {
                console.log(err);
                let errCode = "Error!";
                let errMsg = "Error!";
                if (err.response !== undefined) {
                    errCode = err.response.status;
                    errMsg = err.response.data.message;
                }

                toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
            }
            onClose();
        };
    };

    const handleDownloadFile = async () => {

        try {
            const fileRes = await axios.get(`${process.env.REACT_APP_BASEURL}/file/download/${myTrainingRequest.justification_upload}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob'
            });
            console.log(fileRes);
            FileDownload(fileRes.data, myTrainingRequest.justification_upload_filename);
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
                        <Breadcrumb.Item href="/training/requests">My Training Requests</Breadcrumb.Item>
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
                                <p>{myTrainingRequest.course_title}</p>
                            </div>
                            <div className="c-Field">
                                <h2>Organisation/Institution</h2>
                                <p>{myTrainingRequest.organisation}</p>
                            </div>
                            <div className="c-Field">
                                <h2>Cost</h2>
                                <p>{myTrainingRequest.cost}</p>
                            </div>
                            <div className="c-Field">
                                <h2>Justification</h2>
                                <p>{myTrainingRequest.justification_text}</p>
                            </div>
                            <div className="c-Field">
                                <h2>Rejection Remarks</h2>
                                <p>{myTrainingRequest.remarks ? myTrainingRequest.remarks : "Na"}</p>
                            </div>
                            <div className = "c-Field">
                                <h2>Trainee</h2>
                                <p>{myTrainingRequest.created_by}</p>
                            </div>
                        </div>
                        <div className="c-Fields__Right">
                            <div className="c-Field">
                                <h2>Start Date</h2>
                                <p>{myTrainingRequest.start_date}</p>
                            </div>
                            <div className="c-Field">
                                <h2>End Date</h2>
                                <p>{myTrainingRequest.end_date}</p>
                            </div>
                            <div className="c-Field">
                                <h2>To be Approved by</h2>
                                <p>{myTrainingRequest.approver}</p>
                            </div>
                            <div className="c-Field c-Field__File">
                                <h2>File (For Justification)</h2>
                                {
                                    myTrainingRequest.justification_upload ?
                                        <button type="button" className="c-Btn c-Btn--primary" onClick={handleDownloadFile}>Download</button> :
                                        <p>Na</p>
                                }
                            </div>
                            <div className="c-Field">
                                <h2>Approval Status</h2>
                                <StatusPill type={myTrainingRequest.approval_status} />
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    {

                        myTrainingRequest.approval_status === "rejected" || ((myTrainingRequest.approval_status === "approved" || myTrainingRequest.approval_status === "pending") && !myTrainingRequest.attendance_upload) ?
                            <div className="c-Manage-my-training-request__Danger c-Danger">
                                <div className="c-Danger__Top">
                                    <h1>Danger Zone</h1>
                                </div>
                                <div className="c-Danger__Contents">
                                    <button type="button" className="c-Btn c-Btn--alert-border" onClick={() => handleRemoveOrCancelRequest()}>
                                        {
                                            myTrainingRequest.approval_status === "rejected" ?
                                                "Delete record & request" :
                                                "Cancel record & request"
                                        }
                                    </button>
                                    <p>Performing this action will {myTrainingRequest.approval_status === "rejected" ? "delete" : "cancel"} the request and record (if any) permanently. This action cannot be undoned.</p>
                                </div>

                            </div> :
                            null
                    }


                </div>

            </PageLayout>
        </>
    )
}

export default ManageMyTrainingRequest;
