import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import * as RiIcons from "react-icons/ri";
import { IconContext } from 'react-icons';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import TokenManager from "../../utilities/tokenManager";


const SideNavSubMenu = ({ sideNavListObj, index, activeLink }) => {

    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userID = decodedToken.employee_id;
    const userCompanyID = decodedToken.company_id;
    const [adminLevel, setAdminLevel] = useState(null);

    const [isSubMenuOpen, setIsSubMenuOpen] = useState(() => {
        if (activeLink === sideNavListObj.link) {
            return true;
        }
        return false;
    });

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employees/${userID}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                setAdminLevel(() => res.data.results.admin_level);
            })
            .catch((err) => {
                console.log(err);
                setAdminLevel(() => null);
            });
    }, []);

    // Handler for sub menu
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
                            let isSecondaryAdmin = false;
                            // if user is secondary admin
                            if (subLinkObj.header === "Organisation Settings" && adminLevel === 3) {
                                isSecondaryAdmin = true;
                            }
                            // if user is not super admin
                            else if (subLinkObj.header === "Organisation Settings" && adminLevel !== 2) {
                                return null;
                            }
                            return (
                                <div className = "c-Sidenav__Sub-links" key={calMapIndex}>
                                    <h2 key={"" + calMapIndex} className="c-Sub-links__Header">{subLinkObj.header}</h2>
                                    {subLinkObj.subLinks.map((subLink) => {
                                        if (isSecondaryAdmin) {
                                            if (subLink.link === "/manage-users" || subLink.link === "/manage-organization") {
                                                return null
                                            }
                                        }
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
