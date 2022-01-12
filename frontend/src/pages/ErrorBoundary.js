// import React from 'react';

// // This class component can only be written in class format,
// // purpose of this is to show a friendly message to users
// // if there is an error with the app e.g. api call fail
// // However, they do NOT catch all types of errors
// // More information here: https://reactjs.org/docs/error-boundaries.html

import React from "react";
import Alert from 'react-bootstrap/Alert';

export default class ErrorBoundary extends React.Component {
    state = { hasError: false };

  static getDerivedStateFromError(error) {
    console.log(error);
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      
      // You can render any custom fallback UI
      return (
        <div className="c-Page-not-found">
            <div className="c-Page-not-found__Alert-box">
                <Alert variant="danger">
                    <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
                    <p>Something went wrong, try again later!</p>
                </Alert>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}
