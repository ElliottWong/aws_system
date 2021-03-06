// Imports
// npm packages
import React from 'react';
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom';

// React Components
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import Dashboard from './pages/Dashboard';
import Announcements from './pages/Announcements/Announcements';
import ViewAnnouncements from './pages/Announcements/ViewAnnouncements';
import CreateAnnouncements from './pages/Announcements/CreateAnnouncement';
import Swot from './pages/Swot/Swot';
import SwotArchived from './pages/Swot/SwotArchived';
import InterestedParty from './pages/InterestedParty/InterestedParty';
import InterestedPartyArchived from './pages/InterestedParty/InterestedPartyArchived';
import ScopeOfQMS from './pages/ScopeOfQMS/ScopeOfQMS';
import ScopeOfQMSArchived from './pages/ScopeOfQMS/ScopeOfQMSArchived';
import CompanyPolicy from './pages/CompanyPolicy/CompanyPolicy';
import CompanyPolicyArchived from './pages/CompanyPolicy/CompanyPolicyArchived';
import RespNAuthority from './pages/RespNAuthority/RespNAuthority';
import RespNAuthorityAddRole from './pages/RespNAuthority/RespNAuthorityAddRole';
import RespNAuthorityManageRole from './pages/RespNAuthority/RespNAuthorityManageRole';
import RespNAuthorityAddChart from './pages/RespNAuthority/RespNAuthorityAddChart';
import RespNAuthorityManageChart from './pages/RespNAuthority/RespNAuthorityManageChart';
import RiskNOpp from './pages/RiskNOpp/RiskNOpp';
import ObjAchivProgram from './pages/ObjAchivProgram/ObjAchivProgram';
import ObjAchivProgramArchived from './pages/ObjAchivProgram/ObjAchivProgramArchived';
import Settings from './pages/Settings';
import ManageAccount from './pages/ManageAccount';
import ManageUsers from './pages/ManageUsers';
import ManageUser from './pages/ManageUser';
import PageNotFound from './pages/PageNotFound';
import RiskNOppArchived from './pages/RiskNOpp/RiskNOppArchived';
import ManageInvites from './pages/ManageInvites';
import ManageOrganization from './pages/ManageOrganization';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ChangePassword from './pages/ForgotPassword/ChangePassword';
import EquipmentMaintenance from './pages/EquipmentMaintenance/EquipmentMaintenance';
import ManageEquipmentMaintenance from './pages/EquipmentMaintenance/ManageEquipmentMaintenance';
import AddEquipmentMaintenance from './pages/EquipmentMaintenance/AddEquipmentMaintenance';
import AddEquipmentCategory from './pages/EquipmentMaintenance/AddEquipmentCategory';
import ManageEquipmentCategory from './pages/EquipmentMaintenance/ManageEquipmentCategory';
import Licenses from './pages/PermitLicenses/Licenses';
import AddLicense from './pages/PermitLicenses/AddLicense';
import UploadLicense from './pages/PermitLicenses/UploadLicense';

// Other imports
import TokenManager from './utilities/tokenManager';
import ManageInductionTemplates from './pages/InductionForm/ManageInductionTemplates';
import ManageInductionVersions from './pages/InductionForm/ManageInductionVersions';
import ManageInductionForm from './pages/InductionForm/ManageInductionForm';
import ManageMyTrainingRecord from './pages/Training/ManageMyTrainingRecord';
import PostEvaluationForm from './pages/Training/PostEvaluationForm';
import CreateTrainingRequest from './pages/Training/CreateTrainingRequest';
import ManagePostEvaluationTemplates from './pages/Training/ManagePostEvaluationTemplates';
import CreateEvaluationTemplate from './pages/Training/CreateEvaluationTemplate';
import ManageMyTrainingRequest from './pages/Training/ManageMyTrainingRequest';
import ManageTrainingRecord from './pages/Training/ManageTrainingRecord';
import ManageTrainingRequest from './pages/Training/ManageTrainingRequest';
import ManageEvaluationTemplate from './pages/Training/ManageEvaluationTemplate';
import AddMaintenanceCycle from './pages/EquipmentMaintenance/AddMaintenanceCycle';
import ManageMaintenanceCycle from './pages/EquipmentMaintenance/ManageMaintenanceCycle';
import CreateInductionForm from './pages/InductionForm/CreateInductionForm';
import ManageLicense from './pages/PermitLicenses/ManageLicense';
import MyTrainingRequests from './pages/Training/MyTrainingRequests';
import MyTrainingRecords from './pages/Training/MyTrainingRecords';
import ManageTrainingRequests from './pages/Training/ManageTrainingRequests';
import ManageTrainingRecords from './pages/Training/ManageTrainingRecords';
import UploadMaintenance from './pages/EquipmentMaintenance/UploadMaintenance';

