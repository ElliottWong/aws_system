import React from 'react';
import CompanyPolicyItem from '../../common/CompanyPolicyItem';

const CompanyPolicyRejected = ({
    docRejectedHeaderData, 
    docRejectedTableData, 
    docColumns, 
    docKeyfield}) => {  // Start of CompanyPolicyRejected
    return (
        <div className="c-Company-Policy__Document-content c-Document">
        {/* Title */}
        <h1 className = "c-Document__Title">{docRejectedHeaderData.title ? docRejectedHeaderData.title : "Failed to load data!"}</h1>
        {/* Document Header Info */}
        <div className="c-Company-Policy__Document-header c-Document__Header">
            <div className="c-Company-Policy__Document-header--left c-Document__Header--left">
                <p>To be approved by:</p>
                <p>Submitted by:</p>
                <p>Remarks</p>
            </div>
            <div className="c-Company-Policy__Document-header--right c-Document__Header--right">
                <p>{docRejectedHeaderData.approved_by ? docRejectedHeaderData.approved_by : "Error"}</p>
                <p>{docRejectedHeaderData.created_by ? docRejectedHeaderData.created_by : "Error"}</p>
                {docRejectedHeaderData ? <textarea readOnly value = {docRejectedHeaderData.remarks || ''}></textarea> : "No remarks found!" }
            </div>
        </div>
        {/* Company policy cards section */}
        <div className="c-Company-Policy__Cards">
            <p>The quality management system under the scope of ISO 9001:2015 certification applies to:</p>
            {/* TBC: map through an array to display CompanyPolicyItem */}
            {docRejectedTableData.map((data, index) => (
                <CompanyPolicyItem
                    key={index}
                    itemTitle={data.title}
                    itemContent={data.content}
                    itemIndex={index}
                />
            ))
            }
        </div>
    </div>
    )
}

export default CompanyPolicyRejected;