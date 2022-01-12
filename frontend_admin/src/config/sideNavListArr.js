const sideNavListArr = [
    {
        link: "/dashboard",
        display: "Dashboard"
    },
    {
        link: "/companies",
        display: "Companies"
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
                ]
            }
        ]
    },
];
export default sideNavListArr;