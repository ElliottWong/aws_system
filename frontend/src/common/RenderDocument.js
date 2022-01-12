import React from 'react';
import { TAB } from '../config/enums';
import InterestedPartyActive from '../pages/InterestedParty/InterestedPartyActive';
import InterestedPartyPending from '../pages/InterestedParty/InterestedPartyPending';
import InterestedPartyEditing from '../pages/InterestedParty/InterestedPartyEditing';
import InterestedPartyRejected from '../pages/InterestedParty/InterestedPartyRejected';
import InterestedPartyInactive from '../pages/InterestedParty/InterestedPartyInactive';
import SWOTActive from '../pages/Swot/SwotActive';
import SWOTPending from '../pages/Swot/SwotPending';
import SWOTEditing from '../pages/Swot/SwotEditing';
import SWOTRejected from '../pages/Swot/SwotRejected';
import SWOTInactive from '../pages/Swot/SwotInactive';
import ScopeOfQMSActive from '../pages/ScopeOfQMS/ScopeOfQMSActive';
import ScopeOfQMSPending from '../pages/ScopeOfQMS/ScopeOfQMSPending';
import ScopeOfQMSEditing from '../pages/ScopeOfQMS/ScopeOfQMSEditing';
import ScopeOfQMSRejected from '../pages/ScopeOfQMS/ScopeOfQMSRejected';
import ScopeOfQMSInactive from '../pages/ScopeOfQMS/ScopeOfQMSInactive';
import CompanyPolicyActive from '../pages/CompanyPolicy/CompanyPolicyActive';
import CompanyPolicyPending from '../pages/CompanyPolicy/CompanyPolicyPending';
import CompanyPolicyEditing from '../pages/CompanyPolicy/CompanyPolicyEditing';
import CompanyPolicyRejected from '../pages/CompanyPolicy/CompanyPolicyRejected';
import CompanyPolicyInactive from '../pages/CompanyPolicy/CompanyPolicyInactive';
import RiskNOppActive from '../pages/RiskNOpp/RiskNOppActive';
import RiskNOppPending from '../pages/RiskNOpp/RiskNOppPending';
import RiskNOppEditing from '../pages/RiskNOpp/RiskNOppEditing';
import RiskNOppRejected from '../pages/RiskNOpp/RiskNOppRejected';
import RiskNOppInactive from '../pages/RiskNOpp/RiskNOppInactive';
import ObjAchivProgramActive from '../pages/ObjAchivProgram/ObjAchivProgramActive';
import ObjAchivProgramPending from '../pages/ObjAchivProgram/ObjAchivProgramPending';
import ObjAchivProgramEditing from '../pages/ObjAchivProgram/ObjAchivProgramEditing';
import ObjAchivProgramRejected from '../pages/ObjAchivProgram/ObjAchivProgramRejected';
import ObjAchivProgramInactive from '../pages/ObjAchivProgram/ObjAchivProgramInactive';


