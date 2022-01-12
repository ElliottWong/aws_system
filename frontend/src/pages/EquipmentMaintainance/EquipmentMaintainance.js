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
import { historyEquipmentMaintainanceColumns, equipmentMaintainanceColumns, categoryColumns } from '../../config/tableColumns';
import TokenManager from '../../utilities/tokenManager.js';

const EquipmentMaintainance = () => {

    const toastTiming = config.toastTiming;
    const history = useHistory();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;

    // State Declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [equipmentData, setEquipmentData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
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

                    let tempEquimentData = [];
                    let tempCategoryData = [];
                    let tempArchivedEquimentData = [];

                    if (canEdit) {
                        // Get all equipment in use
                        const resAllEquipments = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/equipment/all`);
                        console.log(resAllEquipments);
                        tempEquimentData = resAllEquipments.data.results;
                        console.log(tempEquimentData);

                        // Get all equipment categories
                        const resAllCategories = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/categories/all`);
                        console.log(resAllCategories);
                        tempCategoryData = resAllCategories.data.results;
                        console.log(tempCategoryData);

                        // Get all archived equipment
                        const resArchivedEquipments = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/equipment/archives`);
                        console.log(resArchivedEquipments);
                        tempArchivedEquimentData = resArchivedEquipments.data.results;
                        console.log(tempArchivedEquimentData);
                    } else {
                        const resSpecificEquipments = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/equipment/assignments`);
                        console.log(resSpecificEquipments);
                        tempEquimentData = resSpecificEquipments.data.results;
                    }

                    setCategoryData(() => {
                        return tempCategoryData.map((data, index) => {
                            return {
                                id: data.category_id,
                                serialNo: index + 1,
                                name: data.name,
                                createdOn: dayjs(new Date(data.created_at)).format("MMMM D, YYYY h:mm A") ,
                                action_manage: `/equipment-maintainance/manage-category/${data.category_id}`
                            }
                        });
                    });

                    setEquipmentData(() => {
                        return tempEquimentData.map((data, index) => {
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
                                action_manage: `/equipment-maintainance/manage-equipment/${data.equipment_id}`
                            }
                        });
                    });

                    setArchivedEquipmentData(() => {
                        return tempArchivedEquimentData.map((data, index) => {
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
                                archived_on: dayjs(new Date(data.archived_at)).format("MMMM D, YYYY h:mm A") ,
                                action_view: `/equipment-maintainance/manage-equipment/${data.equipment_id}`
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
        history.push("/equipment-maintainance/add-equipment");
    };

    const handleBtnAddCategory = () => {
        history.push("/equipment-maintainance/add-category");
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Equipment Maintainance' activeLink="/equipment-maintainance">
                <div className="c-Equipment-maintainance c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Equipment-maintainance__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Equipment Maintainance Program</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Equipment-maintainance__Top c-Main__Top">
                        <h1>Equipment Maintainance Programme</h1>
                        {/* Edit button section */}
                        <button
                            onClick={() => handleBtn()}
                            type="button"
                            className={"c-Btn c-Btn--primary"}
                        >
                            Add New Equipment
                        </button>
                    </div>
                    {/* Table section */}
                    <div className="c-Equipment-maintainance__Table">
                        <BootstrapTable
                            bordered={false}
                            keyField='serialNo'
                            data={equipmentData}
                            columns={equipmentMaintainanceColumns}
                            pagination={paginationFactory()}
                        />
                    </div>

                    {/* Mid section */}
                    <div className="c-Equipment-maintainance-category__Top c-Main__Top">
                        <h1>Equipment Categories</h1>
                        {/* Edit button section */}
                        <button
                            onClick={() => handleBtnAddCategory()}
                            type="button"
                            className={"c-Btn c-Btn--primary"}
                        >
                            Add New Category
                        </button>
                    </div>
                    {/* Table section */}
                    <div className="c-Equipment-maintainance__Table">
                        <BootstrapTable
                            bordered={false}
                            keyField='serialNo'
                            data={categoryData}
                            columns={categoryColumns}
                            pagination={paginationFactory()}
                        />
                    </div>

                    <div className="c-Equipment-maintainance__Archives c-Main__Archives">
                        <h1>History (Archived)</h1>
                        <BootstrapTable
                            wrapperClasses="c-Equipment-maintainance__Archives-table"
                            bordered={false}
                            keyField='serialNo'
                            data={archivedEquipmentData}
                            columns={historyEquipmentMaintainanceColumns}
                            pagination={paginationFactory()}
                        />
                    </div>
                </div>

            </PageLayout>
        </>
    )
}

export default EquipmentMaintainance;