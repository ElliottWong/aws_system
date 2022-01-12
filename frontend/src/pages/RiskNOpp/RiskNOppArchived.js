import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import DocumentLayout from '../../layout/DocumentLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import axios from 'axios';
import dayjs from 'dayjs';
import RiskNOppItem from '../../common/RiskNOppItem';
import TokenManager from '../../utilities/tokenManager';


const RiskNOppArchived = ({ match }) => {
    const rnoID = match.params.rnoID;     // get id of interested party
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [docHeaderData, setDocHeaderData] = useState({});
    const [docTableData, setDocTableData] = useState({
        strength: [],
        weakness: [],
        opp: [],
        threat: []
    });

    useEffect(() => {
        if (!isNaN(rnoID) && rnoID !== null) {
            axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/risks-analyses/${rnoID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    // Format dopcument table data
                    const formattedDocTableData = {
                        strength: res.data.strengths.map((strengthData, strengthIndex) => {
                            return {
                                serialNo: strengthIndex + 1,
                                id: strengthData.fk_risks_analysis_id,
                                swot_item_id: strengthData.fk_swot_item_id,
                                content: strengthData.swot.content,
                                type: strengthData.type,
                                severity: strengthData.severity,
                                likelihood: strengthData.likelihood,
                                rpn: strengthData.rpn,
                                action: strengthData.action,
                                modified: dayjs(new Date(strengthData.updated_at)).format("DD/MM/YYYY"),
                            };
                        }),
                        weakness: res.data.weaknesses.map((weaknessData, weaknessIndex) => {
                            return {
                                serialNo: weaknessIndex + 1,
                                id: weaknessData.fk_risks_analysis_id,
                                swot_item_id: weaknessData.fk_swot_item_id,
                                content: weaknessData.swot.content,
                                type: weaknessData.type,
                                severity: weaknessData.severity,
                                likelihood: weaknessData.likelihood,
                                rpn: weaknessData.rpn,
                                action: weaknessData.action,
                                modified: dayjs(new Date(weaknessData.updated_at)).format("DD/MM/YYYY"),
                            };
                        }),
                        opp: res.data.opportunities.map((oppData, oppIndex) => {
                            return {
                                serialNo: oppIndex + 1,
                                id: oppData.fk_risks_analysis_id,
                                swot_item_id: oppData.fk_swot_item_id,
                                content: oppData.swot.content,
                                type: oppData.type,
                                severity: oppData.severity,
                                likelihood: oppData.likelihood,
                                rpn: oppData.rpn,
                                action: oppData.action,
                                modified: dayjs(new Date(oppData.updated_at)).format("DD/MM/YYYY"),
                            };
                        }),
                        threat: res.data.threats.map((threatData, threatIndex) => {
                            return {
                                serialNo: threatIndex + 1,
                                id: threatData.fk_risks_analysis_id,
                                swot_item_id: threatData.fk_swot_item_id,
                                content: threatData.swot.content,
                                type: threatData.type,
                                severity: threatData.severity,
                                likelihood: threatData.likelihood,
                                rpn: threatData.rpn,
                                action: threatData.action,
                                modified: dayjs(new Date(threatData.updated_at)).format("DD/MM/YYYY"),
                            };
                        })
                    };
                    setDocTableData(() => (formattedDocTableData));

                    // Format document header data
                    const formattedData = {
                        title: res.data.title,
                        created_by: res.data.author.firstname + " " + res.data.author.lastname,
                        approved_by: res.data.approver.firstname + " " + res.data.author.lastname,
                        approved_on: dayjs(new Date(res.data.approved_on)).format("MMMM D, YYYY h:mm A"),
                    }
                    console.log(formattedData);
                    setDocHeaderData(() => (formattedData));

                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, []);

    return (
        <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Risk and Opportunity' activeLink="/risk-n-opportunity">
            <div className="c-RNO c-Main">
                {/* Breadcrumb */}
                <Breadcrumb className="c-RNO__Breadcrumb l-Breadcrumb">
                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item href="/risk-n-opportunity">Risk and Opportunity</Breadcrumb.Item>
                    <Breadcrumb.Item active>View Archived</Breadcrumb.Item>
                </Breadcrumb>

                {/* Top section */}
                <div className="c-RNO__Top c-Main__Top">
                    <h1>Risk and Opportunity (Archived)</h1>
                </div>
                {/* Document section */}
                <div className="c-RNO__Document c-Main__Document">
                    {/* Document */}
                    <DocumentLayout >
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
                                    docTableData.weakness.map((strengthData, index) => {
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
                                    docTableData.opp.map((strengthData, index) => {
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
                                    docTableData.threat.map((strengthData, index) => {
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

                    </DocumentLayout>
                </div>
            </div>
        </PageLayout >
    )
}

export default RiskNOppArchived;