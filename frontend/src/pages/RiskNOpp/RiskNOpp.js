import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { ToastContainer } from 'react-toastify';
import DocumentBtnSection from '../../common/DocumentBtnSection';
import ManageDeleteArchivedDoc from '../../common/ManageDeleteArchivedDoc';
import RenderDocument from '../../common/RenderDocument';
import TabRow from '../../common/TabRow';
import config from '../../config/config';
import { TAB } from '../../config/enums';
import { historyRiskNOppColumns } from '../../config/tableColumns';
import useCheckEditableAxios from '../../hooks/useCheckEditableAxios';
import useDocAxios from '../../hooks/useDocAxios';
import DocumentLayout from '../../layout/DocumentLayout';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager';

const RiskNOpp = () => {
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
    const [docHeaderData, setDocHeaderData] = useState([]);
    const [docTableData, setDocTableData] = useState({
        strength: [],
        weakness: [],
        opp: [],
        threat: []
    }); // contains swot data and risk n opp data
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
    const [queryUrl, setQueryUrl] = useState({
        firstUrl: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/risks-analysis/active`,
        secondUrl: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/risks-analyses`,
    }); // gets data about swot only, risk analysis done separately in useEffect
    const [isApproverOfPendingDoc, setIsApproverOfPendingDoc] = useState(false);    // Track if user is a approver for pending document
    const [isEditor, setIsEditor] = useState(false);        // Track if user has rights to edit
    const [isApprover, setIsApprover] = useState(false); // Check if user can delete document
    const [axiosResponse, axiosError] = useDocAxios(queryUrl);
    // These two const below are used for checking if user can edit
    const [queryCheckEditableAxiosUrl, setQueryCheckEditableAxiosUrl] = useState({
        firstUrl: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m06_01/employees`,
        secondUrl: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swot/pending`,
        thirdUrl: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swot/rejected`,
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
                            serialNo: strengthIndex + 1,
                            id: strengthData.fk_risks_analysis_id,
                            swot_item_id: strengthData.fk_swot_item_id,
                            content: strengthData.swot.content,
                            type: strengthData.type,
                            severity: strengthData.severity,
                            likelihood: strengthData.likelihood,
                            rpn: strengthData.rpn,
                            action: strengthData.action,
                            modified: dayjs(new Date(strengthData.updated_at)).format("MMMM D, YYYY h:mm A"),
                        };
                    }),
                    weakness: axiosResponse.resultDocTable.results.weaknesses.map((weaknessData, weaknessIndex) => {
                        return {
                            serialNo: weaknessIndex + 1,
                            id: weaknessData.fk_risks_analysis_id,
                            swot_item_id: weaknessData.fk_swot_item_id,
                            content: weaknessData.swot.content,
                            type: weaknessData.type,
                            severity: weaknessData.severity,
                            likelihood: weaknessData.likelihood,
                            rpn: weaknessData.rpn,
                            action: weaknessData.action,
                            modified: dayjs(new Date(weaknessData.updated_at)).format("MMMM D, YYYY h:mm A"),
                        };
                    }),
                    opp: axiosResponse.resultDocTable.results.opportunities.map((oppData, oppIndex) => {
                        return {
                            serialNo: oppIndex + 1,
                            id: oppData.fk_risks_analysis_id,
                            swot_item_id: oppData.fk_swot_item_id,
                            content: oppData.swot.content,
                            type: oppData.type,
                            severity: oppData.severity,
                            likelihood: oppData.likelihood,
                            rpn: oppData.rpn,
                            action: oppData.action,
                            modified: dayjs(new Date(oppData.updated_at)).format("MMMM D, YYYY h:mm A"),
                        };
                    }),
                    threat: axiosResponse.resultDocTable.results.threats.map((threatData, threatIndex) => {
                        return {
                            serialNo: threatIndex + 1,
                            id: threatData.fk_risks_analysis_id,
                            swot_item_id: threatData.fk_swot_item_id,
                            content: threatData.swot.content,
                            type: threatData.type,
                            severity: threatData.severity,
                            likelihood: threatData.likelihood,
                            rpn: threatData.rpn,
                            action: threatData.action,
                            modified: dayjs(new Date(threatData.updated_at)).format("MMMM D, YYYY h:mm A"),
                        };
                    })
                };

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

            if (axiosResponse.resultHeaderData.results !== undefined) {
                // Set document header data
                let docActive, docPending, docRejected = false; // these variables are for setting tab settings later on
                axiosResponse.resultHeaderData.results.forEach((resObj) => {

                    //  Active tab
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
                    }
                    //  Pending tab
                    else if (resObj.status === 'pending') {
                        const formattedData = {
                            title: resObj.title,
                            created_by: resObj.author.firstname + " " + resObj.author.lastname,
                            approved_by: resObj.approver.firstname + " " + resObj.author.lastname,
                            remarks: resObj.remarks,
                            docID: resObj.risks_analysis_id
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
                            docID: resObj.risks_analysis_id
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

                // Set current tab settings
                setTabSettings((prevTabSettings) => ({
                    firstTab: (() => {
                        if (docActive !== true) {
                            return TAB.NEW;
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
                        id: archivedData.risks_analysis_id,
                        serialNo: index + 1,
                        approved_by: `${archivedData.approver.firstname} ${archivedData.approver.lastname}`,
                        approved_on: dayjs(new Date(archivedData.approved_at)).format("MMMM D, YYYY h:mm A"),
                        active_till: dayjs(new Date(archivedData.updated_at)).format("MMMM D, YYYY h:mm A"),
                        action_view: `/risk-n-opportunity/archived/${archivedData.risks_analysis_id}`,
                        action_delete: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/risks-analyses/${archivedData.risks_analysis_id}`
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
        } // end of if (axiosResponse != null)

        // Check if user can approve the document - for checking if user can delete document
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m06_01/employees`, {
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

    const historyRiskNOppDeletableColumns = [
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
                        docHeaderUrl={`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/risks-analyses`}
                        setArchivedDocData={setArchivedDocData}
                        docType="risks-analyses"
                        idName="risks_analysis_id"
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Risk and Opportunity' activeLink="/risk-n-opportunity">
                <div className="c-RNO c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-RNO__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Risk and Opportunity</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Top section */}
                    <div className="c-RNO__Top c-Main__Top">
                        <h1>Risk and Opportunity</h1>
                        <DocumentBtnSection
                            setQueryUrl={setQueryUrl}
                            setTabSettings={setTabSettings}
                            tabSettings={tabSettings}
                            docEditTableData={docEditTableData}
                            docEditHeaderData={docEditHeaderData}
                            docPendingTableData={docPendingTableData}
                            docPendingHeaderData={docPendingHeaderData}
                            docRejectedHeaderData={docRejectedHeaderData}
                            pageType="riskNOpp"
                            isApprover={isApproverOfPendingDoc}
                            isEditor={isEditor}
                            docQueryEnum={docQueryEnum}
                            setDocQueryEnum={setDocQueryEnum}
                            startNewDoc={startNewDoc}
                            setStartNewDoc={setStartNewDoc}
                        />
                    </div>


                    {/* Document section */}
                    <div className="c-RNO__Document c-Main__Document">
                        {/* Tabs */}
                        <TabRow
                            setIsDocCollapsed={setIsDocCollapsed}
                            setDocQueryEnum={setDocQueryEnum}
                            setTabSettings={setTabSettings}
                            tabSettings={tabSettings}
                            isDocCollapsed={isDocCollapsed}
                            setQueryUrl={setQueryUrl}
                            pageType="riskNOpp"
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
                                docType="riskNOpp"
                                docEditHeaderData={docEditHeaderData}
                                setDocEditHeaderData={setDocEditHeaderData}
                                docEditTableData={docEditTableData}
                                setDocEditTableData={setDocEditTableData}
                                startNewDoc={startNewDoc}
                                setStartNewDoc={setStartNewDoc}
                            />
                        </DocumentLayout>
                    </div>

                    {/* History/archives section */}
                    <div className="c-RNO__Archives c-Main__Archives">
                        <h1>History (Archived)</h1>
                        {
                            archivedDocData.length !== 0 ?
                                isApprover ?
                                    <BootstrapTable
                                        bordered={false}
                                        keyField='serialNo'
                                        data={archivedDocData}
                                        columns={historyRiskNOppDeletableColumns}
                                        pagination={paginationFactory()}
                                    />
                                    :
                                    <BootstrapTable
                                        bordered={false}
                                        keyField='serialNo'
                                        data={archivedDocData}
                                        columns={historyRiskNOppColumns}
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

export default RiskNOpp;
