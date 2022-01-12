import React, {useState} from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

const ScopeOfQMSActive = ({
    docHeaderData,
    docTableData,
    docColumns,
    docKeyfield
}) => { // start of ScopeOfQMSActive
    return (
        <div className="c-Scope-of-QMS__Document-content c-Document">
            {/* Document Header info */}
            <div className="c-Scope-of-QMS__Document-header c-Document__Header">
                <div className="c-Scope-of-QMS__Document-header--left c-Document__Header--left">
                    <p>Company Name:</p>
                    <p>Active on:</p>
                </div>
                <div className="c-Scope-of-QMS__Document-header--right c-Document__Header--right">
                    <p>{docHeaderData.title ? docHeaderData.title : "Failed to load data"}</p>
                    <p>{docHeaderData.approved_on ? docHeaderData.approved_on : "Failed to load data"}</p>
                </div>
            </div>
            {/* WYSIWYG editor section */}
            <div className="l-Scope-of-QMS__WYSIWYG">
                <p>The quality management system under the scope of ISO 9001:2015 certification applies to:</p>
                <div className = "c-Scope-Of-QMS__WYSIWYG">
                    {docHeaderData.content}
                </div>
            </div>

            {/* Table section */}
            <div className="c-Scope-of-QMS__Table">
                <p>Physicial boundary: The corporate office address from where the above mentioned services are provided as follows</p>
                <BootstrapTable
                    keyField='id'
                    data={docTableData}
                    columns={docColumns}
                />
            </div>

        </div>
    )
}

export default ScopeOfQMSActive;