import dayjs from 'dayjs';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { useHistory } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import config from '../../config/config';
import { managePETColumns } from '../../config/tableColumns';
import PageLayout from '../../layout/PageLayout';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import TokenManager from '../../utilities/tokenManager.js';
import StatusPill from '../../common/StatusPill';

const ManagePostEvaluationTemplates = () => {
    const toastTiming = config.toastTiming;
    const history = useHistory();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    const userID = decodedToken.employee_id;
    // State declarations
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus); // Tracks if sidenav is collapsed
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                // get all templates
                const resAllTemplates = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/training-evaluation/all-templates`);

                if (componentMounted) {
                    const tempAllTemplates = resAllTemplates.data.results;
                    console.log(tempAllTemplates)
                    setTemplates(() => tempAllTemplates.map((data, index) => ({
                        id: data.evaluation_template_id,
                        serialNo: index + 1,
                        template_title: data.name,
                        version: data.version,
                        created_by: "@" + data.author.account.username,
                        created_on: dayjs(new Date(data.created_at)).format("D MMM YYYY"),
                        status: (() => {
                            console.log(data.active)
                            if (data.active) {
                                return <StatusPill type="active" />
                            } else {
                                return <StatusPill type="inactive" />
                            }
                        })(),
                        action_manage: `/training/post-evaluation-templates/manage/${data.evaluation_template_id}`
                    })));
                }

            } catch (error) {
                console.log(error);
            }
        })();

        return (() => {
            componentMounted = false;
        });
    }, []);

    return (
        <>
            <ToastContainer
                position="top-center"
                autoClose={toastTiming}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='Manage Post Evaluation Templates' activeLink="/training">
                <div className="c-Manage-PET c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Manage-PET__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Manage Post Evaluation Templates</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* Top section */}
                    <div className="c-Manage-PET__Top c-Main__Top">
                        <h1>Manage Post Evaluation Templates</h1>
                        <button type="button" className="c-Btn c-Btn--primary" onClick={() => history.push("/training/post-evaluation-templates/create")}>Create New Template</button>
                    </div>
                    {/* Training requests pending for user's approval*/}
                    <div className="c-Manage-PET__Table">
                        {
                            templates.length > 0 ?
                                <BootstrapTable
                                    bordered={false}
                                    keyField='serialNo'
                                    data={templates}
                                    columns={managePETColumns}
                                // pagination={paginationFactory()}
                                /> :
                                "No records found!"
                        }

                    </div>

                </div>

            </PageLayout>
        </>
    )
}

export default ManagePostEvaluationTemplates;