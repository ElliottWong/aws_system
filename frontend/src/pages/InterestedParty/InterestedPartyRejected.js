import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

const InterestedPartyRejected = ({
    docRejectedHeaderData, 
    docRejectedTableData, 
    docColumns, 
    docKeyfield}) => {  // Start of InterestedPartyRejected

    console.log(docRejectedHeaderData);
    return (
        <div className="c-IP__Document-content c-Document">
        {/* Title */}
        <h1>{docRejectedHeaderData.title ? docRejectedHeaderData.title : "Failed to load data!"}</h1>
        {/* Document Header info */}
        <div className="c-IP__Document-header c-Document__Header">
            <div className="c-IP__Document-header--left c-Document__Header--left">
                <p>To bv approved by:</p>
                <p>Submitted by:</p>
                <p>Remarks</p>
            </div>
            <div className="c-IP__Document-header--right c-Document__Header--right">
                <p>{docRejectedHeaderData.approved_by ? docRejectedHeaderData.approved_by : "Failed to load data!"}</p>
                <p>{docRejectedHeaderData.created_by ? docRejectedHeaderData.created_by : "Failed to load data!"}</p>
                {docRejectedHeaderData ? <textarea readOnly value = {docRejectedHeaderData.remarks || ''}></textarea> : "No remarks found!" }
            </div>
        </div>
        {/* Table section */}
        <BootstrapTable keyField={docKeyfield} data={docRejectedTableData} columns={docColumns} />
    </div>
    )
}

export default InterestedPartyRejected;