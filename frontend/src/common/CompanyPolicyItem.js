import React from 'react';
import * as RiIcons from 'react-icons/ri';
import { IconContext } from 'react-icons';

const CompanyPolicyItem = ({
    itemTitle,
    itemContent,
    itemIndex,
    docType,
    setDocEditTableData }) => { // start of CompanyPolicyItem

    const renderEditItem = () => {
        return (
            <div className={(itemIndex + 1) % 2 === 0 ? "l-Company-Policy-Item l-Company-Policy-Item--even" : "l-Company-Policy-Item l-Company-Policy-Item--odd"}>
                <div className="c-Company-Policy-Item" >
                    <div className="c-Company-Policy-Item__Top">
                        <input type="text" name="title" onChange={handleInputChange} value={itemTitle} />
                        <IconContext.Provider value={{ color: "#DC3545", size: "21px" }}>
                            <RiIcons.RiDeleteBin7Line onClick={() => (handleDocDeleteRow(itemIndex + 1))} />
                        </IconContext.Provider>
                    </div>
                    <textarea type="text" name="content" onChange={handleInputChange} value={itemContent}></textarea>
                </div>
            </div>
        );
    };

    // Handler for deleting row
    const handleDocDeleteRow = (deleteRowSerialID) => {
        setDocEditTableData((prevDocTableData) => {

            // Remove deleted row from data array
            let newDocTableData = prevDocTableData.filter((dataElem) => {
                return dataElem.serialNo !== deleteRowSerialID;
            });

            // Update serial no.
            let formattedDocTableData = newDocTableData.map((dataElem, index) => {
                return ({
                    ...dataElem,
                    serialNo: index + 1
                });
            })

            return formattedDocTableData;
        });
    }

    // Handler for input 
    const handleInputChange = (event) => {
        setDocEditTableData((prevState) => {
            return prevState.map((data, index) => {
                if (itemIndex === index) {
                    return {
                        ...data,
                        [event.target.name]: event.target.value
                    }
                }
                return data;
            });
        });
    }

    const renderItem = () => {
        return (
            <div className={(itemIndex + 1) % 2 === 0 ? "l-Company-Policy-Item l-Company-Policy-Item--even" : "l-Company-Policy-Item l-Company-Policy-Item--odd"}>
                <div className="c-Company-Policy-Item" >
                    <h1>{itemTitle ? itemTitle : "Error"}</h1>
                    <p>{itemContent ? itemContent : "itemContent"}</p>
                </div>
            </div>
        );
    }
    return (
        <>
            {
                docType === "editing" ?
                    renderEditItem()
                    :
                    renderItem()
            }
        </>
    )
}

export default CompanyPolicyItem;