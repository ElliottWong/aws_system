import React, { useState } from 'react';
import axios from 'axios';
import { getToken, getUserCompanyID } from '../utilities/localStorageUtils';
import * as RiIcons from 'react-icons/ri';
import { IconContext } from 'react-icons';
import dayjs from 'dayjs';
import { toast, ToastContainer } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import CustomConfirmAlert from './CustomConfirmAlert';
import TokenManager from '../utilities/tokenManager';



const ManageDeleteArchivedDoc = ({ deleteUrl, docHeaderUrl, setArchivedDocData, docType, idName }) => {
    const token = TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;
    // Call endpoint to delete doc first
    const deleteArchivedDoc = () => {
        // Confirmation dialogue for deleting archived document
        const message = `Are you sure you want to delete this document? Click confirm to proceed.`;
        const handler = (onClose) => handleDeleteArchiveDoc(onClose);
        const heading = `Confirm Delete?`;
        const type = "alert"
        const data = {
            message,
            handler,
            heading,
            type
        };
        confirmAlert({
            customUI: ({ onClose }) => {
                return <CustomConfirmAlert {...data} onClose={onClose} />;
            }
        });
        const handleDeleteArchiveDoc = (onClose) => {
            axios.delete(deleteUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    axios.get(docHeaderUrl, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                        .then((res) => {
                            let filteredArchivedDocData;
                            if (res.data.results !== undefined) {
                                // Set archives data
                                filteredArchivedDocData = res.data.results.filter((resObj) => {
                                    return resObj.status === 'archived';
                                });
                            } else {
                                // Set archives data
                                filteredArchivedDocData = res.data.filter((resObj) => {
                                    return resObj.status === 'archived';
                                });
                            }


                            var formattedArchivedDocData = filteredArchivedDocData.map((archivedData, index) => {
                                return ({
                                    ...archivedData,
                                    id: archivedData[idName],
                                    serialNo: index + 1,
                                    name: archivedData.title,
                                    approved_on: dayjs(new Date(archivedData.approved_on)).format("MMMM D, YYYY h:mm A"),
                                    active_till: dayjs(new Date(archivedData.updated_at)).format("MMMM D, YYYY h:mm A"),
                                    action_view: `/${docType}/archived/${archivedData[idName]}`,
                                    action_delete: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/${docType}/${archivedData[idName]}`
                                });
                            })
                            setArchivedDocData(() => (formattedArchivedDocData));
                            onClose();
                            toast.success(<>Success!<br />Message: <b>Document Deleted!</b></>);
                        })
                        .catch((err) => {
                            console.log(err);
                            let errCode = "Error!";
                            let errMsg = "Error!"
                            if (err.response !== undefined) {
                                errCode = err.response.status;
                                errMsg = err.response.data.message;
                            }
                            onClose();

                            toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
                        });
                })
                .catch((err) => {
                    console.log(err);
                });
        };


    }

    return (
        <div className="c-Archived-Delete-Btn">
            <IconContext.Provider value={{ color: "#DC3545", size: "21px" }}>
                <RiIcons.RiDeleteBin7Line onClick={deleteArchivedDoc} />
            </IconContext.Provider>
        </div>

    );
}

export default ManageDeleteArchivedDoc;