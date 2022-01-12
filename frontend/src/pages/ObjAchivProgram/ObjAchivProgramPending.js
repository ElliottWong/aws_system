import React from 'react';
import ObjAchivProgramItem from '../../common/ObjAchivProgramItem';

const ObjAchivProgramPending = ({
    docPendingTableData,
    docPendingHeaderData
}) => { // start of ObjAchivProgramPending.js
    return (
        <div className="c-Obj-Achiv-Program__Document-content c-Document">
            {/* Title */}
            <h1 className = "c-Document__Title">{docPendingHeaderData.title ? docPendingHeaderData.title : "Failed to load data!"}</h1>
            {/* Document Header Info */}
            <div className="c-Obj-Achiv-Program__Document-header c-Document__Header">
                <div className="c-Obj-Achiv-Program__Document-header--left c-Document__Header--left">
                    <p>To be approved by:</p>
                    <p>Submitted by:</p>
                </div>
                <div className="c-Obj-Achiv-Program__Document-header--right c-Document__Header--right">
                    <p>{docPendingHeaderData.approved_by ? docPendingHeaderData.approved_by : "Error"}</p>
                    <p>{docPendingHeaderData.created_by ? docPendingHeaderData.created_by : "Error"}</p>                </div>
            </div>
            {/* Map through an array to display ObjAchivProgramItem */}
            {docPendingTableData.map((data, index) => (
                <ObjAchivProgramItem
                    key={index}
                    docType="pending"
                    itemContent={data}
                />
            ))
            }
        </div>
    )
}

export default ObjAchivProgramPending;