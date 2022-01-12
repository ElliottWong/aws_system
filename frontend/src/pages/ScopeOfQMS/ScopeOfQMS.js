import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import DocumentLayout from '../../layout/DocumentLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import { getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import BootstrapTable from 'react-bootstrap-table-next';
import TabRow from '../../common/TabRow';
import DocumentBtnSection from '../../common/DocumentBtnSection';
import RenderDocument from '../../common/RenderDocument';
import { TAB, DOCUMENT } from '../../config/enums';
import useDocAxios from '../../hooks/useDocAxios';
import jwt_decode from "jwt-decode";
import { ToastContainer } from 'react-toastify';
import dayjs from 'dayjs';
import axios from 'axios';
import draftToHtml from 'draftjs-to-html';
import convert from 'htmr';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { docScopeOfQMSColumns, historyScopeOfQMSColumns } from '../../config/tableColumns';
import ManageDeleteArchivedDoc from '../../common/ManageDeleteArchivedDoc';
import paginationFactory from 'react-bootstrap-table2-paginator';
import config from '../../config/config';
import TokenManager from '../../utilities/tokenManager';


const ScopeOfQMS = () => {
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
    const [docTableData, setDocTableData] = useState([]);
    const [docHeaderData, setDocHeaderData] = useState({});
    const [docEditTableData, setDocEditTableData] = useState([]);
    const [docEditHeaderData, setDocEditHeaderData] = useState({});
    const [docPendingTableData, setDocPendingTableData] = useState([]);
    const [docPendingHeaderData, setDocPendingHeaderData] = useState({});
    const [docRejectedTableData, setDocRejectedTableData] = useState([]);
    const [docRejectedHeaderData, setDocRejectedHeaderData] = useState({});
    const [docQueryEnum, setDocQueryEnum] = useState('active'); // Can either be 1 (active), 2 (pending), 3 (rejected), 4(archived), tracks which document the user is on
    const [archivedDocData, setArchivedDocData] = useState([]);
    const [queryUrl, setQueryUrl] = useState({
        firstUrl: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/qms-scope/active`,
        secondUrl: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/qms-scopes`,
    });
    const [isApproverOfPendingDoc, setIsApproverOfPendingDoc] = useState(false);    // Track if user is a approver for pending document
    const [isEditor, setIsEditor] = useState(false);        // Track if user has rights to edit
    const [isApprover, setIsApprover] = useState(false); // Check if user can delete document
    const [editorState, setEditorState] = useState(() => (EditorState.createEmpty()));  // Create initial editorState
    const [axiosResponse, axiosError] = useDocAxios(queryUrl);

    useEffect(() => {
        if (axiosResponse !== null) {
            if (axiosResponse.resultDocTable.results !== undefined) {
                // Format table data
                const formattedDocTableData = axiosResponse.resultDocTable.results.items.map((data, index) => {
                    return ({
                        ...data,
                        id: data.qms_scope_item_id,
                        serialNo: index + 1,
                        site_scope: (() => {
                            if (data.site_scope.split("\n").length > 1) {
                                return data.site_scope.split("\n").map((strLine, strLineIndex) => (<div key={index + "_scope" + strLineIndex}>{strLine}<br /></div>));
                            }
                            return data.site_scope;
                        })(),
                        site_scope_raw: data.site_scope,
                        site_address: (() => {
                            if (data.address.split("\n").length > 1) {
                                return data.address.split("\n").map((strLine, strLineIndex) => (<div key={index + "_address" + strLineIndex}>{strLine}<br /></div>));
                            }
                            return data.address;
                        })(),
                        parentItemID: data.parent_item_id
                    })
                });
                if (docQueryEnum === 'active') {
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
            if (axiosResponse.resultHeaderData.results !== undefined) {
                // Set document header data
                let docActive, docPending, docRejected = false; // these variables are for setting tab settings later on
                axiosResponse.resultHeaderData.results.forEach((resObj) => {
                    if (resObj.content) {
                        setEditorState(() => (EditorState.createWithContent(convertFromRaw(JSON.parse(resObj.content)))))
                    } else {
                        setEditorState(() => (EditorState.createEmpty()));
                    }

                    console.log((draftToHtml(convertToRaw(editorState.getCurrentContent()))));
                    if (resObj.status === 'active') {
                        const formattedData = {
                            title: resObj.title,
                            content: (() => {
                                if (resObj.content) {
                                    setEditorState(() => (EditorState.createWithContent(convertFromRaw(JSON.parse(resObj.content)))));
                                    return convert(draftToHtml(convertToRaw(EditorState.createWithContent(convertFromRaw(JSON.parse(resObj.content))).getCurrentContent())));
                                } else {
                                    setEditorState(() => (EditorState.createEmpty()));
                                    return "";
                                }
                            })(),
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
                            content: (() => {
                                if (resObj.content) {
                                    setEditorState(() => (EditorState.createWithContent(convertFromRaw(JSON.parse(resObj.content)))));
                                    return convert(draftToHtml(convertToRaw(EditorState.createWithContent(convertFromRaw(JSON.parse(resObj.content))).getCurrentContent())));
                                } else {
                                    setEditorState(() => (EditorState.createEmpty()));
                                    return "";
                                }
                            })(),
                            created_by: resObj.author.firstname + " " + resObj.author.lastname,
                            approved_by: resObj.approver.firstname + " " + resObj.author.lastname,
                            approved_on: dayjs(new Date(resObj.approved_at)).format("MMMM D, YYYY h:mm A"),
                            remarks: resObj.remarks,
                            docID: resObj.qms_scope_id,
                        }
                        console.log(formattedData);

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
                            content: (() => {
                                if (resObj.content) {
                                    setEditorState(() => (EditorState.createWithContent(convertFromRaw(JSON.parse(resObj.content)))));
                                    return convert(draftToHtml(convertToRaw(EditorState.createWithContent(convertFromRaw(JSON.parse(resObj.content))).getCurrentContent())));
                                } else {
                                    setEditorState(() => (EditorState.createEmpty()));
                                    return "";
                                }
                            })(),
                            created_by_id: resObj.author.employee_id,
                            created_by: resObj.author.firstname + " " + resObj.author.lastname,
                            approved_by: resObj.approver.firstname + " " + resObj.author.lastname,
                            approved_on: dayjs(new Date(resObj.approved_at)).format("MMMM D, YYYY h:mm A"),
                            remarks: resObj.remarks,
                            docID: resObj.qms_scope_id,
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
                        id: archivedData.qms_scope_id,
                        serialNo: index + 1,
                        name: archivedData.title,
                        approved_on: dayjs(new Date(archivedData.approved_on)).format("MMMM D, YYYY h:mm A"),
                        active_till: dayjs(new Date(archivedData.updated_at)).format("MMMM D, YYYY h:mm A"),
                        action_view: `/scope-of-qms/archived/${archivedData.qms_scope_id}`,
                        action_delete: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/qms-scopes/${archivedData.qms_scope_id}`
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
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m04_03/employees`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res);
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
    const historyScopeOfQMSDeletableColumns = [
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
                console.log(cell);
                return (
                    <ManageDeleteArchivedDoc
                        deleteUrl={cell}
                        docHeaderUrl={`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/qms-scopes`}
                        setArchivedDocData={setArchivedDocData}
                        docType="qms-scopes"
                        idName="qms_scope_id"
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Scope of QMS' activeLink="/scope-of-qms">
                <div className="c-Scope-of-QMS c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Company-Policy__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Scope of QMS</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Top section */}
                    <div className="c-Scope-of-QMS__Top c-Main__Top">
                        <h1>Scope of QMS</h1>
                        <DocumentBtnSection
                            setQueryUrl={setQueryUrl}
                            setTabSettings={setTabSettings}
                            tabSettings={tabSettings}
                            docEditTableData={docEditTableData}
                            docEditHeaderData={docEditHeaderData}
                            docPendingTableData={docPendingTableData}
                            docPendingHeaderData={docPendingHeaderData}
                            docRejectedHeaderData={docRejectedHeaderData}
                            pageType="scopeOfQMS"
                            isApprover={isApproverOfPendingDoc}
                            isEditor={isEditor}
                            docQueryEnum={docQueryEnum}
                            setDocQueryEnum={setDocQueryEnum}
                            editorState={editorState}
                            setEditorState={setEditorState}
                            startNewDoc={startNewDoc}
                            setStartNewDoc={setStartNewDoc}
                        />
                    </div>

                    {/* Document section */}
                    <div className="c-Scope-of-QMS__Document c-Main__Document">
                        {/* Tabs */}
                        <TabRow
                            setIsDocCollapsed={setIsDocCollapsed}
                            setDocQueryEnum={setDocQueryEnum}
                            setTabSettings={setTabSettings}
                            tabSettings={tabSettings}
                            isDocCollapsed={isDocCollapsed}
                            setQueryUrl={setQueryUrl}
                            pageType="scopeOfQMS"
                        />

                        {/* Document */}
                        <DocumentLayout isDocCollapsed={isDocCollapsed}>

                            <RenderDocument
                                tabSettings={tabSettings}
                                docHeaderData={docHeaderData}
                                docTableData={docTableData}
                                docPendingHeaderData={docPendingHeaderData}
                                docPendingTableData={docPendingTableData}
                                docRejectedHeaderData={docRejectedHeaderData}
                                docRejectedTableData={docRejectedTableData}
                                docColumns={docScopeOfQMSColumns}
                                docType="scopeOfQMS"
                                docEditTableData={docEditTableData}
                                setDocEditTableData={setDocEditTableData}
                                docEditHeaderData={docEditHeaderData}
                                setDocEditHeaderData={setDocEditHeaderData}
                                editorState={editorState}
                                setEditorState={setEditorState}
                                startNewDoc={startNewDoc}
                                setStartNewDoc={setStartNewDoc}
                            />
                        </DocumentLayout>
                    </div>

                    {/* History/archives section */}
                    <div className="c-Scope-of-QMS_Archives c-Main__Archives">
                        <h1>History (Archived)</h1>
                        {
                            archivedDocData.length !== 0 ?
                                isApprover ?
                                    <BootstrapTable
                                        bordered={false}
                                        keyField='serialNo'
                                        data={archivedDocData}
                                        columns={historyScopeOfQMSDeletableColumns}
                                        pagination={paginationFactory()}
                                    />
                                    :
                                    <BootstrapTable
                                        bordered={false}
                                        keyField='serialNo'
                                        data={archivedDocData}
                                        columns={historyScopeOfQMSColumns}
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

export default ScopeOfQMS;
