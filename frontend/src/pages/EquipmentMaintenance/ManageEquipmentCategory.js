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
import dayjs from 'dayjs';

const ManageEquipmentCategory = ({ match }) => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const toastTiming = config.toastTiming;
    let history = useHistory();
    const categoryID = match.params.catID;

    // State declarations
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inputTouched, setInputTouched] = useState(false);
    const [categoryData, setCategoryData] = useState({
        name: '',
        description: 'f'
    });
    const [renderErrorCard, setRenderErrorCard] = useState({
        render: false,
        errMsg: null,
        errStatus: null,
        errStatusText: null
    });
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed

    const handleBtn = (buttonType) => {
        if (buttonType === "save") {
            // Handler for save button
            console.log(categoryData);
            (async () => {
                try {
                    const resUpdateOneCategory = await axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/categories/${categoryID}`,
                        categoryData, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    console.log(resUpdateOneCategory);
                    toast.success(<>Success!<br />Message: <b>Updated category!</b></>);
                } catch (error) {
                    console.log(error);
                    toast.error(<>Error Code: <b>{error.response.status}</b><br />Message: <b>{error.response.data.message}</b></>);
                }
            })();
        } else if (buttonType === "cancel") {
            // Handler for cancel button
            setIsEditing(false);
        } else if (buttonType === "edit") {
            // Handler for edit button
            setIsEditing(true);
        }
    }

    // Handler for input 
    const handleInputChange = (event) => {
        setCategoryData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }

    const renderInputFieldSection = () => {
        return (
            <Container className="l-Manage-equipment__Inputs">
                {/* Row 1 */}
                <Row className="l-Manage-equipment__Inputs--row1 l-Manage-equipment__Inputs--row">
                    {/* Name */}
                    <Col className="c-Input c-Input__Name c-Input c-Input--read-only">
                        <label htmlFor="name">Category Name</label>
                        <input readOnly type="text" name="name" value={categoryData.name} />
                    </Col>
                    {/* Created On */}
                    <Col className="c-Input c-Input__Name c-Input c-Input--read-only">
                        <label htmlFor="createdOn">Created On</label>
                        <input readOnly type="text" name="createdOn" value={categoryData.createdOn} />
                    </Col>
                </Row>
            </Container>
        )
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
                    {/* Created On */}
                    <Col className="c-Input c-Input__Name c-Input c-Input--read-only">
                        <label htmlFor="createdOn">Created On</label>
                        <input readOnly type="text" name="createdOn" value={categoryData.createdOn} />
                    </Col>
                </Row>
            </Container>
        )
    }

    useEffect(() => {
        (async () => {
            try {
                const resCategoryData = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/categories/${categoryID}/assigned-equipment`);
                console.log(resCategoryData);
                const dbName = resCategoryData.data.results.name;
                const createdOn = resCategoryData.data.results.created_at;
                if (!isEditing) {
                    setCategoryData(() => {
                        return {
                            name: dbName,
                            createdOn: dayjs(new Date(createdOn)).format("MMMM D, YYYY h:mm A"),
                        }
                    });
                }
                // else {
                //     setCategoryData(() => {
                //         return {
                //             name: "",
                //             createdOn: createdOn
                //         }
                //     });
                // }
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Equipment Maintenance' activeLink="/equipment-maintenance/manage-category">
                <div className="c-Manage-equipment-maintenance c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Equipment-maintenance__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/equipment-maintenance">Equipment Maintenance Program</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Category</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-equipment__Top c-Main__Top">
                        <h1>Manage Category</h1>
                        {/* Save and Cancel button section */}
                        <div className='c-Manage-equipment__Btns'>
                            {
                                isEditing ?
                                    inputTouched ?
                                        <button onClick={() => (handleBtn("save"))} type="button" className="c-Btn c-Btn--primary">Save</button>
                                        :
                                        <button type="button" disabled={true} className="c-Btn c-Btn--disabled">{loading ? "Loading..." : "Save"}</button>
                                    :
                                    <button onClick={() => (handleBtn("edit"))} type="button" className="c-Btn c-Btn--primary">Edit</button>
                            }
                            {
                                isEditing ? <button onClick={() => (handleBtn("cancel"))} type="button" className="c-Btn c-Btn--cancel">Cancel</button>
                                    : null
                            }
                        </div>
                    </div>
                    {
                        renderErrorCard.render ?
                            <ErrorCard errMsg={renderErrorCard.errMsg} errStatus={renderErrorCard.errStatus} errStatusText={renderErrorCard.errStatusText} />
                            :
                            <>
                                {/* Equipment input fields section */}
                                {
                                    isEditing ?
                                        renderInputFieldEditSection()
                                        : renderInputFieldSection()
                                }
                            </>
                    }
                </div>
            </PageLayout>
        </>
    )
}

export default ManageEquipmentCategory;