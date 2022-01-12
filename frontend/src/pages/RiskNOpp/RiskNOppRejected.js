import React from 'react';
import RiskNOppItem from '../../common/RiskNOppItem';

const RiskNOppRejected = ({
    docRejectedHeaderData,
    docRejectedTableData,
}) => { // start of RiskNOppRejected
    return (
        <div className="c-RNO__Document-content c-Document">
            {/* Title */}
            <h1 className="c-Document__Title">{docRejectedHeaderData.title ? docRejectedHeaderData.title : null}</h1>
            {/* Document Header info */}
            <div className="c-RNO__Document-header c-Document__Header">
                <div className="c-RNO__Document-header--left c-Document__Header--left">
                    <p>Rejected By:</p>
                    <p>Submitted by:</p>
                    <p>Remarks</p>
                </div>
                <div className="c-RNO__Document-header--right c-Document__Header--right">
                    <p>{docRejectedHeaderData.approved_by ? docRejectedHeaderData.approved_by : "Error"}</p>
                    <p>{docRejectedHeaderData.created_by ? docRejectedHeaderData.created_by : "Error"}</p>
                    {docRejectedHeaderData ? <textarea readOnly value={docRejectedHeaderData.remarks || ''}></textarea> : "No remarks found!"}
                </div>
            </div>
            {/* Table section */}
            <div className="c-RNO__Table">
                <h1>Strengths</h1>
                {
                    docRejectedTableData.strength.map((strengthData, index) => {
                        console.log(strengthData);
                        return (
                            <RiskNOppItem
                                key={index}
                                docType="rejected"
                                rnoItemData={strengthData}
                                rnoItemIndex={index}
                            />
                        );
                    })
                }
                <h1>Weakness</h1>
                {
                    docRejectedTableData.weakness.map((strengthData, index) => {
                        console.log(strengthData);
                        return (
                            <RiskNOppItem
                                key={index}
                                docType="rejected"
                                rnoItemData={strengthData}
                                rnoItemIndex={index}
                            />
                        );
                    })
                }
                <h1>Opportunities</h1>
                {
                    docRejectedTableData.opp.map((strengthData, index) => {
                        console.log(strengthData);
                        return (
                            <RiskNOppItem
                                key={index}
                                docType="rejected"
                                rnoItemData={strengthData}
                                rnoItemIndex={index}
                            />
                        );
                    })
                }
                <h1>Threats</h1>
                {
                    docRejectedTableData.threat.map((strengthData, index) => {
                        console.log(strengthData);
                        return (
                            <RiskNOppItem
                                key={index}
                                docType="rejected"
                                rnoItemData={strengthData}
                                rnoItemIndex={index}
                            />
                        );
                    })
                }
            </div>
        </div>
    )
}

export default RiskNOppRejected;