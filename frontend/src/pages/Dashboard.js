import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AnnouncementsBentoBox from '../common/AnnouncementsBentoBox.js';
import DashboardInfoCards from '../common/DashboardInfoCards';
import config from '../config/config';
import PageLayout from '../layout/PageLayout';
import { getSideNavStatus } from '../utilities/sideNavUtils.js';
import TokenManager from '../utilities/tokenManager.js';

const Dashboard = () => {

    // Variable declarations
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const displayName = decodedToken.display_name;
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;
    const toastTiming = config.toastTiming;
    const axiosConfig = {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }
    const contentVariableArr = ["companyScope", "companyReferences", "companyTerms"];
    const dataUrlArr = [
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/scopes`, axiosConfig),
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/references`, axiosConfig),
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/terms`, axiosConfig)
    ];
    const editorUrlArr = [
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m01_01/employees`, axiosConfig),
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m02_01/employees`, axiosConfig),
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m03_01/employees`, axiosConfig),
    ];

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [organisationContent, setOrganisationContent] = useState({
        companyScope: undefined,
        companyReferences: undefined,
        companyTerms: undefined
    });
    const [isEditor, setIsEditor] = useState({
        companyScope: false,
        companyReferences: false,
        companyTerms: false
    });

    useEffect(() => {
        Promise.all(dataUrlArr)
            .then((res) => {
                // Go through response object, if document is found then set organisation content
                res.forEach((resObj, i) => {
                    if (resObj.status === 200) {
                        setOrganisationContent((prevState) => ({
                            ...prevState,
                            [contentVariableArr[i]]: resObj.data.content
                        }));
                    }
                });
            })
            .catch((err) => {
                console.log(err);
            });
        Promise.all(editorUrlArr)
            .then((res) => {
                // Go through response object, if document is found then set content as editable
                res.forEach((resObj, i) => {
                    if (resObj.status === 200) {
                        let canEdit = false;
                        resObj.data.results.forEach((data, index) => {
                            if (data.employee_id === userID) {
                                canEdit = true;
                            }
                        });
                        if (canEdit === true) {
                            setIsEditor((prevState) => ({
                                ...prevState,
                                [contentVariableArr[i]]: true
                            }));
                        }
                    }
                })
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);
    console.log(isEditor);

    return (
        <>
            <ToastContainer
                position="top-center"
                autoClose={toastTiming}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Dashboard' activeLink="/dashboard">
                {/* Welcome message */}
                <Container className="c-Dashboard">
                    <Row className="c-Dashboard__Welcome">
                        <h1>Welcome!</h1>
                        <h2>{displayName ? displayName : "Error in retrieving name"}</h2>
                    </Row>

                    {/* Latest Announcements */}
                    <Row className="c-Dashboard__Latest-announcements">
                        {/* Heading */}
                        <div className="c-Latest-announcements__Heading">
                            <h1>Latest Announcements</h1>
                        </div>
                        <Row className="c-Latest-announcements__Content">
                            <Col className="c-Latest-announcements__Wrapper" md = {12} lg = {6}>
                                <AnnouncementsBentoBox
                                    username="BobSong"
                                    date={dayjs(new Date()).format("MMMM D, YYYY h:mm A")}
                                    title="Important: Double check for roles"
                                    content="Hi all, I have just assigned roles to your accounts, please help me double check if your role is allocated correctly.\nHi all, I have just assigned roles to your accounts, please help me double check if your role is allocated correctly.\n allocated correctly. allocated correctly. allocated correctly. allocated correctly. allocated correctly. allocated correctly. allocated correctly. allocated correctly. allocated correctly. allocated correctly. allocated correctly. allocated correctly."
                                />
                            </Col>
                            <Col className="c-Latest-announcements__Wrapper" md = {12} lg = {6}>
                                <AnnouncementsBentoBox
                                    username="BobSong"
                                    date={dayjs(new Date()).format("MMMM D, YYYY h:mm A")}
                                    title="Important: Double check for roles"
                                    content="Hi all, I have just assigned roles tose help mve just aouble check if your role is allocated correctly.\n"
                                />
                            </Col>
                        </Row>
                        <div className="c-Latest-announcements__Link">
                            <NavLink to="/announcements">View more Announcements</NavLink>
                        </div>

                    </Row>

                    {/* Statistic section
                    <div className="c-Dashboard__Stats">
                        <DashboardBentoBox bgVariation={1} stat="N.a." statType="Coming soon..." />
                        <DashboardBentoBox bgVariation={2} stat="N.a." statType="Coming soon..." />
                    </div> */}
                    {/* Clause 1 - 3 Organisation info*/}
                    <div className="c-Dashboard__Organisation-info">
                        {/* Heading */}
                        <div className="c-Organisation-Info__Heading">
                            <h1>Your organisation</h1>
                        </div>
                        {/* Info cards */}
                        <div className="l-Organisation-Info__Info-Cards">
                            <DashboardInfoCards isEditor={isEditor.companyReferences} organisationContent={organisationContent} type="companyScope" heading="Scope" />
                            <DashboardInfoCards isEditor={isEditor.companyScope} organisationContent={organisationContent} type="companyReferences" heading="Normative References" />
                            <DashboardInfoCards isEditor={isEditor.companyTerms} organisationContent={organisationContent} type="companyTerms" heading="Terms and definition" />
                        </div>
                    </div>

                </Container>


            </PageLayout>
        </>
    )
}

export default Dashboard;
