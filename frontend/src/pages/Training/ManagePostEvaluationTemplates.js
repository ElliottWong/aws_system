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

const ManagePostEvaluationTemplates = () => {
    const toastTiming = config.toastTiming;
    const history = useHistory();

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed

    // Fake data
    const fakeEvaluationTemplateData = [
        {
            id: 1,
            serialNo: 1,
            template_title: "Post Evaluation Template 2022",
            version: "PETF.2022.2",
            created_by: "@AppleKim",
            created_on: dayjs(new Date()).format("D MMM YYYY"),
            status: (() => {
                // if (new Date() < new Date()) {
                //     return "active";
                // } 
                // TODO: algorithm to determine status
                return undefined;
            })(),
            action_manage: ""
        },
        {
            id: 2,
            serialNo: 2,
            template_title: "Post Evaluation Template 2022",
            version: "PETF.2022.1",
            created_by: "@AppleKim",
            created_on: dayjs(new Date()).format("D MMM YYYY"),
            status: (() => {
                // if (new Date() < new Date()) {
                //     return "active";
                // } 
                // TODO: algorithm to determine status
                return undefined;
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Manage Post Evaluation Templates' activeLink="/training">
                <div className="c-Manage-PET c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Manage-PET__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/settings">Settings</Breadcrumb.Item>
                        <Breadcrumb.Item href="/settings/trainings">Manage Trainings</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Post Evaluation Templates</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-PET__Top c-Main__Top">
                        <h1>Manage Post Evaluation Templates</h1>
                        <button type="button" className="c-Btn c-Btn--primary" onClick={() => history.push("/settings/trainings/post-evaluation-templates/create-template")}>Create New Template</button>
                    </div>
                    {/* Training requests pending for user's approval*/}
                    <div className="c-Manage-PET__Table">
                        <BootstrapTable
                            bordered={false}
                            keyField='serialNo'
                            data={fakeEvaluationTemplateData}
                            columns={managePETColumns}
                        // pagination={paginationFactory()}
                        />
                    </div>

                </div>

            </PageLayout>
        </>
    )
}

export default ManagePostEvaluationTemplates;