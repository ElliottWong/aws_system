import React, { useState } from 'react';

const DashboardBentoBox = ({bgVariation, fg, stat, statType}) => {

    return (
        <div className = {bgVariation ? `c-Dashboard-bento-box c-Dashboard-bento-box--${bgVariation}` : "c-Dashboard-bento-box"}>
            <h1>{stat ? stat : "Error"}</h1>
            <p>{statType ? statType : "Error"}</p>
        </div>
    )
}

export default DashboardBentoBox;