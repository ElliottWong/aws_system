import React from 'react'

const StatusPill = ({ type }) => {
    const renderType = () => {
        if (type === "active") {
            return "Active";
        } else if (type === "overdue") {
            return "Overdue";
        } else if (type === "almostDue") {
            return "Almost Due";
        } else if (type === "pending") {
            return "Pending";
        } 
        else {
            return "Active";
        }
    };

    const renderClassName = () => {
        if (type === "active") {
            return "active";
        } else if (type === "overdue") {
            return "overdue";
        } else if (type === "almostDue") {
            return "almost-due";
        } else if (type === "pending") {
            return "pending";
        } 
        else {
            return "active";
        }
    };

    return (
        <div className = {`c-Status-pill c-Status-pill--${type ? renderClassName() : "active"}`}>
            <h1>{ type ? renderType() : "Active" }</h1>
        </div>
    )
}

export default StatusPill;