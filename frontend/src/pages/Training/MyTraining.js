import React, { useState, useEffect } from 'react';
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

const MyTraining = () => {
    const toastTiming = config.toastTiming;
    const history = useHistory();

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed

    // Table info
    const myTrainingRecordsData = [
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

    const myTrainingRequestsData = [
        {
            id: 1,
            serialNo: 1,
            course_title: "Direct Integration Consultant Upskilling Workshop",
            approver: "@AppleKim",
            start_date: dayjs(new Date()).format("D MMM YYYY"),
            end_date: dayjs(new Date()).format("D MMM YYYY"),
            request_status: (() => {
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
            request_status: (() => {
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
                            <BootstrapTable
                                bordered={false}
                                keyField='serialNo'
                                data={myTrainingRecordsData}
                                columns={myTrainingRecordsColumns}
                            // pagination={paginationFactory()}
                            />
                        </div>
                    </div>

                    {/* Training request */}
                    <div className="c-Training__Requests c-Requests">
                        <div className="c-Requests__Top">
                            <h2>My Training Requests</h2>
                            <button onClick={() => history.push("/training/training-request/create")} type = "button" className = "c-Btn c-Btn--primary">Create Training Request</button>
                        </div>

                        <div className="c-Training__Table">
                            <BootstrapTable
                                bordered={false}
                                keyField='serialNo'
                                data={myTrainingRequestsData}
                                columns={myTrainingRequestsColumns}
                            // pagination={paginationFactory()}
                            />
                        </div>
                    </div>

                </div>

            </PageLayout>
        </>
    )
}

export default MyTraining;