const RenderDocument = ({
    tabSettings,
    docHeaderData,
    docTableData,
    docPendingHeaderData,
    docPendingTableData,
    setDocPendingTableData,
    docRejectedHeaderData,
    docRejectedTableData,
    docColumns,
    docType,
    docEditTableData,
    setDocEditTableData,
    docEditHeaderData,
    setDocEditHeaderData,
    editorState,
    setEditorState,
    tempFileArr,
    setTempFileArr,
    startNewDoc,
    setStartNewDoc
}) => { // start of RenderDocument function
    const DOC_COMPONENT = {
        swot: {
            Active: SWOTActive,
            Pending: SWOTPending,
            Editing: SWOTEditing,
            Rejected: SWOTRejected,
            Inactive: SWOTInactive
        },
        interestedParty: {
            Active: InterestedPartyActive,
            Pending: InterestedPartyPending,
            Editing: InterestedPartyEditing,
            Rejected: InterestedPartyRejected,
            Inactive: InterestedPartyInactive
        },
        scopeOfQMS: {
            Active: ScopeOfQMSActive,
            Pending: ScopeOfQMSPending,
            Editing: ScopeOfQMSEditing,
            Rejected: ScopeOfQMSRejected,
            Inactive: ScopeOfQMSInactive
        },
        companyPolicy: {
            Active: CompanyPolicyActive,
            Pending: CompanyPolicyPending,
            Editing: CompanyPolicyEditing,
            Rejected: CompanyPolicyRejected,
            Inactive: CompanyPolicyInactive
        },
        riskNOpp: {
            Active: RiskNOppActive,
            Pending: RiskNOppPending,
            Editing: RiskNOppEditing,
            Rejected: RiskNOppRejected,
            Inactive: RiskNOppInactive
        },
        objAchivProgram: {
            Active: ObjAchivProgramActive,
            Pending: ObjAchivProgramPending,
            Editing: ObjAchivProgramEditing,
            Rejected: ObjAchivProgramRejected,
            Inactive: ObjAchivProgramInactive
        }

    }
    const SpecificDocType = DOC_COMPONENT[docType];
    if (tabSettings.focusTabIndex === 0) {
        if (tabSettings.firstTab === TAB.ACTIVE) {
            // Active tab UI
            if (docType === "swot") {
                return <SpecificDocType.Active
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                />
            }
            else if (docType === "scopeOfQMS") {
                return <SpecificDocType.Active
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                />
            }

            else if (docType === "interestedParty") {
                return <SpecificDocType.Active
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                />
            }
            else if (docType === "companyPolicy") {
                return <SpecificDocType.Active
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                />
            }
            else if (docType === "riskNOpp") {
                return <SpecificDocType.Active
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                />
            }
            else if (docType === "objAchivProgram") {
                return <SpecificDocType.Active
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                />
            }
        }
        // TBC No current active tab (design ui of this first)
        else {
            // Active tab UI with no data
            if (docType === "swot") {
                return <SpecificDocType.Inactive
                    docEditTableData={docEditTableData}
                    setDocEditTableData={setDocEditTableData}
                    docEditHeaderData={docEditHeaderData}
                    setDocEditHeaderData={setDocEditHeaderData}
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                    tabSettings={tabSettings}
                    startNewDoc={startNewDoc}
                    setStartNewDoc={setStartNewDoc}
                />
            }
            else if (docType === "scopeOfQMS") {
                return <SpecificDocType.Inactive
                    docEditTableData={docEditTableData}
                    setDocEditTableData={setDocEditTableData}
                    docEditHeaderData={docEditHeaderData}
                    setDocEditHeaderData={setDocEditHeaderData}
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                    editorState={editorState}
                    setEditorState={setEditorState}
                    tabSettings={tabSettings}
                    startNewDoc={startNewDoc}
                    setStartNewDoc={setStartNewDoc}
                />
            }
            else if (docType === "interestedParty") {
                return <SpecificDocType.Inactive
                    docEditTableData={docEditTableData}
                    setDocEditTableData={setDocEditTableData}
                    docEditHeaderData={docEditHeaderData}
                    setDocEditHeaderData={setDocEditHeaderData}
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                    tabSettings={tabSettings}
                    startNewDoc={startNewDoc}
                    setStartNewDoc={setStartNewDoc}
                />
            }
            else if (docType === "companyPolicy") {
                return <SpecificDocType.Inactive
                    docEditTableData={docEditTableData}
                    setDocEditTableData={setDocEditTableData}
                    docEditHeaderData={docEditHeaderData}
                    setDocEditHeaderData={setDocEditHeaderData}
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                    tabSettings={tabSettings}
                    startNewDoc={startNewDoc}
                    setStartNewDoc={setStartNewDoc}
                />
            }
            else if (docType === "riskNOpp") {
                return <SpecificDocType.Inactive
                    docEditTableData={docEditTableData}
                    setDocEditTableData={setDocEditTableData}
                    docEditHeaderData={docEditHeaderData}
                    setDocEditHeaderData={setDocEditHeaderData}
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                    tabSettings={tabSettings}
                    startNewDoc={startNewDoc}
                    setStartNewDoc={setStartNewDoc}
                />
            }
            else if (docType === "objAchivProgram") {
                return <SpecificDocType.Inactive
                    docEditTableData={docEditTableData}
                    setDocEditTableData={setDocEditTableData}
                    docEditHeaderData={docEditHeaderData}
                    setDocEditHeaderData={setDocEditHeaderData}
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    tempFileArr={tempFileArr}
                    setTempFileArr={setTempFileArr}
                    tabSettings={tabSettings}
                    startNewDoc={startNewDoc}
                    setStartNewDoc={setStartNewDoc}
                />
            }
        }
    } else if (tabSettings.focusTabIndex === 1) {
        if (tabSettings.secondTab === TAB.PENDING) {
            // Pending tab UI
            if (docType === "swot") {
                return <SpecificDocType.Pending
                    docPendingHeaderData={docPendingHeaderData}
                    docPendingTableData={docPendingTableData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                />
            }
            else if (docType === "interestedParty") {
                return <SpecificDocType.Pending
                    docPendingHeaderData={docPendingHeaderData}
                    docPendingTableData={docPendingTableData}
                    setDocPendingTableData={setDocPendingTableData}
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="id"
                />
            }
            else if (docType === "scopeOfQMS") {
                return <SpecificDocType.Pending
                    docPendingHeaderData={docPendingHeaderData}
                    docPendingTableData={docPendingTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                />
            }

            else if (docType === "companyPolicy") {
                return <SpecificDocType.Pending
                    docPendingHeaderData={docPendingHeaderData}
                    docPendingTableData={docPendingTableData}
                    setDocPendingTableData={setDocPendingTableData}
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="id"
                />
            }
            else if (docType === "riskNOpp") {
                return <SpecificDocType.Pending
                    docPendingHeaderData={docPendingHeaderData}
                    docPendingTableData={docPendingTableData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                />
            }
            else if (docType === "objAchivProgram") {
                return <SpecificDocType.Pending
                    docPendingHeaderData={docPendingHeaderData}
                    docPendingTableData={docPendingTableData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                />
            }
        } else if (tabSettings.secondTab === TAB.EDITING) {
            // Editing tab UI
            if (docType === "swot") {
                return <SpecificDocType.Editing
                    docEditTableData={docEditTableData}
                    setDocEditTableData={setDocEditTableData}
                    docEditHeaderData={docEditHeaderData}
                    setDocEditHeaderData={setDocEditHeaderData}
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                />
            }
            else if (docType === "interestedParty") {
                return <SpecificDocType.Editing
                    docEditTableData={docEditTableData}
                    setDocEditTableData={setDocEditTableData}
                    docEditHeaderData={docEditHeaderData}
                    setDocEditHeaderData={setDocEditHeaderData}
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                />
            }
            else if (docType === "scopeOfQMS") {
                return <SpecificDocType.Editing
                    docEditTableData={docEditTableData}
                    setDocEditTableData={setDocEditTableData}
                    docEditHeaderData={docEditHeaderData}
                    setDocEditHeaderData={setDocEditHeaderData}
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                    editorState={editorState}
                    setEditorState={setEditorState}
                />
            }
            else if (docType === "companyPolicy") {
                return <SpecificDocType.Editing
                    docEditTableData={docEditTableData}
                    setDocEditTableData={setDocEditTableData}
                    docEditHeaderData={docEditHeaderData}
                    setDocEditHeaderData={setDocEditHeaderData}
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                />
            }
            else if (docType === "riskNOpp") {
                return <SpecificDocType.Editing
                    docEditTableData={docEditTableData}
                    setDocEditTableData={setDocEditTableData}
                    docEditHeaderData={docEditHeaderData}
                    setDocEditHeaderData={setDocEditHeaderData}
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                />
            }
            else if (docType === "objAchivProgram") {
                return <SpecificDocType.Editing
                    docEditTableData={docEditTableData}
                    setDocEditTableData={setDocEditTableData}
                    docEditHeaderData={docEditHeaderData}
                    setDocEditHeaderData={setDocEditHeaderData}
                    docHeaderData={docHeaderData}
                    docTableData={docTableData}
                    tempFileArr={tempFileArr}
                    setTempFileArr={setTempFileArr}
                />
            }
        } else if (tabSettings.secondTab === TAB.REJECTED) {
            // Rejected tab UI
            if (docType === "swot") {
                return <SpecificDocType.Rejected
                    docRejectedHeaderData={docRejectedHeaderData}
                    docRejectedTableData={docRejectedTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                />
            }
            else if (docType === "interestedParty") {
                return <SpecificDocType.Rejected
                    docRejectedHeaderData={docRejectedHeaderData}
                    docRejectedTableData={docRejectedTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                />
            }
            else if (docType === "scopeOfQMS") {
                return <SpecificDocType.Rejected
                    docRejectedHeaderData={docRejectedHeaderData}
                    docRejectedTableData={docRejectedTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                />
            }
            else if (docType === "companyPolicy") {
                return <SpecificDocType.Rejected
                    docRejectedHeaderData={docRejectedHeaderData}
                    docRejectedTableData={docRejectedTableData}
                    docColumns={docColumns}
                    docKeyfield="serialNo"
                />
            }
            else if (docType === "riskNOpp") {
                return <SpecificDocType.Rejected
                    docRejectedHeaderData={docRejectedHeaderData}
                    docRejectedTableData={docRejectedTableData}
                />
            }
            else if (docType === "objAchivProgram") {
                return <SpecificDocType.Rejected
                    docRejectedHeaderData={docRejectedHeaderData}
                    docRejectedTableData={docRejectedTableData}
                />
            }
        }
    } else {
        return (
            <div className="l-Document__Error">
                <p>There was an error in loading the document =(</p>
            </div>
        );
    }
};

export default RenderDocument;