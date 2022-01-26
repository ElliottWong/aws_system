import React from 'react'

const StatusPill = ({ type }) => {
    const renderType = () => {
        if (type === "active") {
            return "Active";
        }
        else if (type === "completed") {
            return "Completed";
        }
        else if (type === "approved") {
            return "Approved";
        }
        else if (type === "overdue") {
            return "Overdue";
        }
        else if (type === "expired") {
            return "Expired";
        }
        else if (type === "rejected") {
            return "Rejected"
        }
        else if (type === "inactive") {
            return "Inactive";
        }
        else if (type === "almostDue") {
            return "Expiring Soon";
        } else if (type === "pending") {
            return "Pending";
        }
        else if (type === "cancelled") {
            return "Cancelled";
        }
        else {
            return "Na";
        }
    };

    const renderClassName = () => {
        if (type === "active" || type === "completed" || type === "approved") {
            return "active";
        } else if (type === "overdue" || type === "rejected" || type === "inactive" || type === "expired") {
            return "overdue";
        } else if (type === "almostDue") {
            return "almost-due";
        } else if (type === "pending") {
            return "pending";
        } else if (type === "cancelled") {
            return "cancelled"
        }
        else {
            return "Na";
        }
    };

    return (
        <div className={`c-Status-pill c-Status-pill--${type ? renderClassName() : "active"}`}>
            <h1>{type ? renderType() : "Active"}</h1>
        </div>
    )
}

export default StatusPill;