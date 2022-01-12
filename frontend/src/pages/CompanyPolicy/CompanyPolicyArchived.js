import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import DocumentLayout from '../../layout/DocumentLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import CompanyPolicyItem from '../../common/CompanyPolicyItem';
import axios from 'axios';
import dayjs from 'dayjs';
import TokenManager from '../../utilities/tokenManager';


const CompanyPolicyArchived = ({ match }) => {
    const companyPolicyID = match.params.companyPolicyID;     // get id of company policy
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [docHeaderData, setDocHeaderData] = useState({});
    const [docTableData, setDocTableData] = useState([]);

    useEffect(() => {
        if (!isNaN(companyPolicyID) && companyPolicyID !== null) {
            axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/policies/${companyPolicyID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    // Format dopcument table data
                    const formattedDocTableData = res.data.items.map((data, index) => {
                        return ({
                            ...data,
                            id: data.policy_item_id,
                        });
                    });
                    setDocTableData(() => (formattedDocTableData));

                    // Format document header data
                    const formattedData = {
                        title: res.data.title,
                        created_by: res.data.author.firstname + " " + res.data.author.lastname,
                        approved_by: res.data.approver.firstname + " " + res.data.author.lastname,
                        approved_on: dayjs(new Date(res.data.approved_on)).format("MMMM D, YYYY h:mm A"),
                    }
                    setDocHeaderData(() => (formattedData));

                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, []);


    return (
        <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Company Policy' activeLink="/company-policy">
            <div className="c-Company-Policy c-Main">
                {/* Breadcrumb */}
                <Breadcrumb className="c-Company-Policy__Breadcrumb l-Breadcrumb">
                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item href="/company-policy">Company Policy</Breadcrumb.Item>
                    <Breadcrumb.Item active>View archived</Breadcrumb.Item>
                </Breadcrumb>
                {/* Top section */}
                <div className="c-Company-Policy__Top c-Main__Top">
                    <h1>Company Policy (Archived)</h1>
                </div>
                {/* Document section */}
                <div className="c-Company-Policy__Document c-Main__Document">
                    {/* Document */}
                    <DocumentLayout >
                        <div className="c-Company-Policy__Document-content c-Document">
                            {/* Title */}
                            <h1 className="c-Document__Title">{docHeaderData.title ? docHeaderData.title : "Failed to load data!"}</h1>
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
                    </DocumentLayout>
                </div>

            </div>
        </PageLayout>
    );
}

export default CompanyPolicyArchived;