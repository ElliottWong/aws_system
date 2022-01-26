import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import ObjAchivProgramItem from '../../common/ObjAchivProgramItem';
import DocumentLayout from '../../layout/DocumentLayout';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils';
import TokenManager from '../../utilities/tokenManager';

const ObjAchivProgramArchived = ({ match }) => {
    const oapID = match.params.oapID;     // get id of company policy
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [docHeaderData, setDocHeaderData] = useState({});
    const [docTableData, setDocTableData] = useState([]);

    useEffect(() => {
        if (!isNaN(oapID) && oapID !== null) {
            axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/objective-achievements/${oapID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    // Format dopcument table data
                    if (res.data.results !== undefined) {
                        const formattedDocTableData = res.data.results.items.map((data, index) => {
                            return ({
                                ...data,
                                id: data.achievement_id,
                            });
                        });
                        setDocTableData(() => (formattedDocTableData));
                        // Format document header data
                        const formattedData = {
                            title: res.data.results.title,
                            created_by: res.data.results.author.firstname + " " + res.data.results.author.lastname,
                            approved_by: res.data.results.approver.firstname + " " + res.data.results.author.lastname,
                            approved_on: dayjs(new Date(res.data.results.approved_on)).format("MMMM D, YYYY h:mm A"),
                        }
                        setDocHeaderData(() => (formattedData));
                    } else {
                        // Format dopcument table data
                        const formattedDocTableData = res.data.items.map((data, index) => {
                            return ({
                                ...data,
                                id: data.achievement_id,
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
                    }



                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, []);

    return (
        <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Objective Achievement Program' activeLink="/objective-achievement-program">
            <div className="c-Obj-Achiv-Program c-Main">
                {/* Breadcrumb */}
                <Breadcrumb className="c-Obj-Achiv-Program__Breadcrumb l-Breadcrumb">
                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item href="/objective-achievement-program">Objective Achivement Program</Breadcrumb.Item>
                    <Breadcrumb.Item active>View Archived</Breadcrumb.Item>
                </Breadcrumb>
                {/* Top section */}
                <div className="c-Obj-Achiv-Program__Top c-Main__Top">
                    <h1>Objective Achievement Program</h1>
                </div>

                {/* Document section */}
                <div className="c-Obj-Achiv-Program__Document c-Main__Document">
                    {/* Document */}
                    <DocumentLayout>
                        <div className="c-Obj-Achiv-Program__Document-content c-Document">
                            {/* Title */}
                            <h1 className="c-Document__Title">{docHeaderData.title ? docHeaderData.title : "Failed to load data!"}</h1>
                            {/* Document Header Info */}
                            <div className="c-Obj-Achiv-Program__Document-header c-Document__Header">
                                <div className="c-Obj-Achiv-Program__Document-header--left c-Document__Header--left">
                                    <p>Approved by:</p>
                                    <p>Submitted by:</p>
                                    <p>Approved on:</p>
                                </div>
                                <div className="c-Obj-Achiv-Program__Document-header--right c-Document__Header--right">
                                    <p>{docHeaderData.approved_by ? docHeaderData.approved_by : "Error"}</p>
                                    <p>{docHeaderData.created_by ? docHeaderData.created_by : "Error"}</p>
                                    <p>{docHeaderData.approved_on ? docHeaderData.approved_on : "Error"}</p>
                                </div>
                            </div>
                            {/* Map through an array to display ObjAchivProgramItem */}
                            {docTableData.map((data, index) => (
                                <ObjAchivProgramItem
                                    key={index}
                                    docType="active"
                                    itemContent={data}
                                />
                            ))
                            }
                        </div>
                    </DocumentLayout>
                </div>


            </div>
        </PageLayout>
    )
}

export default ObjAchivProgramArchived;