import React from 'react'

const SettingsBentoBox = ({ type, link, linkDisplay, children }) => {
    return (
        <div className="l-Settings-Bento-Box">
            <div className="c-Settings-Bento-Box">
                {/* Main content */}
                <div className={type === 'row' ? "c-Settings-Bento-Box__Content c-Settings-Bento-Box__Content--row" : "c-Settings-Bento-Box__Content c-Settings-Bento-Box__Content--column"}>
                    {children}
                </div>
                {/* Link to page */}
                <div className="c-Settings-Bento-Box__Link" >
                    <a href={link}>{linkDisplay}</a>
                </div>
            </div>
        </div>
    )
}

export default SettingsBentoBox;