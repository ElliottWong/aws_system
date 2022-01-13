import StatusPill from '../common/StatusPill';
import { NavLink } from 'react-router-dom';
// ----------------------------------------------------
// SWOT
// ----------------------------------------------------
// Document columns
export const docSwotColumns = [
    {
        dataField: 'id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
        headerAttrs: {
            hidden: true
        }
    },
    {
        dataField: 'content',
        text: 'Name',
        headerAttrs: {
            hidden: true
        }
    },
];

// History columns
export const historySwotColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'approved_on',
        text: 'Active From'
    },
    {
        dataField: 'active_till',
        text: 'Active Till'
    },
    {
        dataField: 'action_view',
        text: '',
        formatter: (cell, row) => {
            return <a href={cell}>View</a>
        }
    },
];

// ----------------------------------------------------
// End of Swot
// ----------------------------------------------------


// ----------------------------------------------------
// Interested Party
// ----------------------------------------------------
// Document columns
export const docInterestedPartyColumns = [
    {
        dataField: 'id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'interested_parties',
        text: "Interested Parties"
    },
    {
        dataField: 'needs_n_expectations',
        text: "Needs and Expectations"
    }];

// History columns
export const historyInterestedPartyColumns = [
    {
        dataField: 'id',
        text: 'id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'name',
        text: 'Name',
    },
    {
        dataField: 'approved_on',
        text: 'Active From'
    },
    {
        dataField: 'active_till',
        text: 'Active Till'
    },
    {
        dataField: 'action_view',
        text: '',
        formatter: (cell, row) => {
            return <a href={cell}>View</a>
        }
    },
];

// ----------------------------------------------------
// End of Interested Party
// ----------------------------------------------------

// ----------------------------------------------------
// Start of Scope of QMS
// ----------------------------------------------------

export const docScopeOfQMSColumns = [
    {
        dataField: 'id',
        text: 'id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#'
    },
    {
        dataField: 'site_name',
        text: 'Site Name'
    },
    {
        dataField: 'site_address',
        text: 'Site Address'
    },
    {
        dataField: 'site_scope',
        text: 'Site Scope'
    }
];

export const historyScopeOfQMSColumns = [
    {
        dataField: 'id',
        text: 'id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'name',
        text: 'Name',
    },
    {
        dataField: 'approved_on',
        text: 'Active From'
    },
    {
        dataField: 'active_till',
        text: 'Active Till'
    },
    {
        dataField: 'action_view',
        text: '',
        formatter: (cell, row) => {
            return <a href={cell}>View</a>
        }
    },
];
// ----------------------------------------------------
// End of Scope of QMS
// ----------------------------------------------------


// ----------------------------------------------------
// Start of Company Policy
// ----------------------------------------------------
export const historyCompanyPolicyColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'name',
        text: 'Name',
    },
    {
        dataField: 'approved_on',
        text: 'Active From'
    },
    {
        dataField: 'updated_at',
        text: 'Active Till'
    },
    {
        dataField: 'action_view',
        text: '',
        formatter: (cell, row) => {
            return <a href={cell}>View</a>
        }
    }
];

// ----------------------------------------------------
// End of Company Policy
// ----------------------------------------------------

// ----------------------------------------------------
// Start of Resp & Auth
// ----------------------------------------------------


// ----------------------------------------------------
// End of Resp & Auth
// ----------------------------------------------------

// ----------------------------------------------------
// Start of Risk & Opportunity
// ----------------------------------------------------

export const historyRiskNOppColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'approved_on',
        text: 'Active From'
    },
    {
        dataField: 'active_till',
        text: 'Active Till'
    },
    {
        dataField: 'action_view',
        text: '',
        formatter: (cell, row) => {
            return <a href={cell}>View</a>
        }
    }
];

// ----------------------------------------------------
// End of Risk & Opportunity
// ----------------------------------------------------

// ----------------------------------------------------
// Start of Obj. Achi. Program
// ----------------------------------------------------


export const historyObjAchivColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'approved_on',
        text: 'Active From'
    },
    {
        dataField: 'active_till',
        text: 'Active Till'
    },
    {
        dataField: 'action_view',
        text: '',
        formatter: (cell, row) => {
            return <a href={cell}>View</a>
        }
    }
];

