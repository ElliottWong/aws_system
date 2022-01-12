import React from 'react';
import ObjAchivProgramItem from '../../common/ObjAchivProgramItem';


const ObjAchivProgramRejected = ({
    docRejectedHeaderData, 
    docRejectedTableData, 
}) => { // start of ObjAchivProgramRejected
    return (
        <div className="c-Obj-Achiv-Program__Document-content c-Document">
            {/* Title */}
            <h1 className = "c-Document__Title">{docRejectedHeaderData.title ? docRejectedHeaderData.title : "Failed to load data!"}</h1>
            {/* Document Header Info */}
            <div className="c-Obj-Achiv-Program__Document-header c-Document__Header">
                <div className="c-Obj-Achiv-Program__Document-header--left c-Document__Header--left">
                <p>To be approved by:</p>
                <p>Submitted by:</p>
                <p>Remarks</p>
                </div>
                <div className="c-Obj-Achiv-Program__Document-header--right c-Document__Header--right">
                <p>{docRejectedHeaderData.approved_by ? docRejectedHeaderData.approved_by : "Error"}</p>
                <p>{docRejectedHeaderData.created_by ? docRejectedHeaderData.created_by : "Error"}</p>
                {docRejectedHeaderData ? <textarea readOnly value = {docRejectedHeaderData.remarks || ''}></textarea> : "No remarks found!" }
                </div>
            </div>
            {/* Map through an array to display ObjAchivProgramItem */}
            {docRejectedTableData.map((data, index) => (
                <ObjAchivProgramItem
                    key={index}
                    docType="active"
                    itemContent={data}
                />
            ))
            }
        </div>
    )
}

export default ObjAchivProgramRejected;