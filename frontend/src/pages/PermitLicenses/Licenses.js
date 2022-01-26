import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { useHistory } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import config from '../../config/config';
import { historyLicenseColumns, licenseColumns } from '../../config/tableColumns';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager.js';

const Licenses = () => {
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;

    // State Declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [licenseData, setLicenseData] = useState([]);
    const [archivedLicenseData, setArchivedLicenseData] = useState([]);
    const [canApprove, setCanApprove] = useState(false);
    const [canEdit, setCanEdit] = useState(false);

    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                // Can approve people can create new license
                const resClausePermission = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m07_02/employees`);
                // Can edit people can upload new license
                const resClausePermissionEdit = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m07_02/employees`);
                if (componentMounted) {
                    // Check if user can create new license
                    resClausePermission.data.results.forEach((data, index) => {
                        if (data.employee_id === userID) {
                            setCanApprove(true);
                        }
                    });
                    // Check if user is assigned to a license
                    resClausePermissionEdit.data.results.forEach((data, index) => {
                        if (data.employee_id === userID) {
                            setCanEdit(true);
                        }
                    });

                    let tempLicenseData = [];
                    let tempArchivedLicenseData = [];

                    if (canApprove) {
                        // Get all License in use
                        const resAllLicenses = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/licence-registry/all-licences`);
                        console.log(resAllLicenses);
                        tempLicenseData = resAllLicenses.data.results;
                        console.log(tempLicenseData);

                        // Get all archived licenses
                        const resArchivedLicenses = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/licence-registry/all-licences?archived=1`);
                        console.log(resArchivedLicenses);
                        tempArchivedLicenseData = resArchivedLicenses.data.results;
                        console.log(tempArchivedLicenseData);
                    } else {
                        // Get assigned licenses in use
                        const resSpecificLicenses = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/licence-registry/assigned-licences`);
                        console.log(resSpecificLicenses);
                        tempLicenseData = resSpecificLicenses.data.results;

                        // Get assigned archived licenses
                        const resArchivedLicenses = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/licence-registry/assigned-licences?archived=1`);
                        console.log(resArchivedLicenses);
                        tempArchivedLicenseData = resArchivedLicenses.data.results;
                        console.log(tempArchivedLicenseData);
                    }

                    setLicenseData(() => {
                        return tempLicenseData.map((data, index) => {
                            return {
                                id: data.licence_id,
                                serialNo: index + 1,
                                license: data.licence_name,
                                licenseNo: data.licence_number,
                                expDate: (() => {
                                    if (data.expires_at) {
                                        return data.expires_at
                                    } else {
                                        return 'NA'
                                    }
                                })(),
                                externalAgency: data.external_organisation,
                                responsibleUser: (() => {
                                    let userString = ""
                                    // eslint-disable-next-line array-callback-return
                                    data.assignees.map((userData, index) => {
                                        userString += userData.account.username + ", ";
                                    });
                                    return userString.slice(0, -2);
                                })(),
                                status: {
                                    frequency: Math.ceil(Math.abs(new Date(data.expires_at) - new Date(data.issued_at)) / (1000 * 60 * 60 * 24)),
                                    timeLeft: data.days_left,
                                    isNA: (() => {
                                        if (data.expires_at) {
                                            return data.expires_at
                                        } else {
                                            return ''
                                        }
                                    })()
                                },
                                action_manage: `/licenses/manage-license/${data.licence_id}`
                            }
                        });
                    });

                    setArchivedLicenseData(() => {
                        return tempArchivedLicenseData.map((data, index) => {
                            return {
                                id: data.equipment_id,
                                serialNo: index + 1,
                                license: data.licence_name,
                                licenseNo: data.licence_number,
                                expDate: (() => {
                                    if (data.expires_at) {
                                        return data.expires_at
                                    } else {
                                        return 'N.A'
                                    }
                                })(),
                                externalAgency: data.external_organisation,
                                responsibleUser: (() => {
                                    let userString = ""
                                    // eslint-disable-next-line array-callback-return
                                    data.assignees.map((userData, index) => {
                                        userString += userData.account.username + ", ";
                                    });
                                    return userString.slice(0, -2);
                                })(),
                                archived_on: dayjs(new Date(data.archived_at)).format("MMMM D, YYYY h:mm A"),
                                action_manage: `/licenses/manage-license/${data.licence_id}`
                            }
                        });
                    });
                }
            } catch (error) {
                console.log(error);
            }
        })();

        return (() => {
            componentMounted = false;
        });

    }, []);

    // Handlers
    const handleBtn = () => {
        history.push("/licenses/add-license");
    };

    const handleBtnAddCategory = () => {
        history.push("/equipment-maintenance/add-category");
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Permits Licenses' activeLink="/licenses">
                <div className="c-Equipment-maintenance c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Equipment-maintenance__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Register of Permits, Licenses, Approvals & Certificates</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Equipment-maintenance__Top c-Main__Top">
                        <h1>Register of Permits, Licenses, Approvals & Certificates</h1>
                        {/* Add button section */}
                        {canApprove ?
                            <button
                                onClick={() => handleBtn()}
                                type="button"
                                className={"c-Btn c-Btn--primary"}
                            >
                                Add
                            </button>
                            : ""
                        }
                    </div>
                    {/* Table section */}
                    <div className="c-Equipment-maintenance__Table">
                        <BootstrapTable
                            bordered={false}
                            keyField='serialNo'
                            data={licenseData}
                            columns={licenseColumns}
                            pagination={paginationFactory()}
                        />
                    </div>

                    <div className="c-Equipment-maintenance__Archives c-Main__Archives">
                        <h1>History (Archived)</h1>
                        <BootstrapTable
                            wrapperClasses="c-Equipment-maintenance__Archives-table"
                            bordered={false}
                            keyField='serialNo'
                            data={archivedLicenseData}
                            columns={historyLicenseColumns}
                            pagination={paginationFactory()}
                        />
                    </div>
                </div>

            </PageLayout>
        </>
    )
}

export default Licenses;