import React, { useState, useEffect } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import * as RiIcons from 'react-icons/ri';
import { IconContext } from 'react-icons';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import { getUserDisplayName, getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import axios from 'axios';
import draftToHtml from 'draftjs-to-html';
import convert from 'htmr';
import TokenManager from '../../utilities/tokenManager';


const ScopeOfQMSEditing = ({
    docEditTableData,
    setDocEditTableData,
    docEditHeaderData,
    setDocEditHeaderData,
    docHeaderData,
    docTableData,
    docColumns,
    docKeyfield,
    editorState,
    setEditorState
}) => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    // State declarations
    const [approverList, setApproverList] = useState([]);
    const userDisplayName = getUserDisplayName();
    console.log(docEditTableData);
    console.log(docEditHeaderData);
    useEffect(() => {
        setDocEditTableData(() => {
            return docTableData.map((data, index) => {
                return {
                    ...data,
                    site_scope: data.site_scope_raw
                }
            })
        });
        setDocEditHeaderData(() => (docHeaderData));


        // Do axios call here to get approval list then set approved by who
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m04_03/employees`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                const approvalListData = res.data.results;
                setApproverList(() => {
                    if (approvalListData.length === 0) {
                        return null;
                    }
                    return approvalListData.map((acc) => ({
                        displayName: `${acc.firstname} ${acc.lastname}`,
                        username: `@${acc.account.username}`,
                        approvalID: acc.employee_id
                    }));
                });
            })
            .catch((err) => {
                console.error(err);
            })
    }, [docHeaderData, docTableData]);

    // Handler for input 
    const handleInputChange = (event) => {
        setDocEditHeaderData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }

    // Handler for adding row to document
    const handleDocAddRow = () => {
        setDocEditTableData((prevDocTableData) => {
            let newDocTableData = [...prevDocTableData, {
                serialNo: prevDocTableData.length + 1,
                site_name: "Enter Input",
                site_address: "Enter Input",
                site_scope: "Enter Input"
            }];
            return newDocTableData;
        });
    };

    // Handler for deleting row
    const handleDocDeleteRow = (deleteRowSerialID) => {
        setDocEditTableData((prevDocTableData) => {

            // Remove deleted row from data array
            let newDocTableData = prevDocTableData.filter((dataElem) => {
                return dataElem.serialNo !== deleteRowSerialID;
            });

            // Update serial no.
            let formattedDocTableData = newDocTableData.map((dataElem, index) => {
                return ({
                    ...dataElem,
                    serialNo: index + 1
                });
            })

            return formattedDocTableData;
        });
    }

    const docEditingColumns = [{
        dataField: 'id',
        hidden: true,
        editable: false
    }, {
        dataField: 'serialNo',
        text: '#',
        editable: false
    }, {
        dataField: 'site_name',
        text: 'Site Name',
        editable: true,
    }, {
        dataField: 'site_address',
        text: 'Site Address',
        editable: true,
    }, {
        dataField: 'site_scope',
        text: 'Site Scope',
        editable: true,
        editor: {
            type: Type.TEXTAREA
        },
        style: { height: "auto", wordWrap: "hard" },
        formatter: (cell, row, rowIndex) => {
            if (cell.split("\n").length > 1) {
                return cell.split("\n").map((strLine, index) => (<div key={index}>{strLine}<br /></div>));
            } else {
                return cell;
            }
        }
    }, {
        dataField: 'action_delete',
        isDummyField: true,
        editable: false,
        text: "",
        formatter: (cell, row) => {
            return (
                <IconContext.Provider value={{ color: "#DC3545", size: "16px" }}>
                    <RiIcons.RiDeleteBin7Line className="c-Table-Btn--bin c-Table-Btn" onClick={() => (handleDocDeleteRow(row.serialNo))} />
                </IconContext.Provider>
            );
        }
    }
    ];

    

    return (
        <div className="c-Scope-of-QMS__Document-content c-Document">
            {/* Document Header info */}
            <div className="c-Scope-of-QMS__Document-header c-Document__Header">
                <div className="c-Scope-of-QMS__Document-header--left c-Document__Header--left">
                    <p>To be approved by:</p>
                    <p>Form name</p>
                </div>
                <div className="c-Scope-of-QMS__Document-header--right c-Document__Header--right">
                    <select type="text" name="approvedBy" onChange={handleInputChange} value={docEditHeaderData.approvedBy || ''}>
                        <option>{!approverList ? "No approver found!" : "Please select an approver"}</option>
                        {!approverList ? null : approverList.map((approver, index) => (
                            <option key={index} value={approver.approvalID}>
                                {approver.displayName}  {approver.username}
                            </option>
                        ))}
                    </select>
                    <input placeholder="Form Name" type="text" name="title" onChange={handleInputChange} value = {docEditHeaderData.title || ''} />
                </div>
            </div>
            {/* WYSIWYG editor section */}
            <div className="l-Scope-of-QMS__WYSIWYG">
                <p>The quality management system under the scope of ISO 9001:2015 certification applies to:</p>
                {/* Insert wysiwyg editor here */}
                <Editor
                    editorState={editorState}
                    wrapperClassName="demo-wrapper"
                    editorClassName="demo-editor"
                    onEditorStateChange={setEditorState}
                />
            </div>

            {/* Table section */}
            <div className="c-Scope-of-QMS__Table">
                <p>Physicial boundary: The corporate office address from where the above mentioned services are provided as follows</p>
                <BootstrapTable
                    keyField='serialNo'
                    data={docEditTableData}
                    columns={docEditingColumns}
                    cellEdit={cellEditFactory({ mode: 'click', blurToSave: true })}
                />
                {/* Add row */}
                <div className="c-Scope-of-QMS__Add-row" onClick={handleDocAddRow}>
                    <h2>Add new row</h2>
                </div>
            </div>

        </div>
    )
}

export default ScopeOfQMSEditing;