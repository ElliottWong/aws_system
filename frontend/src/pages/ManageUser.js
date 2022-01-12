import React, { useState, useEffect } from 'react';
import { getSideNavStatus } from '../utilities/sideNavUtils.js';
import PageLayout from '../layout/PageLayout';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import axios from 'axios';
import { getToken, getUserCompanyID } from '../utilities/localStorageUtils';
import jwt_decode from "jwt-decode";
import * as RiIcons from 'react-icons/ri';
import { IconContext } from 'react-icons';
import { ToastContainer, toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import ErrorCard from '../common/ErrorCard.js';
import CustomConfirmAlert from '../common/CustomConfirmAlert.js';
import config from '../config/config';
import TokenManager from '../utilities/tokenManager';

const ManageUser = ({ match }) => {
    const employeeID = match.params.employeeID;
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const toastTiming = config.toastTiming;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [userData, setUserData] = useState({
        roles: []
    });
    const [roleData, setRoleData] = useState([]);
    const [editData, setEditData] = useState({
        roles: '',
        jobTitle: ''
    });
    const [editMode, setEditMode] = useState({
        jobTitle: false
    });
    const [rerender, setRerender] = useState(false); // value of state doesnt matter, only using it to force useffect to execute
    const [renderErrorCard, setRenderErrorCard] = useState({
        render: false,
        errMsg: null,
        errStatus: null,
        errStatusText: null
    });
    const [realAdminLevel, setRealAdminLevel] = useState(0);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employees/${employeeID}?roles=true&company=true`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res);
                const resDataResults = res.data.results;
                const formattedUserData = {
                    fullName: `${resDataResults.firstname} ${resDataResults.lastname}`,
                    username: resDataResults.account.username,
                    jobTitle: resDataResults.title,
                    email: resDataResults.email,
                    companyName: resDataResults.company.name,
                    firstName: resDataResults.firstname,
                    lastName: resDataResults.lastname,
                    roles: resDataResults.roles,
                    accountStatus: resDataResults.account.status,
                    adminLevel: resDataResults.admin_level
                };
                setRealAdminLevel(() => resDataResults.admin_level)
                setUserData(() => formattedUserData);
            })
            .catch((err) => {
                console.log(err);
                if (err.response) {
                    if (err.response.status === 401 || err.response.status === 403 || err.response.status === 404) {
                        console.log("this was ran");
                        // return unauthorised error component
                        setRenderErrorCard((prevState) => ({
                            ...prevState,
                            render: true,
                            errMsg: err.response.data.message,
                            errStatus: err.response.status,
                            errStatusText: err.response.statusText
                        }));
                    }
                }

            });
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/roles`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then((res) => {
            console.log(res);
            const formattedRoleData = res.data.results;
            setRoleData(() => formattedRoleData);
        }).catch((err) => {
            console.log(err);
            console.log(err.response);
            if (err.response.status === 401 || err.response.status === 403 || err.response.status === 404) {
                console.log("this was ran");
                // return unauthorised error component
                setRenderErrorCard((prevState) => ({
                    ...prevState,
                    render: true,
                    errMsg: err.response.data.message,
                    errStatus: err.response.status,
                    errStatusText: err.response.statusText
                }));
            }
        });
    }, [rerender]);

    useEffect(() => {
        setEditData(() => ({
            role: '',
            jobTitle: userData.jobTitle
        }));
    }, [userData]);

    // Handler for adding / delete role
    const handleEditRole = (handleType, roleID) => {
        axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employee/${employeeID}/roles`, {
            roles: (() => {
                // handle add role
                if (handleType === "add") {
                    let tempRoleArrList = userData.roles.map((data, index) => {
                        return data.role_id
                    });
                    tempRoleArrList.push(editData.roles);
                    console.log(tempRoleArrList);
                    return tempRoleArrList;
                }
                // handle delete role 
                if (handleType === "delete") {
                    let tempRoleArrList = userData.roles.map((data, index) => {
                        return data.role_id
                    });
                    const indexOfToBeDeletedRoleID = tempRoleArrList.indexOf(roleID);
                    tempRoleArrList.splice(indexOfToBeDeletedRoleID, 1);
                    console.log(tempRoleArrList);
                    return tempRoleArrList;
                }
            })()
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res);
                setRerender((prevState) => !prevState);
                toast.success(<>Success!<br />Message: <b>Roles updated!</b></>);
            })
            .catch((err) => {
                console.log(err);
                let errCode = "Error!";
                let errMsg = "Error!"
                if (err.response !== undefined) {
                    errCode = err.response.status;
                    errMsg = err.response.data.message;
                }

                toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
            });
    };

    // Handler for select input change
    const handleSelectInputChange = (event) => {
        let selectValue = parseInt(event.target.value);

        setEditData((prevState) => ({
            ...prevState,
            [event.target.name]: selectValue
        }));
    };

    // Handler for input change
    const handleInputChange = (event) => {
        setEditData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    };

    // Handler for edit button
    const handleEditBtn = (editType) => {
        if (editType === "jobTitle") {
            setEditMode((prevState) => ({
                ...prevState,
                jobTitle: !prevState.jobTitle
            }));
            console.log(editData);
        }
    };

    // Handler for save button
    const handleSaveBtn = (saveType) => {
        if (saveType === "jobTitle") {
            axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employees/${employeeID}`, { title: editData.jobTitle }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    console.log(res);
                    setEditData((prevState) => ({
                        ...prevState,
                        jobTitle: userData.jobTitle
                    }));
                    setEditMode((prevState) => ({
                        ...prevState,
                        jobTitle: !prevState.jobTitle
                    }));
                    setRerender((prevState) => !prevState);
                    toast.success(<>Success!<br />Message: <b>Job title has been updated!</b></>);
                })
                .catch((err) => {
                    console.log(err);
                    let errCode = "Error!";
                    let errMsg = "Error!"
                    if (err.response !== undefined) {
                        errCode = err.response.status;
                        errMsg = err.response.data.message;
                    }
                    toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                });
        }
    };

    // Handler for cancel button
    const handleCancelBtn = (cancelType) => {
        if (cancelType === "jobTitle") {
            setEditData((prevState) => ({
                ...prevState,
                jobTitle: userData.jobTitle
            }));
            setEditMode((prevState) => ({
                ...prevState,
                jobTitle: !prevState.jobTitle
            }))
        }
    };

    // Handler for user activation 
    const handleUserActivation = (actionType) => {
        let accountStatusType;
        if (actionType === "activated") {
            accountStatusType = "active";
            // Confirmation dialogue for activating this account
            const message = `Are you sure you want to activate this account?`;
            const handler = (onClose) => handleActivateAccount(onClose);
            const heading = `Confirm Activate?`;
            const type = "primary"
            const data = {
                message,
                handler,
                heading,
                type
            };
            confirmAlert({
                customUI: ({ onClose }) => {
                    return <CustomConfirmAlert {...data} onClose={onClose} />;
                }
            });
        } else {
            accountStatusType = "deactivated";
            // Confirmation dialogue for deactivating this account
            const message = `Are you sure you want to deactivate this account?`;
            const handler = (onClose) => handleActivateAccount(onClose);
            const heading = `Confirm Dectivate?`;
            const type = "alert"
            const data = {
                message,
                handler,
                heading,
                type
            };
            confirmAlert({
                customUI: ({ onClose }) => {
                    return <CustomConfirmAlert {...data} onClose={onClose} />;
                }
            });
        }

        const handleActivateAccount = (onClose) => {
            axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employees/${employeeID}`, {
                account_status: accountStatusType
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    console.log(res);
                    setRerender((prevState) => !prevState);
                    onClose();
                    toast.success(<>Success!<br />Message: <b>User has been {actionType}!</b></>);
                })
                .catch((err) => {
                    console.log(err);
                    console.log(err.response);
                    let errCode = "Error!";
                    let errMsg = "Error!"
                    if (err.response !== undefined) {
                        errCode = err.response.status;
                        errMsg = err.response.data.message;
                    }
                    onClose();
                    toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                });
        }
    };

    // Handle admin level save button
    const handleAdminLevelSaveBtn = () => {
        if (realAdminLevel === 2) {
            toast.error(<>Error! Message: <b>Super admin cannot change its own level</b></>);
            return;
        }
        console.log(userData.adminLevel);
        axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employees/${employeeID}`, {
            admin_level: userData.adminLevel
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res);
                setRerender((prevState) => !prevState);
                toast.success(<>Success!<br />Message: <b> Admin level has been updated!</b></>);
            })
            .catch((err) => {
                console.log(err);
                let errCode = "Error!";
                let errMsg = "Error!"
                if (err.response !== undefined) {
                    errCode = err.response.status;
                    errMsg = err.response.data.message;
                }
                toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
            });
    };

    // Handler for admin level select input
    const handleAdminLevelSelect = (event) => {
        setUserData((prevState) => ({
            ...prevState,
            [event.target.name]: [event.target.value]
        }));
    }

    // Handler for rendering add role button section
    const renderAddRoleBtnSection = () => {
        let userHaveAllRoles = false;
        const roleDataArr = roleData.map((data, index) => {
            return data.role_id;
        });

        const userRoleDataArr = userData.roles.map((data, index) => {
            return data.role_id;
        });
        // Stringify array to compare. Cannot compare objects
        if (JSON.stringify(roleDataArr.sort()) === JSON.stringify(userRoleDataArr.sort())) {
            userHaveAllRoles = true;
        }

        if (userHaveAllRoles) {
            return (
                <button className="c-Roles__Add c-Btn c-Btn--disabled" disabled>Add</button>
            );
        } else {
            return (
                <button className="c-Roles__Add c-Btn c-Btn--primary" onClick={() => handleEditRole("add")}>Add</button>
            );
        }
    };



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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Manage User' activeLink="/settings">
                <div className="c-Manage-user c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Manage-user__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/settings">Settings</Breadcrumb.Item>
                        <Breadcrumb.Item href="/settings/manage-users">Manage users</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage user</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-user__Top c-Main__Top">
                        <h1>Manage User</h1>
                    </div>
                    {
                        renderErrorCard.render ?
                            <ErrorCard errMsg={renderErrorCard.errMsg} errStatus={renderErrorCard.errStatus} errStatusText={renderErrorCard.errStatusText} />
                            :
                            <>
                                {/* Input fields */}
                                <h1 className="c-Manage-user__User-heading">You are viewing settings for @{`${userData.username}`}</h1>
                                {/* First row */}
                                <div className="c-Manage-user__Inputs">
                                    <div className="c-Inputs__Left">
                                        <div className="c-Left__Admin-level">
                                            {/* Admin level */}
                                            <label htmlFor="adminLevel">Admin Level</label>
                                            <select disabled={realAdminLevel === 2 ? true : false} name="adminLevel" onChange={handleAdminLevelSelect} value={userData.adminLevel || 0}>
                                                <option value="0">Normal User</option>
                                                {/* <option value="2">System Admin</option> */}
                                                <option value="3">Secondary Admin</option>
                                            </select>
                                            <button disabled={realAdminLevel === 2 ? true : false} type="button" className={realAdminLevel === 2 ? "c-Btn c-Btn--disabled" : "c-Btn c-Btn--primary"} onClick={handleAdminLevelSaveBtn}>Save</button>
                                        </div>
                                        <div className="c-Left__Job-title">
                                            <h2>Job Title</h2>
                                            <div className="c-Job-title__Input">

                                                {
                                                    editMode.jobTitle ?
                                                        <>
                                                            <input type="text" name="jobTitle" value={editData.jobTitle || ''} onChange={handleInputChange} />
                                                            <div className="c-Input__Btn-section">
                                                                <button type="button" className="c-Btn c-Btn--primary" onClick={() => handleSaveBtn("jobTitle")}>Save</button>
                                                                <button type="button" className="c-Btn c-Btn--cancel" onClick={() => handleCancelBtn("jobTitle")}>Cancel</button>
                                                            </div>

                                                        </>
                                                        :
                                                        <>
                                                            <input type="text" value={userData.jobTitle || ''} disabled />
                                                            <div className="c-Input__Btn-section c-Btn-section--edit">
                                                                <button type="button" className="c-Btn c-Btn--primary" onClick={() => handleEditBtn("jobTitle")}>Edit</button>
                                                            </div>
                                                        </>
                                                }

                                            </div>

                                        </div>

                                    </div>

                                    <div className="c-Inputs__Right">
                                        <label htmlFor="roles">Current Role(s)</label>
                                        {/* Select role input */}
                                        <select name="roles" onChange={handleSelectInputChange} value={editData.roles}>
                                            <option value={''}>Please select a role</option>
                                            {
                                                roleData.map((data1, index1) => {
                                                    let userHaveAlready = false;
                                                    userData.roles.forEach((data2, index2) => {
                                                        if (data1.role_id === data2.role_id) {
                                                            userHaveAlready = true;
                                                        }
                                                    });
                                                    if (!userHaveAlready) {
                                                        return <option key={index1} value={data1.role_id}>{data1.name}</option>
                                                    } else {
                                                        return null;
                                                    }
                                                })
                                            }
                                        </select>
                                        {/* Current role list */}
                                        {
                                            userData.roles.map((data, index) => {
                                                return (
                                                    <div key={index} className="c-Roles__Data">
                                                        {data.name}
                                                        <div className="c-Data__Delete-Btn">
                                                            <IconContext.Provider value={{ color: "#DC3545", size: "21px" }}>
                                                                <RiIcons.RiDeleteBin7Line onClick={() => handleEditRole("delete", data.role_id)} />
                                                            </IconContext.Provider>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        }

                                        {/* render button */}
                                        {renderAddRoleBtnSection()}


                                    </div>

                                </div>
                                {/* Second row */}
                                <div className="c-Manage-user__Inputs">

                                </div>
                                {
                                    realAdminLevel === 2 ?
                                        null :
                                        <>
                                            {/* Third row */}
                                            < div className="c-Manage-user__Inputs">
                                                <div className="c-Inputs__Danger-zone">

                                                    <h2>Danger Zone</h2>
                                                    <div className="c-Danger-zone__Row">
                                                        {
                                                            userData.accountStatus === "active" ?
                                                                <>
                                                                    <button type="button" className="c-Btn c-Btn--alert-border" onClick={() => handleUserActivation("deactivated")}>Deactivate user</button>
                                                                    <div className="c-Row__Info">
                                                                        <h3>Deactivate this user</h3>
                                                                        <p>The user will not have access to the company's eISO system.</p>
                                                                    </div>
                                                                </> :
                                                                <>
                                                                    <button type="button" className="c-Btn c-Btn--primary-border" onClick={() => handleUserActivation("activated")}>Activate user</button>
                                                                    <div className="c-Row__Info">
                                                                        <h3>Activate this user</h3>
                                                                        <p>The user will regain access to the company's eISO system.</p>
                                                                    </div>
                                                                </>
                                                        }

                                                    </div>
                                                </div>
                                            </div>
                                        </>

                                }

                            </>
                    }

                </div>
            </PageLayout>
        </>
    )
}

export default ManageUser;