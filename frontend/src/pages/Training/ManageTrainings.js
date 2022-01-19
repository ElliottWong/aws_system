import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageLayout from '../../layout/PageLayout';
import DocumentLayout from '../../layout/DocumentLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import { managePendingTrainingRequestsColumns, manageAllTrainingRequestsColumns, manageAllTrainingRecordsColumns } from '../../config/tableColumns';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import BootstrapTable from 'react-bootstrap-table-next';
import dayjs from 'dayjs';
import { ToastContainer } from 'react-toastify';
import config from '../../config/config';
import { useHistory } from 'react-router-dom';
import TokenManager from '../../utilities/tokenManager.js';

const ManageTrainings = () => {

    const toastTiming = config.toastTiming;
    const history = useHistory();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [trainingRequests, setTrainingRequests] = useState([]);
    const [trainingRecords, setTrainingRecords] = useState([]);


    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                 // Get training requests of this user //TODO
                 const resTrainingRequests = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employee/${userID}/training-requests`);

                 // Get training records of this user
                 const resTrainingRecords = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employee/${userID}/training-records`);
 
                 if (componentMounted) {
                     const tempTrainingRequests = resTrainingRequests.data.results;
                     const tempTrainingRecords = resTrainingRecords.data.results;
                     console.log(resTrainingRequests);
                     console.log(resTrainingRecords);
                     setTrainingRequests(() => tempTrainingRequests.map((data, index) => ({
                         id: data.training_id,
                         serialNo: index + 1,
                         course_title: data.title,
                         approver: data.approved_at,
                         start_date: dayjs(data.training_start).format("D MMM YYYY"),
                         end_date: dayjs(data.training_end).format("D MMM YYYY"),
                         attendance: (() => {
                             if (data.attendance_upload === null) {
                                 return false;
                             } else {
                                 return true;
                             }
                         })(),
                         request_status: data.status,
                         supervisor_evaluation_done: data.supervisor_evaluation_done,
                         trainee_evaluation_done: data.trainee_evaluation_done,
                         action_manage: `/training/training-request/manage/${data.training_id}`
                     })));
 
                     setTrainingRecords(() => tempTrainingRecords.map((data, index) => ({
                         id: data.training_id,
                         serialNo: index + 1,
                         course_title: data.title,
                         approver: data.approved_at,
                         start_date: dayjs(data.training_start).format("D MMM YYYY"),
                         end_date: dayjs(data.training_end).format("D MMM YYYY"),
                         attendance: (() => {
                             if (data.attendance_upload === null) {
                                 return false;
                             } else {
                                 return true;
                             }
                         })(),
                         request_status: data.status,
                         supervisor_evaluation_done: data.supervisor_evaluation_done,
                         trainee_evaluation_done: data.trainee_evaluation_done,
                         action_manage: `/training/training-record/manage/${data.training_id}`
                     })));
                 }
            } catch (error) {
                console.log(error);
            }
        })();

        return (() => {
            componentMounted = false;
        })
    }, []);

    // Fake data
    const fakeTrainingRecordsData = [
        {
            id: 1,
            serialNo: 1,
            course_title: "Direct Integration Consultant Upskilling Workshop",
            approver: "@AppleKim",
            start_date: dayjs(new Date()).format("D MMM YYYY"),
            end_date: dayjs(new Date()).format("D MMM YYYY"),
            evaluation: (() => {
                // if (new Date() < new Date()) {
                //     return "active";
                // } 
                // TODO: algorithm to determine status
                return undefined;
            })(),
            attendance: (() => {
                return undefined
            })(),
            action_manage: ""
        },
        {
            id: 2,
            serialNo: 2,
            course_title: "Human Quality Engineer Upskilling Workshop",
            approver: "@AppleKim",
            start_date: dayjs(new Date()).format("D MMM YYYY"),
            end_date: dayjs(new Date()).format("D MMM YYYY"),
            evaluation: (() => {
                // if (new Date() < new Date()) {
                //     return "active";
                // } 
                // TODO: algorithm to determine status
                return undefined;
            })(),
            attendance: (() => {
                return undefined
            })(),
            action_manage: ""
        },
    ];



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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Manage Trainings' activeLink="/training">
                <div className="c-Manage-trainings c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Manage-trainings__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Trainings</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-trainings__Top c-Main__Top">
                        <h1>Manage Trainings</h1>
                        <button type = "button" className="c-Btn c-Btn--primary" onClick={() => history.push("/settings/trainings/post-evaluation-templates")}>Manage Post Evaluation Templates</button>
                    </div>
                    {/* Training requests pending for user's approval*/}
                    <div className="c-Manage-trainings__Pending-requests">
                        <h2>Training Requests pending for your approval</h2>
                        <div className="c-Manage-trainings__Table">
                            <BootstrapTable
                                bordered={false}
                                keyField='serialNo'
                                data={fakeTrainingRecordsData}
                                columns={managePendingTrainingRequestsColumns}
                            // pagination={paginationFactory()}
                            />
                        </div>
                    </div>

                    {/* All Training requests */}
                    <div className="c-Manage-trainings__Requests c-Requests">
                        <h2>All Training Requests</h2>
                        <div className="c-Manage-trainings__Table">
                            <BootstrapTable
                                bordered={false}
                                keyField='serialNo'
                                data={fakeTrainingRecordsData}
                                columns={manageAllTrainingRequestsColumns}
                            // pagination={paginationFactory()}
                            />
                        </div>
                    </div>

                    {/* All Training Records */}
                    <div className="c-Manage-trainings__Records c-Requests">
                        <h2>All Training Records</h2>
                        <div className="c-Manage-trainings__Table">
                            <BootstrapTable
                                bordered={false}
                                keyField='serialNo'
                                data={fakeTrainingRecordsData}
                                columns={manageAllTrainingRequestsColumns}
                            // pagination={paginationFactory()}
                            />
                        </div>
                    </div>

                </div>

            </PageLayout>
        </>
    );
};

export default ManageTrainings;