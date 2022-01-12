import React from 'react';
import CompanyPolicyItem from '../../common/CompanyPolicyItem';

const CompanyPolicyActive = ({
    docHeaderData,
    docTableData,
    docColumns,
    docKeyfield
}) => { // start of CompanyPolicyActive
    return (
        <div className="c-Company-Policy__Document-content c-Document">
            {/* Title */}
            <h1 className = "c-Document__Title">{docHeaderData.title ? docHeaderData.title : "Failed to load data!"}</h1>
            {/* Document Header Info */}
            <div className="c-Company-Policy__Document-header c-Document__Header">
                <div className="c-Company-Policy__Document-header--left c-Document__Header--left">
                    <p>Approved by:</p>
                    <p>Submitted by:</p>
                    <p>Approved on:</p>
                </div>
                <div className="c-Company-Policy__Document-header--right c-Document__Header--right">
                    <p>{docHeaderData.approved_by ? docHeaderData.approved_by : "Error"}</p>
                    <p>{docHeaderData.created_by ? docHeaderData.created_by : "Error"}</p>
                    <p>{docHeaderData.approved_on ? docHeaderData.approved_on : "Error"}</p>
                </div>
            </div>
            {/* Company policy cards section */}
            <div className="c-Company-Policy__Cards">
                <p>The quality management system under the scope of ISO 9001:2015 certification applies to:</p>
                {/* Map through an array to display CompanyPolicyItem */}
                {docTableData.map((data, index) => (
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

export default CompanyPolicyActive;