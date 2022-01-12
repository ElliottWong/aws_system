import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { useHistory } from 'react-router';
import { normalPermissionListArr } from '../../config/permissionListArr';
import axios from 'axios';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import { toast, ToastContainer } from 'react-toastify';
import paginationFactory from 'react-bootstrap-table2-paginator';
import config from '../../config/config';
import TokenManager from '../../utilities/tokenManager';


const RespNAuthorityManageRole = ({ match }) => {
    const roleID = match.params.roleID;     // get id of role
    const history = useHistory();
    const { SearchBar, ClearSearchButton } = Search;
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const toastTiming = config.toastTiming;
    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);   // Tracks if sidenav is collapsed
    const [roleInputData, setRoleInputData] = useState({
        name: "",
        responsibility: "",
        rights: []
    });
    const [renderErrorPage, setRenderErrorPage] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);  // scroll to top when component is rendered
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/role/${roleID}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res);
                setRoleInputData(() => {
                    return {
                        name: res.data.results.name,
                        responsibility: res.data.results.responsibility,
                        rights: (() => {
                            const fullPermissionList = normalPermissionListArr.map((data, index) => {
                                return {
                                    [data.moduleCode]: {
                                        edit: false,
                                        approve: false
                                    }
                                };
                            });
                            // push all the objects in rights to array
                            let rightsObjSize = Object.keys(res.data.results.rights).length;
                            for (let i = 0; i < rightsObjSize; i++) {
                                const moduleCode = Object.keys(res.data.results.rights)[i];
                                const canEdit = res.data.results.rights[moduleCode].edit;
                                if (canEdit) {
                                    for (let v = 0; v < fullPermissionList.length; v++) {
                                        const checkModuleCode = Object.keys(fullPermissionList[v])[0];
                                        console.log(fullPermissionList[v])
                                        if (checkModuleCode === moduleCode) {
                                            fullPermissionList[v] = {
                                                [moduleCode]: {
                                                    ...fullPermissionList[v][moduleCode],
                                                    edit: true,
                                                }
                                            };
                                            break;
                                        }
                                    }
                                }

                                const canApprove = res.data.results.rights[moduleCode].approve;
                                if (canApprove) {
                                    for (let v = 0; v < fullPermissionList.length; v++) {
                                        const checkModuleCode = Object.keys(fullPermissionList[v])[0];
                                        if (moduleCode === checkModuleCode) {
                                            fullPermissionList[v] = {
                                                [moduleCode]: {
                                                    ...fullPermissionList[v][moduleCode],
                                                    approve: true,
                                                }
                                            };
                                            break;
                                        }
                                    }
                                }
                            };
                            console.log(fullPermissionList);
                            return fullPermissionList;
                        })()
                    }
                });
            })
            .catch((err) => {
                console.log(err);
                let errCode = "Error!";
                let errMsg = "Error!";
                if (err.response !== undefined) {
                    errCode = err.response.status;
                    errMsg = err.response.data.message;
                }
                toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
            });

    }, []);


    const docRespNAuthOrgChartColumns = [
        {
            dataField: 'id',
            text: 'Id',
            hidden: true
        },
        {
            dataField: 'serialNo',
            text: '#',
        },
        {
            dataField: 'title',
            text: 'Title',
        },
        {
            dataField: 'description',
            text: 'Description',
        },
        {
            dataField: 'created_by',
            text: 'Created By',
        },
        {
            dataField: 'created_on',
            text: 'Submitted On',
        },
        {
            dataField: 'action_view',
            text: '',
            formatter: (cell, row) => {
                return <a href={cell}>View more</a>
            }
        }
    ];

    const manageRoleUserColumn = [
        {
            dataField: 'role_id',
            text: 'Id',
            hidden: true
        },
        {
            dataField: 'serialNo',
            text: '#',
        },
        {
            dataField: 'user',
            text: 'User',
        },
    ];

    // Mock data, eventually you'll need to call endpoint and shift the columns to config/tableColumns.js
    const mockDocData = [
        { id: 1, name: 'George', animal: 'Monkey' },
        { id: 2, name: 'Jeffrey', animal: 'Giraffe' },
        { id: 3, name: 'Alice', animal: 'Giraffe' },
        { id: 4, name: 'Alice', animal: 'Tiger' }
    ];
    // Check if checkbox is checked
    const checkCheckboxChecked = (moduleCodeAndRights) => {
        const checkModuleCode = moduleCodeAndRights.split(" ")[0];
        const checkModuleRights = moduleCodeAndRights.split(" ")[1];
        let checkCheckboxChecked = false;
        console.log(roleInputData);
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
    };

    // Handler for add role button
    const handeInputChange = (event) => {
        setRoleInputData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    };

    // Handler for checkbox change
    const handleCheckboxChange = (event) => {
        setRoleInputData((prevState) => ({
            ...prevState,
            rights: (() => {
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
    };

    const handleSaveBtn = () => {
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
        axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/role/${roleID}`, formattedInsertData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json;charset=UTF-8'
            }
        }).then((res) => {
            console.log(res);
            toast.success(<>Success!<br />Message: <b>Role has been updated!</b></>);
            window.scrollTo(0, 0);
        }).catch((err) => {
            console.log(err);
            let errCode = "Error!";
            let errMsg = "Error!"
            if (err.response !== undefined) {
                errCode = err.response.status;
                errMsg = err.response.data.message;
            }

            toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
        })
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Responsibility and Authority' activeLink="/responsibility-n-authority">
                <div className="c-Manage-role c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Manage-role__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/responsibility-n-authority">Resp. & Authority</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Role</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-role__Top c-Main__Top">
                        <h1>Manage Role</h1>
                    </div>

                    {/* Configurations section */}
                    <div className="c-Manage-role__Configs">
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

                            {/* User list */}
                            {/* <div className="c-Configs__User-list">
                                <h2>Users</h2>
                                <div className="c-User-list__Table">
                                    <ToolkitProvider
                                        search
                                    >
                                        {
                                            props => (
                                                <div className="c-Table">
                                                    <div className="c-Table__Top">
                                                        <SearchBar {...props.searchProps} />
                                                        <ClearSearchButton className="c-Table__Clear-btn" {...props.searchProps} />
                                                        <button type="button" className="c-Btn c-Btn--link" onClick={() => (history.push('/settings/manage-users'))}>Manage Users</button>
                                                    </div>
                                                    <hr />
                                                    <BootstrapTable
                                                        {...props.baseProps}
                                                        bordered={false}
                                                        keyField='serialNo'
                                                        data={mockDocData}
                                                        columns={manageRoleUserColumn}
                                                        pagination={ paginationFactory() }
                                                    />
                                                </div>
                                            )
                                        }
                                    </ToolkitProvider>
                                </div>
                            </div> */}
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
                                                    data.moduleCode === "m05_03" || data.moduleCode === "m01_01" || data.moduleCode === "m02_01" || data.moduleCode === "m03_01" || data.moduleCode === "m07_01" || data.moduleCode === "m07_02" ?
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
                    <div className="c-Manage-role__Btns">
                        <button type="button" onClick={handleSaveBtn} className="c-Btn c-Btn--primary">Save</button>
                        <button type="button" onClick={() => (history.push("/responsibility-n-authority"))} className="c-Btn c-Btn--cancel">Cancel</button>
                    </div>

                </div>
            </PageLayout>
        </>
    )
}

export default RespNAuthorityManageRole;