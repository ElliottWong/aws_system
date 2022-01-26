import React from 'react';
import CompanyPolicyItem from '../../common/CompanyPolicyItem';

const CompanyPolicyPending = ({
    docPendingTableData, 
    setDocPendingTableData,
    docPendingHeaderData, 
    docHeaderData,
    docTableData,
    docColumns, 
    docKeyfield}) => { // start of CompanyPolicyPending.js
    return (
        <div className="c-Company-Policy__Document-content c-Document">
            {/* Title */}
            <h1 className = "c-Document__Title">{docPendingHeaderData.title ? docPendingHeaderData.title : "Failed to load data!"}</h1>
            {/* Document Header Info */}
            <div className="c-Company-Policy__Document-header c-Document__Header">
                <div className="c-Company-Policy__Document-header--left c-Document__Header--left">
                    <p>To be approved by:</p>
                    <p>Submitted by:</p>
                </div>
                <div className="c-Company-Policy__Document-header--right c-Document__Header--right">
                    <p>{docPendingHeaderData.approved_by ? docPendingHeaderData.approved_by : "Error"}</p>
                    <p>{docPendingHeaderData.created_by ? docPendingHeaderData.created_by : "Error"}</p>
                </div>
            </div>
            {/* Company policy cards section */}
            <div className="c-Company-Policy__Cards">
                <p>The quality management system under the scope of ISO 9001:2015 certification applies to:</p>
                {/* TBC: map through an array to display CompanyPolicyItem */}
                {docPendingTableData.map((data, index) => (
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

export default CompanyPolicyPending;