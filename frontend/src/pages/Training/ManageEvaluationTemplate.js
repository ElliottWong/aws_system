import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { useHistory } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import EvaluationQuestions from '../../common/EvaluationQuestions';
import StatusPill from '../../common/StatusPill';
import config from '../../config/config';
import { QUESTION_TYPE, TRAINING_EVALUATION_MODE } from '../../config/enums';
import DocumentLayout from '../../layout/DocumentLayout';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager.js';

const ManageEvaluationTemplate = ({ match }) => {
    const templateID = match.params.templateID;
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [questions, setQuestions] = useState({
        trainee: [],
        supervisor: []
    }); // Includes answers
    const [editQuestions, setEditQuestions] = useState({
        trainee: [],
        supervisor: []
    });
    const [meta, setMeta] = useState({});
    const [editMeta, setEditMeta] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [rerender, setRerender] = useState(false);

    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                const resOneTemplate = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training-evaluation/all-templates/${templateID}`);

                if (componentMounted) {
                    console.log(resOneTemplate)
                    const tempOneTemplate = resOneTemplate.data.results;

                    setQuestions(() => ({
                        trainee: tempOneTemplate.template.evaluation.trainee.map((data, index) => ({
                            ...data,
                            displayType: (() => {
                                if (data.type === "rating") {
                                    return QUESTION_TYPE.RATING;
                                } else if (data.type === "open") {
                                    return QUESTION_TYPE.OPEN;
                                } else if (data.type === "bool") {
                                    return QUESTION_TYPE.BOOLEAN;
                                } else {
                                    return QUESTION_TYPE.DEFAULT;
                                }
                            })()
                        })),
                        supervisor: tempOneTemplate.template.evaluation.supervisor.map((data) => ({
                            ...data,
                            displayType: (() => {
                                if (data.type === "rating") {
                                    return QUESTION_TYPE.RATING;
                                } else if (data.type === "open") {
                                    return QUESTION_TYPE.OPEN;
                                } else if (data.type === "bool") {
                                    return QUESTION_TYPE.BOOLEAN;
                                } else {
                                    return QUESTION_TYPE.DEFAULT;
                                }
                            })()
                        }))
                    }));

                    setEditQuestions(() => ({
                        trainee: tempOneTemplate.template.evaluation.trainee.map((data, index) => ({
                            ...data,
                            displayType: (() => {
                                if (data.type === "rating") {
                                    return QUESTION_TYPE.RATING;
                                } else if (data.type === "open") {
                                    return QUESTION_TYPE.OPEN;
                                } else if (data.type === "bool") {
                                    return QUESTION_TYPE.BOOLEAN;
                                } else {
                                    return QUESTION_TYPE.DEFAULT;
                                }
                            })()
                        })),
                        supervisor: tempOneTemplate.template.evaluation.supervisor.map((data) => ({
                            ...data,
                            displayType: (() => {
                                if (data.type === "rating") {
                                    return QUESTION_TYPE.RATING;
                                } else if (data.type === "open") {
                                    return QUESTION_TYPE.OPEN;
                                } else if (data.type === "bool") {
                                    return QUESTION_TYPE.BOOLEAN;
                                } else {
                                    return QUESTION_TYPE.DEFAULT;
                                }
                            })()
                        }))
                    }));

                    setMeta(() => ({
                        created_by: tempOneTemplate.author.account.username,
                        name: tempOneTemplate.name,
                        version: tempOneTemplate.version,
                        active: tempOneTemplate.active
                    }));

                    setEditMeta(() => ({
                        created_by: tempOneTemplate.author.account.username,
                        name: tempOneTemplate.name,
                        version: tempOneTemplate.version,
                        active: tempOneTemplate.active
                    }));
                }
            } catch (error) {
                console.log(error);
            }

        })();

        return (() => {
            componentMounted = false;
        });
    }, [editMode, rerender]);

    // Handlers

    const handleInputChange = (event) => {
        setEditMeta((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    };

    const handleSubmitNewTemplate = async () => {

        const formattedTemplateData = {
            name: editMeta.name,
            version: editMeta.version,
            evaluation: editQuestions,
            immediate: true
        }

        try {
            // TODO
            await axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training-evaluation/all-templates`, formattedTemplateData);
            setTimeout(() => {
                toast.success("Success! A new post evaluation form has been created!");
            }, 0);
            history.push("/training/post-evaluation-templates");

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

    const handleActivateTemplate = async () => {
        try {
            await axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training-evaluation/all-templates/${templateID}/activate`, {});
            toast.success("Template has been successfully activated!");
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
                        <Breadcrumb.Item href="/training/post-evaluation-templates" >Manage Post Evaluation Templates</Breadcrumb.Item>
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
                                            <button type="button" className="c-Btn c-Btn--primary" onClick={() => handleSubmitNewTemplate()}>Create</button>
                                            <button type="button" className="c-Btn c-Btn--cancel" onClick={() => setEditMode((prevState) => !prevState)}>Cancel</button>
                                        </>
                                        :
                                        <button type="button" className="c-Btn c-Btn--primary" onClick={() => setEditMode((prevState) => !prevState)}>Edit & Submit New Version</button>
                                }

                            </div>
                        </div>
                        <div className="c-Top__Row">
                            <h2>Status:</h2>
                            {
                                meta.active ?
                                    <StatusPill type="active" />
                                    :
                                    <>
                                        <StatusPill type="inactive" />
                                        <button type="button" className="c-Btn c-Btn--link" onClick={() => handleActivateTemplate()}>Change Status to Active</button>
                                    </>
                            }

                        </div>

                    </div>
                    {/* Document Section */}
                    <div className="c-Manage-PET__Document c-Main__Document">
                        <DocumentLayout isDocCollapsed={false}>
                            <div className="c-Manage-PET__Document-content">
                                {/* Title */}
                                {
                                    editMode ?
                                        <div className="c-Manage-PET__Document-title">
                                            <input type="text" placeholder="Enter form title" name="name" value={editMeta.name || ''} onChange={(event) => handleInputChange(event)} />
                                        </div> :
                                        <h1>{meta.name || "Error"}</h1>
                                }

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
                                        {
                                            editMode ?
                                                <input type="text" name="version" value={editMeta.version || 'Error'} onChange={(event) => handleInputChange(event)} /> :
                                                <input type="text" name="version" value={meta.version || 'Error'} disabled />
                                        }

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
                                            {
                                                questions.trainee?.length > 0 ?
                                                    editMode ?
                                                        editQuestions.trainee?.map((data, index) =>
                                                            <EvaluationQuestions
                                                                mode={TRAINING_EVALUATION_MODE.EDIT}
                                                                qns={data.question}
                                                                qnsType={data.displayType}
                                                                index={index}
                                                                setQuestions={setEditQuestions}
                                                                formType="trainee"
                                                                key={index}
                                                            />
                                                        ) :
                                                        questions.trainee?.map((data, index) =>
                                                            <EvaluationQuestions
                                                                mode={TRAINING_EVALUATION_MODE.VIEW}
                                                                qns={data.question}
                                                                viewType={data.displayType}
                                                                index={index}
                                                                setQuestions={setQuestions}
                                                                formType="trainee"
                                                                key={index}
                                                            />
                                                        ) :
                                                    "No questions"
                                            }

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
                                                questions.supervisor?.length > 0 ?
                                                    editMode ?
                                                        editQuestions.supervisor?.map((data, index) =>
                                                            <EvaluationQuestions
                                                                mode={TRAINING_EVALUATION_MODE.EDIT}
                                                                qns={data.question}
                                                                qnsType={data.displayType}
                                                                index={index}
                                                                setQuestions={setEditQuestions}
                                                                formType="supervisor"
                                                                key={index}
                                                            />
                                                        ) :
                                                        questions.supervisor?.map((data, index) =>
                                                            <EvaluationQuestions
                                                                mode={TRAINING_EVALUATION_MODE.VIEW}
                                                                qns={data.question}
                                                                viewType={data.displayType}
                                                                index={index}
                                                                setQuestions={setQuestions}
                                                                formType="supervisor"
                                                                key={index}
                                                            />
                                                        ) :
                                                    "No questions"
                                            }
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