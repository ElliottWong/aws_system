import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import DocumentLayout from '../../layout/DocumentLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import { managePETColumns } from '../../config/tableColumns';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import BootstrapTable from 'react-bootstrap-table-next';
import dayjs from 'dayjs';
import { ToastContainer } from 'react-toastify';
import config from '../../config/config';
import { NavLink, useHistory } from 'react-router-dom';
import { defaultTemplate } from '../../config/trainingEvaluation';
import EvaluationQuestions from '../../common/EvaluationQuestions';
import { QUESTION_TYPE, TRAINING_EVALUATION_MODE } from '../../config/enums';
import StatusPill from '../../common/StatusPill';

const ManageEvaluationTemplate = ({ match }) => {

    const toastTiming = config.toastTiming;
    const history = useHistory();
    const templateID = match.params.templateID;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [questions, setQuestions] = useState({
        trainee: [],
        supervisor: []
    }); // Includes answers
    const [editMode, setEditMode] = useState(false);

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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Manage Post Evaluation Template' activeLink="/settings">
                <div className="c-Manage-PET c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Manage-PET__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/settings">Settings</Breadcrumb.Item>
                        <Breadcrumb.Item href="/settings/trainings">Manage Trainings</Breadcrumb.Item>
                        <Breadcrumb.Item href="/settings/trainings/post-evaluation-templates" >Manage Post Evaluation Templates</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Post Evaluation Template</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-PET__Top c-Top">
                        <div className="c-Top__Row">
                            <h1>Manage Post Evaluation Template</h1>
                            <div className="c-Top__Btns">
                                {
                                    editMode ?
                                        <>
                                            <button type="button" className="c-Btn c-Btn--primary">Create</button>
                                            <button type="button" className="c-Btn c-Btn--cancel" onClick={() => setEditMode((prevState) => !prevState)}>Cancel</button>
                                        </>
                                        :
                                        <button type="button" className="c-Btn c-Btn--primary" onClick={() => setEditMode((prevState) => !prevState)}>Edit</button>
                                }

                            </div>
                        </div>
                        <div className="c-Top__Row">
                            <h2>Status:</h2>
                            <StatusPill type="active" />
                            <button type = "button" className = "c-Btn c-Btn--link">Change Status to Active</button>
                        </div>

                    </div>
                    {/* Document Section */}
                    <div className="c-Manage-PET__Document c-Main__Document">
                        <DocumentLayout isDocCollapsed={false}>
                            <div className="c-Manage-PET__Document-content">
                                {/* Title */}
                                <h1>Post Training Evaluation Form 2022</h1>
                                {/* Document Header Info */}
                                <div className="c-Manage-PET__Document-header c-Document__Header">
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
                                        <br />
                                        <br />
                                        <br />
                                        <br />
                                        <input type="text" value="PTEF.2022.1" disabled/>
                                        <br />
                                        <br />
                                        <br />
                                        <br />
                                    </div>
                                </div>

                                {/* Form section */}
                                <div className="c-Manage-PET__Document-form c-Document-form">
                                    {/* Trainee section */}
                                    <div className="c-Document-form__Trainee">
                                        <div className="c-Document-form__Heading">
                                            <h1>Trainee Section</h1>
                                            <p>This section will only be shown to the trainee when doing the form</p>
                                        </div>
                                        <div className="c-Document-form__Fields">
                                            <EvaluationQuestions
                                                mode={TRAINING_EVALUATION_MODE.VIEW}
                                                qns="Boolean?"
                                                viewType={QUESTION_TYPE.OPEN}
                                                index="1"
                                                setQuestions={setQuestions}
                                                formType="trainee"
                                            />
                                            <EvaluationQuestions
                                                mode={TRAINING_EVALUATION_MODE.VIEW}
                                                qns="Boolean?"
                                                viewType={QUESTION_TYPE.RATING}
                                                index="1"
                                                setQuestions={setQuestions}
                                                formType="trainee"
                                            />
                                            <EvaluationQuestions
                                                mode={TRAINING_EVALUATION_MODE.VIEW}
                                                qns="Boolean?"
                                                viewType={QUESTION_TYPE.BOOLEAN}
                                                index="1"
                                                setQuestions={setQuestions}
                                                formType="trainee"
                                            />
                                        </div>
                                    </div>

                                    {/* Approver/Supervisor section */}
                                    <div className="c-Document-form__Approver">
                                        <div className="c-Document-form__Heading">
                                            <h1>Approver/Supervisor Section</h1>
                                            <p>This section will only be shown to the approver/supervisor when doing the form</p>
                                        </div>
                                        <div className="c-Document-form__Fields">
                                            <EvaluationQuestions
                                                mode={TRAINING_EVALUATION_MODE.VIEW}
                                                qns="A question?"
                                                index="1"
                                                viewType={QUESTION_TYPE.OPEN}
                                            />
                                        </div>
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

export default ManageEvaluationTemplate;