import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import SwotItems from '../../common/SwotItems';

const SwotActive = ({
    docHeaderData,
    docTableData,
    docColumns,
    docKeyfield
}) => { // start of SwotActive


    return (
        <div className="c-Swot__Document-content c-Document">
            {/* Document Header Info */}
            <div className="c-Swot__Document-header c-Document__Header">
                <div className="c-Swot__Document-header--left c-Document__Header--left">
                    <p>Approved by:</p>
                    <p>Submitted by:</p>
                    <p>Approved on:</p>
                </div>
                <div className="c-Swot__Document-header--right c-Document__Header--right">
                    <p>{docHeaderData.approved_by ? docHeaderData.approved_by : "Error"}</p>
                    <p>{docHeaderData.created_by  ? docHeaderData.created_by : "Error"}</p>
                    <p>{docHeaderData.approved_on  ? docHeaderData.approved_on : "Error"}</p>
                </div>
            </div>
            {/* Swot table section */}
            <SwotItems header="Strengths">
                <BootstrapTable
                    bordered={false}
                    keyField='serialNo'
                    data={docTableData.strength}
                    columns={docColumns}
                />
            </SwotItems>
            <SwotItems header="Weaknesses">
                <BootstrapTable
                    bordered={false}
                    keyField='serialNo'
                    data={docTableData.weakness}
                    columns={docColumns}
                />
            </SwotItems>
            <SwotItems header="Opportunities">
                <BootstrapTable
                    bordered={false}
                    keyField='serialNo'
                    data={docTableData.opp}
                    columns={docColumns}
                />
            </SwotItems>
            <SwotItems header="Threats">
                <BootstrapTable
                    bordered={false}
                    keyField='serialNo'
                    data={docTableData.threat}
                    columns={docColumns}
                />
            </SwotItems>


        </div>
    )
}

export default SwotActive;