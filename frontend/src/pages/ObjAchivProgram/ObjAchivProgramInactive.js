import React, { useState, useEffect } from 'react';
import { getUserDisplayName, getUserCompanyID, getToken } from '../../utilities/localStorageUtils';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import { TAB } from '../../config/enums';
import ObjAchivProgramItem from '../../common/ObjAchivProgramItem';
import TokenManager from '../../utilities/tokenManager';



const ObjAchivProgramInactive = ({
    docEditTableData,
    setDocEditTableData,
    docEditHeaderData,
    setDocEditHeaderData,
    docHeaderData,
    docTableData,
    docKeyfield,
    tabSettings,
    startNewDoc,
    setStartNewDoc,
    tempFileArr,
    setTempFileArr }) => {

    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userDisplayName = decodedToken.display_name;
    const userID = decodedToken.employee_id;
    const [personelResponsibleList, setPersonelResponsibleList] = useState([]);

    // State declarations
    const [approverList, setApproverList] = useState([]);
    const [isEditor, setIsEditor] = useState(false);

    useEffect(() => {
        setDocEditTableData(() => {
            return docTableData.map((data, index) => ({
                ...data,
                files: (() => {
                    console.log(data);
                    return data.data.map((fileData, fileIndex) => {
                        console.log(fileData);
                        return {
                            ...fileData.file,
                            new: false,
                            serialNo: fileIndex + 1
                        }
                    });
                })()
            }));
        });
        setDocEditHeaderData(() => ({
            submittedBy: `${userDisplayName}`
        }));
        setTempFileArr(() => []);
        // Do axios call to find out the company roles
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/roles`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res);
                if (res.data.results !== undefined) {
                    setPersonelResponsibleList(() => {
                        return res.data.results.map((data, index) => {
                            return data;
                        });
                    });
                }

                console.log(personelResponsibleList);
            })
            .catch((err) => {
                console.log(err);
            });
        // Do axios call here to get approval list then set approved by who
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/approve/m06_02/employees`, {
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
        axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/edit/m06_02/employees`, {
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
        console.log(event.target.value);
        console.log(event.target.name);
        setDocEditHeaderData((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    };
    console.log(docEditHeaderData);

    // add new role
    const handleDocAddRow = () => {
        setDocEditTableData((prevState) => {
            let newDocTableData = [...prevState, {
                serialNo: prevState.length + 1,
                function: "",
                quality_objective: "",
                personel_responsible: undefined,
                data: [],
                files: [],
                data_collection: "",
                data_analysis: "",
                display_order: prevState.length + 1
            }];
            return newDocTableData;
        });
    }

    return (
        <div className="c-Obj-Achiv-Program__Document-content c-Document">
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
                                <div className="l-Obj-Achiv-Program__Document-title">
                                    <input placeholder="Title" type="text" name="title" onChange={handleInputChange} value={docEditHeaderData.title || ''} />
                                </div>
                                {/* Document Header Info */}
                                <div className="c-Obj-Achiv-Program__Document-header c-Document__Header">
                                    <div className="c-Obj-Achiv-Program__Document-header--left c-Document__Header--left">
                                        <p>Approved by:</p>
                                        <p>Submitted by:</p>
                                    </div>
                                    <div className="c-Obj-Achiv-Program__Document-header--right c-Document__Header--right">
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
                                {/* Map through an array to display ObjAchivProgramItem */}
                                {docEditTableData.map((data, index) => (
                                    <ObjAchivProgramItem
                                        key={index}
                                        docType="edit"
                                        itemContent={data}
                                        itemIndex={index}
                                        setDocEditTableData={setDocEditTableData}
                                        docEditHeaderData={docEditHeaderData}
                                        docEditTableData={docEditTableData}
                                        tempFileArr={tempFileArr}
                                        setTempFileArr={setTempFileArr}
                                        personelResponsibleList={personelResponsibleList}
                                    />
                                ))
                                }
                                {/* Add row */}
                                <div className="c-Obj-Achiv-Program__Add-row" onClick={handleDocAddRow}>
                                    <h2>Add new row</h2>
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

export default ObjAchivProgramInactive;