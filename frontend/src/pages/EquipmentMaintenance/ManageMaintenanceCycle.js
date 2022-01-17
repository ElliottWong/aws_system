import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import { maintenanceRecordColumns } from '../../config/tableColumns';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import BootstrapTable from 'react-bootstrap-table-next';
import { TAB } from '../../config/enums';
import dayjs from 'dayjs';
import jwt_decode from "jwt-decode";
import axios from 'axios';
import paginationFactory from 'react-bootstrap-table2-paginator';
import config from '../../config/config';
import ErrorCard from '../../common/ErrorCard';
import { Container, Row, Col } from 'react-bootstrap';
import DateTimePicker from 'react-datetime-picker';
import * as RiIcons from 'react-icons/ri';
import { IconContext } from 'react-icons';
import { ToastContainer, toast } from 'react-toastify';
import Select from "react-select";
import { confirmAlert } from 'react-confirm-alert';
import CustomConfirmAlert from '../../common/CustomConfirmAlert';
import TokenManager from '../../utilities/tokenManager';
import StatusPill from '../../common/StatusPill';
import { useHistory, NavLink } from 'react-router-dom';

const ManageMaintenanceCycle = ({ match }) => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;
    const toastTiming = config.toastTiming;
    const [rerender, setRerender] = useState(false); // value of state doesnt matter, only using it to force useffect to execute

    // State declarations
    const options = [
        { label: 'Swedish', value: 'Swedish' },
        { label: 'English', value: 'English' },
        { label: 'English', value: 'English' },
        { label: 'English', value: 'English' },
        { label: 'English', value: 'English' },
    ];
    const [maintenanceRecordsData, setMaintenanceRecordsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputTouched, setInputTouched] = useState(false);
    const [editData, setEditData] = useState({
        users: ''
    });
    const [allUsernameData, setallUsernameData] = useState({
        username: []
    });
    const [maintenanceCyclesData, setMaintenanceCyclesData] = useState([]);
    const [renderErrorCard, setRenderErrorCard] = useState({
        render: false,
        errMsg: null,
        errStatus: null,
        errStatusText: null
    });
    const [isEditing, setIsEditing] = useState(false);
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [isEditor, setIsEditor] = useState(false);        // Track if user has rights to edit
    const [archivedDocData, setArchivedDocData] = useState([]);
    const equipmentID = match.params.emID;
    const maintenanceID = match.params.maintenanceID;

    useEffect(() => {
        // Set equipment maintenance cycle data
        (async () => {
            try {
                let tempEquipmentData = [];

                const resOneEquipment = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment/${equipmentID}/all-maintenance/${maintenanceID}`);
                console.log(resOneEquipment);
                tempEquipmentData = resOneEquipment.data.results;
                console.log(tempEquipmentData);

                setMaintenanceCyclesData(() => {
                    return {
                        id: tempEquipmentData.maintenance_id,
                        serialNo: 1,
                        maintenanceType: tempEquipmentData.type,
                        responsible: (() => {
                            let personArray = [];
                            let personString = ""
                            tempEquipmentData.assignees.map((eachPerson) => {
                                personString += eachPerson.account.username + ", ";
                            });
                            personArray.push(personString.slice(0, -2));
                            personString = "";
                            return personArray;
                        })(),
                        maintenanceFrequency: (() => {
                            console.log(tempEquipmentData.freq_unit_time)
                            if (tempEquipmentData.freq_unit_time === 7) {
                                return `${tempEquipmentData.freq_multiplier} weeks`
                            }
                            if (tempEquipmentData.freq_unit_time === 30) {
                                return `${tempEquipmentData.freq_multiplier} months`
                            }
                            if (tempEquipmentData.freq_unit_time === 365) {
                                return `${tempEquipmentData.freq_multiplier} years`
                            }
                        })(),
                        lastServiceDate: tempEquipmentData.last_service_at,
                        status: (() => {
                            let placeholder = '';
                            if (placeholder === undefined) {
                                return <p>Nil</p>
                            }
                            return <StatusPill type="active" />
                        })(),
                    }
                });

                setMaintenanceRecordsData(() => {
                    return {
                        id: tempEquipmentData.maintenance_id,
                        serialNo: 1,
                        fileName: tempEquipmentData.fileName,
                        description: tempEquipmentData.last_service_at,
                        uploader: (() => {
                            let personArray = [];
                            let personString = ""
                            tempEquipmentData.assignees.map((eachPerson) => {
                                personString += eachPerson.account.username + ", ";
                            });
                            personArray.push(personString.slice(0, -2));
                            personString = "";
                            return personArray;
                        })(),
                        uploadDate: tempEquipmentData.last_service_at,
                        action_download: `/equipment-maintenance/manage-equipment/manage-cycle/${tempEquipmentData.maintenance_id}`,
                        action_delete: (() => {
                            return (
                                <IconContext.Provider value={{ color: "#DC3545", size: "16px" }}>
                                    <RiIcons.RiDeleteBin7Line className="c-Table-Btn--bin c-Table-Btn" onClick={() => (handleDeleteRecord(tempEquipmentData.maintenance_record_id))} />
                                </IconContext.Provider>
                            )                
                        })(),
                    }
                });
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

    const handleBtn = (buttonType) => {
        if (buttonType === "upload") {
            // Handler for upload button
        }
    }

    // Handler for input 
    const handleInputChange = (event) => {
        setMaintenanceCyclesData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }

    // Handler for select input change
    const handleSelectInputChange = (event) => {
        let selectValue = parseInt(event.target.value);

        setEditData((prevState) => ({
            ...prevState,
            [event.target.name]: selectValue
        }));
    };

    // Handler for adding / delete role
    const handleEditResponsibleUsers = (handleType, roleID) => {
        // axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employee/${employeeID}/roles`, {
        //     roles: (() => {
        //         // handle add role
        //         if (handleType === "add") {
        //             let tempRoleArrList = userData.roles.map((data, index) => {
        //                 return data.role_id
        //             });
        //             tempRoleArrList.push(editData.roles);
        //             console.log(tempRoleArrList);
        //             return tempRoleArrList;
        //         }
        //         // handle delete role 
        //         if (handleType === "delete") {
        //             let tempRoleArrList = userData.roles.map((data, index) => {
        //                 return data.role_id
        //             });
        //             const indexOfToBeDeletedRoleID = tempRoleArrList.indexOf(roleID);
        //             tempRoleArrList.splice(indexOfToBeDeletedRoleID, 1);
        //             console.log(tempRoleArrList);
        //             return tempRoleArrList;
        //         }
        //     })()
        // }, {
        //     headers: {
        //         'Authorization': `Bearer ${token}`
        //     }
        // })
        //     .then((res) => {
        //         console.log(res);
        //         setRerender((prevState) => !prevState);
        //         toast.success(<>Success!<br />Message: <b>Roles updated!</b></>);
        //     })
        //     .catch((err) => {
        //         console.log(err);
        //         let errCode = "Error!";
        //         let errMsg = "Error!"
        //         if (err.response !== undefined) {
        //             errCode = err.response.status;
        //             errMsg = err.response.data.message;
        //         }

        //         toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
        //     });
    };

    // Dynamic Search filter
    const filterSearch = (option, inputValue) => {
        const { label, value } = option;
        // looking if other options with same username are matching inputValue
        const otherKey = options.filter(
            opt => {
                return opt.name === label && opt.value.includes(inputValue)
            }
        );
        return value.includes(inputValue) || otherKey.length > 0;
    };

    // Only rendered when document is in editing mode
    const renderInputFieldEditSection = () => {
        return (
            <Container className="l-Manage-equipment__Inputs">
                {/* Row 1 */}
                <Row className="l-Manage-equipment__Inputs--row1 l-Manage-equipment__Inputs--row">
                    {/* Maintenance Type */}
                    <Col className="c-Input c-Input__Name c-Input c-Input--edit">
                        <label htmlFor="maintenanceType">Maintenance Type</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="maintenanceType" value={maintenanceCyclesData.maintenanceType} />
                    </Col>
                    {/* Responsible */}
                    <Col className="c-Input c-Input__Category c-Input c-Input--edit">
                        <label htmlFor="responsible">Responsible</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="responsible" value={maintenanceCyclesData.responsible} />
                    </Col>
                    {/* Maintenance Frequency */}
                    <Col className="c-Input c-Input__Ref-no c-Input--edit">
                        <label htmlFor="maintenanceFrequency">Maintenance Frequency</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="maintenanceMultiplier" value={maintenanceCyclesData.maintenanceMultiplier} />
                        <select onFocus={() => setInputTouched(true)} type="text" name="maintenanceUnitTime" onChange={handleInputChange} value={maintenanceCyclesData.maintenanceUnitTime}>
                            <option>Select Time Unit</option>
                            <option>Days</option>
                            <option>Weeks</option>
                            <option>Months</option>
                        </select>
                    </Col>
                </Row>

                {/* Row 2 */}
                <Row className="l-Manage-equipment__Inputs--row2 l-Manage-equipment__Inputs--row">
                    {/* Last Service Date */}
                    <Col className="c-Input c-Input__Reg-no c-Input--edit">
                        <label htmlFor="lastServiceDate">Last Service Date</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="lastServiceDate" value={maintenanceCyclesData.lastServiceDate} />
                    </Col>
                    {/* Filler */}
                    <Col className="c-Input c-Input__Model-brand c-Input--edit">
                    </Col>
                </Row>

                {/* Save & Cancel Buttons */}
                <Row className="c-Manage-equipment__Btns">
                    {
                        inputTouched ?
                            <button onClick={() => (handleBtn("editEquipmentSave"))} type="button" className="c-Btn c-Btn--primary">Save</button>
                            :
                            <button type="button" disabled={true} className="c-Btn c-Btn--disabled">{loading ? "Loading..." : "Save"}</button>
                    }

                    <button onClick={() => (handleBtn("editEquipmentCancel"))} type="button" className="c-Btn c-Btn--cancel">Cancel</button>
                </Row>
            </Container>
        )
    }

    // Rendered when document is not in editing mode
    const renderInputFieldSection = () => {
        return (
            <Container className="l-Manage-equipment__Inputs">
                {/* Row 1 */}
                <Row className="l-Manage-equipment__Inputs--row1 l-Manage-equipment__Inputs--row">
                    {/* Maintenance Type */}
                    <Col className="c-Input c-Input__Name c-Input--read-only">
                        <label htmlFor="maintenanceType">Maintenance Type</label>
                        <input readOnly type="text" name="maintenanceType" value={maintenanceCyclesData.maintenanceType} />
                    </Col>
                    {/* Responsible */}
                    <Col className="c-Input c-Input__Category c-Input--read-only">
                        <label htmlFor="responsible">Responsible</label>
                        <input readOnly type="text" name="responsible" value={maintenanceCyclesData.responsible} />
                    </Col>
                    {/* Maintenance Frequency */}
                    <Col className="c-Input c-Input__Ref-no c-Input--read-only">
                        <label htmlFor="maintenanceFrequency">Maintenance Frequency</label>
                        <input readOnly type="text" name="maintenanceFrequency" value={maintenanceCyclesData.maintenanceFrequency} />
                    </Col>
                </Row>

                {/* Row 2 */}
                <Row className="l-Manage-equipment__Inputs--row2 l-Manage-equipment__Inputs--row">
                    {/* Last Service Date */}
                    <Col className="c-Input c-Input__Reg-no c-Input--read-only">
                        <label htmlFor="lastServiceDate">Last Service Date</label>
                        <input readOnly type="text" name="lastServiceDate" value={maintenanceCyclesData.lastServiceDate} />
                    </Col>
                    {/* Status */}
                    <Col className="c-Input c-Input__Model-brand c-Input--read-only">
                        <label htmlFor="status">Status</label>
                        {
                            maintenanceCyclesData.status
                        }
                    </Col>
                </Row>
            </Container>
        )
    }

    // Handler for deleting maintenance cycle 
    const handleDeleteCycle = (actionType) => {
        if (actionType === "deleteCycle") {
            // Confirmation dialogue for activating this account
            const message = `Are you sure you want to delete this maintenance cycle?`;
            const handler = (onClose) => handleDelete(onClose);
            const heading = `Confirm Delete?`;
            const type = "alert"
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
        }

        const handleDelete = (onClose) => {
            axios.delete(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment/${equipmentID}/all-maintenance/${maintenanceID}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    console.log(res);
                    setRerender((prevState) => !prevState);
                    onClose();
                    toast.success(<>Success!<br />Message: <b>Maintenance cycle has been deleted!</b></>);
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
    };

    // Handler for deleting maintenance record 
    const handleDeleteRecord = (actionType) => {
        if (actionType === "deleteRecord") {
            // Confirmation dialogue for activating this account
            const message = `Are you sure you want to delete this maintenance record?`;
            const handler = (onClose) => handleDelete(onClose);
            const heading = `Confirm Delete?`;
            const type = "alert"
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
        }

        const handleDelete = (onClose) => {
            // Wrong endpoint need edit
            axios.delete(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment/${equipmentID}/all-maintenance/${maintenanceID}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    console.log(res);
                    setRerender((prevState) => !prevState);
                    onClose();
                    toast.success(<>Success!<br />Message: <b>Maintenance cycle has been deleted!</b></>);
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
    };

    const maintenanceCyclesDataPlaceholder = [
        {
            id: 1,
            serialNo: 1,
            maintenanceType: "Preventive",
            responsible: "HengHeng",
            maintenanceFrequency: "1 Month",
            lastServiceDate: dayjs(new Date()).format("MMMM D, YYYY h:mm A"),
            status: (() => {
                // if (new Date() < new Date()) {
                //     return "active";
                // } 
                // TODO: algorithm to determine status
                return "active";
            })(),
            action_manage: "",
            action_delete: ""
        },
        {
            id: 2,
            serialNo: 2,
            maintenanceType: "Corrective",
            responsible: "HengHeng",
            maintenanceFrequency: "1 Month",
            lastServiceDate: dayjs(new Date()).format("MMMM D, YYYY h:mm A"),
            status: (() => {
                // if (new Date() < new Date()) {
                //     return "active";
                // } 
                // TODO: algorithm to determine status
                return "almostDue";
            })(),
            action_manage: "",
            action_delete: ""
        },
    ]

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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Equipment Maintenance Cycle' activeLink={`/equipment-maintenance/manage-equipment/${equipmentID}/manage-cycle/${maintenanceID}`}>
                <div className="c-Manage-equipment-maintenance c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Equipment-maintenance__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/equipment-maintenance">Equipment Maintenance Program</Breadcrumb.Item>
                        <Breadcrumb.Item href={`/equipment-maintenance/manage-equipment/${equipmentID}`}>Manage Equipment</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Maintenance Cycle</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-equipment__Top c-Main__Top">
                        <h1>Manage Maintenance cycle</h1>
                        {/* Edit button section */}
                        {
                            isEditing || renderErrorCard.render ?
                                null :
                                <button
                                    onClick={() => (handleBtn("editEquipment"))}
                                    type="button"
                                    className={"c-Btn c-Btn--primary"}
                                >
                                    Edit
                                </button>
                        }
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
                                        :
                                        renderInputFieldSection()
                                }
                            </>
                    }

                    {/* Danger Zone */}
                    <h2 className="c-Danger-zone__Title">Danger Zone</h2>
                    <div className="c-Danger-zone__Row">
                        <div className='c-Danger-zone__Item'>
                            <button type="button" className="c-Btn c-Btn--alert-border" onClick={() => handleDeleteCycle('deleteCycle')}>Delete Cycle</button>
                            <div className="c-Row__Info">
                                <p>This action cannot be undone</p>
                            </div>
                        </div>
                    </div>

                    {/* Maintenance Records */}
                    <div className="c-Manage-equipment-maintenance__Cycles-top c-Main__Top">
                        <h1>Maintenance Records</h1>
                        {/* Edit button section */}
                        <button
                            onClick={() => handleBtn("upload")}
                            type="button"
                            className={"c-Btn c-Btn--primary"}
                        >
                            Upload
                        </button>
                    </div>

                    {/* Maintenance Records Table section */}
                    <div className="c-Manage-equipment-maintenance__Cycles-table c-Main__Cycles-table">
                        {console.log(maintenanceRecordsData)}
                        {
                            maintenanceCyclesDataPlaceholder.length !== 0 ?
                                <BootstrapTable
                                    bordered={false}
                                    keyField='serialNo'
                                    data={maintenanceRecordsData}
                                    columns={maintenanceRecordColumns}
                                    pagination={paginationFactory()}
                                />
                                :
                                "No records found!"
                        }
                    </div>
                </div>
            </PageLayout>
        </>
    )
}

export default ManageMaintenanceCycle;