import React, { useEffect, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import SwotItems from '../../common/SwotItems';

const SwotPending = ({
    docPendingHeaderData,
    docPendingTableData,
    docTableData,
    docColumns,
    docKeyfield
}) => {    // start of SwotPending
    console.log(docPendingHeaderData);
    console.log(docPendingTableData);

    const [rowStyle, setRowStyle] = useState({
        newStrengthRowArr: [],
        newWeaknessRowArr: [],
        newOppRowArr: [],
        newThreatRowArr: [],
        editedStrengthRowArr: [],
        editedWeaknessRowArr: [],
        editedOppRowArr: [],
        editedThreatRowArr: [],
    });
    const [rowStrengthStyleTable, setRowStrengthStyleTable] = useState(null);
    const [rowWeaknessStyleTable, setRowWeaknessStyleTable] = useState(null);
    const [rowOppStyleTable, setRowOppStyleTable] = useState(null);
    const [rowThreatStyleTable, setRowThreatStyleTable] = useState(null);

    useEffect(() => {
        setRowStyle(() => {

            // Variables declaration
            let newStrengthRowArr = [];
            let newWeaknessRowArr = [];
            let newOppRowArr = [];
            let newThreatRowArr = [];
            let editedStrengthRowArr = [];
            let editedWeaknessRowArr = [];
            let editedOppRowArr = [];
            let editedThreatRowArr = [];

            const checkNewRow = () => {
                // Obtain rows that are newly added
                const checkStrengthNewRow = docPendingTableData.strength.filter((data, index) => {
                    console.log(data);
                    return data.parentItemID === null;
                });
                checkStrengthNewRow.forEach((data) => {
                    newStrengthRowArr.push(data.id);
                });
                const checkWeaknessNewRow = docPendingTableData.weakness.filter((data, index) => {
                    console.log(data);
                    return data.parentItemID === null;
                });
                checkWeaknessNewRow.forEach((data) => {
                    newWeaknessRowArr.push(data.id);
                });
                const checkOppNewRow = docPendingTableData.opp.filter((data, index) => {
                    console.log(data);
                    return data.parentItemID === null;
                });
                checkOppNewRow.forEach((data) => {
                    newOppRowArr.push(data.id);
                });
                const checkThreatNewRow = docPendingTableData.threat.filter((data, index) => {
                    console.log(data);
                    return data.parentItemID === null;
                });
                checkThreatNewRow.forEach((data) => {
                    newThreatRowArr.push(data.id);
                });
            }

            const checkEditedRow = () => {
                // Obtain edited rows
                docPendingTableData.strength.forEach((pendingData, pendingIndex) => {

                    docTableData.strength.forEach((activeData, activeIndex) => {
                        if (pendingData.parentItemID === activeData.id) {
                            // Check if the fields has been edited
                            if (pendingData.content !== activeData.content) {
                                editedStrengthRowArr.push(pendingData.id);
                            }
                        }
                    })
                });
                // Obtain edited rows
                docPendingTableData.weakness.forEach((pendingData, pendingIndex) => {

                    docTableData.weakness.forEach((activeData, activeIndex) => {
                        if (pendingData.parentItemID === activeData.id) {
                            // Check if the fields has been edited
                            if (pendingData.content !== activeData.content) {
                                editedWeaknessRowArr.push(pendingData.id);
                            }
                        }
                    })
                });
                // Obtain edited rows
                docPendingTableData.opp.forEach((pendingData, pendingIndex) => {

                    docTableData.opp.forEach((activeData, activeIndex) => {
                        if (pendingData.parentItemID === activeData.id) {
                            // Check if the fields has been edited
                            if (pendingData.content !== activeData.content) {
                                editedOppRowArr.push(pendingData.id);
                            }
                        }
                    })
                });
                // Obtain edited rows
                docPendingTableData.threat.forEach((pendingData, pendingIndex) => {

                    docTableData.threat.forEach((activeData, activeIndex) => {
                        if (pendingData.parentItemID === activeData.id) {
                            // Check if the fields has been edited
                            if (pendingData.content !== activeData.content) {
                                editedThreatRowArr.push(pendingData.id);
                            }
                        }
                    })
                });
            }
            checkNewRow();
            checkEditedRow();

            return ({
                newStrengthRowArr,
                newWeaknessRowArr,
                newOppRowArr,
                newThreatRowArr,
                editedStrengthRowArr,
                editedWeaknessRowArr,
                editedOppRowArr,
                editedThreatRowArr
            });
        });


    }, [docPendingTableData, docTableData]);

    useEffect(() => {
        console.log("rowstyle chanigng")
        setRowStrengthStyleTable(() => ((row, rowIndex) => {
            const style = {};
            rowStyle.newStrengthRowArr.forEach((data) => {
                if (row.id === data) {
                    style.backgroundColor = '#FFF3CD';
                    style.textDecoration = 'underline';
                }
            });
          
            rowStyle.editedStrengthRowArr.forEach((data) => {
                if (row.id === data) {
                    style.backgroundColor = '#FFF3CD';
                    style.fontWeight = 'bold';
                }
            })
          
            return style;
        }));
        setRowWeaknessStyleTable(() => ((row, rowIndex) => {
            const style = {};
            rowStyle.newWeaknessRowArr.forEach((data) => {
                if (row.id === data) {
                    style.backgroundColor = '#FFF3CD';
                    style.textDecoration = 'underline';
                }
            });
          
            rowStyle.editedWeaknessRowArr.forEach((data) => {
                if (row.id === data) {
                    style.backgroundColor = '#FFF3CD';
                    style.fontWeight = 'bold';
                }
            })
          
            return style;
        }));
        setRowOppStyleTable(() => ((row, rowIndex) => {
            const style = {};
            rowStyle.newOppRowArr.forEach((data) => {
                if (row.id === data) {
                    style.backgroundColor = '#FFF3CD';
                    style.textDecoration = 'underline';
                }
            });
          
            rowStyle.editedOppRowArr.forEach((data) => {
                if (row.id === data) {
                    style.backgroundColor = '#FFF3CD';
                    style.fontWeight = 'bold';
                }
            })
          
            return style;
        }));
        setRowThreatStyleTable(() => ((row, rowIndex) => {
            const style = {};
            rowStyle.newThreatRowArr.forEach((data) => {
                if (row.id === data) {
                    style.backgroundColor = '#FFF3CD';
                    style.textDecoration = 'underline';
                }
            });
          
            rowStyle.editedThreatRowArr.forEach((data) => {
                if (row.id === data) {
                    style.backgroundColor = '#FFF3CD';
                    style.fontWeight = 'bold';
                }
            })
          
            return style;
        }));
    }, [rowStyle]);

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
                    <p>{docPendingHeaderData.approved_by ? docPendingHeaderData.approved_by : "Error"}</p>
                    <p>{docPendingHeaderData.created_by ? docPendingHeaderData.created_by : "Error"}</p>
                </div>
            </div>
            {/* Swot table section */}
            <SwotItems header="Strengths">
                <BootstrapTable
                    bordered={false}
                    keyField='serialNo'
                    data={docPendingTableData.strength}
                    columns={docColumns}
                    rowStyle={rowStrengthStyleTable}
                />
            </SwotItems>
            <SwotItems header="Weaknesses">
                <BootstrapTable
                    bordered={false}
                    keyField='serialNo'
                    data={docPendingTableData.weakness}
                    columns={docColumns}
                    rowStyle={rowWeaknessStyleTable}
                />
            </SwotItems>
            <SwotItems header="Opportunities">
                <BootstrapTable
                    bordered={false}
                    keyField='serialNo'
                    data={docPendingTableData.opp}
                    columns={docColumns}
                    rowStyle={rowOppStyleTable}
                />
            </SwotItems>
            <SwotItems header="Threats">
                <BootstrapTable
                    bordered={false}
                    keyField='serialNo'
                    data={docPendingTableData.threat}
                    columns={docColumns}
                    rowStyle={rowThreatStyleTable}
                />
            </SwotItems>


        </div>
    )
}

export default SwotPending;