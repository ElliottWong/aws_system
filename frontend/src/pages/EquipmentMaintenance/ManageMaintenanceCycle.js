import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import DocumentLayout from '../../layout/DocumentLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import { docManageEquipmentColumns, historyManageEquipmentColumns } from '../../config/tableColumns';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import BootstrapTable from 'react-bootstrap-table-next';
import TabRow from '../../common/TabRow';
import DocumentBtnSection from '../../common/DocumentBtnSection';
import RenderDocument from '../../common/RenderDocument';
import { TAB } from '../../config/enums';
import dayjs from 'dayjs';
import jwt_decode from "jwt-decode";
import useCheckEditableAxios from '../../hooks/useCheckEditableAxios';
import ManageDeleteArchivedDoc from '../../common/ManageDeleteArchivedDoc';
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
import { maintenanceRecordColumns, } from '../../config/tableColumns';

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
    const [maintenanceCyclesData2, setMaintenanceCyclesData2] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputTouched, setInputTouched] = useState(false);
    const [editData, setEditData] = useState({
        users: ''
    });
    const [allUsernameData, setallUsernameData] = useState({
        username: []
    });
    const [maintenanceCyclesData, setMaintenanceCyclesData] = useState({
        name: 'Error',
        category: 'Error',
        refNo: 'Error',
        regNo: 'Error',
        model: 'Error',
        serialNo: 'Error',
        archivedAt: null,
    });
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

                const resOneEquipment = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment/${equipmentID}`);
                console.log(resOneEquipment);
                tempEquipmentData = resOneEquipment.data.results;
                console.log(tempEquipmentData);

                setMaintenanceCyclesData(() => {
                    return tempEquipmentData.maintenance.map((data, index) => {
                        return {
                            id: data.maintenance_id,
                            serialNo: 1,
                            maintenanceType: data.type,
                            responsible: (() => {
                                let personArray = [];
                                let personString = ""
                                data.assignees.map((eachPerson) => {
                                    personString += eachPerson.account.username + ", ";
                                });
                                personArray.push(personString.slice(0, -2));
                                personString = "";
                                return personArray;
                            })(),
                            maintenanceFrequency: (() => {
                                console.log(data.freq_unit_time)
                                if (data.freq_unit_time == 7) {
                                    return `${data.freq_multiplier} weeks`
                                }
                                if (data.freq_unit_time == 30) {
                                    return `${data.freq_multiplier} months`
                                }
                                if (data.freq_unit_time == 365) {
                                    return `${data.freq_multiplier} years`
                                }
                            })(),
                            lastServiceDate: data.last_service_at,
                            status: `/equipment-maintenance/manage-equipment/${data.maintenance_id}`,
                        }
                    });
                });

                setMaintenanceCyclesData2(() => {
                    return tempEquipmentData.maintenance.map((data, index) => {
                        return {
                            id: data.maintenance_id,
                            serialNo: 1,
                            maintenanceType: data.type,
                            responsible: (() => {
                                let personArray = [];
                                let personString = ""
                                data.assignees.map((eachPerson) => {
                                    personString += eachPerson.account.username + ", ";
                                });
                                personArray.push(personString.slice(0, -2));
                                personString = "";
                                return personArray;
                            })(),
                            maintenanceFrequency: (() => {
                                console.log(data.freq_unit_time)
                                if (data.freq_unit_time == 7) {
                                    return `${data.freq_multiplier} weeks`
                                }
                                if (data.freq_unit_time == 30) {
                                    return `${data.freq_multiplier} months`
                                }
                                if (data.freq_unit_time == 365) {
                                    return `${data.freq_multiplier} years`
                                }
                            })(),
                            lastServiceDate: data.last_service_at,
                            status: `/equipment-maintenance/manage-equipment/${data.maintenance_id}`,
                            action_manage: `/equipment-maintenance/manage-equipment/manage-cycle/${data.maintenance_id}`,
                            action_delete: 'asd',
                        }
                    });
                });
            } catch (error) {
                console.log(error);
            }
        })();

        //     var filteredArchivedDocData = axiosResponse.resultHeaderData.results.filter((resObj) => {
        //         return resObj.status === 'archived';
        //     });
        //     var formattedArchivedDocData = filteredArchivedDocData.map((archivedData, index) => {
        //         return ({
        //             ...archivedData,
        //             id: archivedData.swot_id,
        //             serialNo: index + 1,
        //             type:
        //                 refNo:
        //             regNo:
        //                 model:
        //             serialNo:
        //                 lastServiceDate:
        //             responsible:
        //                 created_on:
        //             archived_on:
        //                 approved_by: `${archivedData.approver.firstname} ${archivedData.approver.lastname}`,
        //             approved_on: dayjs(new Date(archivedData.approved_on)).format("MMMM D, YYYY h:mm A"),
        //                 active_till: dayjs(new Date(archivedData.updated_at)).format("MMMM D, YYYY h:mm A"),
        //                     action_view: `/swot/archived/${archivedData.swot_id}`,
        //                         action_delete: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swots/${archivedData.swot_id}`
        //     });
        // })
        // setArchivedDocData(() => (formattedArchivedDocData));

        // Set archives data (More refinements to be done)
        // var filteredArchivedDocData = axiosResponse.resultHeaderData.results.filter((resObj) => {
        //     return resObj.status === 'archived';
        // });
        // var formattedArchivedDocData = filteredArchivedDocData.map((archivedData, index) => {
        //     return ({
        //         ...archivedData,
        //         id: archivedData.swot_id,
        //         serialNo: index + 1,
        //         type:
        //         refNo:
        //         regNo:
        //         model:
        //         serialNo:
        //         lastServiceDate:
        //         responsible:
        //         created_on:
        //         archived_on:
        //         approved_by: `${archivedData.approver.firstname} ${archivedData.approver.lastname}`,
        //         approved_on: dayjs(new Date(archivedData.approved_on)).format("MMMM D, YYYY h:mm A"),
        //         active_till: dayjs(new Date(archivedData.updated_at)).format("MMMM D, YYYY h:mm A"),
        //         action_view: `/swot/archived/${archivedData.swot_id}`,
        //         action_delete: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swots/${archivedData.swot_id}`
        //     });
        // })
        // setArchivedDocData(() => (formattedArchivedDocData));

        // Check if user can edit Equipment Maintenance Program attributes - add new equipment, configurations, etc
        // axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m07_01/employees`, {
        //     headers: {
        //         'Authorization': `Bearer ${token}`
        //     }
        // })
        //     .then((res) => {
        //         let canEdit = false;
        //         if (res.data.results !== undefined) {
        //             res.data.results.forEach((data, index) => {
        //                 if (data.employee_id === userID) {
        //                     canEdit = true;
        //                 }
        //             });
        //         }

        //         if (canEdit === true) {
        //             setIsEditor(() => (true));
        //         }
        //     })
        //     .catch((err) => {
        //         console.log(err);
        //     });
    }, [maintenanceCyclesData.archivedAt]);

    const handleBtn = (buttonType) => {
        if (buttonType === "editEquipment" || buttonType === "editEquipmentCancel") {
            // Handler for edit button
            setIsEditing((prevState) => (!prevState));
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
                    {/* Status */}
                    <Col className="c-Input c-Input__Model-brand c-Input--edit">
                        <label htmlFor="status">Status</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="status" value={maintenanceCyclesData.status} />
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
                        <input readOnly type="text" name="maintenanceMultiplier" value={maintenanceCyclesData.maintenanceMultiplier} />
                        <input readOnly type="text" name="maintenanceUnitTime" value={maintenanceCyclesData.maintenanceUnitTime} />
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
                        <input readOnly type="text" name="status" value={maintenanceCyclesData.status} />
                    </Col>
                </Row>
            </Container>
        )
    }

    // Archived deleteable table placed here because 'action_delete' requires setArchivedDocData


    // Handler for archiving equipment 
    const handleDeleteCycle = (actionType) => {
        let accountStatusType;
        if (actionType === "activated") {
            accountStatusType = "active";
            // Confirmation dialogue for activating this account
            const message = `Are you sure you want to activate this account?`;
            const handler = (onClose) => handleDelete(onClose);
            const heading = `Confirm Activate?`;
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
        }

        const handleDelete = (onClose) => {
            axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment/${equipmentID}/activate`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    console.log(res);
                    setRerender((prevState) => !prevState);
                    onClose();
                    setMaintenanceCyclesData({
                        ...maintenanceCyclesData,
                        archivedAt: null,
                    })
                    toast.success(<>Success!<br />Message: <b>User has been {actionType}!</b></>);
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
                            <button type="button" className="c-Btn c-Btn--alert-border" onClick={() => handleDeleteCycle()}>Delete Cycle</button>
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
                        {console.log(maintenanceCyclesData2)}
                        {
                            maintenanceCyclesDataPlaceholder.length !== 0 ?
                                <BootstrapTable
                                    bordered={false}
                                    keyField='serialNo'
                                    data={maintenanceCyclesData2}
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