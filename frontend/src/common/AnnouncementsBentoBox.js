import React from 'react';
import { NavLink } from 'react-router-dom';

const AnnouncementsBentoBox = ({ username, date, title, content, link }) => {
    if (username) {
        username = "@" + username;
    }
    return (
        <div className="l-Announcements-bento-box">
            {/* Top Line (Deco) */}
            <div className="l-Announcements-bento-box__Top-line"></div>
            <div className="c-Announcements-bento-box">

                {/* Account Information */}
                <div className="c-Announcements-bento-box__Account">
                    <h1>{username}</h1>
                    <p>{date}</p>
                </div>
                <hr />
                {/* Announcement Content */}
                <div className="c-Announcements-bento-box__Content">
                    <h1>{title}</h1>
                    <p>{content}</p>
                </div>
                {/* View More Link */}
                <div className="c-Announcements-bento-box__Link">
                    <NavLink to={`/${link}`}>View more</NavLink>
                </div>
            </div>
        </div>
    )
}

export default AnnouncementsBentoBox;