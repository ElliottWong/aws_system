import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { useHistory } from 'react-router-dom';
import StatusPill from '../../common/StatusPill';
import config from '../../config/config';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager.js';
import FileDownload from 'js-file-download';
import { toast, ToastContainer } from 'react-toastify';


const ManageTrainingRecord = ({ match }) => {
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const trainingRecordID = match.params.trainingID;
    const decodedToken = TokenManager.getDecodedToken();
    const token = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [boolCompletedTraining, setBoolCompletedTraining] = useState(false);
    const [trainingRecord, setTrainingRecord] = useState({});

    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                const resTrainingRecord = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training/all-requests/${trainingRecordID}`);

                if (componentMounted) {
                    const tempTrainingRecord = resTrainingRecord.data.results;
                    console.log(tempTrainingRecord);
                    setTrainingRecord(() => ({
                        id: tempTrainingRecord.training_id,
                        organisation: tempTrainingRecord.training_institution,
                        course_title: tempTrainingRecord.title,
                        cost: tempTrainingRecord.training_cost,
                        approver: "@" + tempTrainingRecord.approver.account.username,
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
                        attendance_file: tempTrainingRecord.attendance_file,
                        status: tempTrainingRecord.status,
                        created_by: "@" + tempTrainingRecord.author.account.username
                    }));
                }
            } catch (error) {
                console.log(error);
            }
        })();
        setBoolCompletedTraining(() => true); // temporary

        return (() => {
            componentMounted = false;
        })
    }, []);


    // Handlers
    const handleCompletePostEvaluation = async () => {
        try {
            // tell the system to start evaluation and lock on one template version
            await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training-evaluation/evaluate-record/${trainingRecordID}`);
            history.push(`/training/manage/records/manage/${trainingRecordID}/post-training-evaluation`);
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

    const handleFileDownload = async () => {
        try {
            const fileRes = await axios.get(`${process.env.REACT_APP_BASEURL}/file/download/${trainingRecord.attendance_file?.file_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob'
            });
            console.log(fileRes);
            FileDownload(fileRes.data, trainingRecord.attendance_file.file_name);
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Manage Training Record' activeLink="/training">
                <div className="c-Manage-training-record c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Manage-training-record__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/training/manage/records">Manage Training Records</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Training Record</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-training-record__Top c-Main__Top">
                        <h1>Manage Training Record</h1>
                        {
                            boolCompletedTraining ?
                                <button type="button" className="c-Btn c-Btn--primary" onClick={() => handleCompletePostEvaluation()}>Complete Post Evaluation</button> :
                                null
                        }
                    </div>

                    {/* Training records */}
                    <div className="c-Manage-training-record__Fields c-Fields">
                        <div className="c-Fields__Left">
                            <div className="c-Field">
                                <h2>Course Title</h2>
                                <p>{trainingRecord.course_title}</p>
                            </div>
                            <div className="c-Field">
                                <h2>Organisation/Institution</h2>
                                <p>{trainingRecord.organisation}</p>
                            </div>
                            <div className="c-Field">
                                <h2>Cost</h2>
                                <p>{trainingRecord.cost}</p>
                            </div>
                            <div className="c-Field">
                                <h2>Evaluation Status (Trainee)</h2>
                                {trainingRecord.status === "cancelled" ?
                                    <StatusPill type="cancelled" /> :
                                    !trainingRecord.attendance ?
                                        <p>Nil</p> :
                                        trainingRecord.trainee_evaluation_done ?
                                            <StatusPill type="completed" /> :
                                            <StatusPill type="pending" />
                                }
                            </div>
                            <div className="c-Field">
                                <h2>File (Evidence for Attendance)</h2>
                                {
                                    trainingRecord.attendance_file ?
                                        <div className="c-Field__File c-File">
                                            <h1 onClick={handleFileDownload}>{trainingRecord.attendance_file.file_name}</h1>
                                            {
                                                trainingRecord.status === "cancelled" ?
                                                    null :
                                                    <h2>Change File</h2>
                                            }
                                        </div> :
                                        <p>No file.</p>
                                }
                            </div>
                            <div className="c-Field">
                                <h2>Trainee</h2>
                                <p>{trainingRecord.created_by}</p>
                            </div>
                        </div>
                        <div className="c-Fields__Right">
                            <div className="c-Field">
                                <h2>Start Date</h2>
                                <p>{trainingRecord.start_date}</p>
                            </div>
                            <div className="c-Field">
                                <h2>End Date</h2>
                                <p>{trainingRecord.end_date}</p>
                            </div>
                            <div className="c-Field">
                                <h2>Approver</h2>
                                <p>{trainingRecord.approver}</p>
                            </div>
                            <div className="c-Field">
                                <h2>Evaluation Status (Approver)</h2>
                                {trainingRecord.status === "cancelled" ?
                                    <StatusPill type="cancelled" /> :
                                    !trainingRecord.attendance ?
                                        <p>Nil</p> :
                                        trainingRecord.supervisor_evaluation_done ?
                                            <StatusPill type="completed" /> :
                                            <StatusPill type="pending" />
                                }
                            </div>
                            <div className="c-Field">
                                <h2>Attendance Status</h2>
                                {
                                    trainingRecord.status === "cancelled" ?
                                        <StatusPill type="cancelled" /> :
                                        trainingRecord.attendance ?
                                            <StatusPill type="completed" /> :
                                            <StatusPill type="pending" />
                                }

                            </div>
                        </div>
                    </div>

                </div>

            </PageLayout>
        </>
    )
}

export default ManageTrainingRecord;