import React, { useState, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { useHistory } from 'react-router';
import axios from 'axios';
import dayjs from 'dayjs';
import { getToken } from '../../utilities/localStorageUtils';
import paginationFactory from 'react-bootstrap-table2-paginator';

const Companies = () => {
    const { SearchBar, ClearSearchButton } = Search;
    const history = useHistory();
    const token = getToken();
    // State declaration
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [companiesData, setCompaniesData] = useState([]);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BASEURL}/companies`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res);
                const formattedDocTableData = res.data.results.map((companyData, index) => {
                    return ({
                        ...companyData,
                        serialNo: index + 1,
                        company_name: companyData.name,
                        company_alias: companyData.alias,
                        created_on: dayjs(new Date(companyData.created_at)).format("MMMM D, YYYY h:mm A")
                    });
                });
                setCompaniesData(() => (formattedDocTableData));
            })
            .catch((err) => {

            });
    }, []);

    const companiesColumn = [
        {
            dataField: 'company_id',
            text: 'Id',
            hidden: true
        },
        {
            dataField: 'serialNo',
            text: '#'
        },
        {
            dataField: 'company_name',
            text: 'Company Name'
        },
        {
            dataField: 'company_alias',
            text: 'Company Alias'
        },
        {
            dataField: 'created_on',
            text: 'Created On'
        },
        {
            dataField: 'status',
            text: 'Status'
        },
        {
            dataField: 'action_manage',
            text: '',
            formatter: (cell, row) => {
                return <a href={`/companies/manage-company/${row.company_id}`}>Manage</a>
            }
        },
    ];

    return (
        <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Companies' activeLink="/companies">
            <div className="c-Companies c-Main">
                {/* Breadcrumb */}
                <Breadcrumb className="c-Companies__Breadcrumb l-Breadcrumb">
                    <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item active>Companies</Breadcrumb.Item>
                </Breadcrumb>

                {/* Top section */}
                <div className="c-Companies__Top c-Main__Top">
                    <h1>Companies</h1>
                </div>

                {/* Table */}
                <div className="c-Companies__Table">
                    <ToolkitProvider
                        keyField="id"
                        data={companiesData}
                        columns={companiesColumn}
                        search

                    >
                        {
                            props => (
                                <div className="c-Table">
                                    <div className="c-Table__Top">
                                        <SearchBar {...props.searchProps} />
                                        <ClearSearchButton className="c-Table__Clear-btn" {...props.searchProps} />
                                        <button type="button" className="c-Btn c-Btn--primary" onClick={() => (history.push('/companies/add-company'))}>Add Company</button>
                                    </div>
                                    <hr />
                                    <BootstrapTable
                                        {...props.baseProps}
                                        bordered={false}
                                        pagination={paginationFactory()}
                                    />
                                </div>
                            )
                        }
                    </ToolkitProvider>

                </div>
            </div>
        </PageLayout>
    )
}

export default Companies;