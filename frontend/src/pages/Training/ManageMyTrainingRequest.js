import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageLayout from '../../layout/PageLayout';
import DocumentLayout from '../../layout/DocumentLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import { myTrainingRecordsColumns, myTrainingRequestsColumns } from '../../config/tableColumns';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import BootstrapTable from 'react-bootstrap-table-next';
import dayjs from 'dayjs';
import { ToastContainer } from 'react-toastify';
import config from '../../config/config';
import { useHistory } from 'react-router-dom';
import StatusPill from '../../common/StatusPill';
import { confirmAlert } from 'react-confirm-alert';
import FileSelect from '../../common/FileSelect';
import CustomConfirmAlert from '../../common/CustomConfirmAlert';
import TokenManager from '../../utilities/tokenManager.js';
import FileDownload from 'js-file-download';
import { toast } from 'react-toastify';

const ManageMyTrainingRequest = ({ match }) => {
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const trainingReqID = match.params.trainingReqID;
    const decodedToken = TokenManager.getDecodedToken();
    const token = TokenManager.getToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [myTrainingRequest, setMyTrainingRequest] = useState({});

    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                const resMyTrainingRequest = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training/all-requests/${trainingReqID}`);
                if (componentMounted) {
                    const tempMyTrainingRequest = resMyTrainingRequest.data.results;
                    console.log(resMyTrainingRequest);
                    setMyTrainingRequest(() => ({
                        id: tempMyTrainingRequest.training_id,
                        organisation: tempMyTrainingRequest.training_institution,
                        course_title: tempMyTrainingRequest.title,
                        cost: tempMyTrainingRequest.training_cost,
                        approver: tempMyTrainingRequest.approved_at,
                        approval_status: tempMyTrainingRequest.status,
                        start_date: dayjs(tempMyTrainingRequest.training_start).format("D MMM YYYY"),
                        end_date: dayjs(tempMyTrainingRequest.training_end).format("D MMM YYYY"),
                        justification_text: tempMyTrainingRequest.justification_text,
                        justification_upload: tempMyTrainingRequest.justification_upload,
                        remarks: tempMyTrainingRequest.remarks
                    }));
                }
            } catch (error) {
                console.log(error);
            }
        })();

        return (() => {
            componentMounted = false;
        })
    }, []);

    // Handlers
    const handleRemoveRecord = () => {
        // Confirmation dialogue for deleting rejected document
        const message = `Deleting this record will remove its respective record (if any) permanently. Click confirm to proceed.`;
        const handler = (onClose) => confirmRemoveRecord(onClose);
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

        const confirmRemoveRecord = () => {

        };
    };

    const handleDownloadFile = async () => {

        try {
            const fileInfoRes = await axios.get(`${process.env.REACT_APP_BASEURL}/file/info/${myTrainingRequest.justification_upload}`);
            const fileRes = await axios.get(`${process.env.REACT_APP_BASEURL}/file/download/${myTrainingRequest.justification_upload}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob'
            });
            console.log(fileInfoRes);
            console.log(fileRes);
            FileDownload(fileRes.data, fileInfoRes.data.results.file_name);
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Manage My Training Record' activeLink="/settings">
                <div className="c-Manage-my-training-request c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Manage-my-training-request__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/training">Trainings</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage My Training Request</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-my-training-request__Top c-Main__Top">
                        <h1>Manage my Training Request</h1>
                    </div>

                    {/* Training records */}
                    <div className="c-Manage-my-training-request__Fields c-Fields">
                        <div className="c-Fields__Left">
                            <div className="c-Field">
                                <h2>Course Title</h2>
                                <p>{myTrainingRequest.course_title}</p>
                            </div>
                            <div className="c-Field">
                                <h2>Organisation/Institution</h2>
                                <p>{myTrainingRequest.organisation}</p>
                            </div>
                            <div className="c-Field">
                                <h2>Cost</h2>
                                <p>{myTrainingRequest.cost}</p>
                            </div>
                            <div className="c-Field">
                                <h2>Justification</h2>
                                <p>{myTrainingRequest.justification_text}</p>
                            </div>
                            <div className="c-Field">
                                <h2>Rejection Remarks</h2>
                                <p>{myTrainingRequest.remarks ? myTrainingRequest.remarks : "Na"}</p>
                            </div>
                        </div>
                        <div className="c-Fields__Right">
                            <div className="c-Field">
                                <h2>Start Date</h2>
                                <p>{myTrainingRequest.start_date}</p>
                            </div>
                            <div className="c-Field">
                                <h2>End Date</h2>
                                <p>{myTrainingRequest.end_date}</p>
                            </div>
                            <div className="c-Field">
                                <h2>To be Approved by</h2>
                                <p>@AppleKim</p>
                            </div>
                            <div className="c-Field c-Field__File">
                                <h2>File (For Justification)</h2>
                                {
                                    myTrainingRequest.justification_upload ?
                                        <button type="button" className="c-Btn c-Btn--primary" onClick = {handleDownloadFile}>Download</button> :
                                        <p>Na</p>
                                }
                            </div>
                            <div className="c-Field">
                                <h2>Approval Status</h2>
                                <StatusPill type={myTrainingRequest.approval_status} />
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="c-Manage-my-training-request__Danger c-Danger">
                        <div className="c-Danger__Top">
                            <h1>Danger Zone</h1>
                        </div>
                        <div className="c-Danger__Contents">
                            <button type="button" className="c-Btn c-Btn--alert-border" onClick={() => handleRemoveRecord()}>Remove record & request</button>
                            <p>Performing this action will remove the request and record (if any) permanently. This action cannot be undoned.</p>
                        </div>

                    </div>

                </div>

            </PageLayout>
        </>
    )
}

export default ManageMyTrainingRequest;
