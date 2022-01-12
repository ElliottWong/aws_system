import React from 'react';
import RiskNOppItem from '../../common/RiskNOppItem';

const RiskNOppPending = ({
    docPendingHeaderData,
    docPendingTableData,
    docTableData,
    docColumns,
}) => { // start of RiskNOppPending
    return (
        <div className="c-RNO__Document-content c-Document">
            {/* Title */}
            <h1 className="c-Document__Title">{docPendingHeaderData.title ? docPendingHeaderData.title : null}</h1>
            {/* Document Header info */}
            <div className="c-RNO__Document-header c-Document__Header">
                <div className="c-RNO__Document-header--left c-Document__Header--left">
                    <p>Approved by:</p>
                    <p>Submitted by:</p>
                </div>
                <div className="c-RNO__Document-header--right c-Document__Header--right">
                    <p>{docPendingHeaderData.approved_by ? docPendingHeaderData.approved_by : "Error"}</p>
                    <p>{docPendingHeaderData.created_by ? docPendingHeaderData.created_by : "Error"}</p>
                </div>
            </div>
            {/* Table section */}
            <div className="c-RNO__Table">
                <h1>Strengths</h1>
                {
                    docPendingTableData.strength.map((strengthData, index) => {
                        console.log(strengthData);
                        return (
                            <RiskNOppItem
                                key={index}
                                docType="active"
                                rnoItemData={strengthData}
                                rnoItemIndex={index}
                            />
                        );
                    })
                }
                <h1>Weakness</h1>
                {
                    docPendingTableData.weakness.map((strengthData, index) => {
                        console.log(strengthData);
                        return (
                            <RiskNOppItem
                                key={index}
                                docType="active"
                                rnoItemData={strengthData}
                                rnoItemIndex={index}
                            />
                        );
                    })
                }
                <h1>Opportunities</h1>
                {
                    docPendingTableData.opp.map((strengthData, index) => {
                        console.log(strengthData);
                        return (
                            <RiskNOppItem
                                key={index}
                                docType="active"
                                rnoItemData={strengthData}
                                rnoItemIndex={index}
                            />
                        );
                    })
                }
                <h1>Threats</h1>
                {
                    docPendingTableData.threat.map((strengthData, index) => {
                        console.log(strengthData);
                        return (
                            <RiskNOppItem
                                key={index}
                                docType="active"
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

export default RiskNOppPending;