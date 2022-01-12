import React, { useState, useEffect, useRef } from 'react';

const useEndpoints = ({TokenManager}) => {

    let decodedToken = TokenManager.getDecodedToken();

    const userCompanyID = decodedToken?.company_id;

    const [btnEndpointsListObj, setBtnEndpointsListObj] = useState({
        swot: {
            editSubmit: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swots`,
            pendingApprove: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swot/approve/`,
            pendingReject: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swot/reject/`,
            rejectedEdit: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swot/reject/`,
            rejectedDelete: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swots/`,
        },
        interestedParty: {
            editSubmit: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/interested-parties`,
            pendingApprove: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/interested-party/approve/`,
            pendingReject: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/interested-party/reject/`,
            rejectedEdit: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/interested-party/reject/`,
            rejectedDelete: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/interested-parties/`,
        },
        scopeOfQMS: {
            editSubmit: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/qms-scopes`,
            pendingApprove: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/qms-scope/approve/`,
            pendingReject: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/qms-scope/reject/`,
            rejectedEdit: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/qms-scope/reject/`,
            rejectedDelete: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/qms-scopes/`,
        },
        companyPolicy: {
            editSubmit: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/policies`,
            pendingApprove: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/policy/approve/`,
            pendingReject: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/policy/reject/`,
            rejectedEdit: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/policy/reject/`,
            rejectedDelete: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/policies/`,
        },
        respNAuth: {
    
        },
        riskNOpp: {
            editSubmit: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/risks-analyses`,
            pendingApprove: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/risks-analysis/approve/`,
            pendingReject: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/risks-analysis/reject/`,
            rejectedEdit: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/risks-analysis/reject/`,
            rejectedDelete: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/risks-analyses/`,
        },
        objAchivProgram: {
            editSubmit: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/objective-achievements`,
            pendingApprove: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/objective-achievement/approve/`,
            pendingReject: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/objective-achievement/reject/`,
            rejectedEdit: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/objective-achievement/reject/`,
            rejectedDelete: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/objective-achievements/`
        }
    });

    const [tabEndpointsListObj, setTabEndpointsListObj] = useState({
        swot: {
            getAll: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swots`,
            active: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swot/active`,
            pending: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swot/pending`,
            rejected: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/swot/rejected`,
        },
        interestedParty: {
            getAll: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/interested-parties`,
            active: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/interested-party/active`,
            pending: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/interested-party/pending`,
            rejected: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/interested-party/rejected`,
        },
        scopeOfQMS: {
            getAll: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/qms-scopes`,
            active: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/qms-scope/active`,
            pending: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/qms-scope/pending`,
            rejected: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/qms-scope/rejected`,
        },
        companyPolicy: {
            getAll: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/policies`,
            active: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/policy/active`,
            pending: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/policy/pending`,
            rejected: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/policy/rejected`,
        },
        respNAuth: {
    
        },
        riskNOpp: {
            getAll: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/risks-analyses`,
            active: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/risks-analysis/active`,
            pending: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/risks-analysis/pending`,
            rejected: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/risks-analysis/rejected`,
        },
        objAchivProgram: {
            getAll: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/objective-achievements`,
            active: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/objective-achievement/active`,
            pending: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/objective-achievement/pending`,
            rejected: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/objective-achievement/rejected`,
        }
    });


    return [btnEndpointsListObj, tabEndpointsListObj];
}

export default useEndpoints;