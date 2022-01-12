import React from 'react'
import { useHistory } from 'react-router-dom';

const AnnouncementsListItem = ({ id, username, date, title, content }) => {
    const history = useHistory();

    const handleClick = () => {
        history.push(`/announcements/view/${id}`);
    };

    return (
        <div className="c-Announcements-list-item" onClick={() => handleClick()}>
            <div className="c-Announcements-list-item__Content">
                <h1>@{username}</h1>
                <h3>{date}</h3>
                <h2>{title}</h2>
                <p>{content}</p>
            </div>
            <hr />
        </div>
    )
}

export default AnnouncementsListItem;