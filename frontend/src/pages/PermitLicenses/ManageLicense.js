import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { confirmAlert } from 'react-confirm-alert';
import { useHistory } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import CustomConfirmAlert from '../../common/CustomConfirmAlert';
import ErrorCard from '../../common/ErrorCard';
import StatusPill from '../../common/StatusPill';
import config from '../../config/config';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager';
import DateTimePicker from 'react-datetime-picker';
import Select from "react-select";
import * as RiIcons from 'react-icons/ri';
import { IconContext } from 'react-icons';

const ManageLicense = ({ match }) => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;
    const toastTiming = config.toastTiming;
    const [rerender, setRerender] = useState(false); // value of state doesnt matter, only using it to force useffect to execute
    const history = useHistory();
    const fileRef = useRef(null);
    const licenseID = match.params.licenseID;

    // State declarations
    const [userList, setUserList] = useState([]);
    const options = [
        { label: 'Swedish', value: 'Swedish' },
        { label: 'English', value: 'English' },
        { label: 'English', value: 'English' },
        { label: 'English', value: 'English' },
        { label: 'English', value: 'English' },
    ];
    const [loading, setLoading] = useState(false);
    const [inputTouched, setInputTouched] = useState(false);
    const [editData, setEditData] = useState({
        users: ''
    });
    const [allUsernameData, setallUsernameData] = useState({
        username: []
    });
    const [licenseData, setLicenseData] = useState({
        license: 'Error',
        licenseNo: 'Error',
        expDate: 'NA',
        responsibleExternalAgency: 'Error',
        responsibleUser: [],
        archived_at: null
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
    const [licenseFile, setLicenseFile] = useState(null);

    useEffect(() => {
        // Set equipment maintenance cycle data
        (async () => {
            try {
                let tempLicenseData = [];
                let tempPersonsData = [];

                const resClausePermission = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m07_02/employees`);
                console.log(resClausePermission);
                tempPersonsData = resClausePermission.data.results;
                console.log(tempPersonsData);

                const resOneLicense = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/licence-registry/all-licences/${licenseID}`);
                console.log(resOneLicense);
                tempLicenseData = resOneLicense.data.results;
                console.log(tempLicenseData);

                setLicenseData(() => {
                    return {
                        id: tempLicenseData.licence_id,
                        license: tempLicenseData.licence_name,
                        licenseNo: tempLicenseData.licence_number,
                        expDate: tempLicenseData.expires_at,
                        responsibleExternalAgency: tempLicenseData.external_organisation,
                        archived_at: tempLicenseData.archived_at,
                        responsibleUser: (() => {
                            // eslint-disable-next-line array-callback-return
                            return tempLicenseData.assignees.map((personData) => {
                                return {
                                    value: personData.employee_id,
                                    label: personData.account.username,
                                }
                            });
                        })(),
                        status: (() => {
                            let placeholder = '';
                            if (placeholder === undefined) {
                                return <p>Nil</p>
                            }
                            return <StatusPill type="active" />
                        })(),
                    }
                });

                setUserList(() => {
                    return tempPersonsData.map((data) => ({
                        label: data.account.username,
                        value: data.employee_id
                    }));
                });
            } catch (error) {
                console.log(error);
            }
        })();
    }, [licenseData.archivedAt]);

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
            axios.delete(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/all-equipment/${licenseID}/all-maintenance/${maintenanceID}`, {}, {
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
        if (buttonType === "upload") {
            // Handler for upload button
            fileRef.current.click();
        }

        if (buttonType === "edit") {
            // Handler for edit button
            setIsEditing(true);
        }

        if (buttonType === "editEquipmentCancel") {
            // Handler for cancel button
            setIsEditing(false);
        }

        if (buttonType === "editEquipmentSave") {
            // Handler for save button
            (async () => {
                try {
                    console.log(licenseData);
                    const resUpdateLicense = await axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/licence-registry/all-licences/${licenseID}`,
                        licenseData, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    console.log(resUpdateLicense);
                    toast.success(<>Success!<br />Message: <b>Updated License details!</b></>);
                    setIsEditing(false);
                } catch (error) {
                    console.log(error);
                }
            })();
        }
    }

    // Handler for input 
    const handleInputChange = (event) => {
        setLicenseData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }

    // For file input

    const handleFileInputChange = (event) => {
        const fileObj = event.target.files[0];
        console.log(fileObj);
        setLicenseFile(() => fileObj);
    };

    const handleDeleteFile = () => {
        setLicenseFile(() => null);
    };

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

    // Handler for setting last service date 
    const setExpDate = (date) => {
        console.log(date);
        setLicenseData((prevState) => ({
            ...prevState,
            expDate: date
        }));
    }

    // Handler for input array
    const handleInputArrayChange = (options) => {
        console.log(options);
        setLicenseData((prevState) => ({
            ...prevState,
            assignees: options
        }));
    }

    // Only rendered when document is in editing mode
    const renderInputFieldEditSection = () => {
        return (
            <Container className="l-Manage-equipment__Inputs">
                {/* Row 1 */}
                <Row className="l-Manage-equipment__Inputs--row1 l-Manage-equipment__Inputs--row">
                    {/* License/Permit/Certificate */}
                    <Col className="c-Input c-Input__Name c-Input c-Input--edit">
                        <label htmlFor="license">License/Permit/Certificate</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="license" value={licenseData.license} />
                    </Col>
                    {/* License No. */}
                    <Col className="c-Input c-Input__Category c-Input c-Input--edit">
                        <label htmlFor="licenseNo">License No.</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="licenseNo" value={licenseData.licenseNo} />
                    </Col>
                    {/* Exp. Date */}
                    <Col className="c-Input c-Input__Ref-no c-Input--edit">
                        <label htmlFor="expDate">Exp. Date</label>
                        <DateTimePicker
                            onChange={setExpDate}
                            value={licenseData.expDate}
                            className="c-Form__Date"
                            format="dd/MM/y"
                        />
                    </Col>
                </Row>

                {/* Row 2 */}
                <Row className="l-Manage-equipment__Inputs--row2 l-Manage-equipment__Inputs--row">
                    {/* Responsible External Agency */}
                    <Col className="c-Input c-Input__Reg-no c-Input--edit">
                        <label htmlFor="responsibleExternalAgency">Responsible External Agency</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="responsibleExternalAgency" value={licenseData.responsibleExternalAgency} />
                    </Col>
                    {/* Responsible User */}
                    <Col className="c-Input c-Input__Model-brand c-Input--edit">
                        <label htmlFor="responsibleUser">Responsible User</label>
                        <Select
                            isMulti
                            options={userList}
                            placeholder="Select Users"
                            onChange={handleInputArrayChange}
                        />
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
                    {/* License/Permit/Certificate */}
                    <Col className="c-Input c-Input__Name c-Input--read-only">
                        <label htmlFor="license">License/Permit/Certificate</label>
                        <input readOnly type="text" name="license" value={licenseData.license} />
                    </Col>
                    {/* License No. */}
                    <Col className="c-Input c-Input__Category c-Input--read-only">
                        <label htmlFor="licenseNo">License No.</label>
                        <input readOnly type="text" name="licenseNo" value={licenseData.licenseNo} />
                    </Col>
                    {/* Exp. Date */}
                    <Col className="c-Input c-Input__Ref-no c-Input--read-only">
                        <label htmlFor="expDate">Exp. Date</label>
                        <input readOnly type="text" name="expDate" value={licenseData.expDate} />
                    </Col>
                </Row>

                {/* Row 2 */}
                <Row className="l-Manage-equipment__Inputs--row2 l-Manage-equipment__Inputs--row">
                    {/* Responsible External Agency */}
                    <Col className="c-Input c-Input__Reg-no c-Input--read-only">
                        <label htmlFor="responsibleExternalAgency">Responsible External Agency</label>
                        <input readOnly type="text" name="responsibleExternalAgency" value={licenseData.responsibleExternalAgency} />
                    </Col>
                    {/* Responsible User */}
                    <Col className="c-Input c-Input__Model-brand c-Input--read-only">
                        <label htmlFor="responsibleUser">Responsible User</label>
                        <input readOnly type="text" name="responsibleUser" value={(() => {
                            let personStr = "";
                            licenseData.responsibleUser?.forEach((data) => {
                                personStr += data.label + ", "
                            });
                            return personStr.slice(0, -2);;
                        })()} />
                    </Col>
                    {/* Status */}
                    <Col className="c-Input c-Input__Model-brand c-Input--read-only">
                        <label htmlFor="status">Status</label>
                        {
                            licenseData.status
                        }
                    </Col>
                </Row>
            </Container>
        )
    }

    // Archived deleteable table placed here because 'action_delete' requires setArchivedDocData


    // Handler for archiving equipment 
    const handleLicenseArchive = (actionType) => {
        if (actionType === "activated") {
            // Confirmation dialogue for activating this account
            const message = `Are you sure you want to activate this license?`;
            const handler = (onClose) => handleActivateLicense(onClose);
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
            // Confirmation dialogue for deactivating this account
            const message = `Are you sure you want to deactivate this license?`;
            const handler = (onClose) => handleDeactivateLicense(onClose);
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

        const handleActivateLicense = (onClose) => {
            axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/licence-registry/all-licences/${licenseID}/activate`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    console.log(res);
                    setRerender((prevState) => !prevState);
                    onClose();
                    setLicenseData({
                        ...licenseData,
                        archivedAt: null,
                    })
                    toast.success(<>Success!<br />Message: <b>License has been reactivated!</b></>);
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

        const handleDeactivateLicense = (onClose) => {
            axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/licence-registry/all-licences/${licenseID}/archive`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    console.log(res);
                    setRerender((prevState) => !prevState);
                    onClose();
                    setLicenseData({
                        ...licenseData,
                        archivedAt: "refresh",
                    })
                    toast.success(<>Success!<br />Message: <b>License has been archived!</b></>);
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
                        <Breadcrumb.Item href="/licenses">Register of Permits, Licenses, Approvals & Certificates</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Permits/Licenses/Certificates</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-equipment__Top c-Main__Top">
                        <h1>Manage Permits/Licenses/Certificates</h1>
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
                    {/* File Upload */}
                        {/* Upload Button */}
                        <div className="c-Manage-equipment__Mid c-Main__Top c-File-upload">
                            <div className="c-Manage-equipment__File">
                                {
                                    licenseFile ?
                                        <>
                                            <p>{licenseFile.name}</p>
                                            <IconContext.Provider value={{ color: "#DC3545", size: "21px" }}>
                                                <RiIcons.RiDeleteBin7Line className="c-File-upload__Bin" onClick={() => handleDeleteFile()} />
                                            </IconContext.Provider>
                                        </>
                                        : <p>No File Detected.</p>
                                }
                            </div>
                            <button
                                onClick={() => (handleBtn("upload"))}
                                type="button"
                                className={"c-Btn c-Btn--primary"}
                            >
                                Upload
                            </button>
                            <input className="c-Manage-equipment__File-input c-File-select__Raw" type="file" ref={fileRef} onChange={handleFileInputChange} />
                        </div>

                    {/* Danger Zone */}
                    <h2 className="c-Danger-zone__Title">Danger Zone</h2>
                    <div className="c-Danger-zone__Row">
                        {
                            licenseData.archived_at === null ?
                                <>
                                    <div className='c-Danger-zone__Item'>
                                        <button type="button" className="c-Btn c-Btn--alert-border" onClick={() => handleLicenseArchive("deactivated")}>Archive Permits/Licenses/Certificates</button>
                                        <div className="c-Row__Info">
                                            <p>Perfoming this action will archive this permit/license/certificate</p>
                                        </div>
                                    </div>
                                </> :
                                <>
                                    <div className='c-Danger-zone__Item'>
                                        <button type="button" className="c-Btn c-Btn--primary-border" onClick={() => handleLicenseArchive("activated")}>Unarchive Permits/Licenses/Certificates</button>
                                        <div className="c-Row__Info">
                                            <p>Perfoming this action will unarchive this permit/license/certificate </p>
                                        </div>
                                    </div>
                                </>
                        }
                    </div>
                </div>
            </PageLayout>
        </>
    )
}

export default ManageLicense;