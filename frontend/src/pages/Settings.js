import React, { useState, useEffect } from 'react';
import { getSideNavStatus } from '../utilities/sideNavUtils.js';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import profilePic from '../assets/images/default-profile-pic.jpg';
import PageLayout from '../layout/PageLayout';
import SettingsBentoBox from '../common/SettingsBentoBox';
import { getUserDisplayName, getUserEmail, getUserCompanyName, getUserJobTitle, getUserCompanyAlias, getUserCompanyID, getToken } from '../utilities/localStorageUtils';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import TokenManager from '../utilities/tokenManager';

const Settings = () => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const displayName =  decodedToken.display_name;
    const jobTitle =  decodedToken.display_title;
    const email =  decodedToken.email;
    const companyName =  decodedToken.company_name;
    const companyAlias =  decodedToken.company_alias;
    const userID = decodedToken.employee_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [adminLevel, setAdminLevel] = useState(null);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employees/${userID}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res);
                setAdminLevel(() => res.data.results.admin_level);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    return (
        <>
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title="Settings" activeLink="/settings">

                <div className="c-Settings c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Settings__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Settings</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Page header */}
                    <div className="c-Settings__Top c-Main__Top">
                        <h1>Settings</h1>
                    </div>

                    {/* Bento box section */}
                    <div className="l-Settings__Bento-box">
                        {/* User settings */}
                        <div className="l-Bento-box__User-settings l-Bento-box">
                            <h2 className="l-Bento-box__Header">User Settings</h2>
                            <SettingsBentoBox type="row" link="/settings/manage-account" linkDisplay="Manage your account settings">
                                <div className="c-Settings-Bento-Box__User-image">
                                    <img src={profilePic} alt="User pic" />
                                </div>
                                <div className="c-Settings-Bento-Box__User-details">
                                    <p>{displayName ? displayName : "Error"}</p>
                                    <p>{jobTitle ? jobTitle : "Error"}</p>
                                    <p>{email ? email : "Error"}</p>
                                    <p>{companyName ? companyName : "Error"}</p>
                                </div>
                            </SettingsBentoBox>
                        </div>
                        {/* Organisation settings */}
                        {
                            adminLevel === 2 || adminLevel === 3 ?
                                <div className="l-Bento-box__Org-settings l-Bento-box">
                                    <h2 className="l-Bento-box__Header">Organisation Settings</h2>
                                    {
                                        adminLevel === 2 ?
                                            <>
                                                {/* Manage organisation settings */}
                                                <SettingsBentoBox type="column" link="/settings/manage-organization" linkDisplay="Manage your organization settings">
                                                    <div className="c-Settings-Bento-Box__Manage-org">
                                                        <h1>{companyAlias ? companyAlias : "Error"}</h1>
                                                        <h2>{companyName ? companyName : "Error"}</h2>
                                                    </div>
                                                </SettingsBentoBox>
                                                {/* Manage user settings  */}
                                                <SettingsBentoBox type="column" link="/settings/manage-users" linkDisplay="Manage your users">
                                                    <div className="c-Settings-Bento-Box__Manage-users">
                                                        <h1>Manage users</h1>
                                                        <h2>Click on the link to continue</h2>
                                                    </div>
                                                </SettingsBentoBox>
                                            </>
                                            :
                                            null
                                    }

                                    {/* Manage invite settings */}
                                    <SettingsBentoBox type="column" link="/settings/manage-invites" linkDisplay="Manage invites">
                                        <div className="c-Settings-Bento-Box__Manage-invites">
                                            <h1>Manage invites</h1>
                                            <h2>Click on the link to continue</h2>
                                        </div>
                                    </SettingsBentoBox>
                                </div>
                                : null
                        }

                    </div>
                </div>
            </PageLayout>

        </>
    )
}

export default Settings;
