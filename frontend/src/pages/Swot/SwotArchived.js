import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import SwotItems from '../../common/SwotItems';
import { docSwotColumns } from '../../config/tableColumns';
import DocumentLayout from '../../layout/DocumentLayout';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils';
import TokenManager from '../../utilities/tokenManager';


const SwotArchived = ({ match }) => {
    const swotID = match.params.swotID;     // get id of interested party
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
        if (!isNaN(swotID) && swotID !== null) {
            axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swots/${swotID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    console.log(res);
                    // Format dopcument table data
                    const formattedDocTableData = {
                        strength: res.data.results.strengths.map((strengthData, strengthIndex) => {
                            return {
                                id: strengthData.swot_item_id,
                                type: "strength",
                                serialNo: strengthIndex + 1,
                                content: strengthData.content,
                                display_order: 0,
                                parentItemID: strengthData.parent_item_id
                            }
                        }),
                        weakness: res.data.results.weaknesses.map((weaknessData, weaknessIndex) => {
                            return {
                                id: weaknessData.swot_item_id,
                                type: "weakness",
                                serialNo: weaknessIndex + 1,
                                content: weaknessData.content,
                                display_order: 0,
                                parentItemID: weaknessData.parent_item_id
                            }
                        }),
                        opp: res.data.results.opportunities.map((oppData, oppIndex) => {
                            return {
                                id: oppData.swot_item_id,
                                type: "opp",
                                serialNo: oppIndex + 1,
                                content: oppData.content,
                                display_order: 0,
                                parentItemID: oppData.parent_item_id
                            }
                        }),
                        threat: res.data.results.threats.map((threatData, threatIndex) => {
                            return {
                                id: threatData.swot_item_id,
                                type: "threat",
                                serialNo: threatIndex + 1,
                                content: threatData.content,
                                display_order: 0,
                                parentItemID: threatData.parent_item_id
                            }
                        })
                    }
                    setDocTableData(() => (formattedDocTableData));

                    // Format document header data
                    const formattedData = {
                        title: res.data.results.title,
                        created_by: res.data.results.author.firstname + " " + res.data.results.author.lastname,
                        approved_by: res.data.results.approver.firstname + " " + res.data.results.author.lastname,
                        approved_on: dayjs(new Date(res.data.results.approved_at)).format("MMMM D, YYYY h:mm A"),
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
        <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title="SWOT Archived" activeLink="/swot">
            <div className="c-Swot c-Main">
                {/* Breadcrumb */}
                <Breadcrumb className="c-Swot__Breadcrumb l-Breadcrumb">
                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item href="/swot">SWOT</Breadcrumb.Item>
                    <Breadcrumb.Item active>View Archived</Breadcrumb.Item>
                </Breadcrumb>

                {/* Top section */}
                <div className="c-Swot__Top c-Main__Top">
                    <h1>SWOT (Archived)</h1>
                </div>

                {/* Document section */}
                <div className="c-Swot__Document c-Main__Document">
                    {/* Document */}
                    <DocumentLayout >
                        <div className="c-Swot__Document-content c-Document">
                            {/* Document Header Info */}
                            <div className="c-Swot__Document-header c-Document__Header">
                                <div className="c-Swot__Document-header--left c-Document__Header--left">
                                    <p>Approved by:</p>
                                    <p>Submitted by:</p>
                                    <p>Approved on:</p>
                                </div>
                                <div className="c-Swot__Document-header--right c-Document__Header--right">
                                    <p>{docHeaderData.approved_by ? docHeaderData.approved_by : "Error"}</p>
                                    <p>{docHeaderData.created_by ? docHeaderData.created_by : "Error"}</p>
                                    <p>{docHeaderData.approved_on ? docHeaderData.approved_on : "Error"}</p>
                                </div>
                            </div>
                            {/* Swot table section */}
                            <SwotItems header="Strengths">
                                <BootstrapTable
                                    bordered={false}
                                    keyField='serialNo'
                                    data={docTableData.strength}
                                    columns={docSwotColumns}
                                />
                            </SwotItems>
                            <SwotItems header="Weaknesses">
                                <BootstrapTable
                                    bordered={false}
                                    keyField='serialNo'
                                    data={docTableData.weakness}
                                    columns={docSwotColumns}
                                />
                            </SwotItems>
                            <SwotItems header="Opportunities">
                                <BootstrapTable
                                    bordered={false}
                                    keyField='serialNo'
                                    data={docTableData.opp}
                                    columns={docSwotColumns}
                                />
                            </SwotItems>
                            <SwotItems header="Threats">
                                <BootstrapTable
                                    bordered={false}
                                    keyField='serialNo'
                                    data={docTableData.threat}
                                    columns={docSwotColumns}
                                />
                            </SwotItems>
                        </div>
                    </DocumentLayout>
                </div>

            </div>

        </PageLayout>
    )
}

export default SwotArchived;