import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import { getToken, getUserCompanyID } from '../../utilities/localStorageUtils';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { useHistory } from 'react-router';
import axios from 'axios';
import dayjs from 'dayjs';
import ManageDeleteRole from '../ManageDeleteRole';
import { ToastContainer } from 'react-toastify';
import jwt_decode from 'jwt-decode';
import paginationFactory from 'react-bootstrap-table2-paginator';
import config from '../../config/config';
import TokenManager from '../../utilities/tokenManager';

const RespNAuthority = () => {
    const history = useHistory();
    const { SearchBar, ClearSearchButton } = Search;
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;
    const adminLevel = decodedToken.admin_level;    // 0 = normal user, 1 = secondary admin, 2 = super admin
    const toastTiming = config.toastTiming;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [roleData, setRoleData] = useState([]);
    const [orgChartData, setOrgChartData] = useState([]);
    const [isUploader, setIsUploader] = useState(false);

    useEffect(() => {
        // Get org chart data
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/org-charts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res);
                console.log(res.data.results);
                if (res.data.results !== undefined) {
                    // to do setOrgchart here
                    setOrgChartData(() => {
                        return res.data.results.map((data, index) => {
                            return {
                                id: data.chart_id,
                                serialNo: index + 1,
                                title: data.title,
                                description: data.description,
                                created_by: data.author.account.username,
                                created_on: dayjs(new Date(data.created_at)).format("MMMM D, YYYY h:mm A"),
                                action_view: `/responsibility-n-authority/manage-org-chart/${data.chart_id}`
                            }
                        });
                    })
                }

            })
            .catch((err) => {
                console.log(err);
            });

        // get all the roles
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/roles`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res);
                if (res.data.results !== undefined) {
                    setRoleData(() => {
                        return res.data.results.map((data, index) => {
                            return ({
                                ...data,
                                serialNo: index + 1,
                                created_at: dayjs(new Date(data.created_at)).format("MMMM D, YYYY h:mm A"),
                                updated_at: dayjs(new Date(data.updated_at)).format("MMMM D, YYYY h:mm A"),
                                action_delete: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/role/${data.role_id}`
                            });
                        })
                    });
                }

            })
            .catch((err) => {
                console.log(err);
            });
        // Check if user can upload chart
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m05_03/employees`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                let canEdit = false;
                if (res.data.results !== undefined) {
                    res.data.results.forEach((data, index) => {
                        if (data.employee_id === userID) {
                            canEdit = true;
                        }
                    });
                }
                if (canEdit === true) {
                    setIsUploader(() => (true));
                }
            })
            .catch((err) => {
                console.log(err);
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

    const docRespNAuthRolesColumns = [
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
            dataField: 'name',
            text: 'Role',
        },
        {
            dataField: 'created_at',
            text: 'Created',
        },
        {
            dataField: 'updated_at',
            text: 'Last Updated',
        },
        {
            dataField: 'action_manage',
            text: '',
            hidden: (() => {
                // If user is not super admin
                if (adminLevel !== 2) {
                    return true;
                }
                return false;
            })(),
            formatter: (cell, row) => {
                return <a href={`/responsibility-n-authority/manage-role/${row.role_id}`}>Manage</a>
            }
        },
        {
            dataField: 'action_delete',
            text: '',
            hidden: (() => {
                // If user is not super admin
                if (adminLevel !== 2) {
                    return true;
                }
                return false;
            })(),
            formatter: (cell, row) => {
                return (
                    <ManageDeleteRole
                        deleteUrl={cell}
                        refreshUrl={`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/roles`}
                        setRoleData={setRoleData}
                        idName="role_id"
                    />
                )
            }
        }
    ];

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
                <div className="c-Resp-N-Auth c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Resp-N-Auth__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Resp. & Authority</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Top section */}
                    <div className="c-Resp-N-Auth__Top c-Main__Top">
                        <h1>Responsibility & Authority</h1>
                    </div>

                    {/* Organisation chart section */}
                    <div className="c-Resp-N-Auth__Org-Chart">
                        {/* Header + btn */}
                        <div className="c-Org-Chart__Top">
                            <h1>Organisation Chart</h1>
                            {
                                isUploader ?
                                    <button onClick={() => (history.push("/responsibility-n-authority/add-org-chart"))} type="button" className="c-Btn c-Btn--primary">Upload Chart</button>
                                    :
                                    null
                            }
                        </div>
                        {/* Organisation chart Table */}
                        <div className="c-Org-Chart__Table">
                            {
                                orgChartData.length === 0 ?
                                    "No records found!" :
                                    <BootstrapTable
                                        bordered={false}
                                        keyField='serialNo'
                                        data={orgChartData}
                                        columns={docRespNAuthOrgChartColumns}
                                        pagination={paginationFactory()}
                                    />
                            }
                        </div>
                    </div>

                    {/* Roles section */}
                    <div className="c-Resp-N-Auth__Roles">

                        {/* Header */}
                        <div className="c-Roles__Top">
                            <h1>Roles</h1>
                        </div>
                        {/* Table */}
                        <div className="c-Roles__Table">
                            <ToolkitProvider
                                search
                                keyField='serialNo'
                                data={roleData}
                                columns={docRespNAuthRolesColumns}
                            >
                                {
                                    props => (
                                        <div className="c-Table">
                                            <div className="c-Table__Top">
                                                <SearchBar {...props.searchProps} />
                                                <ClearSearchButton className="c-Table__Clear-btn" {...props.searchProps} />
                                                {
                                                    adminLevel !== 2 ?
                                                        null :
                                                        <button type="button" className="c-Btn c-Btn--primary" onClick={() => (history.push('/responsibility-n-authority/add-role'))}>Add role</button>
                                                }
                                            </div>
                                            <hr />
                                            {
                                                roleData.length !== 0 ?
                                                    <BootstrapTable
                                                        {...props.baseProps}
                                                        bordered={false}
                                                        pagination={paginationFactory()}
                                                    />
                                                    :
                                                    "No records found!"
                                            }

                                        </div>
                                    )
                                }
                            </ToolkitProvider>

                        </div>
                    </div>

                </div>
            </PageLayout>
        </>
    )
}

export default RespNAuthority;
