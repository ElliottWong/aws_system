import React, { useState, useEffect } from 'react';
import PageLayout from '../layout/PageLayout';
import { getSideNavStatus } from '../utilities/sideNavUtils';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import axios from 'axios';
import { getToken, getUserCompanyID } from '../utilities/localStorageUtils';
import { useHistory } from 'react-router';
import jwt_decode from 'jwt-decode';
import ErrorCard from '../common/ErrorCard.js';
import paginationFactory from 'react-bootstrap-table2-paginator';
import TokenManager from '../utilities/tokenManager';

const ManageUsers = () => {
    const { SearchBar, ClearSearchButton } = Search;
    const history = useHistory();
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;
    const adminLevel = decodedToken.admin_level;    // 0 = normal user, 1 = secondary admin, 2 = super admin
    // State declaration
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [usersData, setUsersData] = useState([]);
    const [renderErrorCard, setRenderErrorCard] = useState({
        render: false,
        errMsg: null,
        errStatus: null,
        errStatusText: null
    });

    useEffect(() => {
        // get all info about the user
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employees?roles=true`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res);
                const formattedUsersData = res.data.results.map((data, index) => ({
                    ...data,
                    serialNo: index + 1,
                    username: data.account.username,
                    accountStatus: data.account.status
                }));
                console.log(formattedUsersData);
                setUsersData(() => (formattedUsersData));
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

    }, []);

    const usersColumn = [
        {
            dataField: 'employee_id',
            text: 'Id',
            hidden: true
        },
        {
            dataField: 'serialNo',
            text: '#',
            editable: false
        },
        {
            dataField: 'admin_level',
            text: 'Admin level',
            formatter: (cell, row) => {
                if (cell === 0) {
                    return "Normal user";
                } else if (cell === 1) {
                    return "Platform admin";
                } else if (cell === 2) {
                    return "System admin";
                } else if (cell === 3) {
                    return "Secondary Admin";
                }
            }
        },
        {
            dataField: 'email',
            text: 'Email',
            editable: false,
        },
        {
            dataField: 'title',
            text: 'Job Title'
        },
        {
            dataField: 'username',
            text: 'Username',
            editable: false,
        },
        {
            dataField: 'roles',
            text: 'Role(s)',
            editable: false,
            formatter: (cell, row) => {
                if (cell.length === 0) {
                    return "Nil"
                } else {
                    return (
                        cell.map((data, index) => {
                            if (cell.length === index + 1) {
                                return data.name
                            }
                            return (
                                <div key={index}>{data.name + ","}<br /></div>
                            )

                        })

                    );
                }

            }
        },
        {
            dataField: 'accountStatus',
            text: 'Status',
            formatter: (cell, row) => {
                // Capitalize first letter of the string
                return cell.charAt(0).toUpperCase() + cell.slice(1);
            }
        },
        {
            dataField: 'account_action',
            text: '',
            hidden: (() => {
                // If user is not super admin
                if (adminLevel !== 2) {
                    return true;
                }
                return false;
            })(),
            isDummyField: true,
            formatter: (cell, row) => {
                return <a href={`/settings/manage-users/manage-user/${row.employee_id}`}>Manage</a>
            }
        },
    ];

    return (
        <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title="Manage Users" activeLink="/settings">
            <div className="c-Manage-users c-Main">
                {/* Breadcrumb */}
                <Breadcrumb className="c-Manage-users l-Breadcrumb">
                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item href="/settings">Settings</Breadcrumb.Item>
                    <Breadcrumb.Item active>Manage Users</Breadcrumb.Item>
                </Breadcrumb>

                {/* Top section */}
                <div className="c-Manage-users__Top c-Main__Top">
                    <h1>Manage Users</h1>
                </div>
                {
                    renderErrorCard.render ?
                        <ErrorCard errMsg={renderErrorCard.errMsg} errStatus={renderErrorCard.errStatus} errStatusText={renderErrorCard.errStatusText} />
                        :
                        <>
                            {/* Table section */}
                            <div className="c-Manage-users__Table">
                                <ToolkitProvider
                                    keyField="employee_id"
                                    data={usersData}
                                    columns={usersColumn}
                                    search

                                >
                                    {
                                        props => (
                                            <div className="c-Table">
                                                <div className="c-Table__Top">
                                                    <SearchBar {...props.searchProps} />
                                                    <ClearSearchButton className="c-Table__Clear-btn" {...props.searchProps} />
                                                </div>
                                                <hr />
                                                <BootstrapTable
                                                    {...props.baseProps}
                                                    bordered={false}
                                                    pagination={ paginationFactory() }
                                                />
                                            </div>
                                        )
                                    }
                                </ToolkitProvider>

                            </div>

                        </>
                }

            </div>
        </PageLayout>
    )
}

export default ManageUsers;