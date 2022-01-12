import React, { useState, useEffect } from 'react';
import CompanyPolicyItem from '../../common/CompanyPolicyItem';
import { getUserDisplayName, getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import axios from 'axios';
import TokenManager from '../../utilities/tokenManager';


const CompanyPolicyEditing = ({
    docEditTableData,
    setDocEditTableData,
    docEditHeaderData,
    setDocEditHeaderData,
    docHeaderData,
    docTableData,
    docColumns,
    docKeyfield
}) => { // start of CompanyPolicyActive
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userDisplayName = decodedToken.display_name;
    // State declaration
    const [approverList, setApproverList] = useState([]);
    useEffect(() => {
        setDocEditTableData(() => [...docTableData]);
        setDocEditHeaderData(() => ({
            ...docHeaderData,
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
                title: "Enter Input",
                content: "Enter input Test"
            }];
            return newDocTableData;
        });
    };

    return (
        <div className="c-Company-Policy__Document-content c-Document">
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
        </div>
    )
}

export default CompanyPolicyEditing;