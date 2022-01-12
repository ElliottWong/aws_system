import React, { useState } from 'react';
import SideNavSubMenu from './SideNavSubMenu';
import { NavLink } from 'react-router-dom';
import sideNavListArr from '../../config/sideNavListArr';

/*
    Array data for side nav can be found/modified in utilities/sideNavList.js
*/

const SideNav = ({ sideNavStatus, activeLink }) => {

    var sideNavWidth = "100%";
    if (sideNavStatus === false) {
        sideNavWidth = "0px";
    }

    return (
        <div className="c-Sidenav" style={{ width: sideNavWidth }}>
            {  sideNavListArr.map((sideNavListObj, index) => {

                // Check if there's sub link
                if ("subLinksArr" in sideNavListObj) {
                    return (
                        <SideNavSubMenu key = {index} activeLink={activeLink} index={index} sideNavListObj={sideNavListObj} />
                    )
                } else {
                    if (sideNavListObj.link === activeLink) {
                        return <NavLink key={"" + index} to={sideNavListObj.link} className="c-Sidenav__Links-header--active c-Sidenav__Links-header ">{sideNavListObj.display}</NavLink>
                    }
                    return <NavLink key={"" + index} to={sideNavListObj.link} className = "c-Sidenav__Links-header " >{sideNavListObj.display}</NavLink>
                }
            })}
        </div>
    )
}

export default SideNav;


