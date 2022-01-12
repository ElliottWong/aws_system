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
import { manageInductionTemplatesColumns, historyInductionTemplatesColumns } from '../../config/tableColumns';

const ManageInductionTemplates = () => {
    const history = useHistory();
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();

    // State declaration
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);

    // Fake table data
    const fakeInductionTemplateData = [
        {
            id: 1,
            serialNo: 1,
            template_name: "IT Department Induction Template",
            action_manage: `/settings/manage-induction-templates/manage-induction-template/${1}`
        }
    ];


    return (
        <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title="Manage Induction Templates" activeLink="/settings">
            <div className="c-Manage-induction-templates c-Main">
                {/* Breadcrumb */}
                <Breadcrumb className="c-Manage-induction-templates__Breadcrumb l-Breadcrumb">
                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item href="/settings">Settings</Breadcrumb.Item>
                    <Breadcrumb.Item active>Manage Induction Templates</Breadcrumb.Item>
                </Breadcrumb>

                {/* Top section */}
                <div className="c-Manage-induction-templates__Top c-Main__Top">
                    <h1>Manage Induction Templates</h1>
                    <button type="button" className="c-Btn c-Btn--primary">Add Template</button>
                </div>

                {/* Table section */}
                <div className="c-Manage-induction-templates__Table">
                    <h2>Template: IT Department Induction Forms</h2>
                    <BootstrapTable
                        bordered={false}
                        keyField='serialNo'
                        data={fakeInductionTemplateData}
                        columns={manageInductionTemplatesColumns}
                    />

                </div>

                {/* History/Archives section */}
                <div className='c-Manage-induction-templates c-Main__Archives'>
                    <h1>History (Archived)</h1>
                    {
                        <BootstrapTable
                            bordered={false}
                            keyField='serialNo'
                            data={fakeInductionTemplateData}
                            columns={historyInductionTemplatesColumns}
                            pagination={paginationFactory()}
                        />
                    }
                </div>

            </div>
        </PageLayout>
    )
}

export default ManageInductionTemplates;