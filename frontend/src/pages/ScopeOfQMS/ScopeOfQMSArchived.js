import axios from 'axios';
import dayjs from 'dayjs';
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import convert from 'htmr';
import React, { useEffect, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { docScopeOfQMSColumns } from '../../config/tableColumns';
import DocumentLayout from '../../layout/DocumentLayout';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils';
import TokenManager from '../../utilities/tokenManager';


const ScopeOfQMSArchived = ({ match }) => {
    const scopeOfQMSID = match.params.scopeOfQMSID;     // get id of interested party
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;

    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [docHeaderData, setDocHeaderData] = useState({});
    const [docTableData, setDocTableData] = useState([]);
    const [editorState, setEditorState] = useState(() => (EditorState.createEmpty()));  // Create initial editorState

    useEffect(() => {
        if (!isNaN(scopeOfQMSID) && scopeOfQMSID !== null) {
            axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/qms-scopes/${scopeOfQMSID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    // Format dopcument table data
                    // Format table data
                    console.log(res);
                    const formattedDocTableData = res.data.results[0].items.map((data, index) => {
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
                            site_address: (() => {
                                if (data.address.split("\n").length > 1) {
                                    return data.address.split("\n").map((strLine, strLineIndex) => (<div key={index + "_address" + strLineIndex}>{strLine}<br /></div>));
                                }
                                return data.address;
                            })(),
                            parentItemID: data.parent_item_id
                        })
                    });
                    setDocTableData(() => (formattedDocTableData));
                    
                    res.data.results.forEach((resObj) => {
                        if (resObj.content) {
                            setEditorState(() => (EditorState.createWithContent(convertFromRaw(JSON.parse(resObj.content)))))
                        } else {
                            setEditorState(() => (EditorState.createEmpty()));
                        }

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
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, []);

    return (
        <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Scope of QMS' activeLink="/scope-of-qms">
            <div className="c-Scope-of-QMS c-Main">
                {/* Breadcrumb */}
                <Breadcrumb className="c-Company-Policy__Breadcrumb l-Breadcrumb">
                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item href="/scope-of-qms">Scope of QMS</Breadcrumb.Item>
                    <Breadcrumb.Item active>View Archived</Breadcrumb.Item>
                </Breadcrumb>

                {/* Top section */}
                <div className="c-Scope-of-QMS__Top c-Main__Top">
                    <h1>Scope Of QMS (Archived)</h1>
                </div>

                {/* Document section */}
                <div className="c-Scope-of-QMS__Document c-Main__Document">
                    {/* Document */}
                    <DocumentLayout >
                        <div className="c-Scope-of-QMS__Document-content c-Document">
                            {/* Document Header info */}
                            <div className="c-Scope-of-QMS__Document-header c-Document__Header">
                                <div className="c-Scope-of-QMS__Document-header--left c-Document__Header--left">
                                    <p>Company Name:</p>
                                    <p>Active on:</p>
                                </div>
                                <div className="c-Scope-of-QMS__Document-header--right c-Document__Header--right">
                                    <p>{docHeaderData.title ? docHeaderData.title : "Failed to load data"}</p>
                                    <p>{docHeaderData.approved_on ? docHeaderData.approved_on : "Failed to load data"}</p>
                                </div>
                            </div>
                            {/* WYSIWYG editor section */}
                            <div className="l-Scope-of-QMS__WYSIWYG">
                                <p>The quality management system under the scope of ISO 9001:2015 certification applies to:</p>
                                <div className="c-Scope-Of-QMS__WYSIWYG">
                                    {docHeaderData.content}
                                </div>
                            </div>

                            {/* Table section */}
                            <div className="c-Scope-of-QMS__Table">
                                <p>Physicial boundary: The corporate office address from where the above mentioned services are provided as follows</p>
                                <BootstrapTable
                                    keyField='id'
                                    data={docTableData}
                                    columns={docScopeOfQMSColumns}
                                />
                            </div>

                        </div>
                    </DocumentLayout>
                </div>
            </div>
        </PageLayout>
    )
}

export default ScopeOfQMSArchived;