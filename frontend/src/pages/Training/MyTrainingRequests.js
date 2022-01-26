import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { useHistory } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import config from '../../config/config';
import { myTrainingRequestsColumns } from '../../config/tableColumns';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager.js';

const MyTrainingRequests = () => {
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [myTrainingRequests, setMyTrainingRequests] = useState([]);


    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                // Get training requests of this user //TODO
                const resMyTrainingRequests = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employee/${userID}/training-requests`);

                if (componentMounted) {
                    const tempMyTrainingRequests = resMyTrainingRequests.data.results;
                    console.log(resMyTrainingRequests);
                    setMyTrainingRequests(() => tempMyTrainingRequests.map((data, index) => ({
                        id: data.training_id,
                        serialNo: index + 1,
                        course_title: data.title,
                        approver: "@" + data.approver?.account?.username,
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
                        action_manage: `/training/requests/manage/${data.training_id}`
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='My Training Requests' activeLink="/training">
                <div className="c-Training-requests c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Training__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>My Training Requests</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Training-requests__Top c-Main__Top">
                        <h1>My Training Requests</h1>
                        <button onClick={() => history.push("/training/requests/create")} type="button" className="c-Btn c-Btn--primary">Create Training Request</button>
                    </div>

                    {/* Training request */}
                    <div className="c-Training-requests__Table">
                        {
                            myTrainingRequests.length === 0 ?
                                "No records found!" :
                                <BootstrapTable
                                    bordered={false}
                                    keyField='serialNo'
                                    data={myTrainingRequests}
                                    columns={myTrainingRequestsColumns}
                                    pagination={paginationFactory()}
                                />
                        }

                    </div>

                </div>

            </PageLayout>
        </>
    )
};

export default MyTrainingRequests;