import React, { useState, useEffect } from 'react';
import DashboardBentoBox from '../common/DashboardBentoBox';
import PageLayout from '../layout/PageLayout';
import { getUserDisplayName } from '../utilities/localStorageUtils';
import { getSideNavStatus } from '../utilities/sideNavUtils';


const Dashboard = () => {

    const displayName = getUserDisplayName();

    // State declaration
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);

    return (
        <>
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title="Dashboard" activeLink="/dashboard">

                <div className="c-Dashboard c-Main">
                    {/* Welcome message */}
                    <div className="c-Dashboard__Welcome">
                        <h1>Welcome!</h1>
                        <h2>{displayName ? displayName : "Error in retrieving name"}</h2>
                    </div>

                    {/* Statistic section */}
                    <div className="c-Dashboard__Stats">
                        <DashboardBentoBox bgVariation={1} stat="N.a." statType="Coming soon..." />
                        <DashboardBentoBox bgVariation={2} stat="N.a." statType="Coming soon..." />
                    </div>

                </div>


            </PageLayout>
        </>
    )
}

export default Dashboard;