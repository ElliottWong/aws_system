import React, { useState, useRef } from 'react';
import PageLayout from '../../layout/PageLayout';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { getSideNavStatus } from '../../utilities/sideNavUtils';
import { getToken, getUserCompanyID } from '../../utilities/localStorageUtils';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import { useHistory } from "react-router-dom";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import config from '../../config/config';
import TokenManager from '../../utilities/tokenManager';

const RespNAuthorityAddChart = () => {
    const history = useHistory();
    const fileRef = useRef();
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [orgChartData, setOrgChartData] = useState({
        title: "",
        description: "",
        file: ""
    });
    const toastTiming = config.toastTiming;

    // Handle submit and cancel buttons
    const handleBtn = (btnType) => {
        if (btnType === "submit") {
            if (orgChartData.title === "" || orgChartData.description === "" || orgChartData.file === "") {
                toast.error(<>Error! Some fields are empty!</>);
                return;
            }
            const formData = new FormData();

            formData.append("title", orgChartData.title);
            formData.append("description", orgChartData.description);
            formData.append("display_order", 1);
            formData.append("chart", orgChartData.file);

            axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/org-charts`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            })
                .then((res) => {
                    console.log(res);
                    setTimeout(() => {
                        toast.success(<>Success!<br />Message: <b>Chart has been added!</b></>);
                    }, 0);
                    history.push('/responsibility-n-authority');
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


        } else {
            // Reset the data
            setOrgChartData(() => ({
                title: "",
                description: "",
                file: ""
            }));
            history.push("/responsibility-n-authority");
        }
    };

    // Handle file input change
    const handleFileInputChange = (event) => {
        const fileObj = event.target.files[0];
        setOrgChartData((prevState) => {
            return {
                ...prevState,
                file: fileObj
            }
        })
    };

    // Handle input change 
    const handleInputChange = (event) => {
        setOrgChartData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title="Upload Chart" activeLink="/responsibility-n-authority">
                <div className="c-Add-chart c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Add-chart__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/responsibility-n-authority">Resp. & Authority</Breadcrumb.Item>
                        <Breadcrumb.Item active>Add Organisation Chart</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Top section */}
                    <div className="c-Add-chart__Top c-Main__Top">
                        <h1>Add Organisation Chart</h1>
                    </div>
                    {/* Input */}
                    <div className="c-Add-chart__Inputs">
                        <div className="c-Add-chart__Title c-Input">
                            <label htmlFor="title">Title</label>
                            <input onChange={handleInputChange} type="text" value={orgChartData.title || ""} name="title" placeholder="Enter title" />
                        </div>
                        <div className="c-Add-chart__Description c-Input">
                            <label htmlFor="description">Description</label>
                            <input onChange={handleInputChange} type="text" value={orgChartData.description || ""} name="description" placeholder="Enter description" />
                        </div>
                        <div className="c-Add-chart__Upload-file c-Input">
                            <label htmlFor="file">File</label>
                            <input onChange={handleFileInputChange} type="file" name="file" ref={fileRef} />
                        </div>
                    </div>
                    <div className="c-Add-chart__Btns">
                        <button type="button" className="c-Btn c-Btn--primary" onClick={() => handleBtn("submit")}>Submit</button>
                        <button type="button" className="c-Btn c-Btn--cancel" onClick={() => handleBtn("cancel")}>Cancel</button>
                    </div>

                </div>

            </PageLayout>
        </>
    )
}

export default RespNAuthorityAddChart;