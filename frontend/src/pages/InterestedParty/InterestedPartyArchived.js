import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import DocumentLayout from '../../layout/DocumentLayout';
import BootstrapTable from 'react-bootstrap-table-next';
import { getSideNavStatus } from '../../utilities/sideNavUtils';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { docInterestedPartyColumns } from '../../config/tableColumns';
import axios from 'axios';
import dayjs from 'dayjs';
import TokenManager from '../../utilities/tokenManager';


const InterestedPartyArchived = ({ match }) => {
    const ipID = match.params.ipID;     // get id of interested party
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [docHeaderData, setDocHeaderData] = useState({});
    const [docTableData, setDocTableData] = useState([]);

    useEffect(() => {
        if (!isNaN(ipID) && ipID !== null) {
            axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/interested-parties/${ipID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    // Format dopcument table data
                    const formattedDocTableData = res.data.items.map((data, index) => {
                        return ({
                            id: data.party_item_id,
                            needs_n_expectations: (() => {
                                if (data.expectations.split("\n").length > 1) {
                                    return data.expectations.split("\n").map(strLine => (<>{strLine}<br /></>));
                                }
                                return data.expectations;
                            })(),
                            serialNo: index + 1,
                            interested_parties: data.interested_party,
                            parentItemID: data.parent_item_id
                        })
                    });
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
        <>
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title="Interested Party Archived" activeLink="/interested-party">
                <div className="c-IP c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-IP__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/interested-party">Interested Party</Breadcrumb.Item>
                        <Breadcrumb.Item active>View Archived</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Top section */}
                    <div className="c-IP__Top c-Main__Top">
                        <h1>Interested Parties (Archived)</h1>
                    </div>
                    {/* Document section */}
                    <div className="c-IP__Document c-Main__Document">

                        {/* Document */}
                        <DocumentLayout >
                            <div className="c-IP__Document-content c-Document">
                                {/* Title */}
                                <h1 className="c-Document__Title">{docHeaderData.title ? docHeaderData.title : "Failed to load data!"}</h1>
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
                                <BootstrapTable keyField='serialNo' data={docTableData} columns={docInterestedPartyColumns} />
                            </div>
                        </DocumentLayout>
                    </div>

                </div>
            </PageLayout>
        </>
    )
}

export default InterestedPartyArchived;