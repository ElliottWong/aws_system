import React, { useState, useEffect } from 'react';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import { getUserDisplayName, getToken, getUserCompanyID } from '../../utilities/localStorageUtils.js';
import PageLayout from '../../layout/PageLayout';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import { ToastContainer } from 'react-toastify';
import config from '../../config/config';
import dayjs from 'dayjs';
import { useHistory } from 'react-router-dom';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import AnnouncementsListItem from '../../common/AnnouncementsListItem.js';

const Announcements = () => {
    const toastTiming = config.toastTiming;
    const history = useHistory();
    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);

    const announcementData = [
        {
            id: 1,
            username: "BobSong",
            date: dayjs(new Date()).format("MMMM D, YYYY h:mm A"),
            title: "Important: Double check for roles",
            content: "Hi all, I have just assigned roles to your accounts, please help me double check "
        },
        {
            id: 2,
            username: "BobSong",
            date: dayjs(new Date()).format("MMMM D, YYYY h:mm A"),
            title: "Important: Double check for roles",
            content: "Hi all, I have just assigned roles to your accounts, please help me double check "
        },
        {
            id: 3,
            username: "BobSong",
            date: dayjs(new Date()).format("MMMM D, YYYY h:mm A"),
            title: "Important: Double check for roles",
            content: "Hi all, I have just assigned roles to your accounts, please help me double check "
        },
        
    ];

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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Announcements' activeLink="/announcements">
                {/* Welcome message */}
                <div className="c-Announcements c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Announcements__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Announcements</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Top section */}
                    <div className="c-Announcements__Top c-Main__Top">
                        <h1>Announcements</h1>
                        <button type="button" className="c-Btn c-Btn--primary" onClick={() => history.push("/announcements/create")}>Create announcements</button>
                    </div>

                    {/* Filter section */}
                    <div className="c-Announcements__Filter">

                    </div>

                    {/* Annouoncement list */}
                    <div className="c-Announcements__List">
                        {
                            announcementData ?
                                <>
                                    <hr />
                                    {
                                        announcementData.map((data, index) =>
                                            <AnnouncementsListItem
                                                key={index}
                                                id={data.id}
                                                username={data.username}
                                                date={data.date}
                                                title={data.title}
                                                content={data.content}
                                            />
                                        )
                                    }
                                </>
                                :
                                <p>No records found.</p>
                        }
                    </div>
                </div>


            </PageLayout>
        </>
    )
}

export default Announcements;