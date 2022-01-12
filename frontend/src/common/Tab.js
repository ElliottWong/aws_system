import React from 'react';
import { TAB } from '../config/enums';

const Tab = ({ handleTabOnClick, tabType, children, focus, tabSettings }) => {

    return (
        <>
            {tabType
                ?
                <div className="c-Tab" >
                    <div className={focus ? "c-Tab--focused" : "c-Tab--unfocused"}>
                        <span 
                            onClick={handleTabOnClick ? handleTabOnClick : null} 
                            // Prevent user from clicking on active if form is in editing mode
                            className={tabType ? (tabType === 'Active' && tabSettings.secondTab === TAB.EDITING || tabType === "Inactive" && tabSettings.secondTab === TAB.EDITING ? "c-Tab--disabled c-Tab--" + tabType.toLowerCase() :  "c-Tab--" + tabType.toLowerCase()) : null}
                        >
                            {children ? children : tabType}
                        </span>
                    </div>
                </div>
                :
                null
            }

        </>
    )
}

export default Tab;