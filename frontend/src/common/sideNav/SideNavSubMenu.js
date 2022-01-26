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
    const [access, setAccess] = useState([]);

    const [isSubMenuOpen, setIsSubMenuOpen] = useState(() => {
        if (activeLink === sideNavListObj.link) {
            return true;
        }
        return false;
    });

    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                const employeeDataRes = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employees/${userID}`);

                if (componentMounted) {
                    setAdminLevel(() => employeeDataRes.data.results.admin_level);

                    if (sideNavListObj.link === "/training") {
                        const checkEditTrainingRequestRes = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m07_03a/employees`);
                        const checkApproveTrainingRequestRes = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m07_03a/employees`);

                        const editerListData = checkEditTrainingRequestRes.data.results;
                        const approverListData = checkApproveTrainingRequestRes.data.results;

                        let tempIsEditer = false;
                        let tempIsApprover = false;
                        if (editerListData !== undefined) {
                            editerListData.every((editer) => {
                                if (editer.employee_id === userID) {
                                    tempIsEditer = true;
                                    return false;
                                }
                                return true;
                            });
                        }

                        if (approverListData !== undefined) {
                            approverListData.every((approver) => {
                                if (approver.employee_id === userID) {
                                    tempIsApprover = true;
                                    return false;
                                }
                                return true;
                            });
                        }

                        // TO BE IMPROVED
                        setAccess((prevState) => ([
                            {
                                "7.3a": {
                                    "edit": tempIsEditer,
                                    "approve": tempIsApprover
                                }
                            }
                        ]));
                    }
                }

            } catch (err) {
                setAdminLevel(() => null);
                console.log(err);
            }
        })();

        return (() => {
            componentMounted = false;
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

                            // If sub page is training pages
                            if (subLinkObj.header === "Training Pages") {
                                let isEditer = false;
                                let isApprover = false;
                                access.every((oneAccess) => {
                                    let moduleCode =  Object.keys(oneAccess)[0];
                                    if (moduleCode === "7.3a") {
                                        isEditer = oneAccess[moduleCode].edit;
                                        isApprover = oneAccess[moduleCode].approve;
                                        return false;
                                    }
                                    return true;
                                });
                                // User is not an editer or approver for this clause
                                if (!isEditer && !isApprover) {
                                    return "You do not have access to this section.";
                                }
                            }


                            return (
                                <div className="c-Sidenav__Sub-links" key={calMapIndex}>
                                    <h2 key={"" + calMapIndex} className="c-Sub-links__Header">{subLinkObj.header}</h2>
                                    {subLinkObj.subLinks.map((subLink) => {
                                        // Restrict access to training pages to only users with edit and/or approve permission roles
                                        if (subLinkObj.header === "Training Pages") {
                                            let isEditer = false;
                                            let isApprover = false;
                                            access.every((oneAccess) => {
                                                let moduleCode =  Object.keys(oneAccess)[0];
                                                if (moduleCode === "7.3a") {
                                                    isEditer = oneAccess[moduleCode].edit;
                                                    isApprover = oneAccess[moduleCode].approve;
                                                    return false;
                                                }
                                                return true;
                                            });

                                            if (subLink.link === "/requests" || subLink.link === "/records") {
      
                                                if (!isEditer) {
                                                    return null;
                                                }
                                            }

                                            if (subLink.link === "/manage/requests" || subLink.link === "/manage/records") {
                                                if (!isApprover) {
                                                    return null;
                                                }
                                            }
                                        }

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
