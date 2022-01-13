import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import jwt_decode from "jwt-decode";
import axios from 'axios';
import config from '../../config/config';
import ErrorCard from '../../common/ErrorCard';
import { Container, Row, Col } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import CustomConfirmAlert from '../../common/CustomConfirmAlert';
import TokenManager from '../../utilities/tokenManager';
import { useHistory, NavLink } from 'react-router-dom';

const AddMaintenanceCycle = ({match}) => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const toastTiming = config.toastTiming;
    let history = useHistory();
    const equipmentID = match.params.emID;

    // State declarations
    const [loading, setLoading] = useState(false);
    const [inputTouched, setInputTouched] = useState(false);
    const [maintenanceData, setMaintenanceData] = useState({
        name: '',
        category: '',
        reference_number: '',
        register_number: '',
        model: '',
        serial_number: '',
    });
    const [categoryList, setCategoryList] = useState([]);
    const [renderErrorCard, setRenderErrorCard] = useState({
        render: false,
        errMsg: null,
        errStatus: null,
        errStatusText: null
    });
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed

    const handleBtn = (buttonType) => {
        if (buttonType === "addEquipment") {
            // Handler for add button
            console.log(maintenanceData);
            (async () => {
                try {
                    const resInsertOneEquipment = await axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment`,
                        maintenanceData, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    console.log(resInsertOneEquipment);

                } catch (error) {
                    console.log(error);
                }
            })();
        } else if (buttonType === "cancel") {
            // Handler for cancel button
            history.push(`/equipment-maintenance/manage-equipment/${equipmentID}`);
        }
    }

    // Handler for input 
    const handleInputChange = (event) => {
        setMaintenanceData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }

    const renderInputFieldEditSection = () => {
        return (
            <Container className="l-Manage-equipment__Inputs">
                {/* Row 1 */}
                <Row className="l-Manage-equipment__Inputs--row1 l-Manage-equipment__Inputs--row">
                    {/* Maintenance Type */}
                    <Col className="c-Input c-Input__Maintenance-type c-Input c-Input--edit">
                        <label htmlFor="type">Maintenance Type</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="type" value={maintenanceData.type} />
                    </Col>
                    {/* Responsible */}
                    <Col className="c-Input c-Input__Category c-Input c-Input--edit">
                        <label htmlFor="responsible">Responsible</label>
                        <select onFocus={() => setInputTouched(true)} type="text" name="responsible" onChange={handleInputChange} value={maintenanceData.responsible || 'Error'}>
                            <option>{!categoryList ? "No users found!" : "Select Users"}</option>
                            {!categoryList ? null : categoryList.map((category, index) => (
                                <option key={index} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </Col>
                    {/* Maintenance Frequency */}
                    <Col className="c-Input c-Input__Ref-no c-Input--edit">
                        <label htmlFor="maintenanceFrequency">Maintenance Frequency</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="maintenanceMultiplier" value={maintenanceData.maintenanceMultiplier} />
                        <select onFocus={() => setInputTouched(true)} type="text" name="maintenanceUnitTime" onChange={handleInputChange} value={maintenanceData.maintenanceUnitTime}>
                            <option>Select Time Unit</option>
                            <option>Days</option>
                            <option>Weeks</option>
                            <option>Months</option>
                        </select>
                    </Col>
                    {/* Last Service Date */}
                    <Col className="c-Input c-Input__Reg-no c-Input--edit">
                        <label htmlFor="lastServiceDate">Last Service Date</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="lastServiceDate" value={maintenanceData.lastServiceDate} />
                    </Col>
                </Row>
            </Container>
        )
    }

    useEffect(() => {
        (async () => {
            try {                
                let tempCategoryData = [];
                // Get all equipment categories
                const resAllCategories = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/categories`);
                console.log(resAllCategories);
                tempCategoryData = resAllCategories.data.results;
                console.log(tempCategoryData);

                setCategoryList(() => {
                    if (tempCategoryData.length === 0) {
                        return null;
                    }
                    return tempCategoryData.map((data) => ({
                        name: `${data.name}`
                    }));
                });
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Equipment Maintenance' activeLink="/equipment-maintenance/add-equipment">
                <div className="c-Manage-equipment-maintenance c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Equipment-maintenance__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/equipment-maintenance">Equipment Maintenance Program</Breadcrumb.Item>
                        <Breadcrumb.Item href={`/equipment-maintenance/manage-equipment/${equipmentID}`}>Manage Equipment</Breadcrumb.Item>
                        <Breadcrumb.Item active>Add Equipment</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-equipment__Top c-Main__Top">
                        <h1>Add Equipment</h1>
                        {/* Add and Cancel button section */}
                        <div className='c-Manage-equipment__Btns'>
                            {
                                inputTouched ?
                                    <button onClick={() => (handleBtn("addEquipment"))} type="button" className="c-Btn c-Btn--primary">Add</button>
                                    :
                                    <button type="button" disabled={true} className="c-Btn c-Btn--disabled">{loading ? "Loading..." : "Add"}</button>
                            }

                            <button onClick={() => (handleBtn("cancel"))} type="button" className="c-Btn c-Btn--cancel">Cancel</button>
                        </div>
                    </div>
                    {
                        renderErrorCard.render ?
                            <ErrorCard errMsg={renderErrorCard.errMsg} errStatus={renderErrorCard.errStatus} errStatusText={renderErrorCard.errStatusText} />
                            :
                            <>
                                {/* Equipment input fields section */}
                                {
                                    renderInputFieldEditSection()
                                }
                            </>
                    }
                </div>
            </PageLayout>

        </>
    )
}

export default AddMaintenanceCycle;