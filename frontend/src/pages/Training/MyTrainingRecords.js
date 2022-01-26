import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { useHistory } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import config from '../../config/config';
import { manageMyInductionColumn, myTrainingRecordsColumns, myTrainingRequestsColumns } from '../../config/tableColumns';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager.js';
import paginationFactory from 'react-bootstrap-table2-paginator';

const MyTrainingCords = () => {
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [myTrainingRecords, setMyTrainingRecords] = useState([]);


    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {

                // Get training records of this user
                const resMyTrainingRecords = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employee/${userID}/training-records`);

                if (componentMounted) {
                    const tempMyTrainingRecords = resMyTrainingRecords.data.results;
                    console.log(resMyTrainingRecords);

                    setMyTrainingRecords(() => tempMyTrainingRecords.map((data, index) => ({
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
                        action_manage: `/training/records/manage/${data.training_id}`
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
                <div className="c-Training-records c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Training-records__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>My Training Records</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Training-records__Top c-Main__Top">
                        <h1>My Training Records</h1>
                    </div>
                    {/* Training records */}
                    <div className="c-Training-records__Table">
                        {
                            myTrainingRecords.length === 0 ?
                                "No records found!" :
                                <BootstrapTable
                                    bordered={false}
                                    keyField='serialNo'
                                    data={myTrainingRecords}
                                    columns={myTrainingRecordsColumns}
                                    pagination={paginationFactory()}
                                />
                        }
                    </div>
                </div>

            </PageLayout>
        </>
    )
};

export default MyTrainingCords;