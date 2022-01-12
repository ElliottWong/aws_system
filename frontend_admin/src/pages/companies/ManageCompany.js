import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import axios from 'axios';
import dayjs from 'dayjs';
import { getToken } from '../../utilities/localStorageUtils';
import { Container, Row, Col } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import CustomConfirmAlert from '../../common/CustomConfirmAlert';
import { Spinner } from 'react-bootstrap';
import config from '../../config/config';

const ManageCompany = ({ match }) => {
    const token = getToken();
    const userCompanyID = match.params.companyID;
    const toastTiming = config.toastTiming;

    // Invites state declarations
    const [sendInviteInputData, setSendInviteInputData] = useState({
        name: "",
        email: "",
        title: ""
    });

    // Invite List state declarations
    // const { SearchBar, ClearSearchButton } = Search;
    // const history = useHistory();
    // const [rerender, setRerender] = useState(false);
    // const [inviteListData, setInviteData] = useState([]);
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

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [isEditing, setIsEditing] = useState(false);
    const [inputTouched, setInputTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sendInviteLoading, setSendInviteLoading] = useState(false);
    const [deactivateOrReactivateLoading, setdeactivateOrReactivateLoading] = useState(false);
    const [companyData, setCompanyData] = useState({
        companyName: 'Error',
        businessRegNum: 'Error',
        companyAlias: 'Error',
        createdOn: 'Error',
        status: 'Error',
        description: 'Error',
        address: {
            line1: 'Error',
            line2: 'Error',
            city: 'Error',
            state: 'Error',
            country: 'Error',
            postalCode: 'Error'
        },
    });

    // For invite list in future update
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


    useEffect(() => {
        // Endpoint to retrieve details about company
        axios.get(`${process.env.REACT_APP_BASEURL}/companies/${userCompanyID}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res);
                const resDataResults = res.data.results;
                const formattedCompanyData = {
                    companyName: resDataResults.name,
                    businessRegNum: resDataResults.business_registration_number,
                    companyAlias: resDataResults.alias,
                    createdOn: resDataResults.created_at,
                    status: resDataResults.status,
                    description: resDataResults.description,
                    address: {
                        addressID: resDataResults.address_id,
                        line1: resDataResults.address.address_line_one,
                        line2: resDataResults.address.address_line_two,
                        city: resDataResults.address.city,
                        state: resDataResults.address.state,
                        country: resDataResults.address.country,
                        postalCode: resDataResults.address.postal_code
                    },
                };
                setCompanyData(() => formattedCompanyData);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [token, userCompanyID]);

    const handleSendInviteAxios = (onClose) => {
        onClose();
        setSendInviteLoading(() => true);
        axios.post(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/invites/new/system`, sendInviteInputData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res);
                toast.success(<>Success!<br />Message: <b>Email has been sent to: {`${sendInviteInputData.email}`}!</b></>);

                setSendInviteInputData(() => ({
                    name: "",
                    email: "",
                    title: ""
                }));
                setSendInviteLoading(() => false);
                // setRerender((prevState) => !prevState);
            })
            .catch((err) => {
                console.log(err.response);
                let errCode = "Error!";
                let errMsg = "Error!"
                if (err.response !== undefined) {
                    errCode = err.response.status;
                    errMsg = err.response.data.message;
                }
                setSendInviteLoading(() => false);
                toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
            });
    };

    const handleSendInviteBtn = () => {
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

        // Confirmation dialogue for sending invite
        return confirmAlert({
            customUI: ({ onClose }) => {
                return <CustomConfirmAlert {...data} onClose={onClose} />;
            }
        });
    };

    const handleInviteInputChange = ((event) => {
        console.log(sendInviteInputData);
        console.log(event.target.name);
        console.log(event.target.value);

        setSendInviteInputData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    });

    // Handler for input 
    const handleInputChange = (event) => {
        setCompanyData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }

    const handleAddressInputChange = (event) => {
        setCompanyData((prevState) => ({
            ...prevState,
            address: {
                ...prevState.address,
                [event.target.name]: event.target.value
            }
        }));
    }

    // Handler for edit button
    const handleBtn = (buttonType) => {
        if (buttonType === "editCompany" || buttonType === "editCompanyCancel") {
            // Handler for edit button
            setIsEditing((prevState) => (!prevState));
        }

        if (buttonType === "editCompanySave") {
            const message = `You are about to save new company details. Click confirm to proceed.`;
            const handler = (onClose) => editCompanyDetails(onClose);
            const heading = `Confirm Save?`;
            const type = "primary"
            const data = {
                message,
                handler,
                heading,
                type
            };

            // Confirmation dialogue for sending invite
            return confirmAlert({
                customUI: ({ onClose }) => {
                    return <CustomConfirmAlert {...data} onClose={onClose} />;
                }
            });
        }

        if (buttonType === "deactivateCompany") {
            const message = `You are about to deactivate ${companyData.companyName} Company. Click confirm to proceed.`;
            const handler = (onClose) => deactivateOrReactivateCompany("suspended", onClose);
            const heading = `Confirm Deactivate Company?`;
            const type = "alert"
            const data = {
                message,
                handler,
                heading,
                type
            };

            // Confirmation dialogue for sending invite
            return confirmAlert({
                customUI: ({ onClose }) => {
                    return <CustomConfirmAlert {...data} onClose={onClose} />;
                }
            });
        }

        if (buttonType === "reactivateCompany") {
            const message = `You are about to reactivate ${companyData.companyName} Company. Click confirm to proceed.`;
            const handler = (onClose) => deactivateOrReactivateCompany("active", onClose);
            const heading = `Confirm Reactivate Company?`;
            const type = "primary"
            const data = {
                message,
                handler,
                heading,
                type
            };

            // Confirmation dialogue for sending invite
            return confirmAlert({
                customUI: ({ onClose }) => {
                    return <CustomConfirmAlert {...data} onClose={onClose} />;
                }
            });
        }
    }

    // API Call to deactive company
    const deactivateOrReactivateCompany = (status, onClose) => {
        setdeactivateOrReactivateLoading(() => true);
        axios.put(`${process.env.REACT_APP_BASEURL}/companies/${userCompanyID}`, {
            status: status,
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        )
            .then((res) => {
                console.log("Deactivated Company successfully!");
                const data = res.data;
                console.log(data);
                setdeactivateOrReactivateLoading(() => false);
                if (status === "active") {
                    setCompanyData((prevState) => ({
                        ...prevState,
                        status: "active"
                    }));
                    toast.success(<>Success!<br />Message: <b>Reactivated Company successfully!</b></>);
                } else {
                    setCompanyData((prevState) => ({
                        ...prevState,
                        status: "suspended"
                    }));
                    toast.success(<>Success!<br />Message: <b>Deactivated Company successfully!</b></>);
                }
                onClose();
            })
            .catch((err) => {
                console.log(err.response);
                let errCode = "Error!";
                let errMsg = "Error!"
                if (err.response !== undefined) {
                    errCode = err.response.status;
                    errMsg = err.response.data.message;
                }

                toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                onClose();
                setdeactivateOrReactivateLoading(() => false);
            })
    }

    // API call to edit company details
    const editCompanyDetails = (onClose) => {
        setLoading(() => true);
        axios.put(`${process.env.REACT_APP_BASEURL}/companies/${userCompanyID}`, {
            name: companyData.companyName,
            business_registration_number: companyData.businessRegNum,
            alias: companyData.companyAlias,
            status: companyData.status,
            description: companyData.description,
            address: {
                "address_line_one": companyData.address.line1,
                "address_line_two": companyData.address.line2,
                "city": companyData.address.city,
                "state": companyData.address.state,
                "country": companyData.address.country,
                "postal_code": companyData.address.postalCode,
            },
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        )
            .then((res) => {
                console.log("Updated Company Details successfully!");
                const data = res.data;
                console.log(data);
                setLoading(() => (false));
                setIsEditing(() => false);
                toast.success(<>Success!<br />Message: <b>Updated Company Details successfully!</b></>);
                onClose();
            })
            .catch((err) => {
                console.log(err.response);
                let errCode = "Error!";
                let errMsg = "Error!"
                if (err.response !== undefined) {
                    errCode = err.response.status;
                    errMsg = err.response.data.message;
                }

                toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                setLoading(() => (false));
                onClose();
            })
    }

    // Only rendered when document is in editing mode
    const renderInputFieldEditSection = () => {
        return (
            <Container className="l-Manage-company__Inputs">
                {/* Row 1 */}
                <Row className="l-Manage-company__Inputs--row1 l-Manage-company__Inputs--row">
                    {/* Company Name */}
                    <Col className="c-Input c-Input__First-name c-Input c-Input--edit">
                        <label htmlFor="companyName">Company Name</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="companyName" value={companyData.companyName} />
                    </Col>
                    {/* Business Registration Number */}
                    <Col className="c-Input c-Input__Last-name c-Input--edit">
                        <label htmlFor="businessRegNum">Business Registration Number</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="businessRegNum" value={companyData.businessRegNum} />
                    </Col>
                </Row>
                {/* Row 2 */}
                <Row className="l-Manage-company__Inputs--row2 l-Manage-company__Inputs--row">
                    {/* Company Alias */}
                    <Col className="c-Input c-Input__Email c-Input--edit">
                        <label htmlFor="companyAlias">Company Alias</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="companyAlias" value={companyData.companyAlias} />
                    </Col>
                    {/* Created On */}
                    <Col className="c-Input c-Input__Email c-Input--edit">
                        <label htmlFor="createdOn">Created On</label>
                        <p>Cannot be edited!</p>
                    </Col>
                </Row>
                {/* Row 3 */}
                <Row className="l-Manage-company__Inputs--row3 l-Manage-company__Inputs--row">
                    {/* line1 */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--edit">
                        <label htmlFor="line1">Address Line One</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="line1" value={companyData.address.line1} />
                    </Col>

                    {/* line2 */}
                    <Col className="c-Input c-Input__Organisation c-Input--edit">
                        <label htmlFor="line2">Address Line Two</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="line2" value={companyData.address.line2} />
                    </Col>
                </Row>
                {/* Row 4 */}
                <Row className="l-Manage-company__Inputs--row3 l-Manage-company__Inputs--row">
                    {/* city */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--edit">
                        <label htmlFor="city">City</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="city" value={companyData.address.city} />
                    </Col>

                    {/* country */}
                    <Col className="c-Input c-Input__Organisation c-Input--edit">
                        <label htmlFor="country">Country</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="country" value={companyData.address.country} />
                    </Col>
                </Row>
                {/* Row 5 */}
                <Row className="l-Manage-company__Inputs--row3 l-Manage-company__Inputs--row">
                    {/* postalCode */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--edit">
                        <label htmlFor="postalCode">Postal Code</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="postalCode" value={companyData.address.postalCode} />
                    </Col>

                    {/* state */}
                    <Col className="c-Input c-Input__Organisation c-Input--edit">
                        <label htmlFor="state">State</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleAddressInputChange} name="state" value={companyData.address.state} />
                    </Col>
                </Row>
                {/* Row 6 */}
                <Row className="l-Manage-company__Inputs--row3 l-Manage-company__Inputs--row">
                    {/* description */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--edit">
                        <label htmlFor="description">Description</label>
                        <input onFocus={() => setInputTouched(true)} type="text" onChange={handleInputChange} name="description" value={companyData.description} />
                    </Col>
                </Row>
                {/* Save & Cancel Buttons */}
                <Row className="c-Manage-account__Btns">
                    {
                        inputTouched ?
                            <button onClick={() => (handleBtn("editCompanySave"))} type="button" className="c-Btn c-Btn--primary">Save</button>
                            :
                            <button type="button" disabled={true} className="c-Btn c-Btn--disabled">{loading ? "Loading..." : "Save"}</button>
                    }

                    <button onClick={() => (handleBtn("editCompanyCancel"))} type="button" className="c-Btn c-Btn--cancel">Cancel</button>
                </Row>
            </Container>
        )
    }

    // Rendered when document is not in editing mode
    const renderInputFieldSection = () => {
        return (

            <Container className="l-Manage-company__Inputs">
                {/* Row 1 */}
                <Row className="l-Manage-company__Inputs--row1 l-Manage-company__Inputs--row">
                    {/* Company Name */}
                    <Col className="c-Input c-Input__First-name c-Input c-Input--read-only">
                        <label htmlFor="companyName">Company Name</label>
                        <input readOnly type="text" name="companyName" value={companyData.companyName} />
                    </Col>
                    {/* Business Registration Number */}
                    <Col className="c-Input c-Input__Last-name c-Input--read-only">
                        <label htmlFor="businessRegNum">Business Registration Number</label>
                        <input readOnly type="text" name="businessRegNum" value={companyData.businessRegNum} />
                    </Col>
                </Row>
                {/* Row 2 */}
                <Row className="l-Manage-company__Inputs--row2 l-Manage-company__Inputs--row">
                    {/* Company Alias */}
                    <Col className="c-Input c-Input__Email c-Input--read-only">
                        <label htmlFor="companyAlias">Company Alias</label>
                        <input readOnly type="text" name="companyAlias" value={companyData.companyAlias} />
                    </Col>
                    {/* Created On */}
                    <Col className="c-Input c-Input__Email c-Input--read-only">
                        <label htmlFor="createdOn">Created On</label>
                        <input readOnly type="text" name="createdOn" value={dayjs(new Date(companyData.createdOn)).format("MMMM D, YYYY h:mm A")} />
                    </Col>
                </Row>
                {/* Row 3 */}
                <Row className="l-Manage-company__Inputs--row3 l-Manage-company__Inputs--row">
                    {/* line1 */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--read-only">
                        <label htmlFor="line1">Address Line One</label>
                        <input readOnly type="text" name="line1" value={companyData.address.line1} />
                    </Col>

                    {/* line2 */}
                    <Col className="c-Input c-Input__Organisation c-Input--read-only">
                        <label htmlFor="line2">Address Line Two</label>
                        <input readOnly type="text" name="line2" value={companyData.address.line2} />
                    </Col>
                </Row>
                {/* Row 4 */}
                <Row className="l-Manage-company__Inputs--row3 l-Manage-company__Inputs--row">
                    {/* city */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--read-only">
                        <label htmlFor="city">City</label>
                        <input readOnly type="text" name="city" value={companyData.address.city} />
                    </Col>

                    {/* country */}
                    <Col className="c-Input c-Input__Organisation c-Input--read-only">
                        <label htmlFor="country">Country</label>
                        <input readOnly type="text" name="country" value={companyData.address.country} />
                    </Col>
                </Row>
                {/* Row 5 */}
                <Row className="l-Manage-company__Inputs--row3 l-Manage-company__Inputs--row">
                    {/* postalCode */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--read-only">
                        <label htmlFor="postalCode">Postal Code</label>
                        <input readOnly type="text" name="postalCode" value={companyData.address.postalCode} />
                    </Col>

                    {/* state */}
                    <Col className="c-Input c-Input__Organisation c-Input--read-only">
                        <label htmlFor="state">State</label>
                        <input readOnly type="text" name="state" value={companyData.address.state} />
                    </Col>
                </Row>
                {/* Row 6 */}
                <Row className="l-Manage-company__Inputs--row3 l-Manage-company__Inputs--row">
                    {/* description */}
                    <Col className="c-Input l-Manage-account__Roles c-Input--read-only">
                        <label htmlFor="description">Description</label>
                        <input readOnly type="text" name="description" value={companyData.description} />
                    </Col>
                </Row>
            </Container>
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

            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Companies' activeLink="/companies">
                <div className="c-Manage-company c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Companies__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/companies">Companies</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Company</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Top section */}
                    <div className="c-Companies__Top c-Main__Top">
                        <h1>Manage Company</h1>
                        {/* Edit button section */}
                        {
                            // If editing don't display edit button
                            isEditing ?
                                null :
                                // If company status is active, display edit button normally
                                companyData.status === "active" ?
                                    <button
                                        onClick={() => (handleBtn("editCompany"))}
                                        type="button"
                                        className="c-Btn c-Btn--primary"
                                    >
                                        Edit
                                    </button> :
                                    // If status is not active, disable edit button
                                    <button
                                        onClick={() => (handleBtn("editCompany"))}
                                        type="button"
                                        className="c-Btn c-Btn--primary c-Btn--disabled"
                                        disabled
                                    >
                                        Edit
                                    </button>
                        }
                    </div>

                    {/* Input fields section */}
                    {
                        isEditing ?
                            renderInputFieldEditSection()
                            :
                            renderInputFieldSection()
                    }

                    {/* Deactivate or Reactivate company */}
                    <div className="c-Companies__Danger-zone">
                        <h4>Danger Zone</h4>
                        <Container>
                            <Row className="c-Danger-zone__Row">
                                <Col sm="3">
                                    {
                                        // If company is active display deactivate button
                                        companyData.status === "active" ?
                                            <button
                                                onClick={() => (handleBtn("deactivateCompany"))}
                                                type="button"
                                                className="c-Btn c-Btn--alert-border"
                                            >
                                                {deactivateOrReactivateLoading ? "Loading..." : "Deactivate Company"}
                                            </button> :
                                            // Else display reactivate button
                                            <button
                                                onClick={() => (handleBtn("reactivateCompany"))}
                                                type="button"
                                                className="c-Btn c-Btn--primary-border"
                                            >
                                                {deactivateOrReactivateLoading ? "Loading..." : "Reactivate Company"}
                                            </button>
                                    }
                                </Col>
                                <Col sm="8">
                                    <p><b>{companyData.status === "active" ? "Deactivate" : "Reactivate"} this company</b><br />The company's associated users will not be able to access the documents when deactivated</p>
                                </Col>
                            </Row>
                        </Container>
                    </div>

                    {/* Send invites section */}
                    <div className="c-Manage-invites__Send-email">
                        <h2>Send Invite*</h2>
                        {
                            sendInviteLoading ?
                                <>
                                    <Spinner animation="border" role="status" />
                                    <p>Loading...</p>
                                </>
                                :
                                <>
                                    <div className="c-Send-email__Input">
                                        <div className="c-Input__Row">
                                            <label htmlFor="name">Name</label>
                                            <input type="text" onChange={handleInviteInputChange} name="name" placeholder="Name" value={sendInviteInputData.name} />
                                        </div>
                                        <div className="c-Input__Row">
                                            <label htmlFor="title">Job Title</label>
                                            <input type="text" onChange={handleInviteInputChange} name="title" placeholder="Job Title" value={sendInviteInputData.title} />
                                        </div>
                                        <div className="c-Input__Row">
                                            <label htmlFor="email">Email</label>
                                            <input type="text" onChange={handleInviteInputChange} name="email" placeholder="Email" value={sendInviteInputData.email} />
                                        </div>
                                    </div>
                                    <p><b>*</b>Users who sign up through the invite link will have the role of 'Super Admin'.</p>
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

export default ManageCompany;