import React, { useState } from 'react';
import logo from '../assets/images/eISO-admin-logo-white.png';
import profilePic from '../assets/images/default-profile-pic.jpg';
import { useHistory } from 'react-router-dom';
import { saveUserSideNavStatus, clearLocalStorage, getUserDisplayName, getUsername, getUserEmail, getUserCompanyAlias } from '../utilities/localStorageUtils';
import * as FaIcons from 'react-icons/fa';
import { IconContext } from 'react-icons';
import { toast } from 'react-toastify';
// import { Badge } from '@material-ui/core';



const Header = ({ sideNavStatus, setSideNavStatus }) => {
    let history = useHistory();
    const displayName = getUserDisplayName();
    const username = getUsername();
    const userEmail = getUserEmail();
    const companyAlias = getUserCompanyAlias();

    // States declaration
    const [isProfilePopUpOpen, setIsProfilePopUpOpen] = useState(false);


    // Handler for side navigation hamburger icon
    const handleSideNavHamburger = () => {
        saveUserSideNavStatus(!sideNavStatus);
        setSideNavStatus((prevState) => {
            return !prevState;
        });
    }

    // Handler for clicking on profile picture
    const handleProfilePicClick = () => {
        setIsProfilePopUpOpen((prevState) => (!prevState));
    }

    // Handler for logging out of system
    const handleLogOutClick = () => {
        clearLocalStorage();
        history.push("/login");
        toast.success('Successfully logged out!');
        console.log("this was ran");
    }

    return (
        <header>
            {/* Left section */}
            <div className="l-left">
                <div className="c-Hamburger">
                    <button onClick={handleSideNavHamburger}>
                        <IconContext.Provider value={{ color: "white", size: "21px" }}>
                            <FaIcons.FaBars />
                        </IconContext.Provider>
                    </button>
                </div>
                <div className="c-Logo">
                    <a href="/dashboard"><img src={logo} alt="logo" /></a>
                    <p>Associates Consulting Pte Ltd</p>
                </div>
            </div>

            {/* Right section */}
            <div className="l-right">

                {/* Notification bell section
                <div className="header-notification-icon-section">
                    <Badge badgeContent={1} color="secondary" variant="dot">
                        <IconContext.Provider value={{ color: "black", size: "21px" }}>
                            <FaIcons.FaBell />
                        </IconContext.Provider>
                    </Badge>
                </div> */}

                {/* Profile section */}
                <div className="l-Profile">
                    <div className="c-Profile">
                        <button onClick={handleProfilePicClick}>
                            <img src={profilePic} alt = "Profile img" />
                        </button>

                        {/* Profile picture pop up box */}
                        {isProfilePopUpOpen ?
                            <div className="l-ProfilePopUp">
                                <div className="c-ProfilePopUp">
                                    <div className="c-ProfilePopUp__top">
                                        <img src={profilePic} alt="Profile img" />
                                        <h1>{displayName ? displayName : "Error"}</h1>
                                        <h2>@{username ? username: "Error"}</h2>
                                        <h2>{userEmail ? userEmail : "Error" }</h2>
                                    </div>
                                    <div className="c-ProfilePopUp__bottom">
                                        <a href="/settings/manage-account">Manage Account</a>
                                        <hr />
                                        <button onClick={handleLogOutClick}>Log Out</button>
                                    </div>
                                </div>
                            </div>
                            :
                            null
                        }
                    </div>
                    <div className="c-ProfileName">
                        <h1>{displayName ? displayName : "Error"}</h1>
                    </div>
                </div>
            </div>

        </header>
    )
}

export default Header
    ;