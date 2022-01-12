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
import useDocAxios from '../../hooks/useDocAxios';
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


const ManageEquipmentMaintainance = ({match}) => {
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
    const [maintainanceCyclesData, setMaintainanceCyclesData] = useState([]);
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
        category: 'Error',
        refNo: 'Error',
        regNo: 'Error',
        modelBrand: 'Error',
        serialNo: 'Error',
        // lastServiceDate: new Date(),
        // maintainanceFrequency: {
        //     magnitude: 'Error',
        //     unit: 'Error'
        // },
        // responsible: [],
        // status: 'Error',
        // maintenanceType: 'Error',
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
    const [queryUrl, setQueryUrl] = useState({
        firstUrl: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintainance`,
    });
    const [axiosResponse, axiosError] = useDocAxios(queryUrl);
    const [archivedDocData, setArchivedDocData] = useState([]);
    const [queryCheckEditableAxiosUrl, setQueryCheckEditableAxiosUrl] = useState({
        firstUrl: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m07_01/employees`,
    })

    const [checkEditableAxiosResponse, checkEditableAxiosError] = useCheckEditableAxios(queryCheckEditableAxiosUrl);
    
    const equipmentID = match.params.emID;

    useEffect(() => {
        // Set equipment maintainance cycle data
        (async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintenance-program/equipment/all/${equipmentID}`);
                const employeesData = res.data.results;
                console.log(res);
                console.log(employeesData);
                // setAllRecipients(() => employeesData.map((data, index) => ({
                //     label: `@${data.account.username}`,
                //     value: data.account.username
                // })));
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
        //                 modelBrand:
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
        //         modelBrand:
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

        // Check if user can edit Equipment Maintainance Program attributes - add new equipment, configurations, etc
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
    }, [axiosResponse, checkEditableAxiosResponse, rerender]);

    const handleBtn = (buttonType) => {
        if (buttonType === "editEquipment" || buttonType === "editEquipmentCancel") {
            // Handler for edit button
            setIsEditing((prevState) => (!prevState));
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
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="category" value={equipmentData.category} />
                    </Col>
                    {/* Ref. No. */}
                    <Col className="c-Input c-Input__Ref-no c-Input--edit">
                        <label htmlFor="refNo">Ref. No.</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="refNo" value={equipmentData.refNo} />
                    </Col>
                    {/* Reg. No. */}
                    <Col className="c-Input c-Input__Reg-no c-Input--edit">
                        <label htmlFor="regNo">Reg. No.</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="regNo" value={equipmentData.regNo} />
                    </Col>
                    {/* Model/Brand */}
                    <Col className="c-Input c-Input__Model-brand c-Input--edit">
                        <label htmlFor="modelBrand">Model/Brand</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="modelBrand" value={equipmentData.modelBrand} />
                    </Col>
                </Row>

                {/* Row 2 */}
                <Row className="l-Manage-equipment__Inputs--row2 l-Manage-equipment__Inputs--row">
                    {/* Serial No. */}
                    <Col className="c-Input c-Input__Serial-no c-Input--edit">
                        <label htmlFor="serialNo">Serial No.</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="serialNo" value={equipmentData.serialNo} />
                    </Col>
                    {/* Filler */}
                    <Col className='c-Input'>
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
                        <input readOnly type="text" name="category" value={equipmentData.category} />
                    </Col>
                    {/* Ref. No. */}
                    <Col className="c-Input c-Input__Ref-no c-Input--read-only">
                        <label htmlFor="refNo">Ref. No.</label>
                        <input readOnly type="text" name="refNo" value={equipmentData.refNo} />
                    </Col>
                    {/* Reg. No. */}
                    <Col className="c-Input c-Input__Reg-no c-Input--read-only">
                        <label htmlFor="regNo">Reg. No.</label>
                        <input readOnly type="text" name="regNo" value={equipmentData.regNo} />
                    </Col>
                    {/* Model/Brand */}
                    <Col className="c-Input c-Input__Model-brand c-Input--read-only">
                        <label htmlFor="modelBrand">Model/Brand</label>
                        <input readOnly type="text" name="modelBrand" value={equipmentData.modelBrand} />
                    </Col>
                </Row>

                {/* Row 2 */}
                <Row className="l-Manage-equipment__Inputs--row2 l-Manage-equipment__Inputs--row">
                    {/* Serial No. */}
                    <Col className="c-Input c-Input__Serial-no c-Input--read-only">
                        <label htmlFor="serialNo">Serial No.</label>
                        <input readOnly type="text" name="serialNo" value={equipmentData.serialNo} />
                    </Col>
                    {/* Filler */}
                    <Col className='c-Input'>
                    </Col>
                </Row>
            </Container>
        )
    }

    // Archived deleteable table placed here because 'action_delete' requires setArchivedDocData
    const maintainanceCycleColumns = [
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
            dataField: 'maintainanceType',
            text: 'Maintainance Type'
        },
        {
            dataField: 'responsible',
            text: 'Responsible'
        },
        {
            dataField: 'maintainanceFrequency',
            text: 'Maintainance Frequency'
        },
        {
            dataField: 'lastServiceDate',
            text: 'Last Service Date'
        },
        {
            dataField: 'status',
            text: 'Status',
            formatter: (cell, row) => {
                if (cell) {
                    return <StatusPill type={cell} />
                } else {
                    return "Error"
                }
            }
        },
        {
            dataField: 'action_manage',
            text: 'Manage',
            headerAttrs: {
                hidden: true
            },
            formatter: (cell, row) => {
                if (cell) {
                    return <NavLink to={cell} >Manage</NavLink>
                } else {
                    return "N.a."
                }
            }
        },
        {
            dataField: 'action_delete',
            text: '',
            formatter: (cell, row) => {
                console.log(cell);
                return (
                    <ManageDeleteArchivedDoc
                        deleteUrl={cell}
                        docHeaderUrl={`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/equipment-maintainance`}
                        setArchivedDocData={setArchivedDocData}
                        docType="equipment-maintainance"
                        idName="equipment_maintainance_id"
                    />
                )
            }
        },
    ];

    // Handler for archiving equipment 
    const handleEquipmentArchive = (actionType) => {
        // let accountStatusType;
        // if (actionType === "activated") {
        //     accountStatusType = "active";
        //     // Confirmation dialogue for activating this account
        //     const message = `Are you sure you want to activate this account?`;
        //     const handler = (onClose) => handleActivateAccount(onClose);
        //     const heading = `Confirm Activate?`;
        //     const type = "primary"
        //     const data = {
        //         message,
        //         handler,
        //         heading,
        //         type
        //     };
        //     confirmAlert({
        //         customUI: ({ onClose }) => {
        //             return <CustomConfirmAlert {...data} onClose={onClose} />;
        //         }
        //     });
        // } else {
        //     accountStatusType = "deactivated";
        //     // Confirmation dialogue for deactivating this account
        //     const message = `Are you sure you want to deactivate this account?`;
        //     const handler = (onClose) => handleActivateAccount(onClose);
        //     const heading = `Confirm Dectivate?`;
        //     const type = "alert"
        //     const data = {
        //         message,
        //         handler,
        //         heading,
        //         type
        //     };
        //     confirmAlert({
        //         customUI: ({ onClose }) => {
        //             return <CustomConfirmAlert {...data} onClose={onClose} />;
        //         }
        //     });
        // }

        // const handleActivateAccount = (onClose) => {
        //     axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employees/${employeeID}`, {
        //         account_status: accountStatusType
        //     }, {
        //         headers: {
        //             'Authorization': `Bearer ${token}`
        //         }
        //     })
        //         .then((res) => {
        //             console.log(res);
        //             setRerender((prevState) => !prevState);
        //             onClose();
        //             toast.success(<>Success!<br />Message: <b>User has been {actionType}!</b></>);
        //         })
        //         .catch((err) => {
        //             console.log(err);
        //             console.log(err.response);
        //             let errCode = "Error!";
        //             let errMsg = "Error!"
        //             if (err.response !== undefined) {
        //                 errCode = err.response.status;
        //                 errMsg = err.response.data.message;
        //             }
        //             onClose();
        //             toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
        //         });
        // }
    };

    const maintainanceCyclesDataPlaceholder = [
        {
            id: 1,
            serialNo: 1,
            maintainanceType: "Preventive",
            responsible: "HengHeng",
            maintainanceFrequency: "1 Month",
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
            maintainanceType: "Corrective",
            responsible: "HengHeng",
            maintainanceFrequency: "1 Month",
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Equipment Maintainance' activeLink="/equipment-maintainance">
                <div className="c-Manage-equipment-maintainance c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Equipment-maintainance__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/equipment-maintainance">Equipment Maintainance Program</Breadcrumb.Item>
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
                        {
                            equipmentData.status === "active" ?
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
                    <div className="c-Manage-equipment-maintainance__Cycles-top c-Main__Top">
                        <h1>Maintainance Cycles</h1>
                        {/* Edit button section */}
                        <button
                            onClick={() => handleBtn()}
                            type="button"
                            className={"c-Btn c-Btn--primary"}
                        >
                            Add
                        </button>
                    </div>

                    {/* Maintenance Cycles Table section */}
                    <div className="c-Manage-equipment-maintainance__Cycles-table c-Main__Cycles-table">
                        {
                            maintainanceCyclesDataPlaceholder.length !== 0 ?
                                <BootstrapTable
                                    bordered={false}
                                    keyField='serialNo'
                                    data={maintainanceCyclesDataPlaceholder}
                                    columns={maintainanceCycleColumns}
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

export default ManageEquipmentMaintainance;