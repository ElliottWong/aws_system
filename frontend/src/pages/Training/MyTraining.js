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
import TokenManager from '../../utilities/tokenManager.js';

const MyTraining = () => {
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [myTrainingRecords, setMyTrainingRecords] = useState([]);
    const [myTrainingRequests, setMyTrainingRequests] = useState([]);

    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                // Get training requests of this user //TODO
                const resMyTrainingRequests = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employee/${userID}/training-requests`);

                // Get training records of this user
                const resMyTrainingRecords = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employee/${userID}/training-records`);

                if (componentMounted) {
                    const tempMyTrainingRequests = resMyTrainingRequests.data.results;
                    const tempMyTrainingRecords = resMyTrainingRecords.data.results;
                    console.log(resMyTrainingRequests);
                    console.log(resMyTrainingRecords);
                    setMyTrainingRequests(() => tempMyTrainingRequests.map((data, index) => ({
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

                    setMyTrainingRecords(() => tempMyTrainingRecords.map((data, index) => ({
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Training' activeLink="/training">
                <div className="c-Training c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Training__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Training</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Training__Top c-Main__Top">
                        <h1>Training</h1>
                    </div>
                    {/* Training records */}
                    <div className="c-Training__Records">
                        <h2>My Training Records</h2>
                        <div className="c-Training__Table">
                            {
                                myTrainingRecords.length === 0 ?
                                    "No records found!" :
                                    <BootstrapTable
                                        bordered={false}
                                        keyField='serialNo'
                                        data={myTrainingRecords}
                                        columns={myTrainingRecordsColumns}
                                    // pagination={paginationFactory()}
                                    />
                            }
                        </div>
                    </div>

                    {/* Training request */}
                    <div className="c-Training__Requests c-Requests">
                        <div className="c-Requests__Top">
                            <h2>My Training Requests</h2>
                            <button onClick={() => history.push("/training/training-request/create")} type="button" className="c-Btn c-Btn--primary">Create Training Request</button>
                        </div>

                        <div className="c-Training__Table">
                            {
                                myTrainingRequests.length === 0 ?
                                    "No records found!" :
                                    <BootstrapTable
                                        bordered={false}
                                        keyField='serialNo'
                                        data={myTrainingRequests}
                                        columns={myTrainingRequestsColumns}
                                    // pagination={paginationFactory()}
                                    />
                            }

                        </div>
                    </div>

                </div>

            </PageLayout>
        </>
    )
}

export default MyTraining;