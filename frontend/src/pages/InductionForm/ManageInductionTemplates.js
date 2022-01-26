import React, { useRef, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { confirmAlert } from 'react-confirm-alert';
import { useHistory } from 'react-router';
import { historyInductionTemplatesColumns, manageInductionTemplatesColumns } from '../../config/tableColumns';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils';
import TokenManager from '../../utilities/tokenManager';

const ManageInductionTemplates = () => {
    const history = useHistory();
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();

    const newTemplateName = useRef("");

    // State declaration
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);

    // Fake table data
    const fakeInductionTemplateData = [
        {
            id: 1,
            serialNo: 1,
            template_name: "IT Department Induction Template",
            action_manage: `/settings/induction-templates/induction-template/${1}`
        }
    ];

    // Handlers
    const handleAddTemplate = () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='c-Confirm-alert c-Confirm-alert--new-template'>
                        <h1>Create new template</h1>
                        <input placeholder="Enter template name" name="newTemplateName" ref={newTemplateName} />
                        <div className='c-Confirm-alert__Buttons'>
                            <button className="c-Btn c-Btn--primary" onClick={() => (confirmAddTemplate(onClose))}>Create</button>
                            <button className="c-Btn c-Btn--cancel" onClick={onClose}> Cancel</button>
                        </div>
                    </div>
                );
            }
        });

        const confirmAddTemplate = (onClose) => {

        };
    };


    return (
        <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title="Induction Templates" activeLink="/settings">
            <div className="c-Manage-induction-templates c-Main">
                {/* Breadcrumb */}
                <Breadcrumb className="c-Manage-induction-templates__Breadcrumb l-Breadcrumb">
                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item href="/settings">Settings</Breadcrumb.Item>
                    <Breadcrumb.Item active>Induction Templates</Breadcrumb.Item>
                </Breadcrumb>

                {/* Top section */}
                <div className="c-Manage-induction-templates__Top c-Main__Top">
                    <h1>Induction Templates</h1>
                    <button type="button" className="c-Btn c-Btn--primary" onClick={() => handleAddTemplate()}>Add Template</button>
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