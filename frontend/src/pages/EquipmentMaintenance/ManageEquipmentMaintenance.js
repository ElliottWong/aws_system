import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { confirmAlert } from 'react-confirm-alert';
import { IconContext } from 'react-icons';
import * as RiIcons from 'react-icons/ri';
import { useHistory } from 'react-router-dom';
import Select from "react-select";
import { toast, ToastContainer } from 'react-toastify';
import CustomConfirmAlert from '../../common/CustomConfirmAlert';
import ErrorCard from '../../common/ErrorCard';
import config from '../../config/config';
import { maintenanceCycleColumns } from '../../config/tableColumns';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager';

const ManageEquipmentMaintenance = ({ match }) => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;
    const toastTiming = config.toastTiming;
    const [rerender, setRerender] = useState(false); // value of state doesnt matter, only using it to force useffect to execute
    const history = useHistory();

    // State declarations
    const options = [
        { label: 'Swedish', value: 'Swedish' },
        { label: 'English', value: 'English' },
        { label: 'English', value: 'English' },
        { label: 'English', value: 'English' },
        { label: 'English', value: 'English' },
    ];
    const [maintenanceCyclesData, setMaintenanceCyclesData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputTouched, setInputTouched] = useState(false);
    const [editData, setEditData] = useState({
        users: ''
    });
    const [allUsernameData, setallUsernameData] = useState({
        username: []
    });
    const [equipmentData, setEquipmentData] = useState({
        name: 'Error',
        category: [],
        refNo: 'Error',
        regNo: 'Error',
        model: 'Error',
        serialNo: 'Error',
        location: 'Error',
        archivedAt: null,
    });
    const [categoryList, setCategoryList] = useState([]);
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

    useEffect(() => {
        // Set equipment maintenance cycle data
        (async () => {
            try {
                let tempEquipmentData = [];
                let tempCategoryData = [];

                const resOneEquipment = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment/${equipmentID}`);
                console.log(resOneEquipment);
                tempEquipmentData = resOneEquipment.data.results;
                console.log(tempEquipmentData);

                // Get all equipment categories
                const resAllCategories = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/categories`);
                console.log(resAllCategories);
                tempCategoryData = resAllCategories.data.results;
                console.log(tempCategoryData);

                setEquipmentData(() => {
                    return {
                        id: tempEquipmentData.equipment_id,
                        name: tempEquipmentData.name,
                        category: (() => {
                            // eslint-disable-next-line array-callback-return
                            return tempEquipmentData.categories.map((catData) => {
                                return catData.name;
                            });
                            // return categoryString.slice(0, -2);
                        })(),
                        refNo: tempEquipmentData.reference_number,
                        regNo: tempEquipmentData.register_number,
                        model: tempEquipmentData.model,
                        serialNo: tempEquipmentData.serial_number,
                        location: tempEquipmentData.location,
                        archivedAt: tempEquipmentData.archived_at
                    }
                });

                setCategoryList(() => {
                    return tempCategoryData.map((data) => {
                        return {
                            label: data.name,
                            value: data.category_id
                        }
                    });
                });

                setMaintenanceCyclesData(() => {
                    return tempEquipmentData.maintenance.map((data, index) => {
                        return {
                            id: data.maintenance_id,
                            serialNo: index + 1,
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
                                if (data.freq_unit_time === 7) {
                                    return `${data.freq_multiplier} weeks`
                                }
                                if (data.freq_unit_time === 30) {
                                    return `${data.freq_multiplier} months`
                                }
                                if (data.freq_unit_time === 365) {
                                    return `${data.freq_multiplier} years`
                                }
                            })(),
                            lastServiceDate: data.last_service_at,
                            status: `/equipment-maintenance/manage-equipment/${data.maintenance_id}`,
                            action_manage: `/equipment-maintenance/manage-equipment/${equipmentID}/manage-cycle/${data.maintenance_id}`,
                            action_delete: (() => {
                                console.log(data.maintenance_id);
                                return (
                                    <IconContext.Provider value={{ color: "#DC3545", size: "16px" }}>
                                        <RiIcons.RiDeleteBin7Line className="c-Table-Btn--bin c-Table-Btn" onClick={() => (handleDeleteCycle(data.maintenance_id))} />
                                    </IconContext.Provider>
                                )
                            })(),
                        }
                    });
                });
            } catch (error) {
                console.log(error);
            }
        })();
    }, [equipmentData.archivedAt]);

    console.log(equipmentData);

    // Handler for deleting maintenance record 
    const handleDeleteCycle = (maintenanceID) => {
        // Confirmation dialogue for deleting cycle
        const message = `Are you sure you want to delete this maintenance cycle?`;
        const handler = (onClose) => handleDelete(onClose, maintenanceID);
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

        const handleDelete = (onClose, maintenanceID) => {
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

    const handleBtn = (buttonType) => {
        if (buttonType === "add") {
            // Handler for add button
            history.push(`/equipment-maintenance/manage-equipment/${equipmentID}/add-cycle`);
        }

        if (buttonType === "edit") {
            // Handler for edit button
            setIsEditing(true);
        }

        if (buttonType === "editEquipmentCancel") {
            // Handler for edit button
            setIsEditing(false);
        }

        if (buttonType === "editEquipmentSave") {
            // Handler for save button
            (async () => {
                try {
                    console.log(equipmentData);
                    const resUpdateEquipment = await axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment/${equipmentData.id}`,
                        {
                            name: equipmentData.name,
                            reference_number: equipmentData.refNo,
                            register_number: equipmentData.regNo,
                            serial_number: equipmentData.serialNo,
                            model: equipmentData.model,
                            location: equipmentData.location,
                            categories: equipmentData.category.map((data) => {
                                return data.value;
                            })
                        },
                        {
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        });
                    console.log(resUpdateEquipment);
                    toast.success(<>Success!<br />Message: <b>Updated equipment details!</b></>);
                    setIsEditing(false);
                } catch (error) {
                    console.log(error);
                }
            })();
        }
    }

    // Handler for input 
    const handleInputChange = (event) => {
        setEquipmentData((prevState) => ({
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

    // Handler for input array
    const handleInputArrayChange = (options) => {
        console.log(options);
        setEquipmentData((prevState) => ({
            ...prevState,
            category: options
        }));
    }

    // Only rendered when document is in editing mode
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
                        <label htmlFor="category">Category</label>
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
                        <label htmlFor="refNo">Ref. No.</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="refNo" value={equipmentData.refNo} />
                    </Col>
                    {/* Location */}
                    <Col className="c-Input c-Input__Serial-no c-Input--edit">
                        <label htmlFor="location">Location</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="location" value={equipmentData.location} />
                    </Col>
                </Row>

                {/* Row 2 */}
                <Row className="l-Manage-equipment__Inputs--row2 l-Manage-equipment__Inputs--row">
                    {/* Reg. No. */}
                    <Col className="c-Input c-Input__Reg-no c-Input--edit">
                        <label htmlFor="regNo">Reg. No.</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="regNo" value={equipmentData.regNo} />
                    </Col>
                    {/* Model/Brand */}
                    <Col className="c-Input c-Input__Model-brand c-Input--edit">
                        <label htmlFor="model">Model/Brand</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="model" value={equipmentData.model} />
                    </Col>
                    {/* Serial No. */}
                    <Col className="c-Input c-Input__Serial-no c-Input--edit">
                        <label htmlFor="serialNo">Serial No.</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="serialNo" value={equipmentData.serialNo} />
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
                    {/* Name */}
                    <Col className="c-Input c-Input__Name c-Input--read-only">
                        <label htmlFor="name">Name</label>
                        <input readOnly type="text" name="name" value={equipmentData.name} />
                    </Col>
                    {/* Category */}
                    <Col className="c-Input c-Input__Category c-Input--read-only">
                        <label htmlFor="category">Category</label>
                        <input readOnly type="text" name="category" value={(() => {
                            let catStr = "";
                            equipmentData.category.forEach((data) => {
                                catStr += data + ", "
                            });

                            return catStr.slice(0, -2);;
                        })()} />
                    </Col>
                    {/* Ref. No. */}
                    <Col className="c-Input c-Input__Ref-no c-Input--read-only">
                        <label htmlFor="refNo">Ref. No.</label>
                        <input readOnly type="text" name="refNo" value={equipmentData.refNo} />
                    </Col>
                    {/* Location */}
                    <Col className="c-Input c-Input__Serial-no c-Input--read-only">
                        <label htmlFor="location">Location</label>
                        <input readOnly type="text" name="location" value={equipmentData.location} />
                    </Col>
                </Row>

                {/* Row 2 */}
                <Row className="l-Manage-equipment__Inputs--row2 l-Manage-equipment__Inputs--row">
                    {/* Reg. No. */}
                    <Col className="c-Input c-Input__Reg-no c-Input--read-only">
                        <label htmlFor="regNo">Reg. No.</label>
                        <input readOnly type="text" name="regNo" value={equipmentData.regNo} />
                    </Col>
                    {/* Model/Brand */}
                    <Col className="c-Input c-Input__Model-brand c-Input--read-only">
                        <label htmlFor="model">Model/Brand</label>
                        <input readOnly type="text" name="model" value={equipmentData.model} />
                    </Col>
                    {/* Serial No. */}
                    <Col className="c-Input c-Input__Serial-no c-Input--read-only">
                        <label htmlFor="serialNo">Serial No.</label>
                        <input readOnly type="text" name="serialNo" value={equipmentData.serialNo} />
                    </Col>
                </Row>
            </Container>
        )
    }

    // Archived deleteable table placed here because 'action_delete' requires setArchivedDocData


    // Handler for archiving equipment 
    const handleEquipmentArchive = (actionType) => {
        let accountStatusType;
        if (actionType === "activated") {
            accountStatusType = "active";
            // Confirmation dialogue for activating this account
            const message = `Are you sure you want to activate this account?`;
            const handler = (onClose) => handleActivateAccount(onClose);
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
        } else {
            accountStatusType = "deactivated";
            // Confirmation dialogue for deactivating this account
            const message = `Are you sure you want to deactivate this account?`;
            const handler = (onClose) => handleDeactivateAccount(onClose);
            const heading = `Confirm Dectivate?`;
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

        const handleActivateAccount = (onClose) => {
            axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment/${equipmentID}/activate`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    console.log(res);
                    setRerender((prevState) => !prevState);
                    onClose();
                    setEquipmentData({
                        ...equipmentData,
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

        const handleDeactivateAccount = (onClose) => {
            axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment/${equipmentID}/archive`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    console.log(res);
                    setRerender((prevState) => !prevState);
                    onClose();
                    setEquipmentData({
                        ...equipmentData,
                        archivedAt: "refresh",
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
                <div className="c-Manage-equipment-maintenance c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Equipment-maintenance__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/equipment-maintenance">Equipment Maintenance Program</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Equipment</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-equipment__Top c-Main__Top">
                        <h1>Manage Equipment</h1>
                        {/* Edit button section */}
                        {
                            isEditing || renderErrorCard.render ?
                                null :
                                <button
                                    onClick={() => (handleBtn("edit"))}
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
                        {
                            equipmentData.archivedAt === null ?
                                <>
                                    <div className='c-Danger-zone__Item'>
                                        <button type="button" className="c-Btn c-Btn--alert-border" onClick={() => handleEquipmentArchive("deactivated")}>Archive Equipment</button>
                                        <div className="c-Row__Info">
                                            <p>The equipment will be moved to archives.</p>
                                        </div>
                                    </div>
                                </> :
                                <>
                                    <div className='c-Danger-zone__Item'>
                                        <button type="button" className="c-Btn c-Btn--primary-border" onClick={() => handleEquipmentArchive("activated")}>Unarchive Equipment</button>
                                        <div className="c-Row__Info">
                                            <p>The equipment will be restored from archives.</p>
                                        </div>
                                    </div>
                                </>
                        }
                    </div>

                    {/* Maintenance Cycles */}
                    <div className="c-Manage-equipment-maintenance__Cycles-top c-Main__Top">
                        <h1>Maintenance Cycles</h1>
                        {/* Add button section */}
                        <button
                            onClick={() => handleBtn('add')}
                            type="button"
                            className={"c-Btn c-Btn--primary"}
                        >
                            Add
                        </button>
                    </div>

                    {/* Maintenance Cycles Table section */}
                    <div className="c-Manage-equipment-maintenance__Cycles-table c-Main__Cycles-table">
                        {
                            maintenanceCyclesData.length !== 0 ?
                                <BootstrapTable
                                    bordered={false}
                                    keyField='serialNo'
                                    data={maintenanceCyclesData}
                                    columns={maintenanceCycleColumns}
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

export default ManageEquipmentMaintenance;