// Component
const Routes = () => {
    // Guard to check if user has token
    const authGuard = (Component) => (props) => {
        const token = TokenManager.getToken();
        if (!token) {
            return (<Redirect to="/login" {...props} />);
        } else {
            return (<Component {...props} />);
        }
    };

    return (
        <Router >
            <Switch>
                {/* Auth */}
                <Route path="/login" render={() => <Login />} />
                <Route path="/forgot-password" render={() => <ForgotPassword />} />
                <Route path="/change-password/:username/:otp" render={(props) => <ChangePassword {...props} />} />
                <Route path="/create-account/:token" render={(props) => <CreateAccount {...props} />} />
                <Route exact path="/">
                    <Redirect to="/dashboard" />
                </Route>
                <Route path="/dashboard" render={(props) => authGuard(Dashboard)(props)} />
                
                {/* Announcements */}
                <Route exact path="/announcements" render={(props) => authGuard(Announcements)(props)} />
                <Route path="/announcements/view/:aID" render={(props) => authGuard(ViewAnnouncements)(props)} />
                <Route path="/announcements/create" render={(props) => authGuard(CreateAnnouncements)(props)} />
                
                {/* SWOT */}
                <Route exact path="/swot" render={(props) => authGuard(Swot)(props)} />
                <Route path="/swot/archived/:swotID" render={(props) => authGuard(SwotArchived)(props)} />
                
                {/* Interested party */}
                <Route exact path="/interested-party" render={(props) => authGuard(InterestedParty)(props)} />
                <Route path="/interested-party/archived/:ipID" render={(props) => authGuard(InterestedPartyArchived)(props)} />
                
                {/* Scope of QMS */}
                <Route exact path="/scope-of-qms" render={(props) => authGuard(ScopeOfQMS)(props)} />
                <Route path="/scope-of-qms/archived/:scopeOfQMSID" render={(props) => authGuard(ScopeOfQMSArchived)(props)} />
                
                {/* Company Policy */}
                <Route exact path="/company-policy" render={(props) => authGuard(CompanyPolicy)(props)} />
                <Route path="/company-policy/archived/:companyPolicyID" render={(props) => authGuard(CompanyPolicyArchived)(props)} />
                
                {/* Responsibility & Authority */}
                <Route exact path="/responsibility-n-authority" render={(props) => authGuard(RespNAuthority)(props)} />
                <Route path="/responsibility-n-authority/add-org-chart" render={(props) => authGuard(RespNAuthorityAddChart)(props)} />
                <Route path="/responsibility-n-authority/manage-org-chart/:orgChartID" render={(props) => authGuard(RespNAuthorityManageChart)(props)} />
                <Route path="/responsibility-n-authority/add-role" render={(props) => authGuard(RespNAuthorityAddRole)(props)} />
                <Route path="/responsibility-n-authority/manage-role/:roleID" render={(props) => authGuard(RespNAuthorityManageRole)(props)} />
                
                {/* Risk & Opportunity */}
                <Route exact path="/risk-n-opportunity" render={(props) => authGuard(RiskNOpp)(props)} />
                <Route path="/risk-n-opportunity/archived/:rnoID" render={(props) => authGuard(RiskNOppArchived)(props)} />
                
                {/* Objective achievement Program */}
                <Route exact path="/objective-achievement-program" render={(props) => authGuard(ObjAchivProgram)(props)} />
                <Route path="/objective-achievement-program/archived/:oapID" render={(props) => authGuard(ObjAchivProgramArchived)(props)} />
                
                {/* Equipment Maintenance */}
                <Route exact path="/equipment-maintenance" render={(props) => authGuard(EquipmentMaintenance)(props)} />
                <Route exact path="/equipment-maintenance/manage-equipment/:emID" render={(props) => authGuard(ManageEquipmentMaintenance)(props)} />
                <Route exact path="/equipment-maintenance/add-equipment" render={(props) => authGuard(AddEquipmentMaintenance)(props)} />
                <Route exact path="/equipment-maintenance/add-category" render={(props) => authGuard(AddEquipmentCategory)(props)} />
                <Route exact path="/equipment-maintenance/manage-equipment/:emID/add-cycle" render={(props) => authGuard(AddMaintenanceCycle)(props)} />
                <Route exact path="/equipment-maintenance/manage-equipment/:emID/manage-cycle/:maintenanceID" render={(props) => authGuard(ManageMaintenanceCycle)(props)} />
                <Route exact path="/equipment-maintenance/manage-equipment/:emID/manage-cycle/:maintenanceID/upload" render={(props) => authGuard(UploadMaintenance)(props)} />
                <Route exact path="/equipment-maintenance/manage-category/:catID" render={(props) => authGuard(ManageEquipmentCategory)(props)} />
                
                {/* Licenses */}
                <Route exact path="/licenses" render={(props) => authGuard(Licenses)(props)} />
                <Route exact path="/licenses/add-license" render={(props) => authGuard(AddLicense)(props)} />
                <Route exact path="/licenses/manage-license/:licenseID" render={(props) => authGuard(ManageLicense)(props)} />
                <Route exact path="/licenses/manage-license/:licenseID/upload" render={(props) => authGuard(UploadLicense)(props)} />

                {/* Training */}
                <Route exact path="/training/requests" render={(props) => authGuard(MyTrainingRequests)(props)} />
                <Route exact path="/training/requests/create" render={(props) => authGuard(CreateTrainingRequest)(props)} />
                <Route exact path="/training/requests/manage/:trainingReqID" render={(props) => authGuard(ManageMyTrainingRequest)(props)} />
                <Route exact path="/training/records" render={(props) => authGuard(MyTrainingRecords)(props)} />
                <Route exact path="/training/records/manage/:trainingRecordID" render={(props) => authGuard(ManageMyTrainingRecord)(props)} />
                <Route exact path="/training/records/manage/:trainingRecordID/post-training-evaluation" render={(props) => authGuard(PostEvaluationForm)(props)} />
                <Route exact path="/training/manage/requests" render={(props) => authGuard(ManageTrainingRequests)(props)} />
                <Route exact path="/training/manage/requests/manage/:trainingReqID" render={(props) => authGuard(ManageTrainingRequest)(props)} />
                <Route exact path="/training/manage/records" render={(props) => authGuard(ManageTrainingRecords)(props)} />
                <Route exact path="/training/manage/records/manage/:trainingID" render={(props) => authGuard(ManageTrainingRecord)(props)} />
                <Route exact path="/training/manage/records/manage/:trainingRecordID/post-training-evaluation" render={(props) => authGuard(PostEvaluationForm)(props)} />
                <Route exact path="/training/post-evaluation-templates" render={(props) => authGuard(ManagePostEvaluationTemplates)(props)} />
                <Route exact path="/training/post-evaluation-templates/manage/:templateID" render={(props) => authGuard(ManageEvaluationTemplate)(props)} />
                <Route exact path="/training/post-evaluation-templates/create" render={(props) => authGuard(CreateEvaluationTemplate)(props)} />

                {/* Settings */}
                <Route exact path="/settings" render={(props) => authGuard(Settings)(props)} />
                <Route path="/settings/manage-account" render={(props) => authGuard(ManageAccount)(props)} />
                <Route exact path="/settings/manage-users" render={(props) => authGuard(ManageUsers)(props)} />
                <Route path="/settings/manage-users/manage-user/:employeeID" render={(props) => authGuard(ManageUser)(props)} />
                <Route path="/settings/manage-organization" render={(props) => authGuard(ManageOrganization)(props)} />
                <Route path="/settings/manage-invites" render={(props) => authGuard(ManageInvites)(props)} />
                <Route exact path="/settings/induction-templates" render={(props) => authGuard(ManageInductionTemplates)(props)} />
                <Route exact path="/settings/induction-templates/induction-template-versions/:templateID" render={(props) => authGuard(ManageInductionVersions)(props)} />
                <Route exact path="/settings/induction-templates/induction-template-versions/:templateID/create" render={(props) => authGuard(CreateInductionForm)(props)} />
                <Route exact path="/settings/induction-templates/induction-template-versions/:templateID/manage/:formID" render={(props) => authGuard(ManageInductionForm)(props)} />
                <Route path="*" render={() => <PageNotFound />} />
            </Switch>
        </Router>
    )
}

export default Routes;
