import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import DocumentLayout from '../../layout/DocumentLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import BootstrapTable from 'react-bootstrap-table-next';
import TabRow from '../../common/TabRow';
import DocumentBtnSection from '../../common/DocumentBtnSection';
import RenderDocument from '../../common/RenderDocument';
import { TAB } from '../../config/enums';
import useDocAxios from '../../hooks/useDocAxios';
import dayjs from 'dayjs';
import { ToastContainer } from 'react-toastify';
import jwt_decode from "jwt-decode";
import useCheckEditableAxios from '../../hooks/useCheckEditableAxios';
import ManageDeleteArchivedDoc from '../../common/ManageDeleteArchivedDoc';
import axios from 'axios';
import paginationFactory from 'react-bootstrap-table2-paginator';
import config from '../../config/config';
import ErrorCard from '../../common/ErrorCard';
import { Container, Row, Col } from 'react-bootstrap';
import { useHistory, NavLink } from 'react-router-dom';
import StatusPill from '../../common/StatusPill';
import { historyEquipmentMaintenanceColumns, licenseColumns } from '../../config/tableColumns';
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
    const [archivedEquipmentData, setArchivedEquipmentData] = useState([]);

    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                const resClausePermission = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m07_01/employees`);
                if (componentMounted) {
                    let canEdit = false;
                    // Check if user can create new equipment
                    resClausePermission.data.results.forEach((data, index) => {
                        if (data.employee_id === userID) {
                            canEdit = true;
                        }
                    });

                    let tempLicenseData = [];
                    let tempArchivedLicenseData = [];

                    if (canEdit) {
                        // Get all License in use
                        const resAllLicenses = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/licences/all`);
                        console.log(resAllLicenses);
                        tempLicenseData = resAllLicenses.data.results;
                        console.log(tempLicenseData);

                        // Get all archived equipment
                        const resArchivedEquipments = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/equipment/archives`);
                        console.log(resArchivedEquipments);
                        tempArchivedLicenseData = resArchivedEquipments.data.results;
                        console.log(tempArchivedLicenseData);
                    } else {
                        const resSpecificEquipments = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/equipment/assignments`);
                        console.log(resSpecificEquipments);
                        tempLicenseData = resSpecificEquipments.data.results;
                    }

                    setLicenseData(() => {
                        return tempLicenseData.map((data, index) => {
                            return {
                                id: data.licence_id,
                                serialNo: index + 1,
                                license: data.licence_name,
                                licenseNo: data.licence_number,
                                expDate: data.expires_at,
                                externalAgency: data.external_organisation,
                                responsibleUser: (() => {
                                    let userString = ""
                                    // eslint-disable-next-line array-callback-return
                                    data.assignees.map((userData, index) => {
                                        userString += userData.account.username + ", ";
                                    });
                                    return userString.slice(0, -2);
                                })(),
                                status: '',
                                action_manage: `/licenses/manage-licenses/${data.licence_id}`
                            }
                        });
                    });

                    setArchivedEquipmentData(() => {
                        return tempArchivedLicenseData.map((data, index) => {
                            return {
                                id: data.equipment_id,
                                serialNo: index + 1,
                                name: data.name,
                                category: (() => {
                                    let categoryString = ""
                                    // eslint-disable-next-line array-callback-return
                                    data.categories.map((catData, index) => {
                                        categoryString += catData.name + ", ";
                                    });
                                    return categoryString.slice(0, -2);
                                })(),
                                refNo: data.reference_number,
                                model: data.model,
                                archived_on: dayjs(new Date(data.archived_at)).format("MMMM D, YYYY h:mm A"),
                                action_view: `/equipment-maintenance/manage-equipment/${data.equipment_id}`
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
                        <button
                            onClick={() => handleBtn()}
                            type="button"
                            className={"c-Btn c-Btn--primary"}
                        >
                            Add
                        </button>
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
                            data={archivedEquipmentData}
                            columns={historyEquipmentMaintenanceColumns}
                            pagination={paginationFactory()}
                        />
                    </div>
                </div>

            </PageLayout>
        </>
    )
}

export default Licenses;