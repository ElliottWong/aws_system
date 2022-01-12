import React from 'react';
import Tab from "./Tab";
import { TAB } from '../config/enums';
// import { tabEndpointsListObj } from '../config/endpointsListObj';
import useEndpoints from '../hooks/useEndpoints';
import TokenManager from '../utilities/tokenManager';


const TabRow = ({ setIsDocCollapsed, setDocQueryEnum, setTabSettings, tabSettings, isDocCollapsed, setQueryUrl, pageType }) => {
    
    // Handler for collapse button
    const handleCollapseBtn = () => {
        setIsDocCollapsed((prevState) => {
            return !prevState;
        })
    };

    const [btnEndpointsListObj, tabEndpointsListObj] = useEndpoints({TokenManager});


    // Handler for tabs
    const handleTabOnClick = (newTabIndex, tabType) => {
        // Active tabs
        if (tabType === TAB.ACTIVE) {
            setDocQueryEnum(() => ('active'));
            if (pageType === "swot") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.swot.active,
                    secondUrl: tabEndpointsListObj.swot.getAll,
                });
            }
            else if (pageType === "interestedParty") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.interestedParty.active,
                    secondUrl: tabEndpointsListObj.interestedParty.getAll,
                });
            }
            else if (pageType === "scopeOfQMS") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.scopeOfQMS.active,
                    secondUrl: tabEndpointsListObj.scopeOfQMS.getAll,
                });
            }
            else if (pageType === "companyPolicy") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.companyPolicy.active,
                    secondUrl: tabEndpointsListObj.companyPolicy.getAll,
                });
            } else if (pageType === "riskNOpp") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.riskNOpp.active,
                    secondUrl: tabEndpointsListObj.riskNOpp.getAll,
                });
            } else if (pageType === "objAchivProgram") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.objAchivProgram.active,
                    secondUrl: tabEndpointsListObj.objAchivProgram.getAll,
                });
            }

        }

        // Pending tabs
        else if (tabType === TAB.PENDING) {
            // Pass in data
            console.log("setting query enum");
            setDocQueryEnum(() => ('pending'));
            if (pageType === "swot") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.swot.pending,
                    secondUrl: tabEndpointsListObj.swot.getAll,
                });
            }
            else if (pageType === "interestedParty") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.interestedParty.pending,
                    secondUrl: tabEndpointsListObj.interestedParty.getAll,
                });
            }
            else if (pageType === "scopeOfQMS") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.scopeOfQMS.pending,
                    secondUrl: tabEndpointsListObj.scopeOfQMS.getAll,
                });
            }
            else if (pageType === "companyPolicy") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.companyPolicy.pending,
                    secondUrl: tabEndpointsListObj.companyPolicy.getAll,
                });
            }
            else if (pageType === "riskNOpp") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.riskNOpp.pending,
                    secondUrl: tabEndpointsListObj.riskNOpp.getAll,
                });
            } else if (pageType === "objAchivProgram") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.objAchivProgram.pending,
                    secondUrl: tabEndpointsListObj.objAchivProgram.getAll,
                });
            }
        } 
        
        // Editing tabs
        else if (tabType === TAB.EDITING) {

            // Pass in data
        } 
        
        // Rejected tabs
        else if (tabType === TAB.REJECTED) {
            setDocQueryEnum(() => ('rejected'));
            if (pageType === "swot") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.swot.rejected,
                    secondUrl: tabEndpointsListObj.swot.getAll,
                });
            }
            else if (pageType === "interestedParty" ) {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.interestedParty.rejected,
                    secondUrl: tabEndpointsListObj.interestedParty.getAll,
                });
            }
            else if (pageType === "scopeOfQMS") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.scopeOfQMS.rejected,
                    secondUrl: tabEndpointsListObj.scopeOfQMS.getAll,
                });
            }
            else if (pageType === "companyPolicy") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.companyPolicy.rejected,
                    secondUrl: tabEndpointsListObj.companyPolicy.getAll,
                });
            }
            else if (pageType === "riskNOpp") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.riskNOpp.rejected,
                    secondUrl: tabEndpointsListObj.riskNOpp.getAll,
                });
            }
            else if (pageType === "objAchivProgram") {
                setQueryUrl({
                    firstUrl: tabEndpointsListObj.objAchivProgram.rejected,
                    secondUrl: tabEndpointsListObj.objAchivProgram.getAll,
                });
            }
        }
        setTabSettings((prevState) => ({
            ...prevState,
            focusTabIndex: newTabIndex
        }));

    };

    return (
        <>
            {/* Tabs */}
            <div className="l-Tabs__Row">
                <div className="l-Tabs__Row--left l-Tabs__Side">
                    <Tab
                        focus={tabSettings.focusTabIndex === 0 ? true : false}
                        tabType={tabSettings.firstTab}
                        handleTabOnClick={() => (handleTabOnClick(0, tabSettings.firstTab))}
                        tabSettings={tabSettings}
                    />
                    <Tab
                        focus={tabSettings.focusTabIndex === 1 ? true : false}
                        tabType={tabSettings.secondTab}
                        handleTabOnClick={() => (handleTabOnClick(1, tabSettings.secondTab))}
                    />
                </div>

                <div className="l-Tabs__Row--right l-Tabs__Side">
                    <Tab handleTabOnClick={handleCollapseBtn} tabType={TAB.COLLAPSE}>
                        {
                            isDocCollapsed ?
                                <>Expand Document</>
                                :
                                <>Collapse Document</>
                        }
                    </Tab>
                </div>
            </div>
        </>
    )
}

export default TabRow;