import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import DocumentLayout from '../../layout/DocumentLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { useHistory } from 'react-router';
import { normalPermissionListArr } from '../../config/permissionListArr';
import axios from 'axios';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import { toast, ToastContainer } from 'react-toastify';
import config from '../../config/config';
import TokenManager from '../../utilities/tokenManager';

const RespNAuthorityAddRole = () => {
    const history = useHistory();
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const toastTiming = config.toastTiming;
    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [roleInputData, setRoleInputData] = useState({
        name: "",
        responsibility: "",
        rights: []
    });

    useEffect(() => {
        window.scrollTo(0, 0); // scroll to top when component is rendered
        setRoleInputData((prevState) => ({
            ...prevState,
            rights: (() => {
                return normalPermissionListArr.map((data, index) => {
                    return {
                        [data.moduleCode]: {
                            edit: false,
                            approve: false
                        }
                    };
                });
            })()
        }));

    }, []);
    console.log(roleInputData);

    // Handler for add role button
    const handeInputChange = (event) => {
        setRoleInputData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    };

    // Check if checkbox is checked
    const checkCheckboxChecked = (moduleCodeAndRights) => {
        const checkModuleCode = moduleCodeAndRights.split(" ")[0];
        const checkModuleRights = moduleCodeAndRights.split(" ")[1];
        let checkCheckboxChecked = false;
        roleInputData.rights.forEach((data, index) => {
            const moduleCode = Object.keys(data)[0];
            if (moduleCode === checkModuleCode) {
                if (checkModuleRights === "edit") {
                    checkCheckboxChecked = data[moduleCode].edit;
                } else {
                    checkCheckboxChecked = data[moduleCode].approve;
                }
            }
        });
        return checkCheckboxChecked;
    }

    // Handler for add role button
    const handleAddRole = () => {

        const formattedInsertData = {
            ...roleInputData,
            rights: (() => {
                let tempRightsObj = {};
                for (var i = 0; i < roleInputData.rights.length; i++) {
                    const moduleCode = Object.keys(roleInputData.rights[i])[0];
                    tempRightsObj[moduleCode] = {
                        approve: roleInputData.rights[i][moduleCode].approve,
                        edit: roleInputData.rights[i][moduleCode].edit,
                    };
                }
                return tempRightsObj;
            })()
        };
        console.log(formattedInsertData)
        axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/roles`, formattedInsertData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json;charset=UTF-8'
            }
        }).then((res) => {
            console.log(res);
            history.push('/responsibility-n-authority');
            // Need to set time out so that toast request will not be flushed out
            setTimeout(function () {
                toast.success(<>Success!<br />Message: <b>Role has been added!</b></>);
            }, 0);

        }).catch((err) => {
            console.log(err);
            console.log(err.response);
            let errCode = "Error!";
            let errMsg = "Error!"
            if (err.response !== undefined) {
                errCode = err.response.status;
                errMsg = err.response.data.message;
            }

            toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
        })
    };

    // Handler for checkbox change
    const handleCheckboxChange = (event) => {
        setRoleInputData((prevState) => ({
            ...prevState,
            rights: (() => {
                console.log(prevState);
                return prevState.rights.map((data, index) => {
                    const moduleCode = Object.keys(data)[0];
                    const checkModuleCode = event.target.name.split(" ")[0];
                    const checkIfEditExist = event.target.name.split(" ")[1] === "edit";
                    if (moduleCode === checkModuleCode) {
                        if (checkIfEditExist) {
                            return {
                                [moduleCode]: {
                                    approve: data[moduleCode].approve,
                                    edit: !data[moduleCode].edit,
                                }
                            }
                        } else {
                            return {
                                [moduleCode]: {
                                    approve: !data[moduleCode].approve,
                                    edit: data[moduleCode].edit,
                                }
                            }
                        }
                    }
                    return data;
                })
            })()
        }));
    }

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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Responsibility and Authority' activeLink="/responsibility-n-authority">
                <form onSubmit={(event) => (event.preventDefault())} className="c-Add-role c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Add-role__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/responsibility-n-authority">Resp. & Authority</Breadcrumb.Item>
                        <Breadcrumb.Item active>Add Role</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Top section */}
                    <div className="c-Add-role__Top c-Main__Top">
                        <h1>Add Role</h1>
                    </div>

                    {/* Configurations section */}
                    <div className="c-Add-role__Configs">
                        {/* Left section */}
                        <div className="l-Configs__Left">
                            <h1>Basic Details</h1>
                            {/* Role name */}
                            <div className="c-Configs__Role-name">
                                <label htmlFor="name">Role Name</label>
                                <input type="text" name="name" value={roleInputData.name} onChange={handeInputChange} />
                            </div>
                            {/* Description */}
                            <div className="c-Configs__Description">
                                <label htmlFor="responsibility">Responsibility</label>
                                <textarea wrap="hard" name="responsibility" value={roleInputData.responsibility} onChange={handeInputChange} />
                            </div>

                        </div>

                        {/* Vertical line */}
                        <div className="l-Configs__VL" >
                            <span className="c-Configs__VL"></span>
                        </div>

                        {/* Right section */}
                        <div className="l-Configs__Right">
                            <div className="c-Configs-Permissions">
                                <h1>Permissions</h1>
                                {/* TBC: do mapping of rules here */}
                                {
                                    normalPermissionListArr.map((data, index) => {
                                        return (
                                            <div key={index}>
                                                {/* Edit */}
                                                <div className="c-Configs-Permissions__Checkbox">
                                                    <label htmlFor={data.moduleCode + " edit"}>{data.description.edit}</label>
                                                    <input type="checkbox" onChange={handleCheckboxChange} checked={checkCheckboxChecked(data.moduleCode + " edit") || false} name={data.moduleCode + " edit"} value={`${data.moduleCode} edit`} />
                                                </div>
                                                {
                                                    data.moduleCode === "m05_03" || data.moduleCode === "m01_01" || data.moduleCode === "m02_01" || data.moduleCode === "m03_01" ?
                                                        null :

                                                        < div className="c-Configs-Permissions__Checkbox">
                                                            <label htmlFor={data.moduleCode + " approve"}>{data.description.approve}</label>
                                                            <input type="checkbox" onChange={handleCheckboxChange} checked={checkCheckboxChecked(data.moduleCode + " approve") || false} name={data.moduleCode + " approve"} value={`${data.moduleCode} approve`} />
                                                        </div>
                                                }

                                            </div>
                                        );
                                    })
                                }
                            </div>

                        </div>
                    </div>

                    {/* Button section */}
                    <div className="c-Add-role__Btns">
                        <button type="button" onClick={handleAddRole} className="c-Btn c-Btn--primary">Add Role</button>
                        <button type="button" onClick={() => (history.push("/responsibility-n-authority"))} className="c-Btn c-Btn--cancel">Cancel</button>
                    </div>


                </form>
            </PageLayout>
        </>
    )
}

export default RespNAuthorityAddRole;