// ----------------------------------------------------
// End of Obj. Achi. Program
// ----------------------------------------------------

// ----------------------------------------------------
// Start of Equipment Maintainence Program
// ----------------------------------------------------

// History columns
export const historyManageEquipmentColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'file_name',
        text: 'File Name'
    },
    {
        dataField: 'uploader',
        text: 'Uploader'
    },
    {
        dataField: 'upload_date',
        text: 'Upload Date'
    },
    {
        dataField: 'action_download',
        text: '',
        formatter: (cell, row) => {
            return <a href={cell}>Download</a>
        }
    },
];

export const categoryColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'name',
        text: 'Name',
    },
    {
        dataField: 'createdOn',
        text: 'Created On',
        hidden: true
    },
    {
        dataField: 'action_manage',
        text: 'Manage',
        headerAttrs: {
            hidden: true
        },
        formatter: (cell, row) => {
            if (cell) {
                return <NavLink to={cell} >Manage</NavLink>
            } else {
                return "N.a."
            }
        }
    },
]

export const equipmentMaintenanceColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'name',
        text: 'Name',
    },
    {
        dataField: 'category',
        text: 'Category',
    },
    {
        dataField: 'refNo',
        text: 'Ref. No.',
    },
    {
        dataField: 'model',
        text: 'Model/Brand',
    },
    {
        dataField: 'action_manage',
        text: 'Manage',
        headerAttrs: {
            hidden: true
        },
        formatter: (cell, row) => {
            if (cell) {
                return <NavLink to={cell} >Manage</NavLink>
            } else {
                return "N.a."
            }
        }
    },
];

export const historyEquipmentMaintenanceColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'name',
        text: 'Name',
    },
    {
        dataField: 'category',
        text: 'Category'
    },
    {
        dataField: 'refNo',
        text: 'Ref. No.'
    },
    {
        dataField: 'model',
        text: 'Model/Brand'
    },
    {
        dataField: 'archived_on',
        text: 'Archived On'
    },
    {
        dataField: 'action_view',
        text: 'View',
        headerAttrs: {
            hidden: true
        },
        formatter: (cell, row) => {
            if (cell) {
                return <NavLink to={cell} >View</NavLink>
            } else {
                return "N.a."
            }
        }
    },
];

export const maintenanceCycleColumns = [
    {
        dataField: 'id',
        text: 'id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'maintenanceType',
        text: 'Maintenance Type'
    },
    {
        dataField: 'responsible',
        text: 'Responsible'
    },
    {
        dataField: 'maintenanceFrequency',
        text: 'Maintenance Frequency'
    },
    {
        dataField: 'lastServiceDate',
        text: 'Last Service Date'
    },
    {
        dataField: 'status',
        text: 'Status',
        formatter: (cell, row) => {
            if (cell) {
                return <StatusPill type={cell} />
            } else {
                return "Error"
            }
        }
    },
    {
        dataField: 'action_manage',
        text: 'Manage',
        headerAttrs: {
            hidden: true
        },
        formatter: (cell, row) => {
            if (cell) {
                return <NavLink to={cell} >Manage</NavLink>
            } else {
                return "N.a."
            }
        }
    },
    {
        dataField: 'action_delete',
        text: '',
        formatter: (cell, row) => {
            console.log(cell);
            return 'Delete';
            // (
            // <ManageDeleteArchivedDoc
            //     deleteUrl={cell}
            //     docHeaderUrl={`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance`}
            //     setArchivedDocData={setArchivedDocData}
            //     docType="equipment-maintenance"
            //     idName="equipment_maintenance_id"
            // />
            // )
        }
    },
];

