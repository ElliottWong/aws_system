import axios from 'axios';
import React, { useEffect, useState } from 'react';
import TokenManager from '../../utilities/tokenManager';


const RiskNOppInactive = ({
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
        console.log(docTableData);
        setDocEditTableData(() => (docTableData));
        setDocEditHeaderData(() => ({
            submittedBy: `${userDisplayName}`
        }));
        // Do axios call here to get approval list then set approved by who
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m06_01/employees`, {
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
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m06_01/employees`, {
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

    return (
        <div className="c-RNO__Document-content c-Document">
            {/* Header */}
            <div className="c-Document__New">
                <h1>There are no existing swot documents</h1>
                <p>Please proceed by having an active swot documents first</p>
            </div>
        </div>

    )
}

export default RiskNOppInactive;