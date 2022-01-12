import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { getUserCompanyID, getToken } from '../utilities/localStorageUtils';
import { toast } from 'react-toastify';
import TokenManager from "../utilities/tokenManager";

const DashboardInfoCards = ({ isEditor, organisationContent, heading, type }) => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken;


    // State declarations
    const [editMode, setEditMode] = useState(false);
    const [tempDisplayData, setTempDisplayData] = useState(undefined);  // Had to create another state for storing formatted display data
    const [tempEditedData, setTempEditedData] = useState(undefined);    // This state is for storing the raw content data

    useEffect(() => {
        if (organisationContent[type] !== undefined && organisationContent[type] !== null) {
            setTempDisplayData(() => {
                if (organisationContent[type].split("\n").length > 1) {
                    return organisationContent[type].split("\n").map((strLine, index) => (<div key={index}>{strLine}<br /></div>));
                }
                return organisationContent[type];
            });
            setTempEditedData(() => organisationContent[type]);
        } else if (organisationContent[type] === null) {
            setTempDisplayData(() => {
                return undefined;
            });
            setTempEditedData(() => {
                return undefined;
            });
        }
    }, [organisationContent]);

    const handleTextareaChange = (event) => {
        setTempEditedData(() => {
            return event.target.value;
        });
        setTempDisplayData(() => {
            if (event.target.value.split("\n").length > 1) {
                return event.target.value.split("\n").map((strLine, index) => (<div key={index}>{strLine}<br /></div>));
            }
            return event.target.value;
        });
    }

    const handleBtnClick = (btnType) => {
        if (btnType === "cancel") {
            setTempEditedData(() => organisationContent[type]);
            setTempDisplayData(() => {
                if (organisationContent[type] !== undefined) {
                    if (organisationContent[type].split("\n").length > 1) {
                        return organisationContent[type].split("\n").map((strLine, index) => (<div key={index}>{strLine}<br /></div>));
                    }
                }

                return organisationContent[type];
            });
        } else if (btnType === "save") {
            let saveUrl;
            if (type === "companyScope") {
                saveUrl = `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/scopes`;
            } else if (type === "companyReferences") {
                saveUrl = `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/references`
            } else if (type === "companyTerms") {
                saveUrl = `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/terms`
            }
            axios.post(saveUrl, {
                content: tempEditedData
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json;charset=UTF-8',
                }
            })
                .then((res) => {
                    console.log(res);
                    toast.success(<>Success!<br />Message: <b>{heading} has been updated!</b></>);
                })
                .catch((err) => {
                    console.log(err);
                    let errCode = "Error!";
                    let errMsg = "Error!"
                    if (err.response !== undefined) {
                        errCode = err.response.status;
                        errMsg = err.response.data.message;
                    }
                    setTempEditedData(() => organisationContent[type]);
                    setTempDisplayData(() => {
                        if (organisationContent[type] !== undefined) {
                            if (organisationContent[type].split("\n").length > 1) {
                                return organisationContent[type].split("\n").map((strLine, index) => (<div key={index}>{strLine}<br /></div>));
                            }
                        }

                        return organisationContent[type];
                    });

                    toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                })
        }
        setEditMode((prevState) => !prevState);
    }

    const renderEditMode = () => {
        return (
            <textarea className="c-Content__Textarea" value={tempEditedData} onChange={handleTextareaChange}></textarea>
        );
    }

    const renderNormalMode = () => {
        if (tempDisplayData) {
            return tempDisplayData;
        } else {
            return "Data not found!";
        }
    }

    console.log(isEditor);
    return (
        <div className="l-Dashboard-Info-Cards">
            <div className="c-Dashboard-Info-Cards">
                {/* Heading */}
                <div className="c-Dashboard-Info-Cards__Heading">
                    {heading ? heading : "Data not found!"}
                    {
                        !isEditor ?
                            null :
                            !editMode ?
                                <button type="button" onClick={() => handleBtnClick("edit")} className="c-Btn c-Btn--link">Edit</button> :
                                null
                    }

                </div>
                {/* Content */}
                <div className="c-Dashboard-Info-Cards__Content">
                    {
                        editMode ?
                            renderEditMode() :
                            renderNormalMode()
                    }
                </div>
                {/* Button section */}
                <div className="c-Dashboard-Info-Cards__Btn">
                    {
                        editMode ?
                            <>
                                <button type="button" onClick={() => handleBtnClick("save")} className="c-Btn c-Btn--primary">Save</button>
                                <button type="button" onClick={() => handleBtnClick("cancel")} className="c-Btn c-Btn--cancel">Cancel</button>
                            </> :
                            null
                    }
                </div>
            </div>
        </div>
    )
}

export default DashboardInfoCards;