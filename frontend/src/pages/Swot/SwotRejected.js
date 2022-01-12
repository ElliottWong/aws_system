import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import SwotItems from '../../common/SwotItems';

const SwotRejected = ({
    docRejectedHeaderData,
    docRejectedTableData,
    docColumns,
    docKeyfield
}) => {
    return (
        <div className="c-Swot__Document-content c-Document">
            {/* Document Header Info */}
            <div className="c-Swot__Document-header c-Document__Header">
                <div className="c-Swot__Document-header--left c-Document__Header--left">
                    <p>Rejected By:</p>
                    <p>Submitted by:</p>
                    <p>Remarks</p>
                </div>
                <div className="c-Swot__Document-header--right c-Document__Header--right">
                    <p>{docRejectedHeaderData.approved_by ? docRejectedHeaderData.approved_by : "Error"}</p>
                    <p>{docRejectedHeaderData.created_by ? docRejectedHeaderData.created_by : "Error"}</p>
                    {docRejectedHeaderData ? <textarea readOnly value = {docRejectedHeaderData.remarks || ''}></textarea> : "No remarks found!" }
                </div>
            </div>
            {/* Swot table section */}
            <SwotItems header="Strengths">
                <BootstrapTable
                    bordered={false}
                    keyField='serialNo'
                    data={docRejectedTableData.strength}
                    columns={docColumns}
                />
            </SwotItems>
            <SwotItems header="Weaknesses">
                <BootstrapTable
                    bordered={false}
                    keyField='serialNo'
                    data={docRejectedTableData.weakness}
                    columns={docColumns}
                />
            </SwotItems>
            <SwotItems header="Opportunities">
                <BootstrapTable
                    bordered={false}
                    keyField='serialNo'
                    data={docRejectedTableData.opp}
                    columns={docColumns}
                />
            </SwotItems>
            <SwotItems header="Threats">
                <BootstrapTable
                    bordered={false}
                    keyField='serialNo'
                    data={docRejectedTableData.threat}
                    columns={docColumns}
                />
            </SwotItems>


        </div>
    )
}

export default SwotRejected;