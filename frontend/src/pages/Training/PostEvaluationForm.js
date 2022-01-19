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
import { useHistory, useLocation } from 'react-router-dom';
import StatusPill from '../../common/StatusPill';
import EvaluationQuestions from '../../common/EvaluationQuestions';
import { QUESTION_TYPE, TRAINING_EVALUATION_MODE } from '../../config/enums';

const PostEvaluationForm = ({ match }) => {

    const toastTiming = config.toastTiming;
    const history = useHistory();
    const location = useLocation();
    const pathname = location.pathname;
    const pathnameArr = pathname.split("/");

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [questions, setQuestions] = useState([]);
    const [formType, setFormType] = useState(null);

    const trainingRecordID = match.params.trainingRecordID;

    useEffect(() => {

        if (pathnameArr[1] === "training") {
            // As an approver
            if (pathnameArr[2] === "manage") {
                setFormType(() => "approver");
            }
            // As a trainee
            else {
                setFormType(() => "trainee");
            }
        } else {
            history.push("/page-not-found");
        }

    }, []);

    const handleSubmitPostEvaluation = () => {
        console.log("Clicked on submit");
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Post Evaluation Form' activeLink="/training">
                <div className="c-Post-evaluation-form c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Post-evaluation-form__Breadcrumb l-Breadcrumb">
                        {
                            formType === "approver" ?
                                <>
                                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                                    <Breadcrumb.Item href="/training">Trainings</Breadcrumb.Item>
                                    <Breadcrumb.Item href={`/training/training-record/manage/${trainingRecordID}`}>Manage My Training Record</Breadcrumb.Item>
                                    <Breadcrumb.Item active>Post Training Evaluation</Breadcrumb.Item>
                                </> :
                                <>
                                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                                    <Breadcrumb.Item href="/training/manage">Manage Trainings</Breadcrumb.Item>
                                    <Breadcrumb.Item href={`/training/manage/training-record/manage/${trainingRecordID}`}>Manage Training</Breadcrumb.Item>
                                    <Breadcrumb.Item active>Post Training Evaluation</Breadcrumb.Item>
                                </>
                        }

                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Post-evaluation-form__Top c-Main__Top">
                        <h1>Post Training Evaluation</h1>
                        <button type="button" className="c-Btn c-Btn--primary" onClick={() => handleSubmitPostEvaluation()}>Submit</button>
                    </div>

                    {/* Form */}
                    <div className="c-Post-evaluation-form__Document c-Main__Document">
                        <DocumentLayout isDocCollapsed={false}>
                            <div className="c-Post-evaluation-form__Document-content">
                                {/* Title */}
                                <h1>Post Training Evaluation Form 2022</h1>
                                {/* Document header info */}
                                <div className="c-Post-evaluation-form__Document-header">
                                    <div className="c-Document-header__Key">
                                        <p>Course Title</p>
                                        <p>Organisation</p>
                                        <p>Cost</p>
                                        <p>Status</p>
                                        <p>Evaluation Form Version</p>
                                        <p>Trainee</p>
                                        <p>Approver</p>
                                        <p>Start Date</p>
                                        <p>End Date</p>
                                    </div>
                                    <div className="c-Document-header__Value">
                                        <p>Housekeeping Essentials Workshop</p>
                                        <p>Samsung Asia Pte Ltd</p>
                                        <p>S$1599.90</p>
                                        <p>Completed</p>
                                        <p>PTEF.2022.1</p>
                                        <p>@bobSong</p>
                                        <p>@appleKim</p>
                                        <p>6/1/2022</p>
                                        <p>7/1/2022</p>
                                    </div>
                                </div>
                                {/* Form section - edit mode */}
                                <div className="c-Post-evaluation-form__Document-form c-Document-form c-Document-form--edit">
                                    <div className="c-Document-form__Heading">
                                        <h1>{formType === "approver" ? "Approver" : "Trainee"} Section</h1>
                                    </div>
                                    <div className="c-Document-form__Fields">

                                    </div>
                                </div>
                            </div>
                        </DocumentLayout>
                    </div>

                </div>

            </PageLayout>
        </>
    )
}

export default PostEvaluationForm;