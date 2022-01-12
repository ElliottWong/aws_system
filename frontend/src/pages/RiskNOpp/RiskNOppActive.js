import React from 'react';
import RiskNOppItem from '../../common/RiskNOppItem';

const RiskNOppActive = ({
    docHeaderData,
    docTableData,
    docColumns,
    docKeyfield }) => {   // start of RiskNOppActive
    return (
     
        <div className="c-RNO__Document-content c-Document">
            {/* Title */}
            <h1 className="c-Document__Title">{docHeaderData.title ? docHeaderData.title : null}</h1>
            {/* Document Header info */}
            <div className="c-RNO__Document-header c-Document__Header">
                <div className="c-RNO__Document-header--left c-Document__Header--left">
                    <p>Approved by:</p>
                    <p>Submitted by:</p>
                    <p>Approved on:</p>
                </div>
                <div className="c-RNO__Document-header--right c-Document__Header--right">
                    <p>{docHeaderData.approved_by ? docHeaderData.approved_by : "Error"}</p>
                    <p>{docHeaderData.created_by ? docHeaderData.created_by : "Error"}</p>
                    <p>{docHeaderData.approved_on ? docHeaderData.approved_on : "Error"}</p>
                </div>
            </div>
            {/* Table section */}
            <div className="c-RNO__Table">
                <h1>Strengths</h1>
                {
                    docTableData.strength.map((strengthData, index) => {
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
                    docTableData.weakness.map((strengthData, index) => {
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
                    docTableData.opp.map((strengthData, index) => {
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
                    docTableData.threat.map((strengthData, index) => {
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

export default RiskNOppActive;