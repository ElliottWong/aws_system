/* 
    State enums
    Ensures user can only be in one of these states at one point of time
    Refer to pluralsight video 'Managing react state' By Cory House module 6.
*/

// Track the tabs that the user can see
export const TAB = {
    ACTIVE: "Active",
    PENDING: "Pending",
    REJECTED: "Rejected",
    EDITING: "Editing",
    COLLAPSE: "Dark",
    NULL: null,
    INACTIVE: "Inactive"
}

// Tracks the document submission status
export const DOCUMENT = {
    IDLE: "IDLE",
    SUBMITTED: "SUBMITTED",
    SUBMITTING: "SUBMITTING",
    COMPLETED: "COMPLETED",
}

// Type of questions for post training evaluation
export const QUESTION_TYPE = {
    RATING: 'rating', // rate 1 to 5
    OPEN: 'open', // open ended question
    BOOLEAN: 'bool', // yes or no
    DEFAULT: 'default' // default
};

export const TRAINING_EVALUATION_MODE = {
    EDIT: 'edit',
    VIEW: 'view'
}