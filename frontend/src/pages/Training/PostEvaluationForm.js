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
    const currentPath = location.pathname;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [questions, setQuestions] = useState([]);
    const trainingRecordID = match.params.trainingRecordID;
    let formType = null;
    const currentPathArr = currentPath.split("/");
    if (currentPathArr.length > 0) {
        if (currentPathArr[0] === "training") {
            formType = "trainee";
        } else if (currentPathArr[0] === "settings") {
            formType = "approver";
        } else {
            console.log("Error! Invalid path");
        }
    } else {
        console.log("Error! Invalid path");
    }

    if (formType !== "trainee" && formType !=="approver" ) {
        history.push("/page-not-found");
    }


    const handleSubmitPostEvaluation = () => {

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
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/training">Trainings</Breadcrumb.Item>
                        <Breadcrumb.Item href="/training/training-record">Manage My Training Record</Breadcrumb.Item>
                        <Breadcrumb.Item active>Post Training Evaluation</Breadcrumb.Item>
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

                                <div className = "c-Post-evaluation-form__Document-form">
                                    
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