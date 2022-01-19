import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { confirmAlert } from 'react-confirm-alert';
import { useHistory } from 'react-router-dom';
import Select from "react-select";
import { toast, ToastContainer } from 'react-toastify';
import CustomConfirmAlert from '../../common/CustomConfirmAlert';
import ErrorCard from '../../common/ErrorCard';
import config from '../../config/config';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager';

const AddEquipmentMaintenance = () => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const toastTiming = config.toastTiming;
    let history = useHistory();
    const [rerender, setRerender] = useState(false); // value of state doesnt matter, only using it to force useffect to execute

    // State declarations
    const [loading, setLoading] = useState(false);
    const [inputTouched, setInputTouched] = useState(false);
    const [equipmentData, setEquipmentData] = useState({
        name: '',
        categories: [],
        reference_number: '',
        register_number: '',
        model: '',
        serial_number: '',
        location: '',
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
            console.log(equipmentData);
            // Confirmation dialogue for activating this account
            const message = `Are you sure you want to add this equipment?`;
            const handler = (onClose) => handleAddEquipment(onClose);
            const heading = `Confirm Add?`;
            const type = "primary"
            const data = {
                message,
                handler,
                heading,
                type
            };
            confirmAlert({
                customUI: ({ onClose }) => {
                    return <CustomConfirmAlert {...data} onClose={onClose} />;
                }
            });
        } else if (buttonType === "cancel") {
            // Handler for cancel button
            history.push("/equipment-maintenance");
        }

        const handleAddEquipment = (onClose) => {
            axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment`, {
                ...equipmentData,
                categories: equipmentData.categories.map((data) => {
                    return data.value;
                })
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    console.log(res);
                    setRerender((prevState) => !prevState);
                    onClose();
                    setTimeout(() => {
                        toast.success(<>Success!<br />Message: <b>New equipment has been added!</b></>);
                    }, 0);
                    history.push("/equipment-maintenance");
                })
                .catch((err) => {
                    console.log(err);
                    console.log(err.response);
                    let errCode = "Error!";
                    let errMsg = "Error!"
                    if (err.response !== undefined) {
                        errCode = err.response.status;
                        errMsg = err.response.data.message;
                    }
                    onClose();
                    toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                });
        }

    }

    // Handler for input 
    const handleInputChange = (event) => {
        setEquipmentData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }

    // Handler for input array
    const handleInputArrayChange = (options) => {
        console.log(options);
        setEquipmentData((prevState) => ({
            ...prevState,
            categories: options
        }));
    }

    const renderInputFieldEditSection = () => {
        return (
            <Container className="l-Manage-equipment__Inputs">
                {/* Row 1 */}
                <Row className="l-Manage-equipment__Inputs--row1 l-Manage-equipment__Inputs--row">
                    {/* Name */}
                    <Col className="c-Input c-Input__Name c-Input c-Input--edit">
                        <label htmlFor="name">Name</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="name" value={equipmentData.name} />
                    </Col>
                    {/* Category */}
                    <Col className="c-Input c-Input__Category c-Input c-Input--edit">
                        <label htmlFor="categories">Category</label>
                        <Select
                            isMulti
                            options={categoryList}
                            placeholder="Select Category"
                            onChange={handleInputArrayChange}
                            name="categories"
                        />
                    </Col>
                    {/* Ref. No. */}
                    <Col className="c-Input c-Input__Ref-no c-Input--edit">
                        <label htmlFor="reference_number">Ref. No.</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="reference_number" value={equipmentData.reference_number} />
                    </Col>
                    {/* Reg. No. */}
                    <Col className="c-Input c-Input__Reg-no c-Input--edit">
                        <label htmlFor="register_number">Reg. No.</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="register_number" value={equipmentData.register_number} />
                    </Col>
                </Row>

                {/* Row 2 */}
                <Row className="l-Manage-equipment__Inputs--row2 l-Manage-equipment__Inputs--row">
                    {/* Model/Brand */}
                    <Col className="c-Input c-Input__Model-brand c-Input--edit">
                        <label htmlFor="model">Model/Brand</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="model" value={equipmentData.model} />
                    </Col>
                    {/* Serial No. */}
                    <Col className="c-Input c-Input__Serial-no c-Input--edit">
                        <label htmlFor="serial_number">Serial No.</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="serial_number" value={equipmentData.serial_number} />
                    </Col>
                    {/* Location */}
                    <Col className="c-Input c-Input__Serial-no c-Input--edit">
                        <label htmlFor="location">Location</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="location" value={equipmentData.location} />
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
                        label: `${data.name}`,
                        value: data.category_id
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Add Equipment' activeLink="/equipment-maintenance/add-equipment">
                <div className="c-Manage-equipment-maintenance c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Equipment-maintenance__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/equipment-maintenance">Equipment Maintenance Program</Breadcrumb.Item>
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

export default AddEquipmentMaintenance;