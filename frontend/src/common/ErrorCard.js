import React from 'react';
import Alert from 'react-bootstrap/Alert';

const ErrorCard = ({ errMsg, errStatus, errStatusText }) => {
    return (
        <div className = "l-Error-card">
<div className="c-Error-card">
            <Alert variant="danger">
                <Alert.Heading>Error Code: {errStatus || "Unknown"} {errStatusText || null} </Alert.Heading>
                <p>{errMsg || "An unknown error has occured, try accessing again later!"}</p>
            </Alert>
        </div>
        </div>
        
    )
}

export default ErrorCard;