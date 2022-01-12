import React, { useState, useEffect } from 'react';
import ObjAchivProgramItem from '../../common/ObjAchivProgramItem';

const ObjAchivProgramActive = ({
    docHeaderData,
    docTableData,
    docColumns,
    docKeyfield
}) => { // start of ObjAchivProgramActive

    return (
        <div className="c-Obj-Achiv-Program__Document-content c-Document">
            {/* Title */}
            <h1 className = "c-Document__Title">{docHeaderData.title ? docHeaderData.title : "Failed to load data!"}</h1>
            {/* Document Header Info */}
            <div className="c-Obj-Achiv-Program__Document-header c-Document__Header">
                <div className="c-Obj-Achiv-Program__Document-header--left c-Document__Header--left">
                    <p>Approved by:</p>
                    <p>Submitted by:</p>
                    <p>Approved on:</p>
                </div>
                <div className="c-Obj-Achiv-Program__Document-header--right c-Document__Header--right">
                    <p>{docHeaderData.approved_by ? docHeaderData.approved_by : "Error"}</p>
                    <p>{docHeaderData.created_by ? docHeaderData.created_by : "Error"}</p>
                    <p>{docHeaderData.approved_on ? docHeaderData.approved_on : "Error"}</p>
                </div>
            </div>
            {/* Map through an array to display ObjAchivProgramItem */}
            {docTableData.map((data, index) => (
                <ObjAchivProgramItem
                    key={index}
                    docType="active"
                    itemContent={data}
                />
            ))
            }
        </div>
    );
}

export default ObjAchivProgramActive;