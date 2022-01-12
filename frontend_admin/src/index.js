import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import './assets/scss/main.scss';
import 'react-toastify/dist/ReactToastify.css';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

ReactDOM.render(
  <>
    <App />
  </>,
  document.getElementById('eISO-admin-root')
);