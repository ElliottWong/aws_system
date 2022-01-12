import React, { useState, useEffect } from 'react';
import { getSideNavStatus } from '../../utilities/sideNavUtils.js';
import { ToastContainer } from 'react-toastify';
import PageLayout from '../../layout/PageLayout';
import config from '../../config/config';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import Select from "react-select";
import axios from 'axios';
import TokenManager from '../../utilities/tokenManager.js';

const CreateAnnouncement = () => {
    const toastTiming = config.toastTiming;
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;

    // State declarations
    const [recipientGroup, setRecipientGroup] = useState([
        { label: 'Swedish', value: 'Swedish' },
        { label: 'English', value: 'English' },
        { label: 'English', value: 'English' },
        { label: 'English', value: 'English' },
        { label: 'English', value: 'English' },
    ]);
    const [allRecipients, setAllRecipients] = useState([]);
    const [sideNavStatus, setSideNavStatus] = useState(getSideNavStatus);
    const [editorState, setEditorState] = useState(() => (EditorState.createEmpty()));  // Create initial editorState

    useEffect(() => {
        let componentMounted = true;
        (async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/employees`);
                const employeesData = res.data.results;
                console.log(res);
                console.log(employeesData);
                if (componentMounted) {
                    setAllRecipients(() => employeesData.map((data, index) => ({
                        label: `@${data.account.username}`,
                        value: data.account.username
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
            <PageLayout sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} title='View Announcement' activeLink="/announcements">
                <div className="c-Create-announcement c-Main">
                    {/* Breadcrumb */}
                    <Breadcrumb className="c-Create-announcements__Breadcrumb l-Breadcrumb">
                        <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item href="/announcements">Announcements</Breadcrumb.Item>
                        <Breadcrumb.Item active>Create Announcement</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Top section */}
                    <div className="c-Create-announcement__Top c-Main__Top">
                        <h1>Create Announcement</h1>
                        <button type="button" className="c-Btn c-Btn--primary">Publish</button>
                    </div>

                    {/* Content section */}
                    <div className="c-Create-announcement__Fields c-Fields">
                        <div className="c-Fields__Left">
                            <div className="c-Fields__Recipients">
                                <h2>Send to</h2>
                                <Select
                                    isMulti
                                    options={recipientGroup}
                                    placeholder="Select recipient group"
                                />
                                <h3>Or</h3>
                                <Select
                                    isMulti
                                    options={allRecipients}
                                    placeholder="Select specific recipients"
                                />
                            </div>
                            <div className="c-Fields__Title">
                                <label htmlFor="title">Title</label>
                                <input type="text" name="title" placeholder="Enter title" />
                            </div>
                            <div className="c-Fields__Content">
                                <h2>Content</h2>
                                <Editor
                                    editorState={editorState}
                                    wrapperClassName="demo-wrapper"
                                    editorClassName="demo-editor"
                                    onEditorStateChange={setEditorState}
                                    placeholder='Enter content'
                                />
                            </div>
                            <div className="c-Fields__More-info">
                                <h2>More info</h2>
                                <input type="checkbox" name="sendEmail" />
                                <label htmlFor="sendEmail">Send announcement to specified employees via email</label>
                            </div>
                        </div>

                        <span className="c-Fields__VL"></span>

                        <div className="c-Fields__Right">
                            <h2>Attachments</h2>
                        </div>
                    </div>

                </div>


            </PageLayout>
        </>
    )
}

export default CreateAnnouncement
