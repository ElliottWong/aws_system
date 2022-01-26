import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { useHistory } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import config from '../../config/config';
import { manageAllTrainingRequestsColumns, managePendingTrainingRequestsColumns, manageAllTrainingRecordsColumns } from '../../config/tableColumns';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager.js';
import ErrorCard from '../../common/ErrorCard';
import paginationFactory from 'react-bootstrap-table2-paginator';

const ManageTrainingRequests = () => {
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [isApprover, setIsApprover] = useState(false);
    const [pendingTrainingRequests, setPendingTrainingRequests] = useState([]);
    const [trainingRequests, setTrainingRequests] = useState([]);

    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                // Check if user can approve this training
                const resApprover = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m07_03a/employees`);

                // Check if user is approver of this clause
                const approverListData = resApprover.data.results;
                let tempIsApprover = false;
                if (approverListData !== undefined) {
                    approverListData.every((approver) => {
                        if (approver.employee_id === userID) {
                            tempIsApprover = true;
                            return false;
                        }
                        return true;
                    });
                }

                if (!tempIsApprover) {
                    return;
                }

                setIsApprover(() => true);

                // Get pending training requests under users's approval //TODO
                const resPendingTrainingRequests = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training/pending-requests`);

                // Get all training requests under user's approval TODO
                const resTrainingRequests = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training/requests-approver`);

                if (componentMounted) {

                    // Pending Requests
                    const tempPendingTrainingRequests = resPendingTrainingRequests.data.results;
                    console.log(tempPendingTrainingRequests);
                    setPendingTrainingRequests(() => tempPendingTrainingRequests.map((data, index) => ({
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
                        created_by: "@" + data.author?.account?.username,
                        action_manage: `/training/manage/requests/manage/${data.training_id}`
                    })));

                    // Training requests
                    const tempTrainingRequests = resTrainingRequests.data.results;
                    console.log(tempTrainingRequests)
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
                        created_by: "@" + data.author?.account?.username,
                        action_manage: `/training/manage/requests/manage/${data.training_id}`
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Manage Training Requests' activeLink="/training">
                <div className="c-Manage-training-requests c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Manage-training-requests__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Training Requests</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-training-requests__Top c-Main__Top">
                        <h1>Manage Training Requests</h1>
                    </div>

                    {
                        isApprover ?
                            <>
                                {/* Training requests pending for user's approval*/}
                                < div className="c-Manage-training-requests__Pending">
                                    <h2>Training Requests pending for your approval</h2>
                                    <div className="c-Manage-trainings__Table">
                                        {
                                            pendingTrainingRequests.length === 0 ?
                                                "No records found." :
                                                <BootstrapTable
                                                    bordered={false}
                                                    keyField='serialNo'
                                                    data={pendingTrainingRequests}
                                                    columns={managePendingTrainingRequestsColumns}
                                                    pagination={paginationFactory()}
                                                />
                                        }
                                    </div>
                                </div>

                                <div className="c-Manage-training-requests__All">
                                    <h2>All Training Requests (Under your approval)</h2>
                                    <div className="c-Manage-training-requests__Table">
                                        {
                                            trainingRequests.length === 0 ?
                                                "No records found." :
                                                <BootstrapTable
                                                    bordered={false}
                                                    keyField='serialNo'
                                                    data={trainingRequests}
                                                    columns={manageAllTrainingRequestsColumns}
                                                    pagination={paginationFactory()}
                                                />
                                        }
                                    </div>
                                </div>
                            </>
                            :
                            <div className="c-Manage-training-requests__Non-approver">
                                <ErrorCard
                                    errMsg="You are not permitted to approve trainings"
                                    errStatus="403"
                                />
                            </div>
                    }


                </div>

            </PageLayout>
        </>
    );
};

export default ManageTrainingRequests;