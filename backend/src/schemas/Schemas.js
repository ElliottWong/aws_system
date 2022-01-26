// consolidates all models into one object to use

// because JS is single threaded, the order of the imports below are important
// they are in the order such that their dependencies are initialised before being used
// each file now NO longer imports models directly as that is very messy
// instead they call db.model("ModelAlias") to get the model they need
// and if the model being fetched does not exist, the error occurs

const { Addresses } = require('./Addresses');
const { Companies } = require('./Companies');
const { Employees } = require('./Employees');
const { Files } = require('./Files');

const { Accounts } = require('./Accounts');
const { Passwords } = require('./Passwords');
const { Otps } = require('./Otps');
const { Invitations } = require('./Invitations');

const { Roles, RoleAssignments, RoleRights } = require('./Roles');

// Clauses 1 - 3
const { Scopes } = require('./Scopes');
const { References } = require('./References');
const { TermsAndDefinitions } = require('./Terms');

// Clause 4
const { SwotForms, SwotItems } = require('./Swots');
const { InterestedPartiesForms, InterestedPartiesItems } = require('./InterestedParties');
const { QmsScopeForms, QmsScopeItems } = require('./QmsScopes');

// Clause 5
const { PoliciesForms, PoliciesItems } = require('./Policies');
const { OrgCharts } = require('./Charts');

// Clause 6
const { RisksAnalysesForms, RisksAnalysesItems } = require('./RisksAnalyses');
const { ObjectiveAchievementForms, ObjectiveAchievementItems, ObjectiveAchievementUploads } = require('./Achievements');

// Clause 7
const { Categories, Equipment, Equipment2Categories } = require('./Equipment');
const { Maintenance, MaintenanceAssignees, MaintenanceUploads } = require('./EquipmentMaintenance');
const { Licences, LicenceAssignees, LicenceUploads } = require('./Licences');
const { TrainingRequests } = require('./Training');
const { TrainingEvaluationTemplates } = require('./TrainingEvaluation');

module.exports = {
    Addresses, Companies, Employees, Files,
    User: {
        Accounts, Passwords,
        Otps, Invitations
    },
    Role: {
        Roles,
        Assignments: RoleAssignments,
        Rights: RoleRights
    },

    Documents: {
        // clauses 1 - 3
        Scopes,
        NormativeReferences: References,
        TermsAndDefinitions,

        SWOT: {
            Forms: SwotForms,
            Items: SwotItems
        },

        InterestedParties: {
            Forms: InterestedPartiesForms,
            Items: InterestedPartiesItems
        },

        QmsScope: {
            Forms: QmsScopeForms,
            Items: QmsScopeItems
        },

        Policies: {
            Forms: PoliciesForms,
            Items: PoliciesItems
        },

        OrganisationCharts: OrgCharts,

        // clause 6.1
        // risks and opportunities
        RO: {
            Forms: RisksAnalysesForms,
            Items: RisksAnalysesItems
        },

        // clause 6.2
        // objective achievement program
        OAP: {
            Forms: ObjectiveAchievementForms,
            Items: ObjectiveAchievementItems,
            TrackingData: ObjectiveAchievementUploads // an item can have many tracking data
        },

        // clause 7.1
        // equipment maintenace program
        EMP: {
            Equipment,
            Categories,
            Equipment2Categories,
            Maintenance,
            MaintenanceAssignees,
            MaintenanceUploads
        },

        // clause 7.2
        // permits, licences, certs
        PLC: {
            Licences,
            Assignees: LicenceAssignees,
            Uploads: LicenceUploads
        },

        // clause 7.3
        // human resources
        HR: {
            TrainingRequests,
            TrainingEvaluationTemplates
        }
    }
};
