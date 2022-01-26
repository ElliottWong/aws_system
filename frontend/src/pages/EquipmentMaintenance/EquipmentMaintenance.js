import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { useHistory } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import config from '../../config/config';
import { categoryColumns, equipmentMaintenanceColumns, historyEquipmentMaintenanceColumns } from '../../config/tableColumns';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager.js';

const EquipmentMaintenance = () => {

    const toastTiming = config.toastTiming;
    const history = useHistory();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;
    const [canApprove, setCanApprove] = useState(false);
    const [canEdit, setCanEdit] = useState(false);

    // State Declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [equipmentData, setEquipmentData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [archivedEquipmentData, setArchivedEquipmentData] = useState([]);
    const [filteredCategoryID, setFilteredCategoryID] = useState(null);

    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                // Can approve people can create new equipment
                const resClausePermission = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m07_01/employees`);
                // Can edit people can upload new maintenance record
                const resClausePermissionEdit = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m07_01/employees`);
                if (componentMounted) {
                    // Check if user can create new equipment
                    resClausePermission.data.results.forEach((data, index) => {
                        if (data.employee_id === userID) {
                            setCanApprove(true);
                        }
                    });
                    // Check if user is assigned to an equipment
                    resClausePermissionEdit.data.results.forEach((data, index) => {
                        if (data.employee_id === userID) {
                            setCanEdit(true);
                        }
                    });

                    let tempEquipmentData = [];
                    let tempCategoryData = [];
                    let tempArchivedEquimentData = [];

                    if (canApprove) {
                        console.log(filteredCategoryID);
                        // Check if user tries to filter equipment by category
                        if (!filteredCategoryID) {
                            // Get all equipment in use
                            const resAllEquipments = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment`);
                            console.log(resAllEquipments);
                            tempEquipmentData = resAllEquipments.data.results;
                            console.log(tempEquipmentData);
                        } else {
                            // Get all equipment of filtered category
                            const resAllEquipments = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/categories/${filteredCategoryID}/all-equipment`);
                            console.log(resAllEquipments);
                            tempEquipmentData = resAllEquipments.data.results?.equipment;
                            console.log(tempEquipmentData);
                        }

                        // Get all equipment categories
                        const resAllCategories = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/categories`);
                        console.log(resAllCategories);
                        tempCategoryData = resAllCategories.data.results;
                        console.log(tempCategoryData);

                        // Get all archived equipment
                        const resArchivedEquipments = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment?archived=1`);
                        console.log(resArchivedEquipments);
                        tempArchivedEquimentData = resArchivedEquipments.data.results;
                        console.log(tempArchivedEquimentData);
                    }
                    // need seperate into else if can edit then else in future
                    else {
                        if (!filteredCategoryID) {
                            // Get all assigned equipment in use
                            const resSpecificEquipments = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/assigned-equipment`);
                            console.log(resSpecificEquipments);
                            tempEquipmentData = resSpecificEquipments.data.results;
                            console.log(tempEquipmentData);
                        }
                        else {
                            // Get all assigned equipment of filtered category
                            const resSpecificEquipments = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/categories/${filteredCategoryID}/assigned-equipment`);
                            console.log(resSpecificEquipments);
                            tempEquipmentData = resSpecificEquipments.data.results?.equipment;
                            console.log(tempEquipmentData);
                        }
                        // Get all equipment categories
                        const resAllCategories = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/categories`);
                        console.log(resAllCategories);
                        tempCategoryData = resAllCategories.data.results;
                        console.log(tempCategoryData);

                        // Get all archived equipment
                        const resArchivedEquipments = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/assigned-equipment?archived=1`);
                        console.log(resArchivedEquipments);
                        tempArchivedEquimentData = resArchivedEquipments.data.results;
                        console.log(tempArchivedEquimentData);
                    }

                    setCategoryData(() => {
                        return tempCategoryData.map((data, index) => {
                            return {
                                id: data.category_id,
                                serialNo: index + 1,
                                name: data.name,
                                createdOn: dayjs(new Date(data.created_at)).format("MMMM D, YYYY h:mm A"),
                                action_manage: (() => {
                                    if (canApprove) return `/equipment-maintenance/manage-category/${data.category_id}`
                                    return "";
                                })()
                            }
                        });
                    });

                    setEquipmentData(() => {
                        return tempEquipmentData?.map((data, index) => {
                            return {
                                id: data.equipment_id,
                                serialNo: index + 1,
                                name: data.name,
                                category: (() => {
                                    let categoryString = ""
                                    // eslint-disable-next-line array-callback-return
                                    data.categories?.map((catData) => {
                                        categoryString += catData.name + ", ";
                                    });
                                    return categoryString.slice(0, -2);
                                })(),
                                refNo: data.reference_number,
                                model: data.model,
                                action_manage: `/equipment-maintenance/manage-equipment/${data.equipment_id}`
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
                                    data.categories.map((catData) => {
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

    }, [filteredCategoryID]);

    // Handlers
    const handleBtn = () => {
        history.push("/equipment-maintenance/add-equipment");
    };

    const handleBtnAddCategory = () => {
        history.push("/equipment-maintenance/add-category");
    };

    // Handler for input 
    const handleFilterSelect = (event) => {
        console.log(event.target.value);
        setFilteredCategoryID(event.target.value);
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Equipment Maintenance' activeLink="/equipment-maintenance">
                <div className="c-Equipment-maintenance c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Equipment-maintenance__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Equipment Maintenance Program</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Equipment-maintenance__Top c-Main__Top">
                        <h1>Equipment Maintenance Programme</h1>
                        {/* Add button section */}
                        {
                            canApprove ? <button
                                onClick={() => handleBtn()}
                                type="button"
                                className={"c-Btn c-Btn--primary"}
                            >
                                Add New Equipment
                            </button> : ""
                        }
                    </div>
                    {/* Filter */}
                    <div className='c-Equipment-maintenance__Filter'>
                        <h4>Filter (Category)</h4>
                        <select type="text" name="filterCategory" onChange={handleFilterSelect} value={filteredCategoryID || 'Error'}>
                            <option value={''}>{!categoryData ? "No categories found!" : "All"}</option>
                            {!categoryData ? null : categoryData.map((category, index) => (
                                <option key={index} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Table section */}
                    <div className="c-Equipment-maintenance__Table">
                        {equipmentData ?
                            <BootstrapTable
                                bordered={false}
                                keyField='serialNo'
                                data={equipmentData}
                                columns={equipmentMaintenanceColumns}
                                pagination={paginationFactory()}
                            />
                            : "No results found"
                        }
                    </div>

                    {/* Mid section */}
                    <div className="c-Equipment-maintenance-category__Top c-Main__Top">
                        <h1>Equipment Categories</h1>
                        {/* Add button section */}
                        {
                            canApprove ?
                                <button
                                    onClick={() => handleBtnAddCategory()}
                                    type="button"
                                    className={"c-Btn c-Btn--primary"}
                                >
                                    Add New Category
                                </button> : ""
                        }
                    </div>
                    {/* Table section */}
                    <div className="c-Equipment-maintenance__Table">
                        <BootstrapTable
                            bordered={false}
                            keyField='serialNo'
                            data={categoryData}
                            columns={categoryColumns}
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

export default EquipmentMaintenance;