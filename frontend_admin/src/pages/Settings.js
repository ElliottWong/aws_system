import React, { useState, useEffect } from 'react';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import profilePic from '../assets/images/default-profile-pic.jpg';
import { getUserDisplayName, getUserEmail, getUserCompanyName, getUserJobTitle, getUserCompanyAlias, getUserCompanyID, getToken } from '../utilities/localStorageUtils';
import PageLayout from '../layout/PageLayout';
import SettingsBentoBox from '../common/SettingsBentoBox';
import { getSideNavStatus } from '../utilities/sideNavUtils.js';
import jwt_decode from "jwt-decode";

const Settings = () => {

    const displayName = getUserDisplayName();
    const email = getUserEmail();
    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);

    return (
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
                                    <p>{email ? email : "Error"}</p>
                                    <p>Associates Consulting</p>
                                </div>
                            </SettingsBentoBox>
                        </div>

                    </div>
                </div>
            </PageLayout>
    )
}

export default Settings;