export const maintenanceRecordColumns = [
    {
        dataField: 'id',
        text: 'id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'fileName',
        text: 'File Name'
    },
    {
        dataField: 'description',
        text: 'Description'
    },
    {
        dataField: 'maintenanceFrequency',
        text: 'Maintenance Frequency'
    },
    {
        dataField: 'uploader',
        text: 'Uploader'
    },
    {
        dataField: 'uploadDate',
        text: 'Upload Date'
    },
    {
        dataField: 'action_download',
        text: '',
        headerAttrs: {
            hidden: true
        },
        formatter: (cell, row) => {
            if (cell) {
                return <NavLink to={cell} >Download</NavLink>
            } else {
                return "N.a."
            }
        }
    },
    {
        dataField: 'action_delete',
        text: '',
        formatter: (cell, row) => {
            console.log(cell);
            return 'Delete';
            // (
            // <ManageDeleteArchivedDoc
            //     deleteUrl={cell}
            //     docHeaderUrl={`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance`}
            //     setArchivedDocData={setArchivedDocData}
            //     docType="equipment-maintenance"
            //     idName="equipment_maintenance_id"
            // />
            // )
        }
    },
];

// ----------------------------------------------------
// End of Equipment Maintenance Program
// ----------------------------------------------------

// ----------------------------------------------------
// Start of Register of Permits, Licenses, Approvals & Certificates
// ----------------------------------------------------

export const licenseColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'license',
        text: 'License/Permit/Certificate',
    },
    {
        dataField: 'licenseNo',
        text: 'License No.',
    },
    {
        dataField: 'expDate',
        text: 'Exp. Date',
    },
    {
        dataField: 'externalAgency',
        text: 'Responsible External Agency',
    },
    {
        dataField: 'responsibleUser',
        text: 'Responsible User',
    },
    {
        dataField: 'status',
        text: 'Status',
        formatter: (cell, row) => {
            if (cell === undefined) {
                return <p>Nil</p>
            }
            return <StatusPill type="active" />
        }
    },
    {
        dataField: 'action_manage',
        text: 'Manage',
        headerAttrs: {
            hidden: true
        },
        formatter: (cell, row) => {
            if (cell) {
                return <NavLink to={cell} >Manage</NavLink>
            } else {
                return "N.a."
            }
        }
    },
];

// ----------------------------------------------------
// End of Register of Permits, Licenses, Approvals & Certificates
// ----------------------------------------------------

// ----------------------------------------------------
// Start of Training
// ----------------------------------------------------

// My Training records columns
export const myTrainingRecordsColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'course_title',
        text: 'Course Title'
    },
    {
        dataField: 'approver',
        text: 'Approver'
    },
    {
        dataField: 'start_date',
        text: 'Start Date'
    },
    {
        dataField: 'end_date',
        text: 'End Date'
    },
    {
        dataField: 'evaluation',
        text: 'Evaluation',
        formatter: (cell, row) => {
            if (cell === undefined) {
                return <p>Nil</p>
            }
            return <StatusPill type="active" />
        }
    },
    {
        dataField: 'attendance',
        text: 'Attendance',
        formatter: (cell, row) => {
            if (cell === undefined) {
                return <p>Nil</p>
            }
            return <StatusPill type="active" />
        }
    },
    {
        dataField: 'action_manage',
        text: '',
        formatter: (cell, row) => {
            return <a href={cell}>Manage</a>
        }
    },
];

// My Training requests columns
export const myTrainingRequestsColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'course_title',
        text: 'Course Title'
    },
    {
        dataField: 'approver',
        text: 'To be approved by'
    },
    {
        dataField: 'start_date',
        text: 'Start Date'
    },
    {
        dataField: 'end_date',
        text: 'End Date'
    },
    {
        dataField: 'request_status',
        text: 'Request status',
        formatter: (cell, row) => {
            if (row.done_at === undefined) {
                return <p>Nil</p>
            }
            return <StatusPill type="active" />
        }
    },
    {
        dataField: 'action_manage',
        text: '',
        formatter: (cell, row) => {
            return <a href={cell}>Manage</a>
        }
    },
];

// Mange pending Training requests columns
export const managePendingTrainingRequestsColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'course_title',
        text: 'Course Title'
    },
    {
        dataField: 'approver',
        text: 'To be approved by'
    },
    {
        dataField: 'start_date',
        text: 'Start Date'
    },
    {
        dataField: 'end_date',
        text: 'End Date'
    },
    {
        dataField: 'action_manage',
        text: '',
        formatter: (cell, row) => {
            return <a href={cell}>Manage</a>
        }
    },
];

