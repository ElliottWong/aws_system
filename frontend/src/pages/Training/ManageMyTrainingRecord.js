import axios from 'axios';
import dayjs from 'dayjs';
import FileDownload from 'js-file-download';
import React, { useEffect, useRef, useState } from 'react';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { confirmAlert } from 'react-confirm-alert';
import { useHistory } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import CustomConfirmAlert from '../../common/CustomConfirmAlert';
import FileSelect from '../../common/FileSelect';
import Loading from '../../common/Loading';
import StatusPill from '../../common/StatusPill';
import config from '../../config/config';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager.js';

const ManageMyTrainingRecord = ({ match }) => {
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const trainingRecordID = match.params.trainingRecordID;
    const decodedToken = TokenManager.getDecodedToken();
    const token = TokenManager.getToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [completedTraining, setCompletedTraining] = useState(null);
    const [myTrainingRecord, setMyTrainingRecord] = useState({});
    const [rerender, setRerender] = useState(false);
    const attendanceFileRef = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                // Get information for training record
                const resMyTrainingRequest = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training/all-requests/${trainingRecordID}`);

                if (componentMounted) {
                    const tempMyTrainingRecord = resMyTrainingRequest.data.results;
                    console.log(tempMyTrainingRecord);
                    setMyTrainingRecord(() => ({
                        id: tempMyTrainingRecord.training_id,
                        organisation: tempMyTrainingRecord.training_institution,
                        course_title: tempMyTrainingRecord.title,
                        cost: tempMyTrainingRecord.training_cost,
                        approver: "@" + tempMyTrainingRecord.approver.account.username,
                        supervisor_evaluation_done: tempMyTrainingRecord.supervisor_evaluation_done,
                        trainee_evaluation_done: tempMyTrainingRecord.trainee_evaluation_done,
                        start_date: dayjs(tempMyTrainingRecord.training_start).format("D MMM YYYY"),
                        end_date: dayjs(tempMyTrainingRecord.training_end).format("D MMM YYYY"),
                        attendance: (() => {
                            if (tempMyTrainingRecord.attendance_upload === null) {
                                return false;
                            } else {
                                return true;
                            }
                        })(),
                        attendance_file: tempMyTrainingRecord.attendance_file,
                        status: tempMyTrainingRecord.status,
                        created_by: "@" + tempMyTrainingRecord.author.account.username
                    }));

                    if (tempMyTrainingRecord.attendance_upload !== null) {
                        setCompletedTraining(() => true);
                    } else {
                        setCompletedTraining(() => false);
                    }

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
    const handleUploadFileBtn = () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='c-Confirm-alert c-Confirm-alert--training-record-file-upload'>
                        <h1>Upload File</h1>
                        <div className="c-Confirm-alert__File">
                            <FileSelect
                                fileRef={attendanceFileRef}
                            />
                            <p>This training record's attendance will be updated to completed upon uploading the file</p>
                        </div>
                        <div className='c-Confirm-alert__Buttons'>
                            <button className="c-Btn c-Btn--primary" onClick={() => (confirmUploadFile(onClose))}>Upload</button>
                            <button className="c-Btn c-Btn--cancel" onClick={() => handleCancelFileUpload(onClose)}> Cancel</button>
                        </div>
                    </div>
                );
            }
        });

        const handleCancelFileUpload = (onClose) => {
            onClose();
        };

        const confirmUploadFile = async (onClose) => {
            setLoading(() => true);
            console.log(attendanceFileRef.current.files[0]);
            const fileObj = attendanceFileRef.current.files[0];
            onClose();

            if (fileObj === null) {
                toast.error("Error! No file detected!");
                return;
            }

            const uploadFileFormData = new FormData();
            uploadFileFormData.append("attendance", fileObj);

            try {
                await axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training/all-requests/${trainingRecordID}`, uploadFileFormData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                });
                setTimeout(() => {
                    toast.success("Success! Attendance file has been submitted!");
                }, 0);
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
            setLoading(() => false);

        };
    };

    const handleCompletePostEvaluation = async () => {
        try {
            // tell the system to start evaluation and lock on one template version
            await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training-evaluation/evaluate-record/${trainingRecordID}`);
            history.push(`/training/records/manage/${trainingRecordID}/post-training-evaluation`);
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

    const handleCancelRecord = () => {
        // Confirmation dialogue for deleting rejected document
        const message = `Canceling this record will cancel its respective request permanently. Click confirm to proceed.`;
        const handler = (onClose) => confirmCancelRecord(onClose);
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

        const confirmCancelRecord = async (onClose) => {
            setLoading(() => true);
            try {
                await axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training/cancel-request/${trainingRecordID}`);
                setTimeout(() => {
                    toast.success("Success! Training record and its training request has been cancelled!");
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
                setLoading(() => false);
            }
            onClose();
        };
    };

    const handleFileDownload = async () => {
        try {
            const fileRes = await axios.get(`${process.env.REACT_APP_BASEURL}/file/download/${myTrainingRecord.attendance_file?.file_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob'
            });
            console.log(fileRes);
            FileDownload(fileRes.data, myTrainingRecord.attendance_file.file_name);
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
                <div className="c-Manage-my-training-record c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Manage-my-training-record__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/training/records">My Training Records</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage My Training Record</Breadcrumb.Item>
                    </Breadcrumb>
                    {
                        loading ?
                            <Loading /> :
                            <>
                                {/* Top section */}
                                <div className="c-Manage-my-training-record__Top c-Main__Top">
                                    <h1>Manage my Training Record</h1>
                                    {
                                        completedTraining === null || myTrainingRecord.status === "cancelled" ?
                                            null :
                                            completedTraining ?
                                                <button type="button" className="c-Btn c-Btn--primary" onClick={() => handleCompletePostEvaluation()}>Complete Post Evaluation</button> :
                                                <button type="button" className="c-Btn c-Btn--primary" onClick={() => handleUploadFileBtn()}>Upload File</button>
                                    }
                                </div>

                                {/* Training records */}
                                <div className="c-Manage-my-training-record__Fields c-Fields">
                                    <div className="c-Fields__Left">
                                        <div className="c-Field">
                                            <h2>Course Title</h2>
                                            <p>{myTrainingRecord.course_title}</p>
                                        </div>
                                        <div className="c-Field">
                                            <h2>Organisation/Institution</h2>
                                            <p>{myTrainingRecord.organisation}</p>
                                        </div>
                                        <div className="c-Field">
                                            <h2>Cost</h2>
                                            <p>{myTrainingRecord.cost}</p>
                                        </div>
                                        <div className="c-Field">
                                            <h2>Evaluation Status (Trainee)</h2>
                                            {
                                                myTrainingRecord.status === "cancelled" ?
                                                    <StatusPill type="cancelled" /> :
                                                    !myTrainingRecord.attendance ?
                                                        <p>Nil</p> :
                                                        myTrainingRecord.trainee_evaluation_done ?
                                                            <StatusPill type="completed" /> :
                                                            <StatusPill type="pending" />
                                            }
                                        </div>
                                        <div className="c-Field">
                                            <h2>File (Evidence for Attendance)</h2>
                                            {
                                                myTrainingRecord.attendance_file ?
                                                    <div className="c-Field__File c-File">
                                                        <h1 onClick={handleFileDownload}>{myTrainingRecord.attendance_file.file_name}</h1>
                                                        {
                                                            myTrainingRecord.status === "cancelled" ?
                                                                null :
                                                                <h2>Change File</h2>
                                                        }
                                                    </div> :
                                                    <p>No file.</p>
                                            }
                                        </div>
                                        <div className="c-Field">
                                            <h2>Trainee</h2>
                                            <p>{myTrainingRecord.created_by}</p>
                                        </div>
                                    </div>
                                    <div className="c-Fields__Right">
                                        <div className="c-Field">
                                            <h2>Start Date</h2>
                                            <p>{myTrainingRecord.start_date}</p>
                                        </div>
                                        <div className="c-Field">
                                            <h2>End Date</h2>
                                            <p>{myTrainingRecord.end_date}</p>
                                        </div>
                                        <div className="c-Field">
                                            <h2>Approver</h2>
                                            <p>{myTrainingRecord.approver}</p>
                                        </div>
                                        <div className="c-Field">
                                            <h2>Evaluation Status (Approver)</h2>
                                            {myTrainingRecord.status === "cancelled" ?
                                                <StatusPill type="cancelled" /> :
                                                !myTrainingRecord.attendance ?
                                                    <p>Nil</p> :
                                                    myTrainingRecord.supervisor_evaluation_done ?
                                                        <StatusPill type="completed" /> :
                                                        <StatusPill type="pending" />
                                            }
                                        </div>
                                        <div className="c-Field">
                                            <h2>Attendance Status</h2>
                                            {
                                                myTrainingRecord.status === "cancelled" ?
                                                    <StatusPill type="cancelled" /> :
                                                    myTrainingRecord.attendance ?
                                                        <StatusPill type="completed" /> :
                                                        <StatusPill type="pending" />
                                            }

                                        </div>
                                    </div>
                                </div>

                                {
                                    myTrainingRecord.status === "cancelled" ?
                                        null :
                                        <>
                                            {/* Danger Zone */}
                                            < div className="c-Manage-my-training-record__Danger c-Danger">
                                                <div className="c-Danger__Top">
                                                    <h1>Danger Zone</h1>
                                                </div>
                                                <div className="c-Danger__Contents">
                                                    <button type="button" className="c-Btn c-Btn--alert-border" onClick={() => handleCancelRecord()}>Cancel record & request</button>
                                                    <p>Performing this action will cancel the record and request permanently. This action cannot be undoned.</p>
                                                </div>

                                            </div>
                                        </>
                                }


                            </>
                    }


                </div>

            </PageLayout>
        </>
    )
}

export default ManageMyTrainingRecord;