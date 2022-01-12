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
import { manageInductionTemplateColumns } from '../../config/tableColumns';


const ManageInductionTemplate = ({ match }) => {
    const history = useHistory();
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const templateID = match.params.templateID;

    // State declaration
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);

    // Fake table data
    const fakeInductionTemplateData = [
        {
            id: 1,
            serialNo: 1,
            form_name: "AY2021 Induction Form for IT Department",
            version_label: "IT2021.1",
            status: "test",
            action_view: `/settings/manage-induction-templates/manage-induction-template/${1}/manage-induction-form/${1}`
        }
    ];

    return (
        <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title="Manage Induction Forms" activeLink="/settings">
            <div className="c-Manage-induction-template c-Main">
                {/* Breadcrumb */}
                <Breadcrumb className="c-Manage-induction-templat l-Breadcrumb">
                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item href="/settings">Settings</Breadcrumb.Item>
                    <Breadcrumb.Item href="/settings/manage-induction-templates">Manage Induction Templates</Breadcrumb.Item>
                    <Breadcrumb.Item active>Manage Induction Template</Breadcrumb.Item>
                </Breadcrumb>

                {/* Top section */}
                <div className="c-Manage-induction-template__Top c-Main__Top">
                    <h1>Manage Induction Template</h1>
                    <div className="c-Manage-indudction-template__Btns">
                        <button type="button" className="c-Btn c-Btn--primary">Edit Active Version</button>
                        <button type="button" className="c-Btn c-Btn--alert">Archive</button>
                    </div>
                </div>

                {/* Table section */}
                <div className="c-Manage-induction-template__Table">
                    <BootstrapTable
                        bordered={false}
                        keyField='serialNo'
                        data={fakeInductionTemplateData}
                        columns={manageInductionTemplateColumns}
                    />

                </div>

            </div>
        </PageLayout>
    )
}

export default ManageInductionTemplate;