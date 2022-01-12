import React, { useState, useEffect } from 'react';

const RiskNOppItem = ({
    docType,
    rnoType,
    rnoItemData,
    rnoItemIndex,
    docEditTableData,
    setDocEditTableData
}) => { // start of RiskNOppItem

    const [optionsColorTheme, setOptionsColorTheme] = useState({
        type: "c-RNO-item__Options-item",
        severity: "c-RNO-item__Options-item",
        likelihood: "c-RNO-item__Options-item",
    }); // State for handling the risk evaluation sections
    const [rpn, setRpn] = useState();

    useEffect(() => {
        let type = optionsColorTheme.type;
        let severity = optionsColorTheme.severity;
        let likelihood = optionsColorTheme.likelihood;

        // Check type
        if (rnoItemData.type && rnoItemData.type === "opportunity") {
            type = type + " c-RNO-item__Options-item--green";
        } else if (rnoItemData.type && rnoItemData.type === "risk") {
            type = type + " c-RNO-item__Options-item--red";
        }

        // Check severity
        if (rnoItemData.severity && rnoItemData.severity === 1) {
            severity = severity + " c-RNO-item__Options-item--red";
        } else if (rnoItemData.severity && rnoItemData.severity === 5) {
            severity = severity + " c-RNO-item__Options-item--green";
        } else {

        }

        // Check likelihood
        if (rnoItemData.likelihood && rnoItemData.likelihood === 1) {
            likelihood = severity + " c-RNO-item__Options-item--red";
        } else if (rnoItemData.likelihood && rnoItemData.likelihood === 5) {
            likelihood = severity + " c-RNO-item__Options-item--green";
        }

        // Set rpn
        if (docType === "edit" && rnoItemData.severity && rnoItemData.likelihood) {
            setRpn(() => {
                return rnoItemData.severity * rnoItemData.likelihood;
            });
        } else if (docType === "edit") {
            setRpn(() => {
                return null;
            });
        } else {
            setRpn(() => (rnoItemData.rpn))
        }

        // Set the classnames to get the color~~~ 
        setOptionsColorTheme(() => ({
            type,
            severity,
            likelihood
        }));
    }, [rnoItemData]);

    // This function is for formatting the options integer value to a human readable string
    const renderOptions = () => {
        const type = rnoItemData.type;
        let severity = null;
        let likelihood = null;

        // Format severity
        switch (rnoItemData.severity) {
            case 1: {
                severity = "Negligible";
                break;
            }
            case 2: {
                severity = "Minor";
                break;
            }
            case 3: {
                severity = "Moderate";
                break;
            }
            case 4: {
                severity = "Major";
                break;
            }
            case 5: {
                severity = "Catastrophic";
                break;
            }
            default: {
                severity = "Nil";
                break;
            }
        }
        // Format likelihood
        switch (rnoItemData.likelihood) {
            case 1: {
                likelihood = "Rare";
                break;
            }
            case 2: {
                likelihood = "Remote";
                break;
            }
            case 3: {
                likelihood = "Occasional";
                break;
            }
            case 4: {
                likelihood = "Frequent";
                break;
            }
            case 5: {
                likelihood = "Almost Certain";
                break;
            }
            default: {
                likelihood = "Nil";
                break;
            }
        }


        return (
            <>
                <span className={optionsColorTheme.type}>{type || "Nil"}</span>
                <span className={optionsColorTheme.severity}>{severity}</span>
                <span className={optionsColorTheme.likelihood}>{likelihood}</span>
            </>
        )
    }

    // Only rendered when document is in editing mode
    const renderEditOptions = () => {
        if (docEditTableData.length !== 0) {
            return (
                <>
                    {/* Opportunity / Risk */}
                    <select value={docEditTableData[rnoType][rnoItemIndex].type || ''} name="type" onChange={handleSelectChange}>
                        <option value="na">Nil</option>
                        <option value="risk">Risk</option>
                        <option value="opportunity">Opportunity</option>
                    </select>
                    {/* Severity Categories */}
                    <select value={docEditTableData[rnoType][rnoItemIndex].severity || ''} name="severity" onChange={handleSelectChange}>
                        <option value="na">Nil</option>
                        <option value={1}>Negligible</option>
                        <option value={2}>Minor</option>
                        <option value={3}>Moderate</option>
                        <option value={4}>Major</option>
                        <option value={5}>Catastrophic</option>
                    </select>
                    {/* Likelihood Categories and description */}
                    <select value={docEditTableData[rnoType][rnoItemIndex].likelihood || ''} name="likelihood" onChange={handleSelectChange}>
                        <option value="na">Nil</option>
                        <option value={1}>Rare</option>
                        <option value={2}>Remote</option>
                        <option value={3}>Occasional</option>
                        <option value={4}>Frequent</option>
                        <option value={5}>Almost Certain</option>
                    </select>
                </>
            );
        }
    }

    // Handle changes for select elements
    const handleSelectChange = (event) => {
        let newSelectValue = event.target.value;
        let toBeMultipliedWithNewSelectValue;

        // If the select input's name is not "type", change it to int type
        if (event.target.name !== "type") {
            newSelectValue = parseInt(newSelectValue);
            if (event.target.name === "likelihood") {
                toBeMultipliedWithNewSelectValue = rnoItemData.severity;
            } else if (event.target.name === "severity") {
                toBeMultipliedWithNewSelectValue = rnoItemData.likelihood;
            }
        }

        setDocEditTableData((prevState) => ({
            ...prevState,
            [rnoType]: (() => ( // rnoType can be strength, weakness, opp, or threat
                prevState[rnoType].map((data, index) => {
                    if (rnoItemIndex === index) {
                        return {
                            ...data,
                            [event.target.name]: newSelectValue,
                            rpn: (() => {
                                if (event.target.name !== "type") {
                                    return newSelectValue * toBeMultipliedWithNewSelectValue
                                } else {
                                    return data.rpn
                                }
                            })()
                        }
                    }
                    return data;
                })
            ))()
        }));
        setRpn(() => {
            return docEditTableData[rnoType][rnoItemIndex].severity * docEditTableData[rnoType][rnoItemIndex].likelihood;
        });
    }

    // Handle for input change
    const handleInputChange = (event) => {
        setDocEditTableData((prevState) => ({
            ...prevState,
            [rnoType]: (() => ( // rnoType can be strength, weakness, opp, or threat
                prevState[rnoType].map((data, index) => {
                    if (rnoItemIndex === index) {
                        return {
                            ...data,
                            [event.target.name]: event.target.value
                        }
                    }
                    return data;
                })
            ))()
        }));
    }

    // Only rendered when document is in editing mode
    const renderActionPlanEdit = () => {
        if (rpn < 12 || rpn === null) {
            return (
                <>
                    <label htmlFor="action">Action Plan:</label>
                    <input type="text" name="action" readOnly placeholder = "Rpn < 12" value="" />
                </>
            );
        } else if (docEditTableData.length !== 0) {
            return (
                <>
                    <label htmlFor="action">Action Plan:</label>
                    <input type="text" name="action" onChange={handleInputChange} value={rnoItemData.action || ''} />
                </>
            );
        }
    }

    return (
        <div className="l-RNO-item">
            <div className="c-RNO-item">
                {/* Options */}
                <div className="l-RNO-item__Options">
                    <div className="c-RNO-item__Options c-RNO-item__Options--left">
                        {docType === "edit" ? // to be changed to if edit
                            renderEditOptions()
                            :
                            renderOptions()
                        }
                    </div>
                    {/* RPN */}
                    <div className="c-RNO-item__Options c-RNO-item__Options--right">
                        <p>RPN: {rpn ? rpn : "Nil"}</p>
                        {/* Last modified */}
                        <p>Modified: {rnoItemData.modified ? rnoItemData.modified : "Nil"}</p>
                    </div>
                </div>
                {/* Swot content */}
                <div className="c-RNO-item__SWOT">
                    <p>{rnoItemIndex + 1}</p>
                    <p>{rnoItemData.content}</p>
                </div>
                {/* Action plan */}
                <div className="c-RNO-item__Action-plan">
                    {
                        docType === "edit" ? // to be changed to if edit
                            renderActionPlanEdit()
                            :
                            <p>Action Plan: {rnoItemData.action ? rnoItemData.action : "Nil"}</p>
                    }

                </div>
            </div>
        </div >
    )
}

export default RiskNOppItem;