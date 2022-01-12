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

const AddEquipmentCategory = () => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const toastTiming = config.toastTiming;
    let history = useHistory();

    // State declarations
    const [loading, setLoading] = useState(false);
    const [inputTouched, setInputTouched] = useState(false);
    const [categoryData, setEquipmentData] = useState({
        name: '',
    });
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
            console.log(categoryData);
            (async () => {
                try {
                    const resInsertOneCategory = await axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/categories/all`, {
                        categoryData
                    }, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    console.log(resInsertOneCategory);

                } catch (error) {
                    console.log(error);
                }
            })();
        } else if (buttonType === "cancel") {
            // Handler for cancel button
            history.push("/equipment-maintainance");

        }
    }

    // Handler for input 
    const handleInputChange = (event) => {
        setEquipmentData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }

    const renderInputFieldEditSection = () => {
        return (
            <Container className="l-Manage-equipment__Inputs">
                {/* Row 1 */}
                <Row className="l-Manage-equipment__Inputs--row1 l-Manage-equipment__Inputs--row">
                    {/* Name */}
                    <Col className="c-Input c-Input__Name c-Input c-Input--edit">
                        <label htmlFor="name">Category Name</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="name" value={categoryData.name} />
                    </Col>
                </Row>
            </Container>
        )
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Equipment Maintainance' activeLink="/equipment-maintainance/add-category">
                <div className="c-Manage-equipment-maintainance c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Equipment-maintainance__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/equipment-maintainance">Equipment Maintainance Program</Breadcrumb.Item>
                        <Breadcrumb.Item active>Add Category</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-equipment__Top c-Main__Top">
                        <h1>Add Category</h1>
                        {/* Add and Cancel button section */}
                        <div className='c-Manage-equipment__Btns'>
                            {
                                inputTouched ?
                                    <button onClick={() => (handleBtn("addCategory"))} type="button" className="c-Btn c-Btn--primary">Add</button>
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

export default AddEquipmentCategory;