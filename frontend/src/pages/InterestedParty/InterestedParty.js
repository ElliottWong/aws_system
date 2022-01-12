import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import DocumentLayout from '../../layout/DocumentLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import dayjs from 'dayjs';
import BootstrapTable from 'react-bootstrap-table-next';
import TabRow from '../../common/TabRow';
import DocumentBtnSection from '../../common/DocumentBtnSection';
import RenderDocument from '../../common/RenderDocument';
import { TAB } from '../../config/enums';
import useDocAxios from '../../hooks/useDocAxios';
import { docInterestedPartyColumns, historyInterestedPartyColumns } from '../../config/tableColumns';
import { ToastContainer } from 'react-toastify';
import jwt_decode from "jwt-decode";
import axios from 'axios';
import ManageDeleteArchivedDoc from '../../common/ManageDeleteArchivedDoc';
import paginationFactory from 'react-bootstrap-table2-paginator';
import config from '../../config/config';
import TokenManager from '../../utilities/tokenManager';

const InterestedParty = () => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;
    const toastTiming = config.toastTiming;

    // State declarations
    const [startNewDoc, setStartNewDoc] = useState(false);
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [tabSettings, setTabSettings] = useState({}); // index starts from 0, 0 = firstTab, 1 = secondTab
    const [isDocCollapsed, setIsDocCollapsed] = useState(false);
    const [docTableData, setDocTableData] = useState([]);
    const [docHeaderData, setDocHeaderData] = useState({});
    const [docEditTableData, setDocEditTableData] = useState([]);
    const [docEditHeaderData, setDocEditHeaderData] = useState({});
    const [docPendingTableData, setDocPendingTableData] = useState([]);
    const [docPendingHeaderData, setDocPendingHeaderData] = useState({});
    const [docRejectedTableData, setDocRejectedTableData] = useState([]);
    const [docRejectedHeaderData, setDocRejectedHeaderData] = useState({});
    const [docQueryEnum, setDocQueryEnum] = useState('active');
    const [archivedDocData, setArchivedDocData] = useState([]);
    const [loading, setLoading] = useState(false); // to be done
    const [queryUrl, setQueryUrl] = useState({
        firstUrl: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/interested-party/active`,
        secondUrl: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/interested-parties`,
    });
    const [isApproverOfPendingDoc, setIsApproverOfPendingDoc] = useState(false);    // Track if user is a approver for pending document
    const [isEditor, setIsEditor] = useState(false);        // Track if user has rights to edit
    const [isApprover, setIsApprover] = useState(false); // Check if user can delete document
    const [isNewDoc, setIsNewDoc] = useState(false);
    // Custom hook for making api call to endpoint to get data for document
    const [axiosResponse, axiosError] = useDocAxios(queryUrl);

    // Format data received from axiosResponse
    useEffect(() => {
        if (axiosResponse !== null) {
            if (axiosResponse.resultDocTable.results !== undefined) {
                setIsNewDoc(() => false);
                // Format table data
                const formattedDocTableData = axiosResponse.resultDocTable.results.items.map((data, index) => {
                    return ({
                        id: data.party_item_id,
                        needs_n_expectations: (() => {
                            if (data.expectations.split("\n").length > 1) {
                                return data.expectations.split("\n").map(strLine => (<>{strLine}<br /></>));
                            }
                            return data.expectations;
                        })(),
                        needs_n_expectations_raw: data.expectations,
                        serialNo: index + 1,
                        interested_parties: data.interested_party,
                        parentItemID: data.parent_item_id,
                    })
                });
                if (docQueryEnum === 'active') {
                    // Format table data
                    const formattedDocActiveTableData = axiosResponse.resultDocTable.results.items.map((data, index) => {
                        return ({
                            id: data.party_item_id,
                            needs_n_expectations: (() => {
                                if (data.expectations.split("\n").length > 1) {
                                    return data.expectations.split("\n").map(strLine => (<>{strLine}<br /></>));
                                }
                                return data.expectations;
                            })(),
                            needs_n_expectations_raw: data.expectations,
                            serialNo: index + 1,
                            interested_parties: data.interested_party,
                            parentItemID: data.parent_item_id
                        })
                    });

                    // Check if user can edit the document
                    axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m04_02/employees`, {
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
                                setIsEditor(() => (true));
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                    setDocTableData(() => (formattedDocActiveTableData));
                } else if (docQueryEnum === 'pending') {
                    // Format table data
                    const formattedDocTableData = axiosResponse.resultDocTable.results.items.map((data, index) => {
                        return ({
                            id: data.party_item_id,
                            needs_n_expectations: (() => {
                                if (data.expectations.split("\n").length > 1) {
                                    return data.expectations.split("\n").map(strLine => (<>{strLine}<br /></>));
                                }
                                return data.expectations;
                            })(),
                            needs_n_expectations_raw: data.expectations,
                            serialNo: index + 1,
                            interested_parties: data.interested_party,
                            parentItemID: data.parent_item_id
                        })
                    });
                    setDocPendingTableData(() => (formattedDocTableData));
                } else if (docQueryEnum === 'rejected') {
                    // This is when user clicks on rejected edit button.
                    if (tabSettings.secondTab === TAB.EDITING) {
                        setDocTableData(() => (formattedDocTableData));
                    } else {
                        setDocRejectedTableData(() => (formattedDocTableData));
                    }
                }
            }
            if (axiosResponse.resultHeaderData.results !== undefined) {
                // Set document header data
                let docActive, docPending, docRejected = false; // these variables are for setting tab settings later on
                axiosResponse.resultHeaderData.results.forEach((resObj) => {
                    if (resObj.status === 'active') {
                        const formattedData = {
                            title: resObj.title,
                            created_by: resObj.author.firstname + " " + resObj.author.lastname,
                            approved_by: resObj.approver.firstname + " " + resObj.author.lastname,
                            approved_on: dayjs(new Date(resObj.approved_at)).format("MMMM D, YYYY h:mm A"),
                            remarks: resObj.remarks,
                        }
                        setDocHeaderData(() => (formattedData));

                        docActive = true;
                    } else if (resObj.status === 'pending') {
                        const formattedData = {
                            title: resObj.title,
                            created_by: resObj.author.firstname + " " + resObj.author.lastname,
                            approved_by: resObj.approver.firstname + " " + resObj.author.lastname,
                            remarks: resObj.remarks,
                            docID: resObj.party_id
                        }

                        // Check if user is the approver
                        if (userID === resObj.approved_by) {
                            setIsApproverOfPendingDoc(() => (true));
                        } else {
                            setIsApproverOfPendingDoc(() => (false));
                        }
                        setDocPendingHeaderData(() => (formattedData));
                        docPending = true;
                    } else if (resObj.status === 'rejected') {
                        const formattedData = {
                            title: resObj.title,
                            created_by_id: resObj.author.employee_id,
                            created_by: resObj.author.firstname + " " + resObj.author.lastname,
                            approved_by: resObj.approver.firstname + " " + resObj.author.lastname,
                            approved_on: dayjs(new Date(resObj.approved_at)).format("MMMM D, YYYY h:mm A"),
                            remarks: resObj.remarks,
                            docID: resObj.party_id
                        }
                        // This is when user clicks on rejected edit button.
                        if (tabSettings.secondTab === TAB.EDITING) {
                            setDocHeaderData(() => (formattedData));
                        } else {
                            setDocRejectedHeaderData(() => (formattedData));
                        }
                        docRejected = true;
                    }
                });

                // Set whether document is new
                if (docActive) {
                    setIsNewDoc(() => true);
                } else {
                    setIsNewDoc(() => false);
                }
            
                // Set current tab settings
                setTabSettings((prevTabSettings) => ({
                    firstTab: (() => {
                        if (docActive !== true) {
                            return TAB.INACTIVE;
                        }
                        return TAB.ACTIVE; // To be changed to an idle kind of tab
                    })(),
                    secondTab: (() => {
                        if (docPending === true) {
                            return TAB.PENDING;
                        } else if (prevTabSettings.secondTab === TAB.EDITING && docRejected === true) {
                            // This is when user clicks on rejected edit button.
                            return TAB.EDITING;
                        } else if (docRejected === true) {
                            return TAB.REJECTED;
                        } else {
                            return TAB.NULL;
                        }
                    })(),
                    focusTabIndex: (() => {
                        if (docQueryEnum === 'active') {
                            return 0;
                        }
                        return 1;
                    })()
                }));

                // Set archives data
                var filteredArchivedDocData = axiosResponse.resultHeaderData.results.filter((resObj) => {
                    return resObj.status === 'archived';
                });

                var formattedArchivedDocData = filteredArchivedDocData.map((archivedData, index) => {
                    return ({
                        ...archivedData,
                        id: archivedData.party_id,
                        serialNo: index + 1,
                        name: archivedData.title,
                        approved_on: dayjs(new Date(archivedData.approved_on)).format("MMMM D, YYYY h:mm A"),
                        active_till: dayjs(new Date(archivedData.updated_at)).format("MMMM D, YYYY h:mm A"),
                        action_view: `/interested-party/archived/${archivedData.party_id}`,
                        action_delete: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/interested-parties/${archivedData.party_id}`
                    });
                });
                setArchivedDocData(() => (formattedArchivedDocData));
            } else {
                // This is where new documents are configured if there are no existing documents
                setIsNewDoc(() => true);
                // Set current tab settings
                setTabSettings((prevTabSettings) => ({
                    firstTab: TAB.INACTIVE,
                    secondTab: TAB.NULL,
                    focusTabIndex: (() => {
                        if (docQueryEnum === 'active') {
                            return 0;
                        }
                        return 1;
                    })()
                }));
            }
        }

        // Check if user can approve the document - for checking if user can delete document
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m04_02/employees`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                let canApprove = false;
                if (res.data.results !== undefined) {
                    res.data.results.forEach((data, index) => {
                        if (data.employee_id === userID) {
                            canApprove = true;
                        }
                    });
                }
                if (canApprove === true) {
                    setIsApprover(() => (true));
                }
            })
            .catch((err) => {
                console.log(err);
            });

    }, [axiosResponse]);

    // Archived deleteable table placed here because 'action_delete' requires setArchivedDocData
    const historyInterestedPartyDeletableColumns = [
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
            dataField: 'name',
            text: 'Name',
        },
        {
            dataField: 'approved_on',
            text: 'Active From'
        },
        {
            dataField: 'active_till',
            text: 'Active Till'
        },
        {
            dataField: 'action_view',
            text: '',
            formatter: (cell, row) => {
                return <a href={cell}>View</a>
            }
        },
        {
            dataField: 'action_delete',
            text: '',
            formatter: (cell, row) => {
                return (
                    <ManageDeleteArchivedDoc
                        deleteUrl={cell}
                        docHeaderUrl={`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/interested-parties`}
                        setArchivedDocData={setArchivedDocData}
                        docType="interested-parties"
                        idName="party_id"
                    />
                )
            }
        }];

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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Interested Party' activeLink="/interested-party">
                <div className="c-IP c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-IP__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Interested Party</Breadcrumb.Item>
                    </Breadcrumb>
                    {!loading ?

                        <>
                            {/* Top section */}
                            <div className="c-IP__Top c-Main__Top">
                                <h1>Interested Parties</h1>
                                <DocumentBtnSection
                                    setQueryUrl={setQueryUrl}
                                    setTabSettings={setTabSettings}
                                    tabSettings={tabSettings}
                                    docEditTableData={docEditTableData}
                                    docEditHeaderData={docEditHeaderData}
                                    docPendingTableData={docPendingTableData}
                                    docPendingHeaderData={docPendingHeaderData}
                                    docRejectedHeaderData={docRejectedHeaderData}
                                    pageType="interestedParty"
                                    isApprover={isApproverOfPendingDoc}
                                    isEditor={isEditor}
                                    docQueryEnum={docQueryEnum}
                                    setDocQueryEnum={setDocQueryEnum}
                                    startNewDoc={startNewDoc}
                                    setStartNewDoc={setStartNewDoc}
                                />
                            </div>

                            {/* Document section */}
                            <div className="c-IP__Document c-Main__Document">
                                {/* Tabs */}
                                <TabRow
                                    setIsDocCollapsed={setIsDocCollapsed}
                                    setDocQueryEnum={setDocQueryEnum}
                                    setTabSettings={setTabSettings}
                                    tabSettings={tabSettings}
                                    isDocCollapsed={isDocCollapsed}
                                    setQueryUrl={setQueryUrl}
                                    pageType="interestedParty"
                                />

                                {/* Document */}
                                <DocumentLayout isDocCollapsed={isDocCollapsed}>
                                    <RenderDocument
                                        tabSettings={tabSettings}
                                        docHeaderData={docHeaderData}
                                        docTableData={docTableData}
                                        docPendingHeaderData={docPendingHeaderData}
                                        docPendingTableData={docPendingTableData}
                                        setDocPendingTableData={setDocPendingTableData}
                                        docRejectedHeaderData={docRejectedHeaderData}
                                        docRejectedTableData={docRejectedTableData}
                                        docColumns={docInterestedPartyColumns}
                                        docType="interestedParty"
                                        docEditTableData={docEditTableData}
                                        setDocEditTableData={setDocEditTableData}
                                        docEditHeaderData={docEditHeaderData}
                                        setDocEditHeaderData={setDocEditHeaderData}
                                        startNewDoc={startNewDoc}
                                        setStartNewDoc={setStartNewDoc}
                                    />
                                </DocumentLayout>
                            </div>

                            {/* History/archives section */}
                            <div className="c-IP__Archives c-Main__Archives">
                                <h1>History (Archived)</h1>
                                {
                                    archivedDocData.length !== 0 ?
                                        isApprover ?
                                            <BootstrapTable
                                                bordered={false}
                                                keyField='serialNo'
                                                data={archivedDocData}
                                                columns={historyInterestedPartyDeletableColumns}
                                                pagination={ paginationFactory() }
                                            />
                                            :
                                            <BootstrapTable
                                                bordered={false}
                                                keyField='serialNo'
                                                data={archivedDocData}
                                                columns={historyInterestedPartyColumns}
                                                pagination={ paginationFactory() }
                                            />
                                        :
                                        "No records found!"
                                }

                            </div>
                        </>
                        :
                        "loading..."
                    }
                </div>
            </PageLayout>
        </>
    )
}

export default InterestedParty;