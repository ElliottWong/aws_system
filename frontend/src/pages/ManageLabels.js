import React, { useState, useEffect } from 'react';
import PageLayout from '../layout/PageLayout';
import { getSideNavStatus } from '../utilities/sideNavUtils';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import axios from 'axios';
import { getToken, getUserCompanyID } from '../utilities/localStorageUtils';
import { useHistory } from 'react-router';
import jwt_decode from 'jwt-decode';
import ErrorCard from '../common/ErrorCard.js';
import paginationFactory from 'react-bootstrap-table2-paginator';
import TokenManager from '../utilities/tokenManager';
import * as RiIcons from 'react-icons/ri';
import { IconContext } from 'react-icons';

const ManageLabels = () => {

    const history = useHistory();
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();


    const manageLabelsColumns = [
        {
            dataField: 'id',
            text: 'Id',
            hidden: true
        },
        {
            dataField: 'serialNo',
            text: '#',
        },
        {
            dataField: 'name',
            text: 'Name'
        },
        {
            dataField: 'action_edit',
            text: '',
            formatter: (cell, row) => {
                return <button type="button">Edit</button>
            }
        },
        {
            dataField: 'action_delete',
            text: '',
            formatter: (cell, row) => {
                return (
                    <IconContext.Provider value={{ color: "#DC3545", size: "16px" }}>
                        <RiIcons.RiDeleteBin7Line className="c-Table-Btn--bin c-Table-Btn" />
                    </IconContext.Provider>
                );
            }
        },
    ];

    // State declaration
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [labels, setLabels] = useState([]);

    useEffect(() => {

    }, []);


    return (
        <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title="Manage Labels" activeLink="/settings">
            <div className="c-Manage-labels c-Main">
                {/* Breadcrumb */}
                <Breadcrumb className="c-Manage-labels l-Breadcrumb">
                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item href="/settings">Settings</Breadcrumb.Item>
                    <Breadcrumb.Item active>Manage Labels</Breadcrumb.Item>
                </Breadcrumb>

                {/* Top section */}
                <div className="c-Manage-labels__Top c-Main__Top">
                    <h1>Manage Labels</h1>
                    <button type="button" className="c-Btn c-Btn--primary">Add</button>
                </div>

                {/* Table section */}
                <div className="c-Manage-labels__Table">
                    <BootstrapTable
                        keyField='serialNo'
                        bordered={false}
                        data={labels}
                        columns={manageLabelsColumns}
                    />
                </div>

            </div>
        </PageLayout>
    );
};

export default ManageLabels;
