import React from 'react'

// Swot items refer to swot heading + its list of data

const SwotItems = ({header, children}) => {
    return (
        <div className = "c-Swot-item">
            <h1 className="c-Swot-item__Header">{header}</h1>
            {children}
        </div>
    )
}

export default SwotItems;