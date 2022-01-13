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
import { useHistory } from 'react-router-dom';
import { defaultTemplate } from '../../config/trainingEvaluation';
import EvaluationQuestions from '../../common/EvaluationQuestions';
import { QUESTION_TYPE, TRAINING_EVALUATION_MODE } from '../../config/enums';


const CreateEvaluationTemplate = () => {
    const toastTiming = config.toastTiming;
    const history = useHistory();

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [questions, setQuestions] = useState({
        trainee: [],
        supervisor: []
    });
    const [meta, setMeta] = useState({});

    useEffect(() => {
        setQuestions(() => {
   
            const sortedTraineeQnsRaw = defaultTemplate.evaluation.trainee.sort((a, b) => a.order - b.order);
           
            const sortedSupervisorQnsRaw = defaultTemplate.evaluation.supervisor.sort((a, b) => a.order - b.order);

            return {
                trainee: sortedTraineeQnsRaw.map((data, index) => ({
                    ...data,
                    serialNo: index + 1
                })),
                supervisor: sortedSupervisorQnsRaw.map((data, index) => ({
                    ...data,
                    serialNo: index + 1
                })),
            };
        });
        setMeta(() => {
            return defaultTemplate.meta;
        });
    }, []);

    // Handlers
    const handleAddQns = (type) => {
        if (type === "trainee") {
            setQuestions((prevState) => {
                return ({
                    ...prevState,
                    trainee: [
                        ...prevState.trainee,
                        {
                            serialNo: prevState.trainee.length + 1,
                            question: '',
                            answer: '',
                            type: QUESTION_TYPE.DEFAULT
                        }
                    ]
                })
            }
            );
        }
        else {
            setQuestions((prevState) => ({
                ...prevState,
                supervisor: [
                    ...prevState.supervisor,
                    {
                        serialNo: prevState.supervisor.length + 1,
                        question: '',
                        answer: '',
                        type: QUESTION_TYPE.DEFAULT
                    }
                ]
            }));
        }

    };

    const handleInputChange = (event) => {
        setMeta((prevState) => ({
            ...prevState,
            template: {
                ...prevState.template,
                [event.target.name]: event.target.value
            }
        }));
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Create Post Evaluation Template' activeLink="/settings">
                <div className="c-Create-PET c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Create-PET__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/settings">Settings</Breadcrumb.Item>
                        <Breadcrumb.Item href="/settings/trainings">Manage Trainings</Breadcrumb.Item>
                        <Breadcrumb.Item href="/settings/trainings/post-evaluation-templates" >Manage Post Evaluation Templates</Breadcrumb.Item>
                        <Breadcrumb.Item active>Create Post Evaluation Template</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Create-PET__Top c-Main__Top">
                        <h1>Create Post Evaluation Template</h1>
                        <div className="c-Top__Btns">
                            <button type="button" className="c-Btn c-Btn--primary">Create</button>
                            <button type="button" className="c-Btn c-Btn--cancel" onClick={() => history.push("/settings/trainings/post-evaluation-templates")}>Cancel</button>
                        </div>

                    </div>
                    {/* Document Section */}
                    <div className="c-Create-PET__Document c-Main__Document">
                        <DocumentLayout isDocCollapsed={false}>
                            <div className="c-Create-PET__Document-content">
                                {/* Title */}
                                <div className="c-Create-PET__Document-title">
                                    <input type="text" placeholder="Enter form title" name="name" value={meta.template?.name} onChange={(event) => handleInputChange(event)} />
                                </div>

                                {/* Document Header Info */}
                                <div className="c-Create-PET__Document-header c-Document__Header">
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
                                        <input type="text" name="version" value={meta.template?.version} onChange={(event) => handleInputChange(event)} />
                                        <br />
                                        <br />
                                        <br />
                                        <br />
                                    </div>
                                </div>

                                {/* Form section */}
                                <div className="c-Create-PET__Document-form c-Document-form">
                                    {/* Trainee section */}
                                    <div className="c-Document-form__Trainee">
                                        <div className="c-Document-form__Heading">
                                            <h1>Trainee Section</h1>
                                            <p>This section will only be shown to the trainee when doing the form</p>
                                        </div>
                                        <div className="c-Document-form__Fields">
                                            {
                                                questions?.trainee?.length > 0 ?
                                                    questions.trainee.map((question, index) => {
                                                        return (
                                                            <EvaluationQuestions
                                                                mode={TRAINING_EVALUATION_MODE.EDIT}
                                                                qnsType={question.type}
                                                                qns={question.question}
                                                                index={index}
                                                                setQuestions={setQuestions}
                                                                key={index}
                                                                formType="trainee"
                                                            />
                                                        );
                                                    })
                                                    :
                                                    <p>No questions detected!</p>
                                            }
                                            {/* Add Question */}
                                            <div className="c-Document-form__Add-qns" onClick={() => handleAddQns("trainee")}>
                                                <p>Add New Row</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Approver/Supervisor section */}
                                    <div className="c-Document-form__Approver">
                                        <div className="c-Document-form__Heading">
                                            <h1>Approver/Supervisor Section</h1>
                                            <p>This section will only be shown to the approver/supervisor when doing the form</p>
                                        </div>
                                        <div className="c-Document-form__Fields">
                                            {
                                                questions?.supervisor?.length > 0 ?
                                                    questions.supervisor.map((question, index) => {
                                                        return (

                                                            <EvaluationQuestions
                                                                mode={TRAINING_EVALUATION_MODE.EDIT}
                                                                qnsType={question.type}
                                                                qns={question.question}
                                                                index={index}
                                                                setQuestions={setQuestions}
                                                                key={index}
                                                                formType="supervisor"
                                                            />

                                                        );
                                                    })
                                                    :
                                                    <p>No questions detected!</p>
                                            }
                                            {/* Add Question */}
                                            <div className="c-Document-form__Add-qns" onClick={() => handleAddQns("supervisor")}>
                                                <p>Add New Row</p>
                                            </div>
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

export default CreateEvaluationTemplate;