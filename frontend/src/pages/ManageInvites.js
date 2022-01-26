import axios from 'axios';
import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { Search } from 'react-bootstrap-table2-toolkit';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { confirmAlert } from 'react-confirm-alert';
import { useHistory } from 'react-router';
import { toast, ToastContainer } from 'react-toastify';
import CustomConfirmAlert from '../common/CustomConfirmAlert';
import config from '../config/config';
import PageLayout from '../layout/PageLayout';
import { getSideNavStatus } from '../utilities/sideNavUtils';
import TokenManager from '../utilities/tokenManager';


const ManageInvites = () => {
    const { SearchBar, ClearSearchButton } = Search;
    const history = useHistory();
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const toastTiming = config.toastTiming;
    // State declaration
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [inviteListData, setInviteData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sendInviteInputData, setSendInviteInputData] = useState({
        name: "",
        email: "",
        title: ""
    });

    // const [rerender, setRerender] = useState(false);

    // useEffect(() => {
    //     axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/invites`, {
    //         headers: {
    //             'Authorization': `Bearer ${token}`
    //         }
    //     })
    //         .then((res) => {
    //             console.log(res);
    //             if (res.data !== undefined) {
    //                 const formattedUsersData = res.data.results.map((data, index) => ({
    //                     ...data,
    //                     serialNo: index + 1,
    //                     created_at: dayjs(new Date(data.created_at)).format("MMMM D, YYYY h:mm A")
    //                 }))
    //                 setInviteData(() => (formattedUsersData));
    //             }

    //         })
    //         .catch((err) => {
    //             console.log(err);
    //         })
    // }, [rerender]);

    const handleSendInviteBtn = () => {
        // Confirmation dialogue for sending invite link
        const message = `You are about to send an invite link to ${sendInviteInputData.email} to the system. Click confirm to proceed.`;
        const handler = (onClose) => handleSendInviteAxios(onClose);
        const heading = `Confirm send invite?`;
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
        const handleSendInviteAxios = (onClose) => {
            onClose();
            setLoading(() => true);
            axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/invites/new/user`, sendInviteInputData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    console.log(res);
                    toast.success(<>Success!<br />Message: <b>Email has been sent to: {`${sendInviteInputData.email}`}!</b></>);
                    setLoading(() => false);
                    setSendInviteInputData(() => ({
                        name: "",
                        email: "",
                        title: ""
                    }));
                    // setRerender((prevState) => !prevState);
                })
                .catch((err) => {
                    console.log(err);
                    let errCode = "Error!";
                    let errMsg = "Error!"
                    if (err.response !== undefined) {
                        errCode = err.response.status;
                        errMsg = err.response.data.message;
                    }
                    setLoading(() => false);
                    toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                });
        };

    };

    const handleInputChange = ((event) => {
        console.log(sendInviteInputData);
        console.log(event.target.name);
        console.log(event.target.value);

        setSendInviteInputData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    });

    // const companiesColumn = [
    //     {
    //         dataField: 'employee_id',
    //         text: 'Id',
    //         hidden: true
    //     },
    //     {
    //         dataField: 'serialNo',
    //         text: '#'
    //     },
    //     {
    //         dataField: 'name',
    //         text: 'Name'
    //     },
    //     {
    //         dataField: 'email',
    //         text: 'Email'
    //     },
    //     {
    //         dataField: 'status',
    //         text: 'Status'
    //     },
    //     {
    //         dataField: 'created_at',
    //         text: "Sent on"
    //     },
    // ];

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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title="Manage Invites" activeLink="/settings">
                <div className="c-Manage-invites c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Manage-invites l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/settings">Settings</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Invites</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Top section */}
                    <div className="c-Manage-invites__Top c-Main__Top">
                        <h1>Manage Invites</h1>
                    </div>
                    {/* Send invites section */}
                    <div className="c-Manage-invites__Send-email">
                        <h2>Send Invite*</h2>
                        {
                            loading ?
                                <>
                                    <Spinner animation="border" role="status" />
                                    <p>Loading...</p>
                                </>
                                :
                                <>
                                    <div className="c-Send-email__Input">
                                        <div className="c-Input__Row">
                                            <label htmlFor="name">Name</label>
                                            <input type="text" onChange={handleInputChange} name="name" placeholder="Name" value={sendInviteInputData.name} />
                                        </div>
                                        <div className="c-Input__Row">
                                            <label htmlFor="title">Job Title</label>
                                            <input type="text" onChange={handleInputChange} name="title" placeholder="Job Title" value={sendInviteInputData.title} />
                                        </div>
                                        <div className="c-Input__Row">
                                            <label htmlFor="email">Email</label>
                                            <input type="text" onChange={handleInputChange} name="email" placeholder="Email" value={sendInviteInputData.email} />
                                        </div>
                                        <div className = "c-Input__Row">
                                            {/* To be continued */}
                                            <label htmlFor="induction_template">Induction Template</label>
                                            <select name = "induction_template">
                                                <option value = {null}>Assign an induction template</option>
                                            </select>
                                        </div>
                                    </div>
                                    <p><b>*</b>Users who sign up through the invite link will have the role of 'Normal User'.</p>
                                    <button type="button" className="c-Btn c-Btn--primary" onClick={handleSendInviteBtn}>Send Invite</button>
                                </>
                        }

                    </div>
                    {/* Invite list Table section */}
                    <div className="c-Manage-invites__Table">
                        <h2>Invites List</h2>
                        <p>Coming soon...</p>
                        {/* <ToolkitProvider
                            keyField="id"
                            data={inviteListData}
                            columns={companiesColumn}
                            search

                        >
                            {
                                props => (
                                    <div className="c-Table">
                                        <div className="c-Table__Top">
                                            <SearchBar {...props.searchProps} />
                                            <ClearSearchButton className="c-Table__Clear-btn" {...props.searchProps} />
                                        </div>
                                        <hr />
                                        <BootstrapTable
                                            {...props.baseProps}
                                            bordered={false}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider> */}

                    </div>

                </div>
            </PageLayout>
        </>
    )
}

export default ManageInvites;