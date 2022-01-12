import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import { useHistory } from 'react-router-dom';

const PageNotFound = () => {
    const [show, setShow] = useState(true);
    const history = useHistory();

    const goBack = () => {
        history.goBack();
    }

    return (
        <div className="c-Page-not-found">
            <div className="c-Page-not-found__Alert-box">
                <Alert variant="danger">
                    <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
                    <p>This page doesn't exists :/ Would you like to go back?</p>
                    <button className="c-Alert-box__Back-btn c-Btn c-Btn--cancel" onClick={goBack}>Go back</button>
                </Alert>
            </div>
        </div>
    )
}

export default PageNotFound;
