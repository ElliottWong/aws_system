import React, { useState, useRef } from 'react';
import axios from 'axios';
import { getToken } from '../utilities/localStorageUtils';
import { confirmAlert } from 'react-confirm-alert';
import { TAB } from '../config/enums';
// import { btnEndpointsListObj, tabEndpointsListObj } from '../config/endpointsListObj';
import useEndpoints from '../hooks/useEndpoints';
import { toast } from 'react-toastify';
import jwt_decode from "jwt-decode";
import { convertToRaw } from 'draft-js';
import CustomConfirmAlert from './CustomConfirmAlert';
import TokenManager from "../utilities/tokenManager";


const DocumentBtnSection = ({
    setQueryUrl,
    setTabSettings,
    tabSettings,
    docEditTableData,
    docEditHeaderData,
    docPendingTableData,
    docPendingHeaderData,
    docRejectedHeaderData,
    pageType,
    isApprover,
    isEditor,
    docQueryEnum,
    setDocQueryEnum,
    editorState,
    setEditorState,
    tempFileArr,
    startNewDoc,
    setStartNewDoc }) => { // Start of DocumentBtnSection
    const [btnEndpointsListObj, tabEndpointsListObj] = useEndpoints({TokenManager});

    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userID = decodedToken.employee_id;

    const rejectRemarks = useRef("");
    // Handler for document action buttons
    const handleDocActionBtns = (btnType) => {
        console.log(docEditTableData)
        if (btnType === "edit") {
            setTabSettings(() => ({
                firstTab: TAB.ACTIVE,
                secondTab: TAB.EDITING,
                focusTabIndex: 1
            }));
        } else if (btnType === "editSubmit") {
            console.log(docEditHeaderData);
            // Validation check
            if (docEditHeaderData.approvedBy === undefined || isNaN(docEditHeaderData.approvedBy)) {
                console.log("Error! No approver selected!");
                toast.error(<>Error!<br />Message: <b>Please select an approver!</b></>);
                return;
            }


            let editSubmitAxiosReqData = {};
            let editSubmitUrl = "";
            if (pageType === "swot") {
                editSubmitAxiosReqData = {
                    strengths: docEditTableData.strength.map((row) => ({
                        ...row,
                        parent_item_id: (() => {
                            // If this submit button request came from a rejected tab, then use the current row's parent item id instead of its own id.
                            if (docQueryEnum === "rejected") {
                                return row.parentItemID;
                            } else {
                                return row.id;
                            }

                        })()
                    })),
                    weaknesses: docEditTableData.weakness.map((row) => ({
                        ...row,
                        parent_item_id: (() => {
                            console.log("docQueryEnum:" + docQueryEnum);
                            if (docQueryEnum === "rejected") {
                                return row.parentItemID;
                            } else {
                                return row.id;
                            }

                        })()
                    })),
                    opportunities: docEditTableData.opp.map((row) => ({
                        ...row,
                        parent_item_id: (() => {
                            if (docQueryEnum === "rejected") {
                                return row.parentItemID;
                            } else {
                                return row.id;
                            }
                        })()
                    })),
                    threats: docEditTableData.threat.map((row) => ({
                        ...row,
                        parent_item_id: (() => {
                            if (docQueryEnum === "rejected") {
                                return row.parentItemID;
                            } else {
                                return row.id;
                            }
                        })()
                    })),
                    approved_by: parseInt(docEditHeaderData.approvedBy)
                }
                editSubmitUrl = btnEndpointsListObj.swot.editSubmit;
            }
            else if (pageType === "interestedParty") {
                editSubmitAxiosReqData = {
                    approved_by: docEditHeaderData.approvedBy,
                    title: docEditHeaderData.title,
                    interested_parties: docEditTableData.map((row) => ({
                        interested_party: row.interested_parties,
                        expectations: row.needs_n_expectations,
                        display_order: row.serialNo,
                        parent_item_id: (() => {
                            // If this submit button request came from a rejected tab, then use the current row's parent item id instead of its own id.
                            if (docQueryEnum === "rejected") {
                                return row.parentItemID;
                            } else {
                                return row.id;
                            }
                        })()
                    }))
                }
                editSubmitUrl = btnEndpointsListObj.interestedParty.editSubmit;
            }
            else if (pageType === "scopeOfQMS") {
                // console.log(JSON.stringify(convertToRaw(editorState.getCurrentContent())));
                editSubmitAxiosReqData = {
                    approved_by: docEditHeaderData.approvedBy,
                    title: docEditHeaderData.title,
                    content: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
                    boundaries: docEditTableData.map((row) => ({
                        site_name: row.site_name,
                        site_scope: row.site_scope,
                        address: row.site_address,
                        display_order: row.serialNo,
                        parent_item_id: (() => {
                            // If this submit button request came from a rejected tab, then use the current row's parent item id instead of its own id.
                            if (docQueryEnum === "rejected") {
                                return row.parentItemID;
                            } else {
                                return row.id;
                            }

                        })()
                    }))
                }
                editSubmitUrl = btnEndpointsListObj.scopeOfQMS.editSubmit;
            }
            else if (pageType === "companyPolicy") {
                editSubmitAxiosReqData = {
                    approved_by: docEditHeaderData.approvedBy,
                    title: docEditHeaderData.title,
                    policies: docEditTableData.map((row, index) => ({
                        title: row.title,
                        content: row.content,
                        display_order: index + 1,
                        parent_item_id: (() => {
                            // If this submit button request came from a rejected tab, then use the current row's parent item id instead of its own id.
                            if (docQueryEnum === "rejected") {
                                return row.parentItemID;
                            } else {
                                return row.id;
                            }
                        })()
                    }))
                }
                editSubmitUrl = btnEndpointsListObj.companyPolicy.editSubmit;
            }
            else if (pageType === "respNAuth") {

            }
            else if (pageType === "riskNOpp") {
                editSubmitAxiosReqData = {
                    approved_by: docEditHeaderData.approvedBy,
                    title: docEditHeaderData.title,
                    strengths: docEditTableData.strength.map((row) => ({
                        ...row,
                        parent_item_id: (() => {
                            // If this submit button request came from a rejected tab, then use the current row's parent item id instead of its own id.
                            if (docQueryEnum === "rejected") {
                                return row.parentItemID;
                            } else {
                                return row.id;
                            }

                        })(),
                        action: (() => {
                            if (row.rpn < 12 || row.rpn === null || isNaN(row.rpn)) {
                                return null;
                            } else {
                                return row.action;
                            }
                        })()
                    })),
                    weaknesses: docEditTableData.weakness.map((row) => ({
                        ...row,
                        parent_item_id: (() => {
                            if (docQueryEnum === "rejected") {
                                return row.parentItemID;
                            } else {
                                return row.id;
                            }

                        })(),
                        action: (() => {
                            if (row.rpn < 12 || row.rpn === null || isNaN(row.rpn)) {
                                return null;
                            } else {
                                return row.action;
                            }
                        })()
                    })),
                    opportunities: docEditTableData.opp.map((row) => ({
                        ...row,
                        parent_item_id: (() => {
                            if (docQueryEnum === "rejected") {
                                return row.parentItemID;
                            } else {
                                return row.id;
                            }
                        })(),
                        action: (() => {
                            if (row.rpn < 12 || row.rpn === null || isNaN(row.rpn)) {
                                return null;
                            } else {
                                return row.action;
                            }
                        })()
                    })),
                    threats: docEditTableData.threat.map((row) => ({
                        ...row,
                        parent_item_id: (() => {
                            if (docQueryEnum === "rejected") {
                                return row.parentItemID;
                            } else {
                                return row.id;
                            }
                        })(),
                        action: (() => {
                            if (row.rpn < 12 || row.rpn === null || isNaN(row.rpn)) {
                                return null;
                            } else {
                                return row.action;
                            }
                        })()
                    })),
                }
                editSubmitUrl = btnEndpointsListObj.riskNOpp.editSubmit;
            }
            else if (pageType === "objAchivProgram") {
                let missingPersonelResponsible = false;
                docEditTableData.forEach((data, index) => {
                    if (data.personel_responsible === undefined || isNaN(data.personel_responsible)) {
                        missingPersonelResponsible = true;
                    }
                });
                if (missingPersonelResponsible) {
                    toast.error(<>Error!<br />Message: <b>Please select a personel responsible for all items!</b></>);
                    return;
                }
                const objAchivFormData = new FormData();
                objAchivFormData.append("approved_by", docEditHeaderData.approvedBy);
                objAchivFormData.append("title", docEditHeaderData.title);
                objAchivFormData.append("achievements", JSON.stringify(docEditTableData));

                for (let i = 0; i < tempFileArr.length; i++) {
                    objAchivFormData.append(tempFileArr[i].key, tempFileArr[i].fileObj);
                };

                editSubmitUrl = btnEndpointsListObj.objAchivProgram.editSubmit;
                // obj achiv program has its own axios call
                axios.post(editSubmitUrl, objAchivFormData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                })
                    .then((res) => {
                        console.log(res);
                        toast.success(<>Success!<br />Message: <b>Document submitted for approval!</b></>);
                        setQueryUrl({
                            firstUrl: tabEndpointsListObj.objAchivProgram.active,
                            secondUrl: tabEndpointsListObj.objAchivProgram.getAll,
                        });
                        setTabSettings(() => ({
                            firstTab: TAB.ACTIVE,
                            secondTab: TAB.PENDING,
                            focusTabIndex: 0
                        }));
                        setDocQueryEnum(() => ('active'));
                    })
                    .catch((err) => {
                        console.log(err);
                        let errCode = "Error!";
                        let errMsg = "Error!"
                        if (err.response !== undefined) {
                            errCode = err.response.status;
                            errMsg = err.response.data.message;
                        }

                        toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                    });
                // end here for obj achiv program
                return;
            }

            axios.post(editSubmitUrl, editSubmitAxiosReqData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json;charset=UTF-8',
                }
            })
                .then((res) => {
                    toast.success(<>Success!<br />Message: <b>Document submitted for approval!</b></>);
                    if (pageType === "swot") {
                        setQueryUrl({
                            firstUrl: tabEndpointsListObj.swot.active,
                            secondUrl: tabEndpointsListObj.swot.getAll,
                        });
                    } else if (pageType === "interestedParty") {
                        setQueryUrl({
                            firstUrl: tabEndpointsListObj.interestedParty.active,
                            secondUrl: tabEndpointsListObj.interestedParty.getAll,
                        });
                    } else if (pageType === "scopeOfQMS") {
                        setQueryUrl({
                            firstUrl: tabEndpointsListObj.scopeOfQMS.active,
                            secondUrl: tabEndpointsListObj.scopeOfQMS.getAll
                        })
                    } else if (pageType === "companyPolicy") {
                        setQueryUrl({
                            firstUrl: tabEndpointsListObj.companyPolicy.active,
                            secondUrl: tabEndpointsListObj.companyPolicy.getAll
                        })
                    } else if (pageType === "riskNOpp") {
                        setQueryUrl({
                            firstUrl: tabEndpointsListObj.riskNOpp.active,
                            secondUrl: tabEndpointsListObj.riskNOpp.getAll,
                        });
                    }
                    setTabSettings(() => ({
                        firstTab: TAB.ACTIVE,
                        secondTab: TAB.PENDING,
                        focusTabIndex: 0
                    }));
                    setDocQueryEnum(() => ('active'));
                    setStartNewDoc(() => false)
                })
                .catch((err) => {
                    console.error(err);
                    const errCode = err.response.status;
                    const errMsg = err.response.data.message;
                    toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                });


        } else if (btnType === "editCancel") {
            // Check if there is currently a rejected document
            if (docQueryEnum === "rejected") {
                if (pageType === "swot") {
                    setQueryUrl({
                        firstUrl: tabEndpointsListObj.swot.rejected,
                        secondUrl: tabEndpointsListObj.swot.getAll,
                    });
                } else if (pageType === "interestedParty") {
                    setQueryUrl({
                        firstUrl: tabEndpointsListObj.interestedParty.rejected,
                        secondUrl: tabEndpointsListObj.interestedParty.getAll,
                    });
                } else if (pageType === "scopeOfQMS") {
                    setQueryUrl({
                        firstUrl: tabEndpointsListObj.scopeOfQMS.rejected,
                        secondUrl: tabEndpointsListObj.scopeOfQMS.getAll,
                    });
                } else if (pageType === "companyPolicy") {
                    setQueryUrl({
                        firstUrl: tabEndpointsListObj.companyPolicy.rejected,
                        secondUrl: tabEndpointsListObj.companyPolicy.getAll,
                    });
                } else if (pageType === "riskNOpp") {
                    setQueryUrl({
                        firstUrl: tabEndpointsListObj.riskNOpp.rejected,
                        secondUrl: tabEndpointsListObj.riskNOpp.getAll,
                    });
                } else if (pageType === "objAchivProgram") {
                    setQueryUrl({
                        firstUrl: tabEndpointsListObj.objAchivProgram.rejected,
                        secondUrl: tabEndpointsListObj.objAchivProgram.getAll,
                    });
                }
                setTabSettings(() => ({
                    firstTab: TAB.ACTIVE,
                    secondTab: TAB.REJECTED,
                    focusTabIndex: 1
                }));
                setDocQueryEnum(() => ('rejected'));
            } else {
                if (pageType === "swot") {
                    setQueryUrl({
                        firstUrl: tabEndpointsListObj.swot.active,
                        secondUrl: tabEndpointsListObj.swot.getAll,
                    });
                } else if (pageType === "interestedParty") {
                    setQueryUrl({
                        firstUrl: tabEndpointsListObj.interestedParty.active,
                        secondUrl: tabEndpointsListObj.interestedParty.getAll,
                    });
                } else if (pageType === "scopeOfQMS") {
                    setQueryUrl({
                        firstUrl: tabEndpointsListObj.scopeOfQMS.active,
                        secondUrl: tabEndpointsListObj.scopeOfQMS.getAll,
                    });
                } else if (pageType === "companyPolicy") {
                    setQueryUrl({
                        firstUrl: tabEndpointsListObj.companyPolicy.active,
                        secondUrl: tabEndpointsListObj.companyPolicy.getAll,
                    });
                } else if (pageType === "riskNOpp") {
                    setQueryUrl({
                        firstUrl: tabEndpointsListObj.riskNOpp.active,
                        secondUrl: tabEndpointsListObj.riskNOpp.getAll,
                    });
                } else if (pageType === "objAchivProgram") {
                    setQueryUrl({
                        firstUrl: tabEndpointsListObj.objAchivProgram.active,
                        secondUrl: tabEndpointsListObj.objAchivProgram.getAll,
                    });
                }

                setTabSettings(() => ({
                    firstTab: TAB.ACTIVE,
                    secondTab: TAB.NULL,
                    focusTabIndex: 0
                }));
                setDocQueryEnum(() => ('active'));
            }
        } else if (btnType === "rejectedEdit") {
            console.log("edit btn click");
            if (pageType === "swot") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.swot.rejected,
                    secondUrl: tabEndpointsListObj.swot.getAll,
                });
            } else if (pageType === "interestedParty") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.interestedParty.rejected,
                    secondUrl: tabEndpointsListObj.interestedParty.getAll,
                });
            } else if (pageType === "scopeOfQMS") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.scopeOfQMS.rejected,
                    secondUrl: tabEndpointsListObj.scopeOfQMS.getAll,
                });
            } else if (pageType === "companyPolicy") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.companyPolicy.rejected,
                    secondUrl: tabEndpointsListObj.companyPolicy.getAll,
                });
            } else if (pageType === "riskNOpp") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.riskNOpp.rejected,
                    secondUrl: tabEndpointsListObj.riskNOpp.getAll,
                });
            } else if (pageType === "objAchivProgram") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.objAchivProgram.rejected,
                    secondUrl: tabEndpointsListObj.objAchivProgram.getAll,
                });
            }

            setTabSettings(() => ({
                firstTab: TAB.ACTIVE,
                secondTab: TAB.EDITING,
                focusTabIndex: 1
            }));
            setDocQueryEnum(() => ('rejected'));
        } else if (btnType === "rejectedDelete") {
            // Confirmation dialogue for deleting rejected document
            const message = `Are you sure you want to delete this document? Click confirm to proceed.`;
            const handler = (onClose) => handleRejectDelete(onClose);
            const heading = `Confirm Delete?`;
            const type = "alert"
            const data = {
                message,
                handler,
                heading,
                type
            };
            confirmAlert({
                customUI: ({ onClose }) => {
                    return <CustomConfirmAlert {...data} onClose={onClose} />;
                }
            });

            // Deleting document from the client side doesn't actually delete the dataset in the database
            // We are merely marking the table row that's deleted as deleted by setting "deleted_at" column with a value
            const handleRejectDelete = (onClose) => {
                let rejectedDeleteUrl = "";

                if (pageType === "swot") {
                    rejectedDeleteUrl = btnEndpointsListObj.swot.rejectedDelete + docRejectedHeaderData.docID;
                } else if (pageType === "interestedParty") {
                    rejectedDeleteUrl = btnEndpointsListObj.interestedParty.rejectedDelete + docRejectedHeaderData.docID;
                } else if (pageType === "scopeOfQMS") {
                    rejectedDeleteUrl = btnEndpointsListObj.scopeOfQMS.rejectedDelete + docRejectedHeaderData.docID;
                } else if (pageType === "companyPolicy") {
                    rejectedDeleteUrl = btnEndpointsListObj.companyPolicy.rejectedDelete + docRejectedHeaderData.docID;
                } else if (pageType === "riskNOpp") {
                    rejectedDeleteUrl = btnEndpointsListObj.riskNOpp.rejectedDelete + docRejectedHeaderData.docID;
                } else if (pageType === "objAchivProgram") {
                    rejectedDeleteUrl = btnEndpointsListObj.objAchivProgram.rejectedDelete + docRejectedHeaderData.docID;

                }

                axios.delete(rejectedDeleteUrl, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                    .then((res) => {
                        toast.success(<>Success!<br />Message: <b>Rejected document has been deleted!</b></>);
                        onClose();
                        if (pageType === "swot") {
                            setQueryUrl({
                                firstUrl: tabEndpointsListObj.swot.active,
                                secondUrl: tabEndpointsListObj.swot.getAll,
                            });
                        } else if (pageType === "interestedParty") {
                            setQueryUrl({
                                firstUrl: tabEndpointsListObj.interestedParty.active,
                                secondUrl: tabEndpointsListObj.interestedParty.getAll,
                            });
                        } else if (pageType === "scopeOfQMS") {
                            setQueryUrl({
                                firstUrl: tabEndpointsListObj.scopeOfQMS.active,
                                secondUrl: tabEndpointsListObj.scopeOfQMS.getAll,
                            });
                        } else if (pageType === "companyPolicy") {
                            setQueryUrl({
                                firstUrl: tabEndpointsListObj.companyPolicy.active,
                                secondUrl: tabEndpointsListObj.companyPolicy.getAll,
                            });
                        } else if (pageType === "riskNOpp") {
                            setQueryUrl({
                                firstUrl: tabEndpointsListObj.riskNOpp.active,
                                secondUrl: tabEndpointsListObj.riskNOpp.getAll,
                            });
                        } else if (pageType === "objAchivProgram") {
                            setQueryUrl({
                                firstUrl: tabEndpointsListObj.objAchivProgram.active,
                                secondUrl: tabEndpointsListObj.objAchivProgram.getAll,
                            });
                        }
                        setTabSettings(() => ({
                            firstTab: TAB.ACTIVE,
                            secondTab: TAB.NULL,
                            focusTabIndex: 0
                        }));
                        setDocQueryEnum(() => ('active'));
                    })
                    .catch((err) => {
                        console.log(err);
                        onClose();
                        let errCode = "Error!";
                        let errMsg = "Error!"
                        if (err.response !== undefined) {
                            errCode = err.response.status;
                            errMsg = err.response.data.message;
                        }

                        toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                    });
            };

        } else if (btnType === "pendingApprove") {
            let pendingApproveUrl = "";


            if (pageType === "swot") {
                pendingApproveUrl = btnEndpointsListObj.swot.pendingApprove + docPendingHeaderData.docID;
            } else if (pageType === "interestedParty") {
                pendingApproveUrl = btnEndpointsListObj.interestedParty.pendingApprove + docPendingHeaderData.docID;
            } else if (pageType === "scopeOfQMS") {
                pendingApproveUrl = btnEndpointsListObj.scopeOfQMS.pendingApprove + docPendingHeaderData.docID;
            } else if (pageType === "companyPolicy") {
                pendingApproveUrl = btnEndpointsListObj.companyPolicy.pendingApprove + docPendingHeaderData.docID;
            } else if (pageType === "riskNOpp") {
                pendingApproveUrl = btnEndpointsListObj.riskNOpp.pendingApprove + docPendingHeaderData.docID;
            } else if (pageType === "objAchivProgram") {
                pendingApproveUrl = btnEndpointsListObj.objAchivProgram.pendingApprove + docPendingHeaderData.docID;
            }

            axios.put(pendingApproveUrl, {}, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .then((res) => {
                    if (pageType === "swot") {
                        setQueryUrl({
                            firstUrl: tabEndpointsListObj.swot.active,
                            secondUrl: tabEndpointsListObj.swot.getAll,
                        });
                    } else if (pageType === "interestedParty") {
                        setQueryUrl({
                            firstUrl: tabEndpointsListObj.interestedParty.active,
                            secondUrl: tabEndpointsListObj.interestedParty.getAll,
                        });
                    } else if (pageType === "scopeOfQMS") {
                        setQueryUrl({
                            firstUrl: tabEndpointsListObj.scopeOfQMS.active,
                            secondUrl: tabEndpointsListObj.scopeOfQMS.getAll,
                        });
                    } else if (pageType === "companyPolicy") {
                        setQueryUrl({
                            firstUrl: tabEndpointsListObj.companyPolicy.active,
                            secondUrl: tabEndpointsListObj.companyPolicy.getAll,
                        });
                    } else if (pageType === "riskNOpp") {
                        setQueryUrl({
                            firstUrl: tabEndpointsListObj.riskNOpp.active,
                            secondUrl: tabEndpointsListObj.riskNOpp.getAll,
                        });
                    } else if (pageType === "objAchivProgram") {
                        setQueryUrl({
                            firstUrl: tabEndpointsListObj.objAchivProgram.active,
                            secondUrl: tabEndpointsListObj.objAchivProgram.getAll,
                        });
                    }
                    toast.success(<>Success!<br />Message: <b>Document approved!</b></>);
                    setTabSettings(() => ({
                        firstTab: TAB.ACTIVE,
                        secondTab: TAB.NULL,
                        focusTabIndex: 0
                    }));
                    setDocQueryEnum(() => ('active'));
                })
                .catch((err) => {
                    console.log(err);
                    const errCode = err.response.status || "N.a.";
                    const errMsg = err.response.data.message || "N.a.";
                    toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                });

        } else if (btnType === "pendingReject") {

            const handleRejectPendingDocument = (onClose) => {

                const pendingRejectAxiosReqData = {
                    remarks: rejectRemarks.current.value
                }

                let pendingRejectUrl = "";

                if (pageType === "swot") {
                    pendingRejectUrl = btnEndpointsListObj.swot.pendingReject + docPendingHeaderData.docID;
                } else if (pageType === "interestedParty") {
                    pendingRejectUrl = btnEndpointsListObj.interestedParty.pendingReject + docPendingHeaderData.docID;
                } else if (pageType === "scopeOfQMS") {
                    pendingRejectUrl = btnEndpointsListObj.scopeOfQMS.pendingReject + docPendingHeaderData.docID;
                } else if (pageType === "companyPolicy") {
                    pendingRejectUrl = btnEndpointsListObj.companyPolicy.pendingReject + docPendingHeaderData.docID;
                } else if (pageType === "riskNOpp") {
                    pendingRejectUrl = btnEndpointsListObj.riskNOpp.pendingReject + docPendingHeaderData.docID;
                } else if (pageType === "objAchivProgram") {
                    pendingRejectUrl = btnEndpointsListObj.objAchivProgram.pendingReject + docPendingHeaderData.docID;
                }

                axios.put(pendingRejectUrl, pendingRejectAxiosReqData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                    .then((res) => {
                        onClose();
                        if (pageType === "swot") {
                            setQueryUrl({
                                firstUrl: tabEndpointsListObj.swot.rejected,
                                secondUrl: tabEndpointsListObj.swot.getAll,
                            });
                        } else if (pageType === "interestedParty") {
                            setQueryUrl({
                                firstUrl: tabEndpointsListObj.interestedParty.rejected,
                                secondUrl: tabEndpointsListObj.interestedParty.getAll,
                            });
                        } else if (pageType === "scopeOfQMS") {
                            setQueryUrl({
                                firstUrl: tabEndpointsListObj.scopeOfQMS.rejected,
                                secondUrl: tabEndpointsListObj.scopeOfQMS.getAll,
                            });
                        } else if (pageType === "companyPolicy") {
                            setQueryUrl({
                                firstUrl: tabEndpointsListObj.companyPolicy.rejected,
                                secondUrl: tabEndpointsListObj.companyPolicy.getAll,
                            });
                        } else if (pageType === "riskNOpp") {
                            setQueryUrl({
                                firstUrl: tabEndpointsListObj.riskNOpp.rejected,
                                secondUrl: tabEndpointsListObj.riskNOpp.getAll,
                            });
                        } else if (pageType === "objAchivProgram") {
                            setQueryUrl({
                                firstUrl: tabEndpointsListObj.objAchivProgram.rejected,
                                secondUrl: tabEndpointsListObj.objAchivProgram.getAll,
                            });
                        }

                        setTabSettings(() => ({
                            firstTab: TAB.ACTIVE,
                            secondTab: TAB.REJECTED,
                            focusTabIndex: 1
                        }));
                        setDocQueryEnum(() => ('rejected'));
                        toast.success(<>Success!<br />Message: <b>Document has been rejected!</b></>);
                    })
                    .catch((err) => {
                        console.log(err);
                        console.error(err);
                        onClose();
                        const errCode = err.response.status;
                        const errMsg = err.response.data.message;
                        toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                    })
            }
            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                        <div className='c-Confirm-alert c-Confirm-alert--pending-reject'>
                            <h1>Confirm Reject?</h1>
                            <div className="c-Confirm-alert__Remarks">
                                <h2>Remarks</h2>
                                <textarea name="pendingReject" ref={rejectRemarks}></textarea>
                            </div>
                            <div className='c-Confirm-alert__Buttons'>
                                <button className="c-Btn c-Btn--alert" onClick={() => (handleRejectPendingDocument(onClose))}>Confirm Reject</button>
                                <button className="c-Btn c-Btn--dark" onClick={onClose}> Cancel</button>
                            </div>
                        </div>
                    );
                }
            });
        }
    };

    // User focusing on active tab
    if (tabSettings.firstTab === TAB.ACTIVE && tabSettings.focusTabIndex === 0 && isEditor) {
        // Return null if second tab is either pending, rejected or editing
        if (tabSettings.secondTab === TAB.NULL) {
            return (
                <div className="l-IP__Btns">
                    <button key="edit" type="button" onClick={() => (handleDocActionBtns("edit"))} className="c-Btn c-Btn--primary">Edit</button>
                </div>
            )
        } else {
            return null;
        }
    }
    // User on inactive tab with startNewDoc
    else if (tabSettings.firstTab === TAB.INACTIVE && tabSettings.focusTabIndex === 0 && startNewDoc) {
        return (
            <div className="l-IP__Btns">
                <button key="editSubmit" type="button" onClick={() => (handleDocActionBtns("editSubmit"))} className="c-Btn c-Btn--primary" >Submit</button>
                <button key="editCancel" type="button" onClick={() => (setStartNewDoc(() => false))} className="c-Btn c-Btn--cancel">Cancel</button>
            </div>
        )
    }
    // User focusing on editing tab
    else if (tabSettings.secondTab === TAB.EDITING && tabSettings.focusTabIndex === 1) {
        return (
            <>
                <div className="l-IP__Btns">
                    <button key="editSubmit" type="button" onClick={() => (handleDocActionBtns("editSubmit"))} className="c-Btn c-Btn--primary" >Submit</button>
                    <button key="editCancel" type="button" onClick={() => (handleDocActionBtns("editCancel"))} className="c-Btn c-Btn--cancel">Cancel</button>
                </div>
            </>
        )
    }
    // User focusing on rejected tab
    else if (tabSettings.secondTab === TAB.REJECTED && tabSettings.focusTabIndex === 1) {
        if (docRejectedHeaderData.created_by_id === userID) {
            return (
                <div className="l-IP__Btns">
                    <button key="rejectedEdit" type="button" onClick={() => (handleDocActionBtns("rejectedEdit"))} className="c-Btn c-Btn--primary" >Edit</button>
                    <button key="rejectedDelete" type="button" onClick={() => (handleDocActionBtns("rejectedDelete"))} className="c-Btn c-Btn--alert">Delete</button>
                </div>
            );
        } else {
            return null;
        }

    }

    else if (tabSettings.secondTab === TAB.PENDING && tabSettings.focusTabIndex === 1 && isApprover) {
        return (
            <div className="l-IP__Btns">
                {/* TBC Need to do checking of roles to authorise users to have access to this account */}
                <button key="pendingApprove" type="button" onClick={() => (handleDocActionBtns("pendingApprove"))} className="c-Btn c-Btn--ok">Approve</button>
                <button key="pendingReject" type="button" onClick={() => (handleDocActionBtns("pendingReject"))} className="c-Btn c-Btn--alert">Reject</button>
            </div>
        )
    }
    else {
        return null;
    }
}

export default DocumentBtnSection;