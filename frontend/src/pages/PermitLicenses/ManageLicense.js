import axios from 'axios';
import dayjs from 'dayjs';
import FileDownload from 'js-file-download';
import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { confirmAlert } from 'react-confirm-alert';
import DateTimePicker from 'react-datetime-picker';
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

const ManageLicense = ({ match }) => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const toastTiming = config.toastTiming;
    const [rerender, setRerender] = useState(false); // value of state doesnt matter, only using it to force useffect to execute
    const history = useHistory();
    const licenseID = match.params.licenseID;
    const userID = decodedToken.employee_id;

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
    const [canApprove, setCanApprove] = useState(false);
    const [canEdit, setCanEdit] = useState(false);

    useEffect(() => {
        // Set equipment maintenance cycle data
        (async () => {
            try {
                let tempLicenseData = [];
                let tempPersonsData = [];

                // Can approve people can create new license
                const resClausePermission = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m07_02/employees`);
                // Can edit people can upload new license
                const resClausePermissionEdit = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m07_02/employees`);
                console.log(resClausePermissionEdit);
                tempPersonsData = resClausePermissionEdit.data.results;
                console.log(tempPersonsData);
                // Check if user can create new license
                resClausePermission.data.results.forEach((data, index) => {
                    if (data.employee_id === userID) {
                        setCanApprove(true);
                    }
                });
                // Check if user is assigned to a license
                resClausePermissionEdit.data.results.forEach((data, index) => {
                    if (data.employee_id === userID) {
                        setCanEdit(true);
                    }
                });

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
                        issuedOn: new Date(tempLicenseData.issued_at),
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
                            if (tempLicenseData.days_left <= 0 && tempLicenseData.expires_at) {
                                return <StatusPill type="expired" />
                            } else if (tempLicenseData.days_left / (Math.ceil(Math.abs(new Date(tempLicenseData.expires_at) - new Date(tempLicenseData.issued_at)) / (1000 * 60 * 60 * 24))) < 1 / 5 && tempLicenseData.expires_at) {
                                return <StatusPill type="almostDue" />
                            }
                            else {
                                return <StatusPill type="active" />
                            }
                        })(),
                        upload: tempLicenseData.upload,
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
    }, [licenseData.archivedAt, rerender]);

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
            history.push(`${licenseID}/upload`);
        }

        if (buttonType === "edit") {
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
                    console.log(licenseData);
                    const resUpdateLicense = await axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/licence-registry/all-licences/${licenseID}`,
                        {
                            ...licenseData,
                            licence_name: licenseData.license,
                            licence_number: licenseData.licenseNo,
                            expires_at: licenseData.expDate,
                            issued_at: licenseData.issuedOn,
                            external_organisation: licenseData.responsibleExternalAgency,
                            assignees: (() => {
                                return licenseData.responsibleUser.map((data) => {
                                    return data.value;
                                })
                            })()
                        }, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    console.log(resUpdateLicense);
                    toast.success(<>Success!<br />Message: <b>Updated License details!</b></>);
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
        setLicenseData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }

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
    const setIssuedOn = (date) => {
        console.log(date);
        setLicenseData((prevState) => ({
            ...prevState,
            issuedOn: date
        }));
    }

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
            assignees: options,
            responsibleUser: options
        }));
    }

    // Only rendered when document is in editing mode
    const renderInputFieldEditSection = () => {
        return (
            <Container className="l-Manage-equipment__Inputs">
                {/* Row 1 */}
                <Row className="l-Manage-equipment__Inputs--row1 l-Manage-equipment__Inputs--row">
                    {/* License/Permit/Certificate/Approval */}
                    <Col className="c-Input c-Input__Name c-Input c-Input--edit">
                        <label htmlFor="license">License/Permit/Certificate/Approval</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="license" value={licenseData.license} />
                    </Col>
                    {/* License No. */}
                    <Col className="c-Input c-Input__Category c-Input c-Input--edit">
                        <label htmlFor="licenseNo">License No.</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="licenseNo" value={licenseData.licenseNo} />
                    </Col>
                    {/* Issued On */}
                    <Col className="c-Input c-Input__Ref-no c-Input--edit">
                        <label htmlFor="issuedOn">Issued On</label>
                        <DateTimePicker
                            onChange={setIssuedOn}
                            value={licenseData.issuedOn}
                            className="c-Form__Date"
                            format="dd/MM/y"
                            onFocus={() => setInputTouched(true)}
                        />
                    </Col>
                    {/* Exp. Date */}
                    <Col className="c-Input c-Input__Ref-no c-Input--edit">
                        <label htmlFor="expDate">Exp. Date</label>
                        <DateTimePicker
                            onChange={setExpDate}
                            value={new Date(licenseData.expDate)}
                            className="c-Form__Date"
                            format="dd/MM/y"
                            onFocus={() => setInputTouched(true)}
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
                            onFocus={() => setInputTouched(true)}
                            value={(() => {
                                return licenseData.responsibleUser.map((data) => {
                                    return data;
                                })
                            })()}
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
                    {/* License/Permit/Certificate/Approval */}
                    <Col className="c-Input c-Input__Name c-Input--read-only">
                        <label htmlFor="license">License/Permit/Certificate/Approval</label>
                        <input readOnly type="text" name="license" value={licenseData.license} />
                    </Col>
                    {/* License No. */}
                    <Col className="c-Input c-Input__Category c-Input--read-only">
                        <label htmlFor="licenseNo">License No.</label>
                        <input readOnly type="text" name="licenseNo" value={licenseData.licenseNo} />
                    </Col>
                    {/* Issued On */}
                    <Col className="c-Input c-Input__Ref-no c-Input--read-only">
                        <label htmlFor="issuedOn">Issued On</label>
                        <input readOnly type="text" name="issuedOn" value={dayjs(licenseData.issuedOn).format("D MMM YYYY")} />
                    </Col>
                    {/* Exp. Date */}
                    <Col className="c-Input c-Input__Ref-no c-Input--read-only">
                        <label htmlFor="expDate">Exp. Date</label>
                        <input readOnly type="text" name="expDate" value={licenseData.expDate ? dayjs(new Date(licenseData.expDate)).format("D MMM YYYY") : "NA"} />
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

    const handleFileDownload = async () => {
        try {
            const fileRes = await axios.get(`${process.env.REACT_APP_BASEURL}/file/download/${licenseData.upload?.file?.file_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob'
            });
            console.log(fileRes);
            FileDownload(fileRes.data, licenseData.upload?.file?.file_name);
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Equipment Maintenance' activeLink={`/licenses/manage-license/${licenseID}`}>
                <div className="c-Manage-equipment-maintenance c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Equipment-maintenance__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/licenses">Register of Permits, Licenses, Approvals & Certificates</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Permits/Licenses/Certificates</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-equipment__Top c-Main__Top">
                        <h1>Manage Permits/Licenses/Certificates/Approvals</h1>
                        {/* Edit button section */}
                        {
                            canApprove ?
                                isEditing || renderErrorCard.render ?
                                    null :
                                    <button
                                        onClick={() => (handleBtn("edit"))}
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
                    {/* Upload/Update file */}
                    <div className="c-Field">
                        <h2>File</h2>
                        {licenseData.upload ?
                            <div className='c-Field__File c-File'>
                                <h1 onClick={handleFileDownload}>{licenseData.upload?.file?.file_name}</h1>
                            </div>
                            : ""
                        }
                        <button
                            onClick={() => (handleBtn("upload"))}
                            type="button"
                            className={"c-Btn c-Btn--primary"}
                        >
                            {licenseData.upload ? 'Update File' : 'Upload File'}
                        </button>
                    </div>

                    {/* Danger Zone */}
                    {canApprove ?
                        <>
                            <h2 className="c-Danger-zone__Title">Danger Zone</h2>
                            <div className="c-Danger-zone__Row">
                                {
                                    licenseData.archived_at === null ?
                                        <>
                                            <div className='c-Danger-zone__Item'>
                                                <button type="button" className="c-Btn c-Btn--alert-border" onClick={() => handleLicenseArchive("deactivated")}>Archive Permit/License/Certificate/Approval</button>
                                                <div className="c-Row__Info">
                                                    <p>Perfoming this action will archive this permit/license/certificate/approval</p>
                                                </div>
                                            </div>
                                        </> :
                                        <>
                                            <div className='c-Danger-zone__Item'>
                                                <button type="button" className="c-Btn c-Btn--primary-border" onClick={() => handleLicenseArchive("activated")}>Unarchive Permit/License/Certificate/Approval</button>
                                                <div className="c-Row__Info">
                                                    <p>Perfoming this action will unarchive this permit/license/certificate/approval </p>
                                                </div>
                                            </div>
                                        </>
                                }
                            </div>
                        </> : ""
                    }
                </div>
            </PageLayout>
        </>
    )
}

export default ManageLicense;