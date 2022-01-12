import React from 'react';

const DocumentLayout = ({ isDocCollapsed, children }) => {
    return (
        <div className={isDocCollapsed ? "l-Document l-Document__collapsed" : "l-Document"}>
            {children}
        </div>
    )
}

export default DocumentLayout;