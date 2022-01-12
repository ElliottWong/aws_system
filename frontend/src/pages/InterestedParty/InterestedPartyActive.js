import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

const InterestedPartyActive = ({docHeaderData, docTableData, docColumns, docKeyfield}) => {
    return (
        <div className="c-IP__Document-content c-Document">
            {/* Title */}
            <h1 className = "c-Document__Title">{docHeaderData.title ? docHeaderData.title : "Failed to load data!"}</h1>
            {/* Document Header info */}
            <div className="c-IP__Document-header c-Document__Header">
                <div className="c-IP__Document-header--left c-Document__Header--left">
                    <p>Approved by:</p>
                    <p>Submitted by:</p>
                    <p>Approved on:</p>
                </div>
                <div className="c-IP__Document-header--right c-Document__Header--right">
                    <p>{docHeaderData.approved_by ? docHeaderData.approved_by : "Failed to load data!"}</p>
                    <p>{docHeaderData.created_by ? docHeaderData.created_by : "Failed to load data!"}</p>
                    <p>{docHeaderData.approved_on ? docHeaderData.approved_on : "Failed to load data!"}</p>
                </div>
            </div>
            {/* Table section */}
            <BootstrapTable keyField={docKeyfield} data={docTableData} columns={docColumns} />
        </div>
    )
}

export default InterestedPartyActive;