import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import * as RiIcons from "react-icons/ri";
import { IconContext } from 'react-icons';

const SideNavSubMenu = ({ sideNavListObj, index, activeLink }) => {

    const [isSubMenuOpen, setIsSubMenuOpen] = useState(() => {
        if (activeLink === sideNavListObj.link) {
            return true;
        }
        return false;
    });

    const handleSubMenuIcon = () => {
        setIsSubMenuOpen(() => (!isSubMenuOpen));
    };

    return (
        <>
            {/* Sidebar label */}
            {
                sideNavListObj.link === activeLink ?
                    <div key={"" + index} className="c-Sidenav__Links-header--active c-Sidenav__Links-header" onClick={handleSubMenuIcon}>
                        <p>{sideNavListObj.display}</p>
                        {
                            isSubMenuOpen ?
                                <IconContext.Provider value={{ size: "21px" }}>
                                    <RiIcons.RiArrowDropUpLine />
                                </IconContext.Provider>
                                :
                                <IconContext.Provider value={{ size: "21px" }}>
                                    <RiIcons.RiArrowDropDownLine />
                                </IconContext.Provider>
                        }

                    </div>
                    :
                    <div key={"" + index} className="c-Sidenav__Links-header " onClick={handleSubMenuIcon}>
                        <p>{sideNavListObj.display}</p>
                        {
                            isSubMenuOpen ?
                                <IconContext.Provider value={{ size: "21px" }}>
                                    <RiIcons.RiArrowDropUpLine />
                                </IconContext.Provider>
                                :
                                <IconContext.Provider value={{ size: "21px" }}>
                                    <RiIcons.RiArrowDropDownLine />
                                </IconContext.Provider>
                        }
                    </div>
            }

            <div className="l-Sidenav__Sub-links--outer" >
                {isSubMenuOpen ?
                    <div className="l-Sidenav__Sub-links--inner">
                        {sideNavListObj.subLinksArr.map((subLinkObj, calMapIndex) => {
                            return (
                                <div className = "c-Sidenav__Sub-links" key={calMapIndex}>
                                    <h2 key={"" + calMapIndex} className="c-Sub-links__Header">{subLinkObj.header}</h2>
                                    {subLinkObj.subLinks.map((subLink) => {
                                        return <NavLink key={"" + subLink.link} to={sideNavListObj.link + subLink.link} className="c-Sub-links__Links">{subLink.display}</NavLink>
                                    })}

                                    {/* Don't render horizontal line if it's last sub link section*/}
                                    {sideNavListObj.subLinksArr.length - 1 !== calMapIndex ? <hr className="c-Sub-links__HR" /> : null}
                                </div>
                            )
                        })}
                    </div>
                    :
                    null
                }
            </div>
        </>
    )
}

export default SideNavSubMenu;
