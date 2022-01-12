import React, {useState, useEffect} from 'react';
import BootstrapTable from 'react-bootstrap-table-next';


const InterestedPartyPending = ({
    docPendingTableData, 
    setDocPendingTableData,
    docPendingHeaderData, 
    docHeaderData,
    docTableData,
    docColumns, 
    docKeyfield}) => { // start of InterestedPartyPending

    const [rowStyle, setRowStyle] = useState({
        newRowArr: [],
        deletedRowArr: [],
        editedRowArr: []
    });
    const [rowStyleTable, setRowStyleTable] = useState(null);

    useEffect(() => {
        // Check if table row is edited/deleted/added
        setRowStyle(() => {
            let newRowArr = [];
            let deletedRowArr = [];
            let editedRowArr = [];
            // Obtain rows that are newly added
            const checkNewRow = docPendingTableData.filter((data, index) => {
                return data.parentItemID === null;
            });
            checkNewRow.forEach((data) => {
                newRowArr.push(data.id);
            });

            // Obtain deleted rows
            docTableData.forEach((activeData, activeIndex) => {
                let isDeleted = true;
                docPendingTableData.forEach((pendingData, pendingIndex) => {
                    if (pendingData.parentItemID === activeData.id) {
                        isDeleted = false;
                    }
                });
                if (isDeleted === true) {
                    deletedRowArr.push(activeData.id);
                }
            });

            // Obtain edited rows
            docPendingTableData.forEach((pendingData, pendingIndex) => {
                
                docTableData.forEach((activeData, activeIndex) => {
                    if (pendingData.parentItemID === activeData.id) {
                        // Check if the fields has been edited
                        if (pendingData.interested_parties !== activeData.interested_parties || pendingData.needs_n_expectations !== activeData.needs_n_expectations) {
                            editedRowArr.push(pendingData.id);
                        }
                    }
                })
            })
            return ({
                newRowArr,
                deletedRowArr,
                editedRowArr
            });

        })}, [docPendingTableData, docTableData]);

    useEffect(() => {
        setRowStyleTable(() => ((row, rowIndex) => {
            const style = {};
            rowStyle.newRowArr.forEach((data) => {
                if (row.id === data) {
                    style.backgroundColor = '#FFF3CD';
                    style.textDecoration = 'underline';
                }
            });
    
            rowStyle.deletedRowArr.forEach((data) => {
                if (row.id === data) {
                }
            })
          
            rowStyle.editedRowArr.forEach((data) => {
                if (row.id === data) {
                    style.backgroundColor = '#FFF3CD';
                    style.fontWeight = 'bold';
                }
            })
          
            return style;
        }));
    }, [rowStyle]);
    
    return (
        <div className="c-IP__Document-content c-Document">
            {/* Title */}
            <h1>{docPendingHeaderData.title ? docPendingHeaderData.title : "Failed to load data!"}</h1>
            {/* Document Header info */}
            <div className="c-IP__Document-header c-Document__Header">
                <div className="c-IP__Document-header--left c-Document__Header--left">
                    <p>To be approved by:</p>
                    <p>Submitted by:</p>
                </div>
                <div className="c-IP__Document-header--right c-Document__Header--right">
                    <p>{docPendingHeaderData.approved_by ? docPendingHeaderData.approved_by : "Failed to load data!"}</p>
                    <p>{docPendingHeaderData.created_by ? docPendingHeaderData.created_by : "Failed to load data!"}</p>
                </div>
            </div>
            {/* Table section */}
            <BootstrapTable keyField={docKeyfield} data={docPendingTableData} columns={docColumns} rowStyle={ rowStyleTable } />
        </div>
    )
}

export default InterestedPartyPending;
