import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import DocumentLayout from '../../layout/DocumentLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import { docSwotColumns, historySwotColumns } from '../../config/tableColumns';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import BootstrapTable from 'react-bootstrap-table-next';
import TabRow from '../../common/TabRow';
import DocumentBtnSection from '../../common/DocumentBtnSection';
import RenderDocument from '../../common/RenderDocument';
import { TAB } from '../../config/enums';
import useDocAxios from '../../hooks/useDocAxios';
import dayjs from 'dayjs';
import { ToastContainer } from 'react-toastify';
import jwt_decode from "jwt-decode";
import useCheckEditableAxios from '../../hooks/useCheckEditableAxios';
import ManageDeleteArchivedDoc from '../../common/ManageDeleteArchivedDoc';
import axios from 'axios';
import paginationFactory from 'react-bootstrap-table2-paginator';
import config from '../../config/config';
import TokenManager from '../../utilities/tokenManager';


const Swot = () => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;
    const toastTiming = config.toastTiming;

    // State declarations
    const [startNewDoc, setStartNewDoc] = useState(false);
    const [isNewDoc, setIsNewDoc] = useState(false);
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [tabSettings, setTabSettings] = useState({}); // index starts from 0, 0 = firstTab, 1 = secondTab
    const [isDocCollapsed, setIsDocCollapsed] = useState(false);
    const [docTableData, setDocTableData] = useState({
        strength: [],
        weakness: [],
        opp: [],
        threat: []
    });
    const [docHeaderData, setDocHeaderData] = useState({});
    const [docEditTableData, setDocEditTableData] = useState({
        strength: [],
        weakness: [],
        opp: [],
        threat: []
    });
    const [docEditHeaderData, setDocEditHeaderData] = useState({});
    const [docPendingTableData, setDocPendingTableData] = useState({
        strength: [],
        weakness: [],
        opp: [],
        threat: []
    });
    const [docPendingHeaderData, setDocPendingHeaderData] = useState({});
    const [docRejectedTableData, setDocRejectedTableData] = useState({
        strength: [],
        weakness: [],
        opp: [],
        threat: []
    });
    const [docRejectedHeaderData, setDocRejectedHeaderData] = useState({});
    const [docQueryEnum, setDocQueryEnum] = useState('active'); // Can either be 1 (active), 2 (pending), 3 (rejected), 4(archived), tracks which document the user is on
    const [archivedDocData, setArchivedDocData] = useState([]);
    const [loading, setLoading] = useState(false); // to be done
    const [queryUrl, setQueryUrl] = useState({
        firstUrl: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swot/active`,
        secondUrl: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swots`,
    });
    const [isApproverOfPendingDoc, setIsApproverOfPendingDoc] = useState(false);    // Track if user is a approver for pending document
    const [isEditor, setIsEditor] = useState(false);        // Track if user has rights to edit
    const [isApprover, setIsApprover] = useState(false); // Check if user can delete document
    const [axiosResponse, axiosError] = useDocAxios(queryUrl);
    // These two const below are used for checking if user can edit
    const [queryCheckEditableAxiosUrl, setQueryCheckEditableAxiosUrl] = useState({
        firstUrl: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m04_01/employees`,
        secondUrl: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/risks-analysis/pending`,
        thirdUrl: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/risks-analysis/rejected`,
    })
    const [checkEditableAxiosResponse, checkEditableAxiosError] = useCheckEditableAxios(queryCheckEditableAxiosUrl);

    useEffect(() => {
        if (axiosResponse !== null) {
            if (axiosResponse.resultDocTable.results !== undefined) {
                setIsNewDoc(() => false);
                // Format table data
                const formattedDocTableData = {
                    strength: axiosResponse.resultDocTable.results.strengths.map((strengthData, strengthIndex) => {
                        return {
                            id: strengthData.swot_item_id,
                            type: "strength",
                            serialNo: strengthIndex + 1,
                            content: strengthData.content,
                            display_order: 0,
                            parentItemID: strengthData.parent_item_id
                        }
                    }),
                    weakness: axiosResponse.resultDocTable.results.weaknesses.map((weaknessData, weaknessIndex) => {
                        return {
                            id: weaknessData.swot_item_id,
                            type: "weakness",
                            serialNo: weaknessIndex + 1,
                            content: weaknessData.content,
                            display_order: 0,
                            parentItemID: weaknessData.parent_item_id
                        }
                    }),
                    opp: axiosResponse.resultDocTable.results.opportunities.map((oppData, oppIndex) => {
                        return {
                            id: oppData.swot_item_id,
                            type: "opp",
                            serialNo: oppIndex + 1,
                            content: oppData.content,
                            display_order: 0,
                            parentItemID: oppData.parent_item_id
                        }
                    }),
                    threat: axiosResponse.resultDocTable.results.threats.map((threatData, threatIndex) => {
                        return {
                            id: threatData.swot_item_id,
                            type: "threat",
                            serialNo: threatIndex + 1,
                            content: threatData.content,
                            display_order: 0,
                            parentItemID: threatData.parent_item_id
                        }
                    })
                }

                if (docQueryEnum === 'active') {
                    if (checkEditableAxiosResponse !== null) {
                        // check if user can edit
                        let canEdit = false;

                        checkEditableAxiosResponse.checkIfEmployeeCanEdit.data.results.forEach((data, index) => {
                            if (data.employee_id === userID) {
                                canEdit = true;
                            }
                        });
                        if (checkEditableAxiosResponse.checkIfPendingExist.result !== undefined) {
                            canEdit = false;
                        }
                        if (checkEditableAxiosResponse.checkIfRejectedExist.result !== undefined) {
                            canEdit = false;
                        }
                        console.log(checkEditableAxiosResponse)

                        if (canEdit === true) {
                            setIsEditor(() => (true));
                        } else {
                            setIsEditor(() => (false));
                        }
                    }
                    setDocTableData(() => (formattedDocTableData));
                } else if (docQueryEnum === 'pending') {
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
            console.log(axiosResponse);
            if (axiosResponse.resultHeaderData.results !== undefined) {
                // Set document header data
                let docActive, docPending, docRejected = false; // these variables are for setting tab settings later on
                axiosResponse.resultHeaderData.results.forEach((resObj) => {

                    //  Active tab
                    if (resObj.status === 'active') {
                        const formattedData = {
                            created_by: resObj.author.firstname + " " + resObj.author.lastname,
                            approved_by: resObj.approver.firstname + " " + resObj.author.lastname,
                            approved_on: dayjs(new Date(resObj.approved_at)).format("MMMM D, YYYY h:mm A"),
                            remarks: resObj.remarks,
                        }
                        setDocHeaderData(() => (formattedData));

                        docActive = true;
                    }
                    //  Pending tab
                    else if (resObj.status === 'pending') {
                        const formattedData = {
                            created_by: resObj.author.firstname + " " + resObj.author.lastname,
                            approved_by: resObj.approver.firstname + " " + resObj.author.lastname,
                            remarks: resObj.remarks,
                            docID: resObj.swot_id
                        }

                        // Check if user is the approver
                        if (userID === resObj.approved_by) {
                            setIsApproverOfPendingDoc(() => (true));
                        } else {
                            setIsApproverOfPendingDoc(() => (false));
                        }
                        setDocPendingHeaderData(() => (formattedData));
                        docPending = true;
                    }
                    // Rejected tab
                    else if (resObj.status === 'rejected') {
                        const formattedData = {
                            title: resObj.title,
                            created_by_id: resObj.author.employee_id,
                            created_by: resObj.author.firstname + " " + resObj.author.lastname,
                            approved_by: resObj.approver.firstname + " " + resObj.author.lastname,
                            approved_on: dayjs(new Date(resObj.approved_at)).format("MMMM D, YYYY h:mm A"),
                            remarks: resObj.remarks,
                            docID: resObj.swot_id
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

                // Set archives data (More refinements to be done)
                var filteredArchivedDocData = axiosResponse.resultHeaderData.results.filter((resObj) => {
                    return resObj.status === 'archived';
                });
                var formattedArchivedDocData = filteredArchivedDocData.map((archivedData, index) => {
                    return ({
                        ...archivedData,
                        id: archivedData.swot_id,
                        serialNo: index + 1,
                        approved_by: `${archivedData.approver.firstname} ${archivedData.approver.lastname}`,
                        approved_on: dayjs(new Date(archivedData.approved_on)).format("MMMM D, YYYY h:mm A"),
                        active_till: dayjs(new Date(archivedData.updated_at)).format("MMMM D, YYYY h:mm A"),
                        action_view: `/swot/archived/${archivedData.swot_id}`,
                        action_delete: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swots/${archivedData.swot_id}`
                    });
                })
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
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m04_01/employees`, {
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

    }, [axiosResponse, checkEditableAxiosResponse]);

    // Archived deleteable table placed here because 'action_delete' requires setArchivedDocData
    const historySwotDeletableColumns = [
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
                console.log(cell);
                return (
                    <ManageDeleteArchivedDoc
                        deleteUrl={cell}
                        docHeaderUrl={`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swots`}
                        setArchivedDocData={setArchivedDocData}
                        docType="swots"
                        idName="swot_id"
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='SWOT' activeLink="/swot">
                <div className="c-Swot c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Swot-Policy__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Swot</Breadcrumb.Item>
                    </Breadcrumb>
                    {!loading ?
                        <>
                            {/* Top section */}
                            <div className="c-Swot__Top c-Main__Top">
                                <h1>Swot</h1>
                                <DocumentBtnSection
                                    setQueryUrl={setQueryUrl}
                                    setTabSettings={setTabSettings}
                                    tabSettings={tabSettings}
                                    docEditTableData={docEditTableData}
                                    docEditHeaderData={docEditHeaderData}
                                    docPendingTableData={docPendingTableData}
                                    docPendingHeaderData={docPendingHeaderData}
                                    docRejectedHeaderData={docRejectedHeaderData}
                                    pageType="swot"
                                    isApprover={isApproverOfPendingDoc}
                                    isEditor={isEditor}
                                    docQueryEnum={docQueryEnum}
                                    setDocQueryEnum={setDocQueryEnum}
                                    startNewDoc={startNewDoc}
                                    setStartNewDoc={setStartNewDoc}
                                />
                            </div>

                            {/* Document section */}
                            <div className="c-Swot_Document c-Main__Document">
                                {/* Tabs */}
                                <TabRow
                                    setIsDocCollapsed={setIsDocCollapsed}
                                    setDocQueryEnum={setDocQueryEnum}
                                    setTabSettings={setTabSettings}
                                    tabSettings={tabSettings}
                                    isDocCollapsed={isDocCollapsed}
                                    setQueryUrl={setQueryUrl}
                                    pageType="swot"
                                />

                                {/* Document */}
                                <DocumentLayout isDocCollapsed={isDocCollapsed}>
                                    {/* Render document should be done only when you have set up all the five types of file in this folder (refer to interested party folder) */}
                                    <RenderDocument
                                        tabSettings={tabSettings}
                                        docHeaderData={docHeaderData}
                                        docTableData={docTableData}
                                        docPendingHeaderData={docPendingHeaderData}
                                        docPendingTableData={docPendingTableData}
                                        docRejectedHeaderData={docRejectedHeaderData}
                                        docRejectedTableData={docRejectedTableData}
                                        docColumns={docSwotColumns}
                                        docType="swot"
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
                            <div className="c-Swot__Archives c-Main__Archives">
                                <h1>History (Archived)</h1>
                                {
                                    archivedDocData.length !== 0 ?
                                        isApprover ?
                                            <BootstrapTable
                                                bordered={false}
                                                keyField='serialNo'
                                                data={archivedDocData}
                                                columns={historySwotDeletableColumns}
                                                pagination={paginationFactory()}
                                            />
                                            :
                                            <BootstrapTable
                                                bordered={false}
                                                keyField='serialNo'
                                                data={archivedDocData}
                                                columns={historySwotColumns}
                                                pagination={paginationFactory()}
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

export default Swot;
