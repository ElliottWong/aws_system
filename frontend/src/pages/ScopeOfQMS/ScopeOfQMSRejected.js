import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

const ScopeOfQMSRejected = ({
    docRejectedHeaderData,
    docRejectedTableData,
    docColumns,
    docKeyfield
}) => {
    return (
        <div className="c-Scope-of-QMS__Document-content c-Document">
            {/* Document Header info */}
            <div className="c-Scope-of-QMS__Document-header c-Document__Header">
                <div className="c-Scope-of-QMS__Document-header--left c-Document__Header--left">
                    <p>To bv approved by:</p>
                    <p>Submitted by:</p>
                    <p>Remarks</p>
                </div>
                <div className="c-Scope-of-QMS__Document-header--right c-Document__Header--right">
                    <p>{docRejectedHeaderData.approved_by ? docRejectedHeaderData.approved_by : "Failed to load data!"}</p>
                    <p>{docRejectedHeaderData.created_by ? docRejectedHeaderData.created_by : "Failed to load data!"}</p>
                    {docRejectedHeaderData ? <textarea readOnly value={docRejectedHeaderData.remarks || ''}></textarea> : "No remarks found!"}
                </div>
            </div>
            {/* WYSIWYG editor section */}
            <div className="l-Scope-of-QMS__WYSIWYG">
                <p>The quality management system under the scope of ISO 9001:2015 certification applies to:</p>
                <div className="c-Scope-Of-QMS__WYSIWYG">
                    {docRejectedHeaderData.content}
                </div>
            </div>

            {/* Table section */}
            <div className="c-Scope-of-QMS__Table">
                <p>Physicial boundary: The corporate office address from where the above mentioned services are provided as follows</p>
                <BootstrapTable
                    keyField='id'
                    data={docRejectedTableData}
                    columns={docColumns}
                />
            </div>

        </div>
    )
}

export default ScopeOfQMSRejected;