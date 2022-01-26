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

const ManageTrainingRecords = () => {
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [isApprover, setIsApprover] = useState(false);
    const [trainingRecords, setTrainingRecords] = useState([]);


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

                // Get all training records under user's approval
                const resTrainingRecords = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training/approved-records`);
                console.log(resTrainingRecords);

                if (componentMounted) {
                    // Training records
                    const tempTrainingRecords = resTrainingRecords.data.results;
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
                        created_by: "@" + data.author?.account?.username,
                        action_manage: `/training/manage/records/manage/${data.training_id}`
                    })));
                }
            } catch (error) {
                console.log(error);
            }
        })();

        return (() => {
            componentMounted = false;
        });
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Manage Training Records' activeLink="/training">
                <div className="c-Manage-training-records c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Manage-training-records__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Training Records</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-training-records__Top c-Main__Top">
                        <h1>Manage Training Records (Under your approval)</h1>
                    </div>

                    {
                        isApprover ?
                            <div className="c-Manage-training-records__Table">
                                {
                                    trainingRecords.length === 0 ?
                                        "No records found." :
                                        <BootstrapTable
                                            bordered={false}
                                            keyField='serialNo'
                                            data={trainingRecords}
                                            columns={manageAllTrainingRecordsColumns}
                                            pagination={paginationFactory()}
                                        />
                                }

                            </div>
                            :
                            <div className="c-Manage-training-records__Non-approver">
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

export default ManageTrainingRecords;
