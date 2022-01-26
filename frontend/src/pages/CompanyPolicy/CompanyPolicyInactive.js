import axios from 'axios';
import React, { useEffect, useState } from 'react';
import CompanyPolicyItem from '../../common/CompanyPolicyItem';
import { TAB } from '../../config/enums';
import TokenManager from '../../utilities/tokenManager';


const CompanyPolicyInactive = ({
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
            title: "Enter Input",
            content: "Enter input Test"
        }]));
        setDocEditHeaderData(() => ({
            submittedBy: `${userDisplayName}`
        }));
        // Do axios call here to get approval list then set approved by who
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m05_02/employees`, {
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
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m05_02/employees`, {
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
                title: "Enter Input",
                content: "Enter input Test"
            }];
            return newDocTableData;
        });
    };

    return (
        <div className="c-Company-Policy__Document-content c-Document">
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
                                {/* Title */}
                                <div className="l-Company-Policy__Document-title">
                                    <input placeholder="Title" type="text" name="title" onChange={handleInputChange} value={docEditHeaderData.title || ''} />
                                </div>
                                {/* Document Header Info */}
                                <div className="c-Company-Policy__Document-header c-Document__Header">
                                    <div className="c-Company-Policy__Document-header--left c-Document__Header--left">
                                        <p>Approved by:</p>
                                        <p>Submitted by:</p>
                                    </div>
                                    <div className="c-Company-Policy__Document-header--right c-Document__Header--right">
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
                                {/* Company policy cards section */}
                                <div className="c-Company-Policy__Cards">
                                    <p>The quality management system under the scope of ISO 9001:2015 certification applies to:</p>
                                    {docEditTableData.map((data, index) => (
                                        <CompanyPolicyItem
                                            key={index}
                                            itemTitle={data.title}
                                            itemContent={data.content}
                                            itemIndex={index}
                                            docType="editing"
                                            setDocEditTableData={setDocEditTableData}
                                        />
                                    ))
                                    }
                                    {/* Add row */}
                                    <div className="c-Company-Policy__Add-row" onClick={handleDocAddRow}>
                                        <h2>Add new row</h2>
                                    </div>
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

export default CompanyPolicyInactive;