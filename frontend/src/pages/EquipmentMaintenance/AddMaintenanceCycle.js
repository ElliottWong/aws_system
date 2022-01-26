import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import DateTimePicker from 'react-datetime-picker';
import { useHistory } from 'react-router-dom';
import Select from "react-select";
import { toast, ToastContainer } from 'react-toastify';
import ErrorCard from '../../common/ErrorCard';
import config from '../../config/config';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager';

const AddMaintenanceCycle = ({ match }) => {
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
        type: '',
        responsible: '',
        freq_multiplier: '',
        freq_unit_time: '',
        freq_unit_time_UI: '',
        last_service_at: new Date(),
        assignees: []
    });
    const [userList, setUserList] = useState([]);
    const [renderErrorCard, setRenderErrorCard] = useState({
        render: false,
        errMsg: null,
        errStatus: null,
        errStatusText: null
    });
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed

    const handleBtn = (buttonType) => {
        if (buttonType === "addCycle") {
            // Handler for add button
            console.log(maintenanceData);
            (async () => {
                try {
                    const resInsertOneMaintenance = await axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment/${equipmentID}/all-maintenance`,
                        {
                            ...maintenanceData,
                            assignees: (() => {
                                return maintenanceData.assignees?.map((data) => {
                                    return data.value;
                                })
                            })()
                        }, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    console.log(resInsertOneMaintenance);
                    setTimeout(() => {
                        toast.success(<>Success!<br />Message: <b>New equipment has been added!</b></>);
                    }, 0);
                    history.push(`/equipment-maintenance/manage-equipment/${equipmentID}`);
                } catch (err) {
                    console.log(err);
                    console.log(err.response);
                    let errCode = "Error!";
                    let errMsg = "Error!"
                    if (err.response !== undefined) {
                        errCode = err.response.status;
                        errMsg = err.response.data.message;
                    }
                    toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
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

    // Handler for input 
    const handleTimeInputChange = (event) => {
        let unitTime;
        // if(event.target.value === "Days") unitTime = 1;
        if (event.target.value === "Weeks") unitTime = "week";
        if (event.target.value === "Months") unitTime = "month";
        if (event.target.value === "Years") unitTime = "year";

        // Set string value for backend endpoint
        setMaintenanceData((prevState) => ({
            ...prevState,
            [event.target.name]: unitTime
        }));

        // Set string value for frontend
        setMaintenanceData((prevState) => ({
            ...prevState,
            freq_unit_time_UI: event.target.value
        }));
    }

    // Handler for setting last service date 
    const setLastServiceDate = (date) => {
        console.log(date);
        setMaintenanceData((prevState) => ({
            ...prevState,
            last_service_at: date
        }));
    }

    // Handler for input array
    const handleInputArrayChange = (options) => {
        console.log(options);
        setMaintenanceData((prevState) => ({
            ...prevState,
            assignees: options
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
                    <Col className="c-Input c-Input__Responsible c-Input c-Input--edit">
                        <label htmlFor="responsible">Responsible Users</label>
                        <Select
                            isMulti
                            options={userList}
                            placeholder="Select Users"
                            onChange={handleInputArrayChange}
                            onFocus={() => setInputTouched(true)}
                        />
                    </Col>
                    {/* Maintenance Frequency */}
                    <Col className="c-Input c-Input__Maintenance-frequency c-Input--edit">
                        <label htmlFor="maintenanceFrequency">Maintenance Frequency</label>
                        <div className='c-Input__Maintenance-frequency--input'>
                            <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="freq_multiplier" value={maintenanceData.freq_multiplier} />
                            <select onFocus={() => setInputTouched(true)} type="text" name="freq_unit_time" onChange={handleTimeInputChange} value={maintenanceData.freq_unit_time_UI}>
                                <option>Select Time Unit</option>
                                {/* <option>Days</option> */}
                                <option>Weeks</option>
                                <option>Months</option>
                                <option>Years</option>
                            </select>
                        </div>
                    </Col>
                    {/* Last Service Date */}
                    <Col className="c-Input c-Input__Reg-no c-Input--edit">
                        <label htmlFor="last_service_at">Last Service Date</label>
                        <DateTimePicker
                            onChange={setLastServiceDate}
                            value={maintenanceData.last_service_at}
                            className="c-Form__Date"
                            format="dd/MM/y"
                            onFocus={() => setInputTouched(true)}
                        />
                    </Col>
                </Row>
            </Container>
        )
    }

    useEffect(() => {
        (async () => {
            try {
                let tempUsersData = [];
                // Get all equipment categories
                const resAllUsers = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m07_01/employees`);
                console.log(resAllUsers);
                tempUsersData = resAllUsers.data.results;
                console.log(tempUsersData);

                setUserList(() => {
                    return tempUsersData.map((data) => ({
                        label: data.account.username,
                        value: data.employee_id
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Manage Maintenance Cycle' activeLink="/equipment-maintenance">
                <div className="c-Manage-equipment-maintenance c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Equipment-maintenance__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/equipment-maintenance">Equipment Maintenance Program</Breadcrumb.Item>
                        <Breadcrumb.Item href={`/equipment-maintenance/manage-equipment/${equipmentID}`}>Manage Equipment</Breadcrumb.Item>
                        <Breadcrumb.Item active>Add Maintenance Cycle</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-equipment__Top c-Main__Top">
                        <h1>Add Maintenance Cycle</h1>
                        {/* Add and Cancel button section */}
                        <div className='c-Manage-equipment__Btns'>
                            {
                                inputTouched ?
                                    <button onClick={() => (handleBtn("addCycle"))} type="button" className="c-Btn c-Btn--primary">Add</button>
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