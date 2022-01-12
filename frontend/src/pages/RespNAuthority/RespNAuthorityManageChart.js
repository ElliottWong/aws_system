import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { getSideNavStatus } from '../../utilities/sideNavUtils';
import { getToken, getUserCompanyID } from '../../utilities/localStorageUtils';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import { useHistory } from "react-router-dom";
import axios from 'axios';
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify';
import config from '../../config/config';
import FileDownload from 'js-file-download';
import jwt_decode from 'jwt-decode';
import TokenManager from '../../utilities/tokenManager';

const RespNAuthorityManageChart = ({ match }) => {
    const orgChartID = match.params.orgChartID;
    const history = useHistory();
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;
    const toastTiming = config.toastTiming;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [orgChartData, setOrgChartData] = useState({
        title: "",
        description: "",
        createdBy: "",
        submittedOn: "",
        fileName: ""
    });
    const [editableOrgChartData, setEditableOrgChartData] = useState({
        title: "",
        description: "",
        createdBy: "",
        submittedOn: "",
        fileName: ""
    })
    const [editMode, setEditMode] = useState(false);
    const [rerender, setRerender] = useState(false);
    const [isUploader, setIsUploader] = useState(false);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/org-chart/${orgChartID}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
            .then((res) => {
                console.log(res);
                setOrgChartData(() => ({
                    title: res.data.results.title,
                    description: res.data.results.description,
                    createdBy: res.data.results.author.account.username,
                    submittedOn: dayjs(new Date(res.data.results.created_at)).format("MMMM D, YYYY h:mm A"),
                    fileName: res.data.results.file.file_name,
                    fileID: res.data.results.file_id
                }));
                setEditableOrgChartData(() => ({
                    title: res.data.results.title,
                    description: res.data.results.description,
                    createdBy: res.data.results.author.account.username,
                    submittedOn: dayjs(new Date(res.data.results.created_at)).format("MMMM D, YYYY h:mm A"),
                    fileName: res.data.results.file.file_name
                }))
            })
            .catch((err) => {
                console.log(err);
            });

        // Check if user can edit chart
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m05_03/employees`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                let canEdit = false;
                res.data.results.forEach((data, index) => {
                    if (data.employee_id === userID) {
                        canEdit = true;
                    }
                });
                if (canEdit === true) {
                    setIsUploader(() => (true));
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, [rerender]);

    // Handle submit and cancel buttons
    const handleBtn = (btnType) => {
        if (btnType === "submit") {

            if (editableOrgChartData.title === "" || editableOrgChartData.description === "") {
                toast.error(<>Error! Some fields are empty!</>);
                return;
            }

            const axiosSubmitData = {
                title: editableOrgChartData.title,
                description: editableOrgChartData.description,
                display_order: 1
            };

            axios.put(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/org-chart/${orgChartID}`, axiosSubmitData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
                .then((res) => {
                    console.log(res);
                    toast.success(<>Success!<br />Message: <b>Organisation chart details successfully updated!</b></>);
                    setEditMode(() => false);
                    setRerender((prevState) => !prevState);
                })
                .catch((err) => {
                    console.log(err);
                    let errCode = "Error!";
                    let errMsg = "Error!"
                    if (err.response !== undefined) {
                        errCode = err.response.status;
                        errMsg = err.response.data.message;
                    }

                    toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                });
        } else if (btnType === "delete") {
            axios.delete(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/org-chart/${orgChartID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
                .then((res) => {
                    console.log(res);
                    setTimeout(() => {
                        toast.success(<>Success!<br />Message: <b>Organisation chart has been deleted!</b></>);
                    }, 0);
                    setEditMode(() => false);
                    history.push("/responsibility-n-authority");
                })
                .catch((err) => {
                    console.log(err);
                    let errCode = "Error!";
                    let errMsg = "Error!"
                    if (err.response !== undefined) {
                        errCode = err.response.status;
                        errMsg = err.response.data.message;
                    }

                    toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                });
        } else if (btnType === "edit") {
            setEditMode(() => true);
        } else {
            // Reset the data
            setEditableOrgChartData(() => (orgChartData));
            setEditMode(() => false);
        }
    };

    // Handle input change 
    const handleInputChange = (event) => {
        setEditableOrgChartData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    };

    // Handle file download
    const handleFileDownload = (fileID, fileName) => {
        axios.get(`${process.env.REACT_APP_BASEURL}/file/download/${fileID}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            responseType: 'blob'
        })
            .then((res) => {
                FileDownload(res.data, fileName);
                toast.success(<>Success!<br />Message: <b>Document has been downloaded successfully!</b></>);
            })
            .catch((err) => {
                console.log(err);
                let errCode = "Error!";
                let errMsg = "Error!"
                if (err.response !== undefined) {
                    errCode = err.response.status;
                    errMsg = err.response.data.message;
                }

                toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
            });
    };

    const renderEditMode = () => {
        return (
            <>
                <div className="c-Manage-chart__Inputs">
                    <div className="c-Manage-chart__Title c-Input">
                        <label htmlFor="title">Title</label>
                        <textarea onChange={handleInputChange} type="text" value={editableOrgChartData.title || ""} name="title" placeholder="Enter title"></textarea>
                    </div>
                    <div className="c-Manage-chart__Description c-Input">
                        <label htmlFor="description">Description</label>
                        <textarea onChange={handleInputChange} type="text" value={editableOrgChartData.description || ""} name="description" placeholder="Enter description"></textarea>
                    </div>
                    <div className="c-Manage-chart__Created-by c-Input">
                        <label htmlFor="createdBy">Created By</label>
                        <input type="text" value={orgChartData.createdBy || "Error"} name="createdBy" disabled />
                    </div>
                    <div className="c-Manage-chart__Submitted-on c-Input">
                        <label htmlFor="submittedOn">Submitted On</label>
                        <input type="text" value={orgChartData.submittedOn || "Error"} name="submittedOn" disabled />
                    </div>
                    <div className="c-Manage-chart__Details c-Input">
                        <label htmlFor="details">Details</label>
                        {
                            orgChartData.fileName === "" ?
                            "Failed to load data" :
                            <button onClick={() => handleFileDownload(orgChartID, orgChartData.fileName)} className="c-Btn c-Btn--link">Download</button>
                        }
                    </div>
                </div>
            </>
        )

    }

    const renderViewMode = () => {
        return (
            <>
                <div className="c-Manage-chart__Inputs">
                    <div className="c-Manage-chart__Title c-Input">
                        <h1>Title</h1>
                        <p>{orgChartData.title || "Failed to load data"}</p>
                    </div>
                    <div className="c-Manage-chart__Description c-Input">
                        <h1>Description</h1>
                        <p>{orgChartData.description || "Failed to load data"}</p>
                    </div>
                    <div className="c-Manage-chart__Created-by c-Input">
                        <h1>Created By</h1>
                        <p>{orgChartData.createdBy || "Failed to load data"}</p>
                    </div>
                    <div className="c-Manage-chart__Submitted-on c-Input">
                        <h1>Submitted On</h1>
                        <p>{orgChartData.submittedOn || "Failed to load data"}</p>
                    </div>
                    <div className="c-Manage-chart__Details c-Input">
                        <h1>Details</h1>
                        {
                            orgChartData.fileName === "" ?
                            "Failed to load data" :
                            <button onClick={() => handleFileDownload(orgChartID, orgChartData.fileName)} className="c-Btn c-Btn--link">Download</button>
                        }
                    </div>
                </div>
            </>
        )
    }

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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title="Upload Chart" activeLink="/responsibility-n-authority">
                <div className="c-Manage-chart c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Manage-chart__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/responsibility-n-authority">Resp. & Authority</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Organisation Chart</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Top section */}
                    <div className="c-Manage-chart__Top c-Main__Top">
                        <h1>Manage Organisation Chart</h1>
                    </div>
                    {/* Input */}
                    {
                        editMode ?
                            renderEditMode() :
                            renderViewMode()
                    }
                    {/* Buttons section */}
                    {
                        isUploader ?
                        orgChartData.title === "" ?
                            null :
                            editMode ?
                                <div className="c-Manage-chart__Btns">
                                    <button type="button" className="c-Btn c-Btn--primary" onClick={() => handleBtn("submit")}>Submit</button>
                                    <button type="button" className="c-Btn c-Btn--cancel" onClick={() => handleBtn("cancel")}>Cancel</button>
                                </div>
                                :
                                <div className="c-Manage-chart__Btns">
                                    <button type="button" className="c-Btn c-Btn--primary" onClick={() => handleBtn("edit")}>Edit</button>
                                    <button type="button" className="c-Btn c-Btn--alert" onClick={() => handleBtn("delete")}>Delete</button>
                                </div>
                            :
                        null
                    }

                </div>

            </PageLayout>
        </>
    )
}

export default RespNAuthorityManageChart;