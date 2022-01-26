import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

const ScopeOfQMSPending = ({
    docPendingHeaderData,
    docPendingTableData,
    docColumns,
    docKeyfield
}) => {
    return (
        <div className="c-Scope-of-QMS__Document-content c-Document">
            {/* Document Header info */}
            <div className="c-Scope-of-QMS__Document-header c-Document__Header">
                <div className="c-Scope-of-QMS__Document-header--left c-Document__Header--left">
                    <p>Company Name:</p>
                    <p>To be approved by:</p>
                    <p>Submitted by:</p>
                </div>
                <div className="c-Scope-of-QMS__Document-header--right c-Document__Header--right">
                    <p>{docPendingHeaderData.title ? docPendingHeaderData.title : "Failed to load data"}</p>
                    <p>{docPendingHeaderData.approved_by ? docPendingHeaderData.approved_by : "Failed to load data!"}</p>
                    <p>{docPendingHeaderData.created_by ? docPendingHeaderData.created_by : "Failed to load data!"}</p>
                </div>
            </div>
            {/* WYSIWYG editor section */}
            <div className="l-Scope-of-QMS__WYSIWYG">
                <p>The quality management system under the scope of ISO 9001:2015 certification applies to:</p>
                <div className = "c-Scope-Of-QMS__WYSIWYG">
                    {docPendingHeaderData.content}
                </div>
            </div>

            {/* Table section */}
            <div className="c-Scope-of-QMS__Table">
                <p>Physicial boundary: The corporate office address from where the above mentioned services are provided as follows</p>
                <BootstrapTable
                    keyField='id'
                    data={docPendingTableData}
                    columns={docColumns}
                />
            </div>

        </div>
    )
}

export default ScopeOfQMSPending;