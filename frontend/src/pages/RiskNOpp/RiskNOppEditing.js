import React, { useState, useEffect } from 'react';
import RiskNOppItem from '../../common/RiskNOppItem';
import axios from 'axios';
import { getUserDisplayName, getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import TokenManager from '../../utilities/tokenManager';

const RiskNOppEditing = ({
    docEditTableData,
    setDocEditTableData,
    docEditHeaderData,
    setDocEditHeaderData,
    docHeaderData,
    docTableData
}) => {     // start of RiskNOppEditing
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const [approverList, setApprovalList] = useState([]);
    const userDisplayName =decodedToken.display_name;
    useEffect(() => {
        setDocEditHeaderData(() => ({
            ...docHeaderData,
            submittedBy: `${userDisplayName}`
        }));

        setDocEditTableData(() => (docTableData));
        // Do axios call here to get approval list then set approved by who
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m06_01/employees`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                const approvalListData = res.data.results;
                setApprovalList(() => {
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
                console.log(err);
            });
    }, [docTableData]);

    const handleInputChange = (event) => {
        setDocEditHeaderData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    };

    return (
        <div className="c-RNO__Document-content c-Document">
            {/* Title */}
            <div className="l-RNO__Document-title">
                <input placeholder="Title" type="text" name="title" onChange={handleInputChange} value={docEditHeaderData.title || ''} />
            </div>
            {/* Document Header info */}
            <div className="c-RNO__Document-header c-Document__Header">
                <div className="c-RNO__Document-header--left c-Document__Header--left">
                    <p>To be Approved by:</p>
                    <p>Submitted by:</p>
                </div>
                <div className="c-RNO__Document-header--right c-Document__Header--right">
                    <select type="text" name="approvedBy" onChange={handleInputChange} value={docEditHeaderData.approvedBy || ''}>
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
            {/* Table section */}
            <div className="c-RNO__Table">
                <h1>Strengths</h1>
                {docEditTableData.length !== 0 ? docEditTableData.strength.map((strengthData, index) => {
                    return (
                        <RiskNOppItem
                            key={index}
                            docType="edit"
                            rnoType="strength"
                            rnoItemData={strengthData}
                            rnoItemIndex={index}
                            docEditTableData={docEditTableData}
                            setDocEditTableData={setDocEditTableData}
                        />
                    );
                })
                    :
                    null
                }
                <h1>Weakness</h1>
                {docEditTableData.length !== 0 ? docEditTableData.weakness.map((weaknessData, index) => {
                    return (
                        <RiskNOppItem
                            key={index}
                            docType="edit"
                            rnoType="weakness"
                            rnoItemData={weaknessData}
                            rnoItemIndex={index}
                            docEditTableData={docEditTableData}
                            setDocEditTableData={setDocEditTableData}
                        />
                    );
                })
                    :
                    null
                }
                <h1>Opportunities</h1>
                {docEditTableData.length !== 0 ? docEditTableData.opp.map((oppData, index) => {
                    return (
                        <RiskNOppItem
                            key={index}
                            docType="edit"
                            rnoType="opp"
                            rnoItemData={oppData}
                            rnoItemIndex={index}
                            docEditTableData={docEditTableData}
                            setDocEditTableData={setDocEditTableData}
                        />
                    );
                })
                    :
                    null
                }
                <h1>Threats</h1>
                {docEditTableData.length !== 0 ? docEditTableData.threat.map((threatData, index) => {
                    return (
                        <RiskNOppItem
                            key={index}
                            docType="edit"
                            rnoType="threat"
                            rnoItemData={threatData}
                            rnoItemIndex={index}
                            docEditTableData={docEditTableData}
                            setDocEditTableData={setDocEditTableData}
                        />
                    );
                })
                    :
                    null
                }
            </div>
        </div>
    
    );
}

export default RiskNOppEditing;