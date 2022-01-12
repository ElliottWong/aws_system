import React from 'react';

const CustomConfirmAlert = ({ message, type = "primary", handler, heading, onClose }) => {
    return (
        <div className='c-Confirm-alert c-Confirm-alert--send-invite'>
            <h1>{heading}</h1>
            <p>{message}</p>
            <div className='c-Confirm-alert__Buttons'>
                <button className={"c-Btn c-Btn--" + type} onClick={() => (handler(onClose))}>Confirm</button>
                <button className="c-Btn c-Btn--cancel" onClick={onClose}> Cancel</button>
            </div>
        </div>
    );
}
export default CustomConfirmAlert;