// Manage all Training requests columns
export const manageAllTrainingRequestsColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'course_title',
        text: 'Course Title'
    },
    {
        dataField: 'approver',
        text: 'To be approved by'
    },
    {
        dataField: 'start_date',
        text: 'Start Date'
    },
    {
        dataField: 'end_date',
        text: 'End Date'
    },
    {
        dataField: 'request_status',
        text: 'Request status',
        formatter: (cell, row) => {
            if (row.done_at === undefined) {
                return <p>Nil</p>
            }
            return <StatusPill type="active" />
        }
    },
    {
        dataField: 'action_manage',
        text: '',
        formatter: (cell, row) => {
            return <a href={cell}>Manage</a>
        }
    },
];

// Manage all Training records columns
export const manageAllTrainingRecordsColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'course_title',
        text: 'Course Title'
    },
    {
        dataField: 'approver',
        text: 'Approver'
    },
    {
        dataField: 'start_date',
        text: 'Start Date'
    },
    {
        dataField: 'end_date',
        text: 'End Date'
    },
    {
        dataField: 'evaluation',
        text: 'Evaluation',
        formatter: (cell, row) => {
            if (cell === undefined) {
                return <p>Nil</p>
            }
            return <StatusPill type="active" />
        }
    },
    {
        dataField: 'attendance',
        text: 'Attendance',
        formatter: (cell, row) => {
            if (cell === undefined) {
                return <p>Nil</p>
            }
            return <StatusPill type="active" />
        }
    },
    {
        dataField: 'action_manage',
        text: '',
        formatter: (cell, row) => {
            return <a href={cell}>Manage</a>
        }
    },
];

// Manage post evaluation templates columns
export const managePETColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'template_title',
        text: 'Template Title'
    },
    {
        dataField: 'version',
        text: 'Version'
    },
    {
        dataField: 'created_by',
        text: 'Created By'
    },
    {
        dataField: 'created_on',
        text: 'Created On'
    },
    {
        dataField: 'status',
        text: 'Status',
        formatter: (cell, row) => {
            if (cell === undefined) {
                return <p>Nil</p>
            }
            return <StatusPill type="active" />
        }
    },
    {
        dataField: 'action_manage',
        text: '',
        formatter: (cell, row) => {
            return <a href={cell}>Manage</a>
        }
    },
];

// ----------------------------------------------------
// End of Training
// ----------------------------------------------------

// ----------------------------------------------------
// Start of Induction Program
// ----------------------------------------------------

// Manage induction template columns
export const manageInductionTemplatesColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'template_name',
        text: 'Template Name'
    },
    {
        dataField: 'action_manage',
        text: '',
        formatter: (cell, row) => {
            return <a href={cell}>Manage</a>
        }
    },
];

export const historyInductionTemplatesColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'template_name',
        text: 'Template Name'
    },
    {
        dataField: 'action_view',
        text: '',
        formatter: (cell, row) => {
            return <a href={cell}>View</a>
        }
    },
];

export const manageInductionTemplateColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'serialNo',
        text: '#',
    },
    {
        dataField: 'form_name',
        text: 'Form Name'
    },
    {
        dataField: 'version_label',
        text: 'Version Label'
    },
    {
        dataField: 'status',
        text: 'Status'
    },
    {
        dataField: 'action_view',
        text: '',
        formatter: (cell, row) => {
            return <NavLink to={cell}>View</NavLink>
        }
    },
];

export const manageInductionFormSectionColumns = [
    {
        dataField: 'id',
        text: 'Id',
        hidden: true
    },
    {
        dataField: 'description',
        text: 'Description'
    },
    {
        dataField: 'file',
        text: 'file'
    },
    {
        dataField: 'done_at',
        text: 'Done On'
    },
    {
        dataField: 'status',
        text: 'Status',
        formatter: (cell, row) => {
            if (row.done_at === undefined) {
                return <p>Nil</p>
            }
            return <StatusPill type="active" />
        }
    },
    {
        dataField: 'action_view',
        text: '',
        formatter: (cell, row) => {
            return <a href={cell}>Mark Done</a>
        }
    },
];

// ----------------------------------------------------
// End of Induction Program
// ----------------------------------------------------