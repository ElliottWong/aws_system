import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { QUESTION_TYPE, TRAINING_EVALUATION_MODE } from '../../config/enums';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { useHistory, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import config from '../../config/config';
import DocumentLayout from '../../layout/DocumentLayout';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager.js';
import EvaluationQuestions from '../../common/EvaluationQuestions';
import dayjs from 'dayjs';


const PostEvaluationForm = ({ match }) => {

    const toastTiming = config.toastTiming;
    const history = useHistory();
    const location = useLocation();
    const pathname = location.pathname;
    const pathnameArr = pathname.split("/");
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [questions, setQuestions] = useState([]);
    const [editQuestions, setEditQuestions] = useState([]);
    const [meta, setMeta] = useState({});
    const [formType, setFormType] = useState(null);
    const [editMode, setEditMode] = useState(false);

    const trainingRecordID = match.params.trainingRecordID;

    useEffect(() => {
        let componentMounted = true;

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

        (async () => {
            try {
                const trainingRecordRes = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training/all-requests/${trainingRecordID}`);
                console.log(trainingRecordRes)
                if (componentMounted) {
                    const tempTrainingRecord = trainingRecordRes.data.results;
                    setMeta(() => ({
                        course_title: tempTrainingRecord.title,
                        organisation: tempTrainingRecord.training_institution,
                        cost: tempTrainingRecord.training_cost,
                        status: "Completed",
                        trainee: "@" + tempTrainingRecord.author.account.username,
                        supervisor: "@" + tempTrainingRecord.approver.account.username,
                        start_date: dayjs(new Date(tempTrainingRecord.training_start)).format("MMMM D, YYYY"),
                        end_date: dayjs(new Date(tempTrainingRecord.training_end)).format("MMMM D, YYYY"),
                        version: tempTrainingRecord.evaluation.meta.template.version,
                        form_title: tempTrainingRecord.evaluation.meta.template.name
                    }));

                    setQuestions(() => {
                        // Approver
                        if (pathnameArr[2] === "manage") {
                            return tempTrainingRecord.evaluation.evaluation.supervisor.map((data) => ({
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
                            }));
                        }
                        // trainee
                        else {
                            return tempTrainingRecord.evaluation.evaluation.trainee.map((data) => ({
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
                            }));
                        }
                    });

                    setEditQuestions(() => {
                        // Approver
                        if (pathnameArr[2] === "manage") {
                            return tempTrainingRecord.evaluation.evaluation.supervisor.map((data) => ({
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
                            }));
                        }
                        // trainee
                        else {
                            return tempTrainingRecord.evaluation.evaluation.trainee.map((data) => ({
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
                            }));
                        }
                    });
                }
            } catch (error) {
                console.log(error);
            }
            if (componentMounted) {

            }
        })();
        console.log("ran use effect")

        return (() => {
            componentMounted = false;
        });
    }, [editMode]);

    const handleSubmitPostEvaluation = async () => {
        try {
            let axiosBodyData = {};
            console.log(editQuestions)
            // Approver/supervisor
            if (pathnameArr[2] === "manage") {
                axiosBodyData = {
                    supervisor_evaluation_done: true,
                    supervisor: editQuestions
                };
            }
            // Trainee
            else {
                axiosBodyData = {
                    trainee_evaluation_done: true,
                    trainee: editQuestions
                }
            }
            await axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training-evaluation/evaluate-record/${trainingRecordID}`, axiosBodyData);

            toast.success("You have successfully modified your evaluation!");
            setEditMode(() => false);

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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Post Evaluation Form' activeLink="/training">
                <div className="c-Post-evaluation-form c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Post-evaluation-form__Breadcrumb l-Breadcrumb">
                        {
                            formType !== "approver" ?
                                <>
                                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                                    <Breadcrumb.Item href="/training">My Training Records</Breadcrumb.Item>
                                    <Breadcrumb.Item href={`/training/records/manage/${trainingRecordID}`}>Manage My Training Record</Breadcrumb.Item>
                                    <Breadcrumb.Item active>Post Training Evaluation</Breadcrumb.Item>
                                </> :
                                <>
                                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                                    <Breadcrumb.Item href="/training/manage">Assigned Records</Breadcrumb.Item>
                                    <Breadcrumb.Item href={`/training/manage/records/manage/${trainingRecordID}`}>Manage Training</Breadcrumb.Item>
                                    <Breadcrumb.Item active>Post Training Evaluation</Breadcrumb.Item>
                                </>
                        }

                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Post-evaluation-form__Top c-Main__Top">
                        <h1>Post Training Evaluation</h1>
                        {
                            editMode ?
                                <div className="c-Post-evaluation-form__Btns">
                                    <button type="button" className="c-Btn c-Btn--primary" onClick={() => handleSubmitPostEvaluation()}>Submit</button>
                                    <button type="button" className="c-Btn c-Btn--cancel" onClick={() => setEditMode((prevState) => !prevState)}>Cancel</button>
                                </div>
                                :
                                <button type="button" className="c-Btn c-Btn--primary" onClick={() => setEditMode((prevState) => !prevState)}>Edit</button>

                        }

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
                                        <p>{meta.course_title}</p>
                                        <p>{meta.organisation}</p>
                                        <p>{meta.cost}</p>
                                        <p>{meta.status}</p>
                                        <p>{meta.version}</p>
                                        <p>{meta.trainee}</p>
                                        <p>{meta.supervisor}</p>
                                        <p>{meta.start_date}</p>
                                        <p>{meta.end_date}</p>
                                    </div>
                                </div>
                                {/* Form section - edit mode */}
                                <div className="c-Post-evaluation-form__Document-form c-Document-form c-Document-form--edit">
                                    <div className="c-Document-form__Heading">
                                        <h1>{formType === "approver" ? "Approver" : "Trainee"} Section</h1>
                                    </div>
                                    <div className="c-Document-form__Fields">
                                        {
                                            questions.length > 0 ?
                                                editMode ?
                                                    editQuestions.map((data, index) =>
                                                        <EvaluationQuestions
                                                            mode={TRAINING_EVALUATION_MODE.DO}
                                                            qns={data.question}
                                                            viewType={data.displayType}
                                                            index={index}
                                                            setQuestions={setEditQuestions}
                                                            formType={formType}
                                                            key={index}
                                                            answer={data.answer}
                                                        />
                                                    ) :
                                                    questions.map((data, index) =>
                                                        <EvaluationQuestions
                                                            mode={TRAINING_EVALUATION_MODE.VIEW}
                                                            qns={data.question}
                                                            viewType={data.displayType}
                                                            index={index}
                                                            setQuestions={setQuestions}
                                                            formType={formType}
                                                            key={index}
                                                            answer={data.answer}
                                                        />
                                                    )
                                                :
                                                "No questions"
                                        }
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