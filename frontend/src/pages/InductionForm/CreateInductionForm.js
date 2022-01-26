import React, { useState } from 'react';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { useHistory } from 'react-router';
import InductionFormSection from '../../common/InductionFormSection';
import DocumentLayout from '../../layout/DocumentLayout';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils';
import TokenManager from '../../utilities/tokenManager';


const CreateInductionForm = () => {
    const history = useHistory();
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();

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


    // State declaration
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    return (
        <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title="Create Induction Template" activeLink="/settings">
            <div className="c-Create-induction-form c-Main">
                {/* Breadcrumb */}
                <Breadcrumb className="c-Create-induction-form__Breadcrumb l-Breadcrumb">
                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item href="/settings">Settings</Breadcrumb.Item>
                    <Breadcrumb.Item href="/settings/induction-templates">Induction Templates</Breadcrumb.Item>
                    <Breadcrumb.Item href={`/settings/induction-templates/induction-template-versions/${1}`}>Manage Induction Versions</Breadcrumb.Item>
                    <Breadcrumb.Item active>Create Induction Form</Breadcrumb.Item>
                </Breadcrumb>

                {/* Top section */}
                <div className="c-Create-induction-form__Top c-Main__Top">
                    <h1>Create Induction Form</h1>
                    <button type="button" className="c-Btn c-Btn--primary">Create</button>
                </div>

                {/* Form section */}
                <div className="c-Create-induction-form__Document c-Main__Document">
                    <h2>Template: IT Department Induction Forms</h2>
                    <DocumentLayout isDocCollapsed={false}>
                        {/* TODO: Verify class naming is correct */}
                        <div className="c-Create-induction-form__Document-content">
                            {/* Title */}
                            <h1>AY2021 Induction Form for IT Department</h1>
                            {/* Document Header info */}
                            <div className="c-Create-induction-form__Document-header c-Document__Header">
                                <div className="c-Create-indcution-form__Document-header--left c-Document__Header--left">
                                    <p>To bv approved by:</p>
                                    <p>Submitted by:</p>
                                    <p>Remarks</p>
                                </div>
                                <div className="c-Create__Document-header--right c-Document__Header--right">
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
                                            formMode="edit"
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

export default CreateInductionForm;