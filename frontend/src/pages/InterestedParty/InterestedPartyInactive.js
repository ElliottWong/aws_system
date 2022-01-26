import axios from 'axios';
import React, { useEffect, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import { IconContext } from 'react-icons';
import * as RiIcons from 'react-icons/ri';
import { TAB } from '../../config/enums';
import TokenManager from '../../utilities/tokenManager';


const InterestedPartyInactive = ({
    docEditTableData,
    setDocEditTableData,
    docEditHeaderData,
    setDocEditHeaderData,
    docHeaderData,
    docTableData,
    docKeyfield,
    tabSettings,
    startNewDoc,
    setStartNewDoc }) => {

    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userDisplayName = decodedToken.display_name;
    const userID = decodedToken.employee_id;

    // State declarations
    const [approverList, setApproverList] = useState([]);
    const [isEditor, setIsEditor] = useState(false);

    useEffect(() => {
        setDocEditTableData(() => ([{
            serialNo: 1,
            interested_parties: "Enter Input",
            needs_n_expectations: "Enter input"
        }]));
        setDocEditHeaderData(() => ({
            submittedBy: `${userDisplayName}`
        }));
        // Do axios call here to get approval list then set approved by who
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m04_02/employees`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                const approverListData = res.data.results;
                if (approverListData !== undefined) {
                    setApproverList(() => {
                        if (approverListData.length === 0) {
                            return null;
                        }
                        return approverListData.map((acc) => ({
                            displayName: `${acc.firstname} ${acc.lastname}`,
                            username: `@${acc.account.username}`,
                            approvalID: acc.employee_id
                        }));
                    });
                }

            })
            .catch((err) => {
                console.log(err);
            });

        // Do axios call here to get list of users who can edit the document
        // Check if user can edit the document
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m04_02/employees`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                let canEdit = false;
                if (res.data.results !== undefined) {
                    res.data.results.forEach((data, index) => {
                        if (data.employee_id === userID) {
                            canEdit = true;
                        }
                    });
                }
                if (canEdit === true) {
                    setIsEditor(() => (true));
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, [docHeaderData, docTableData]);

    // Handle start new doc buttton
    const handleStartNewDocBtn = () => {
        setStartNewDoc(() => true);
    };

    const docEditingColumns = [{
        dataField: 'id',
        hidden: true,
        editable: false
    }, {
        dataField: 'serialNo',
        text: '#',
        editable: false
    }, {
        dataField: 'interested_parties',
        text: "Interested Parties",
        editable: true,
    }, {
        dataField: 'needs_n_expectations',
        text: "Needs and Expectations",
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
    }];
    // Handler for adding row to document
    const handleDocAddRow = () => {
        setDocEditTableData((prevDocTableData) => {
            let newDocTableData = [...prevDocTableData, {
                serialNo: prevDocTableData.length + 1,
                interested_parties: "Enter Input",
                needs_n_expectations: "Enter input"
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

    // Handler for input 
    const handleInputChange = (event) => {
        setDocEditHeaderData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }
    console.log(tabSettings);
    console.log(tabSettings.secondTab);
    console.log(tabSettings === TAB.NULL);
    console.log(TAB.NULL);
    return (
        <div className="c-IP__Document-content c-Document">
            {
                tabSettings.secondTab === TAB.NULL ?
                    isEditor ?
                        !startNewDoc ?
                            <>
                                {/* Header */}
                                <h1>There are no existing documents</h1>
                                <div className="c-IP__Document-new">
                                    <button onClick={handleStartNewDocBtn} type="button" className="c-Btn c-Btn--primary">Start new document</button>
                                </div>
                            </>
                            :
                            <>
                                {/* Title */}
                                < div className="l-IP__Document-title">
                                    <input type="text" name="title" placeholder="Title" onChange={handleInputChange} value={docEditHeaderData.title || ''} />
                                </div>
                                {/* Document Header info */}
                                <div className="c-IP__Document-header c-Document__Header">
                                    <div className="c-IP__Document-header--left c-Document__Header--left">
                                        <p>Approved by:</p>
                                        <p>Submitted by:</p>
                                    </div>
                                    <div className="c-IP__Document-header--right c-Document__Header--right">
                                        <select type="text" name="approvedBy" onChange={handleInputChange} value={docEditHeaderData.approvedBy || ''}>
                                            <option>{!approverList ? "No approver found!" : "Please select an approver"}</option>
                                            {!approverList ? null : approverList.map((approver, index) => (
                                                <option key={index} value={approver.approvalID}>
                                                    {approver.displayName}  {approver.username}
                                                </option>
                                            ))}
                                        </select>
                                        <input type="text" readOnly name="submittedBy" value={docEditHeaderData.submittedBy || ''} />
                                    </div>
                                </div>
                                {/* Table section */}
                                <BootstrapTable
                                    keyField={docKeyfield}
                                    data={docEditTableData}
                                    columns={docEditingColumns}
                                    cellEdit={cellEditFactory({ mode: 'click', blurToSave: true })}
                                />
                                {/* Add row */}
                                <div className="c-IP__Add-row" onClick={handleDocAddRow}>
                                    <h2>Add new row</h2>
                                </div>
                            </>
                        :
                        <>
                            <div className="c-IP__Document-new">
                                <h1>There are no existing documents</h1>
                                <p>You do not have permission to start new documents</p>
                            </div>
                        </>
                    :
                    <div className="c-IP__Document-new">
                        <h1>There is one pending/rejected document</h1>
                        <p>Please proceed by resolving the pending/rejected document</p>
                    </div>
            }

        </div >
    )
}

export default InterestedPartyInactive;