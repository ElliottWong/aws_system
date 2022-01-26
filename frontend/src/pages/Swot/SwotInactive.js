import axios from 'axios';
import React, { useEffect, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { IconContext } from 'react-icons';
import * as RiIcons from 'react-icons/ri';
import SwotItems from '../../common/SwotItems';
import { TAB } from '../../config/enums';
import TokenManager from '../../utilities/tokenManager';


const SwotInactive = ({
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
        setDocEditTableData(() => ({ ...docTableData }));
        setDocEditHeaderData(() => ({
            submittedBy: `${userDisplayName}`
        }));
        // Do axios call here to get approval list then set approved by who
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m04_01/employees`, {
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
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m04_01/employees`, {
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
        editable: false,
    }, {
        dataField: 'type',
        hidden: true,
        editable: false
    }, {
        dataField: 'serialNo',
        text: '#',
        editable: false,
        headerAttrs: {
            hidden: true
        }
    }, {
        dataField: 'content',
        text: "Swot content",
        editable: true,
        headerAttrs: {
            hidden: true
        }
    }, {
        dataField: 'action_delete',
        isDummyField: true,
        editable: false,
        text: "",
        formatter: (cell, row) => {
            console.log(row);
            return (
                <IconContext.Provider value={{ color: "#DC3545", size: "16px" }}>
                    <RiIcons.RiDeleteBin7Line className="c-Table-Btn--bin c-Table-Btn" onClick={() => (handleDocDeleteRow(row.serialNo, row.type))} />
                </IconContext.Provider>
            );
        }
    }];

    // Handler for input 
    const handleInputChange = (event) => {
        console.log(event);
        setDocEditHeaderData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }

    // Handler for adding row to document, table type refers to either strength, weakness, opportunity, or threat in swot.
    const handleDocAddRow = (tableType) => {
        setDocEditTableData((prevDocTableData) => {

            let newDocTableData = {
                ...prevDocTableData,
                [tableType]: [
                    ...prevDocTableData[tableType],
                    {
                        serialNo: prevDocTableData[tableType].length + 1,
                        content: `Click to input`,
                        type: tableType,
                        display_order: 0
                    }
                ]
            }
            return newDocTableData;
        });
    }

    // Handler for deleting row
    const handleDocDeleteRow = (deleteRowSerialID, swotType) => {

        console.log(docEditTableData);
        setDocEditTableData((prevDocTableData) => {

            // Remove deleted row from specific swot type array
            const newSwotTypeTableData = prevDocTableData[swotType].filter((dataElem) => {
                return dataElem.serialNo !== deleteRowSerialID;
            });
            console.log(newSwotTypeTableData);

            // Update serial no.
            const formattedSwotTypeTableData = newSwotTypeTableData.map((dataElem, index) => {
                return ({
                    ...dataElem,
                    serialNo: index + 1
                });
            });
            console.log(formattedSwotTypeTableData);

            // final formatted data with previous data
            const formattedDocTableData = {
                ...prevDocTableData,
                [swotType]: formattedSwotTypeTableData
            }
            console.log(formattedDocTableData);

            return formattedDocTableData;
        });
    }

    return (
        <div className="c-SWOT__Document-content c-Document">
            {
                tabSettings.secondTab === TAB.NULL ?
                    isEditor ?
                        !startNewDoc ?
                            <>
                                {/* Header */}
                                <div className="c-Document__New">
                                    <h1>There are no existing documents</h1>
                                    <button onClick={handleStartNewDocBtn} type="button" className="c-Btn c-Btn--primary">Start new document</button>
                                </div>
                            </>
                            :
                            <>
                                {/* Document Header Info */}
                                <div className="c-Swot__Document-header c-Document__Header">
                                    <div className="c-Swot__Document-header--left c-Document__Header--left">
                                        <p>To be Approved by:</p>
                                        <p>Submitted by:</p>
                                    </div>
                                    <div className="c-Swot__Document-header--right c-Document__Header--right">
                                        <select type="text" name="approvedBy" onChange={handleInputChange} value={docEditHeaderData.approvedBy || 'Error'}>
                                            <option>{!approverList ? "No approver found!" : "Please select an approver"}</option>
                                            {!approverList ? null : approverList.map((approver, index) => (
                                                <option key={index} value={approver.approvalID}>
                                                    {approver.displayName}  {approver.username}
                                                </option>
                                            ))}
                                        </select>
                                        <input type="text" readOnly name="submittedBy" value={docEditHeaderData.submittedBy || 'Error'} />
                                    </div>
                                </div>
                                <div className="c-Swot__Tables--edit">
                                    {/* Swot table section */}
                                    <SwotItems header="Strengths">
                                        <BootstrapTable
                                            bordered={false}
                                            keyField='serialNo'
                                            data={docEditTableData.strength}
                                            columns={docEditingColumns}
                                            cellEdit={cellEditFactory({ mode: 'click', blurToSave: true })}
                                        />
                                        {/* Add new row */}
                                        <div className="c-Swot__Add-row" onClick={() => (handleDocAddRow("strength"))}>
                                            <h2>Add new row</h2>
                                        </div>
                                    </SwotItems>
                                    <SwotItems header="Weaknesses">
                                        <BootstrapTable
                                            bordered={false}
                                            keyField='serialNo'
                                            data={docEditTableData.weakness}
                                            columns={docEditingColumns}
                                            cellEdit={cellEditFactory({ mode: 'click', blurToSave: true })}
                                        />
                                        {/* Add new row */}
                                        <div className="c-Swot__Add-row" onClick={() => (handleDocAddRow("weakness"))}>
                                            <h2>Add new row</h2>
                                        </div>
                                    </SwotItems>
                                    <SwotItems header="Opportunities">
                                        <BootstrapTable
                                            bordered={false}
                                            keyField='serialNo'
                                            data={docEditTableData.opp}
                                            columns={docEditingColumns}
                                            cellEdit={cellEditFactory({ mode: 'click', blurToSave: true })}
                                        />
                                        {/* Add new row */}
                                        <div className="c-Swot__Add-row" onClick={() => (handleDocAddRow("opp"))}>
                                            <h2>Add new row</h2>
                                        </div>
                                    </SwotItems>
                                    <SwotItems header="Threats">
                                        <BootstrapTable
                                            bordered={false}
                                            keyField='serialNo'
                                            data={docEditTableData.threat}
                                            columns={docEditingColumns}
                                            cellEdit={cellEditFactory({ mode: 'click', blurToSave: true })}
                                        />
                                        {/* Add new row */}
                                        <div className="c-Swot__Add-row" onClick={() => (handleDocAddRow("threat"))}>
                                            <h2>Add new row</h2>
                                        </div>
                                    </SwotItems>
                                </div>
                            </>
                        :
                        <>
                            <div className="c-Document__New">
                                <h1>There are no existing documents</h1>
                                <p>You do not have permission to start new documents</p>
                            </div>
                        </>
                    :
                    <div className="c-Document__New">
                        <h1>There is one pending/rejected document</h1>
                        <p>Please proceed by resolving the pending/rejected document</p>
                    </div>
            }
        </div>
    )
}

export default SwotInactive;