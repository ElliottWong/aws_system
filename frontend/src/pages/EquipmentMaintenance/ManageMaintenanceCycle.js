import axios from 'axios';
import dayjs from 'dayjs';
import FileDownload from 'js-file-download';
import React, { useEffect, useRef, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { confirmAlert } from 'react-confirm-alert';
import DateTimePicker from 'react-datetime-picker';
import { IconContext } from 'react-icons';
import * as RiIcons from 'react-icons/ri';
import { useHistory } from 'react-router-dom';
import Select from "react-select";
import { toast, ToastContainer } from 'react-toastify';
import CustomConfirmAlert from '../../common/CustomConfirmAlert';
import ErrorCard from '../../common/ErrorCard';
import StatusPill from '../../common/StatusPill';
import config from '../../config/config';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager';


const ManageMaintenanceCycle = ({ match }) => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const toastTiming = config.toastTiming;
    let history = useHistory();
    const [rerender, setRerender] = useState(false); // value of state doesnt matter, only using it to force useffect to execute
    const descriptionRef = useRef("");
    const maintenanceFileRef = useRef(null);
    const equipmentID = match.params.emID;
    const maintenanceID = match.params.maintenanceID;
    const userID = decodedToken.employee_id;

    // State declarations
    const [maintenanceRecordsData, setMaintenanceRecordsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputTouched, setInputTouched] = useState(false);
    const [userList, setUserList] = useState([]);
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
    const [canApprove, setCanApprove] = useState(false);
    const [canEdit, setCanEdit] = useState(false);

    useEffect(() => {
        // Set equipment maintenance cycle data
        (async () => {
            try {
                let tempEquipmentData = [];
                let tempPersonsData = [];

                // Can approve people can create new equipment
                const resClausePermission = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m07_01/employees`);
                // Can edit people can upload new maintenance record
                const resClausePermissionEdit = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m07_01/employees`);
                console.log(resClausePermissionEdit);
                tempPersonsData = resClausePermissionEdit.data.results;
                console.log(tempPersonsData);

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

                const resOneEquipment = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment/${equipmentID}/all-maintenance/${maintenanceID}`);
                console.log(resOneEquipment);
                tempEquipmentData = resOneEquipment.data.results;
                console.log(tempEquipmentData);

                setMaintenanceCyclesData(() => {
                    return {
                        id: tempEquipmentData.maintenance_id,
                        maintenanceType: tempEquipmentData.type,
                        responsible: (() => {
                            return tempEquipmentData.assignees.map((eachPerson) => {
                                return {
                                    label: eachPerson.account.username,
                                    value: eachPerson.employee_id
                                }
                            });
                        })(),
                        freq_unit_time: tempEquipmentData.freq_unit_time,
                        freq_multiplier: tempEquipmentData.freq_multiplier,
                        maintenanceFrequency: tempEquipmentData.freq_unit_time,
                        lastServiceDate: new Date(tempEquipmentData.last_service_at),
                        status: (() => {
                            if (tempEquipmentData.days_left <= 0) {
                                return <StatusPill type="overdue" />
                            } else if (tempEquipmentData.days_left / (tempEquipmentData.freq_multiplier * tempEquipmentData.freq_unit_time) < 2 / 5) {
                                return <StatusPill type="almostDue" />
                            }
                            else {
                                return <StatusPill type="active" />
                            }
                        })(),
                    }
                });

                setUserList(() => {
                    return tempPersonsData.map((data) => ({
                        label: data.account.username,
                        value: data.employee_id
                    }));
                });

                setMaintenanceRecordsData(() => {
                    return tempEquipmentData.uploads.map((fileData, index) => {
                        return {
                            id: fileData.file.file_id,
                            serialNo: index + 1,
                            fileName: fileData.file.file_name,
                            description: fileData.description,
                            uploader: fileData.author.account.username,
                            uploadDate: dayjs(fileData.created_at).format("D MMM YYYY"),
                            action_download: fileData.file?.file_name,
                            action_delete: (() => {
                                return (
                                    <IconContext.Provider value={{ color: "#DC3545", size: "16px" }}>
                                        <RiIcons.RiDeleteBin7Line className="c-Table-Btn--bin c-Table-Btn" onClick={() => (handleDeleteRecord("deleteRecord", fileData.file.file_id))} />
                                    </IconContext.Provider>
                                )
                            })(),
                        }
                    })
                });
            } catch (error) {
                console.log(error);
            }
        })();
    }, [rerender, loading]);
    const maintenanceRecordColumns = [
        {
            dataField: 'id',
            text: 'id',
            hidden: true
        },
        {
            dataField: 'serialNo',
            text: '#',
        },
        {
            dataField: 'fileName',
            text: 'File Name'
        },
        {
            dataField: 'description',
            text: 'Description'
        },
        {
            dataField: 'uploader',
            text: 'Uploader'
        },
        {
            dataField: 'uploadDate',
            text: 'Upload Date'
        },
        {
            dataField: 'action_download',
            text: '',
            formatter: (cell, row) => {
                if (cell) {
                    return <button className='c-Btn c-Btn--link' onClick={() => handleFileDownload(row.id, row.fileName)} >Download</button>
                } else {
                    return "N.a."
                }
            }
        },
        {
            dataField: 'action_delete',
            text: '',
            formatter: (cell) => {
                console.log(cell);
                return cell
            }
        },
    ];

    const handleFileDownload = async (id, fileName) => {
        try {
            const fileRes = await axios.get(`${process.env.REACT_APP_BASEURL}/file/download/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob'
            });
            console.log(fileRes);
            FileDownload(fileRes.data, fileName);
            toast.success(<>Success!<br />Message: <b>Document has been downloaded successfully!</b></>);
        } catch (err) {
            console.log(err);
            let errCode = "Error!";
            let errMsg = "Error!"
            if (err.response !== undefined) {
                errCode = err.response.status;
                errMsg = err.response.data.message;
            }

            toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
        }
    };

    const handleBtn = (buttonType) => {
        if (buttonType === "upload") {
            // Handler for upload button
            history.push(`./${maintenanceID}/upload`);
        }

        if (buttonType === "editEquipment") {
            // Handler for edit button
            setIsEditing(true);
        }

        if (buttonType === "editEquipmentCancel") {
            // Handler for cancel button
            setIsEditing(false);
            setInputTouched(false);
            setRerender((prevState) => !prevState);
        }

        if (buttonType === "editEquipmentSave") {
            // Handler for save button
            (async () => {
                try {
                    console.log(maintenanceCyclesData);
                    let unitTime = maintenanceCyclesData.freq_unit_time;
                    if (unitTime === "7" || unitTime === 7) unitTime = "week";
                    if (unitTime === "30" || unitTime === 30) unitTime = "month";
                    if (unitTime === "365" || unitTime === 365) unitTime = "year";

                    const resUpdateCycle = await axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment/${equipmentID}/all-maintenance/${maintenanceID}`,
                        {
                            type: maintenanceCyclesData.maintenanceType,
                            freq_multiplier: maintenanceCyclesData.freq_multiplier,
                            freq_unit_time: unitTime,
                            last_service_at: maintenanceCyclesData.lastServiceDate,
                            assignees: (() => {
                                return maintenanceCyclesData.responsible.map((data) => {
                                    return data.value;
                                })
                            })(),
                        },
                        {
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        });
                    console.log(resUpdateCycle);
                    toast.success(<>Success!<br />Message: <b>Updated Maintenance Cycle!</b></>);
                    setIsEditing(false);
                    setRerender((prevState) => !prevState);
                } catch (err) {
                    console.log(err);
                    let errCode = "Error!";
                    let errMsg = "Error!"
                    if (err.response !== undefined) {
                        errCode = err.response.status;
                        errMsg = err.response.data.message;
                    }

                    toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                }
            })();
        }
    }

    // Handler for input 
    const handleInputChange = (event) => {
        setMaintenanceCyclesData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }

    // Handler for setting last service date 
    const setLastServiceDate = (date) => {
        console.log(date);
        setMaintenanceCyclesData((prevState) => ({
            ...prevState,
            lastServiceDate: date
        }));
    }

    // Handler for input array
    const handleInputArrayChange = (options) => {
        console.log(options);
        setMaintenanceCyclesData((prevState) => ({
            ...prevState,
            assignees: options,
            responsible: options
        }));
    }

    // Handler for input 
    const handleTimeInputChange = (event) => {
        // Set string value for backend endpoint
        setMaintenanceCyclesData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
        console.log();
    }

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
                        <Select
                            isMulti
                            options={userList}
                            placeholder="Select Users"
                            onChange={handleInputArrayChange}
                            onFocus={() => setInputTouched(true)}
                            value={(() => {
                                return maintenanceCyclesData.responsible.map((data) => {
                                    return data;
                                })
                            })()}
                        />
                    </Col>
                    {/* Maintenance Frequency */}
                    <Col className="c-Input c-Input__Ref-no c-Input--edit">
                        <label htmlFor="maintenanceFrequency">Maintenance Frequency</label>
                        <div className='c-Input__Maintenance-frequency--input'>
                            <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="freq_multiplier" value={maintenanceCyclesData.freq_multiplier} />
                            <select onFocus={() => setInputTouched(true)} type="text" name="freq_unit_time" onChange={handleTimeInputChange} value={maintenanceCyclesData.freq_unit_time}>
                                <option>Select Time Unit</option>
                                <option value={7}>Weeks</option>
                                <option value={30}>Months</option>
                                <option value={365}>Years</option>
                            </select>
                        </div>
                    </Col>
                </Row>

                {/* Row 2 */}
                <Row className="l-Manage-equipment__Inputs--row2 l-Manage-equipment__Inputs--row">
                    {/* Last Service Date */}
                    <Col className="c-Input c-Input__Reg-no c-Input--edit">
                        <label htmlFor="lastServiceDate">Last Service Date</label>
                        <DateTimePicker
                            onChange={setLastServiceDate}
                            value={maintenanceCyclesData.lastServiceDate}
                            className="c-Form__Date"
                            format="dd/MM/y"
                            onFocus={() => setInputTouched(true)}
                        />
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
                        <input readOnly type="text" name="responsible" value={(() => {
                            let personStr = "";
                            maintenanceCyclesData.responsible?.forEach((data) => {
                                personStr += data.label + ", "
                            });
                            return personStr.slice(0, -2);;
                        })()} />
                    </Col>
                    {/* Maintenance Frequency */}
                    <Col className="c-Input c-Input__Ref-no c-Input--read-only">
                        <label htmlFor="maintenanceFrequency">Maintenance Frequency</label>
                        <input readOnly type="text" name="maintenanceFrequency" value={(() => {
                            if (maintenanceCyclesData.freq_unit_time === 7) {
                                return `${maintenanceCyclesData.freq_multiplier} weeks`
                            }
                            if (maintenanceCyclesData.freq_unit_time === 30) {
                                return `${maintenanceCyclesData.freq_multiplier} months`
                            }
                            if (maintenanceCyclesData.freq_unit_time === 365) {
                                return `${maintenanceCyclesData.freq_multiplier} years`
                            }
                        })()} />
                    </Col>
                </Row>

                {/* Row 2 */}
                <Row className="l-Manage-equipment__Inputs--row2 l-Manage-equipment__Inputs--row">
                    {/* Last Service Date */}
                    <Col className="c-Input c-Input__Reg-no c-Input--read-only">
                        <label htmlFor="lastServiceDate">Last Service Date</label>
                        <input readOnly type="text" name="lastServiceDate" value={dayjs(maintenanceCyclesData.lastServiceDate).format("D MMM YYYY")} />
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
                    setTimeout(() => {
                        toast.success(<>Success!<br />Message: <b>Maintenance Cycle has been deleted!</b></>);
                    }, 0);
                    history.push(`/equipment-maintenance/manage-equipment/${equipmentID}`);
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
    const handleDeleteRecord = (actionType, id) => {
        if (actionType === "deleteRecord") {
            // Confirmation dialogue for activating this account
            const message = `Are you sure you want to delete this maintenance record?`;
            const handler = (onClose) => handleDelete(onClose, id);
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

        const handleDelete = (onClose, id) => {
            // Handler for deleting maintenance record
            console.log(maintenanceRecordsData);
            axios.delete(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment/${equipmentID}/all-maintenance/${maintenanceID}/uploads/${id}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    console.log(res);
                    setRerender((prevState) => !prevState);
                    onClose();
                    toast.success(<>Success!<br />Message: <b>Maintenance record has been deleted!</b></>);
                    setRerender((prevState) => !prevState);
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
                            canApprove ?
                                isEditing || renderErrorCard.render ?
                                    null :
                                    <button
                                        onClick={() => (handleBtn("editEquipment"))}
                                        type="button"
                                        className={"c-Btn c-Btn--primary"}
                                    >
                                        Edit
                                    </button>
                                : ""
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
                    {canApprove ?
                        <>
                            <h2 className="c-Danger-zone__Title">Danger Zone</h2>
                            <div className="c-Danger-zone__Row">
                                <div className='c-Danger-zone__Item'>
                                    <button type="button" className="c-Btn c-Btn--alert-border" onClick={() => handleDeleteCycle('deleteCycle')}>Delete Cycle</button>
                                    <div className="c-Row__Info">
                                        <p>This action cannot be undone</p>
                                    </div>
                                </div>
                            </div>
                        </> : ""
                    }

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
                        {
                            maintenanceRecordsData.length !== 0 ?
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