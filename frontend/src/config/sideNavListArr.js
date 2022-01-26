const sideNavListArr = [
    {
        link: "/dashboard",
        display: "Dashboard"
    },
    {
        link: "/announcements",
        display: "Announcements"
    },
    {
        link: "/swot",
        display: "4.1 SWOT"
    },
    {
        link: "/interested-party",
        display: "4.2 Interested Party"
    },
    {
        link: "/scope-of-qms",
        display: "4.3 Scope of QMS"
    },
    {
        link: "/company-policy",
        display: "5.2 Company Policy"
    },
    {
        link: "/responsibility-n-authority",
        display: "5.3 Resp. & Authority"
    },
    {
        link: "/risk-n-opportunity",
        display: "6.1 Risk & Opp."
    },
    {
        link: "/objective-achievement-program",
        display: "6.2 Obj. Achiv. Program"
    },
    {
        link: "/equipment-maintenance",
        display: "7.1 Equipment Maintenance Program"
    },
    {
        link: "/licenses",
        display: "7.2 Permits Licenses"
    },
    {
        link: "/training",
        display: "7.3 Training",
        subLinksArr: [
            {
                header: "Training Pages",
                subLinks: [
                    {
                        link: "/requests",
                        display: "My Requests"
                    },
                    {
                        link: "/records",
                        display: "My Records"
                    },
                    {
                        link: "/manage/requests",
                        display: "Incoming Requests"
                    },
                    {
                        link: "/manage/records",
                        display: "Assigned Records"
                    },
                    {
                        link: "/post-evaluation-templates",
                        display: "Manage Post Evaluation Templates"
                    }
                ]
            }
        ]
    },
    {
        link: "/settings",
        display: "Settings",
        minHeight: "380.8px",
        subLinksArr: [
            {
                header: "Overview",
                subLinks: [
                    {
                        link: "",
                        display: "Settings Overview"
                    }
                ]
            },
            {
                header: "User Settings",
                subLinks: [
                    {
                        link: "/manage-account",
                        display: "Manage Account"
                    },
                    {
                        link: "/notifications",
                        display: "Notifications"
                    },
                ]
            },
            {
                header: "Organisation Settings",
                subLinks: [
                    {
                        link: "/manage-organization",
                        display: "Manage Organization"
                    },
                    {
                        link: "/manage-users",
                        display: "Manage Users"
                    },
                    {
                        link: "/manage-invites",
                        display: "Manage Invites"
                    },
                    {
                        link: "/induction-templates",
                        display: "Manage Induction Templates"
                    }
                ]
            }
        ]
    },
];
export default sideNavListArr;