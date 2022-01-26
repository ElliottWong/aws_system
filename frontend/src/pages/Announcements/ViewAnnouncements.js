import React, { useState } from 'react';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { ToastContainer } from 'react-toastify';
import config from '../../config/config';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';

const ViewAnnouncements = ({ match }) => {
    const aID = match.params.aid;
    const toastTiming = config.toastTiming;
    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);

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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='View Announcement' activeLink="/announcements">
                {/* Welcome message */}
                <div className="c-View-announcements c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-View-announcements__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/announcements">Announcements</Breadcrumb.Item>
                        <Breadcrumb.Item active>View Announcement</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Top section */}
                    <div className="c-View-announcements__Top c-Main__Top">
                        <h1>View Announcement</h1>
                    </div>

                    {/* Content section */}
                    <div className="c-View-announcements__Content">
                        <div className="c-Content__Top">
                            <hr/>
                            <h1>@BobSong</h1>
                            <h3>10 Nov 2021, 3:45PM</h3>
                            <p><i>This announcement was sent to all employee's email of this company</i></p>
                        </div>
                        <hr />
                        <div className="c-Content__Main">
                            <h1>Important: Double check for roles</h1>
                            <hr />
                            <p>
                                Hi all, <br />I have just assigned roles to your accounts, please help me double check if your role is allocated correctly. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                <br />
                                <br />
                                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                <br />
                                <br />
                                Regards,
                                <br />
                                Bob Song
                            </p>
                        </div>

                        <div className="c-Content__Attachments">
                            <p><i>2 Attachments</i></p>
                            <div className="c-Content__Attachments-section">

                            </div>
                        </div>
                        <hr />
                    </div>

                    {/* Danger zone */}
                    <div className="c-View-announcements__Danger">
                        <h1>Danger Zone</h1>
                        <div className="c-Danger__Row">
                            <button type="button" className="c-Btn c-Btn--alert-border">Delete</button>
                            <p>This action cannot be reversed.</p>
                        </div>

                    </div>


                </div>


            </PageLayout>
        </>
    )
}

export default ViewAnnouncements;