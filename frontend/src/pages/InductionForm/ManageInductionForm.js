import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import axios from 'axios';
import { useHistory } from 'react-router';
import paginationFactory from 'react-bootstrap-table2-paginator';
import TokenManager from '../../utilities/tokenManager';
import DocumentLayout from '../../layout/DocumentLayout';
import RenderDocument from '../../common/RenderDocument';
import InductionFormSection from '../../common/InductionFormSection';

const ManageInductionForm = ({ match }) => {
    const history = useHistory();
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const formID = match.params.formID;
    const templateID = match.params.templateID;

    // State declaration
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [sectionsData, setSectionsData] = useState([
        {
            order: 1,
            section: 'Section A: Introduction',
            tasks: [
                {
                    order: 1,
                    task: 'Introduction',
                    descriptions: [
                        // when the template is cloned and done
                        { order: 1, description: 'Dress code', file: 'dress code picture', done: false, done_at: '1234' },
                        { order: 3, description: 'Staff indentification', file: 'staff id card', done: true, done_at: '1234' },
                        { order: 2, description: 'Working hours', done: true, done_at: '1234' }
                    ]
                },
                {
                    order: 2,
                    task: 'Rules',
                    descriptions: [
                        // template only
                        { order: 1, description: 'Attendance', file: 'attendance' }, // with a file
                        { order: 2, description: 'Regulations' } // without a file
                    ]
                }
            ]
        },
    ]);

    // Fake table data
    const fakeInductionTemplateData = [
        {
            id: 1,
            serialNo: 1,
            template_name: "IT Department Induction Template",
            action_manage: `/settings/manage-induction-templates/manage-induction-template/${1}`
        }
    ];

    useEffect(() => {
        // Obtain data for the induction form

        // Do sorting of the tasks,sections and descriptions
        // e.g. tasks.sort(function(a, b){return a-b});

        
    }, []);


    return (
        <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title="Manage Induction Templates" activeLink="/settings">
            <div className="c-Manage-induction-form c-Main">
                {/* Breadcrumb */}
                <Breadcrumb className="c-Manage-induction-form l-Breadcrumb">
                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item href="/settings">Settings</Breadcrumb.Item>
                    <Breadcrumb.Item href="/settings/manage-induction-templates">Manage Induction Templates</Breadcrumb.Item>
                    <Breadcrumb.Item href={`/settings/manage-induction-templates/manage-induction-template/${1}`}>Manage Induction Template</Breadcrumb.Item>
                    <Breadcrumb.Item active>Manage Induction Form</Breadcrumb.Item>
                </Breadcrumb>

                {/* Top section */}
                <div className="c-Manage-induction-form__Top c-Main__Top">
                    <h1>Manage Induction Form</h1>
                    <button type="button" className="c-Btn c-Btn--primary">Change to Active</button>
                </div>

                {/* Document section */}
                <div className="c-Manage-induction-form__Document c-Main__Document">
                    <h2>Template: IT Department Induction Forms</h2>
                    {/* Document */}
                    <DocumentLayout isDocCollapsed={false}>
                        {/* TODO: Verify class naming is correct */}
                        <div className="c-Manage-induction-form__Document-content">
                            {/* Title */}
                            <h1>AY2021 Induction Form for IT Department</h1>
                            {/* Document Header info */}
                            <div className="c-Manage-induction-form__Document-header c-Document__Header">
                                <div className="c-Manage-indcution-form__Document-header--left c-Document__Header--left">
                                    <p>To bv approved by:</p>
                                    <p>Submitted by:</p>
                                    <p>Remarks</p>
                                </div>
                                <div className="c-IP__Document-header--right c-Document__Header--right">
                                    {/* <p>{docRejectedHeaderData.approved_by ? docRejectedHeaderData.approved_by : "Failed to load data!"}</p>
                                    <p>{docRejectedHeaderData.created_by ? docRejectedHeaderData.created_by : "Failed to load data!"}</p>
                                    {docRejectedHeaderData ? <textarea readOnly value={docRejectedHeaderData.remarks || ''}></textarea> : "No remarks found!"} */}
                                </div>
                            </div>
                            {/* Induction sections */}
                            {
                                sectionsData.length !== 0 ?
                                    sectionsData.map((sectionData, index) =>
                                        <InductionFormSection
                                            key={index}
                                            sectionData={sectionData}
                                        />
                                    )
                                    :
                                    "No records found!"
                            }
                        </div>

                    </DocumentLayout>

                </div>

            </div>
        </PageLayout>
    )
}

export default ManageInductionForm;