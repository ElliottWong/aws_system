import React, { useState, useEffect } from 'react';
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

const ManageTrainingRecord = ({ match }) => {
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const trainingRecordID = match.params.trainingID;
    const decodedToken = TokenManager.getDecodedToken();
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
        setBoolCompletedTraining(() => true); // temporary

        return (() => {
            componentMounted = false;
        })
    }, []);


    const handleCompletePostEvaluation = () => {
        history.push("/training/training-record/post-training-evaluation");
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
                        <Breadcrumb.Item href="/training/manage">Manage Trainings</Breadcrumb.Item>
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
                                {
                                    !trainingRecord.attendance ?
                                        <p>Nil</p> :
                                        trainingRecord.trainee_evaluation_done ?
                                            <StatusPill type="pending" /> :
                                            <StatusPill type="completed" />
                                }
                            </div>
                            <div className="c-Field">
                                <h2>File (Evidence for Attendance)</h2>
                                <p>Na</p>
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
                                <p>@AppleKim</p>
                            </div>
                            <div className="c-Field">
                                <h2>Evaluation Status (Approver)</h2>
                                {
                                    !trainingRecord.attendance ?
                                        <p>Nil</p> :
                                        trainingRecord.supervisor_evaluation_done ?
                                            <StatusPill type="pending" /> :
                                            <StatusPill type="completed" />
                                }
                            </div>
                            <div className="c-Field">
                                <h2>Attendance Status</h2>
                                {
                                    trainingRecord.attendance ?
                                        <StatusPill type="completed" /> :
                                        <StatusPill type="pending" />
                                }

                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="c-Manage-training-record__Danger c-Danger">
                        <div className="c-Danger__Top">
                            <h1>Danger Zone</h1>
                        </div>
                        <div className="c-Danger__Contents">
                            <button type="button" className="c-Btn c-Btn--alert-border">Remove record & request</button>
                            <p>Performing this action will remove the record and request permanently. This action cannot be undoned.</p>
                        </div>

                    </div>

                </div>

            </PageLayout>
        </>
    )
}

export default ManageTrainingRecord;