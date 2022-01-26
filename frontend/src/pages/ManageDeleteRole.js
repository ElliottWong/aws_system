import axios from 'axios';
import dayjs from 'dayjs';
import React from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { IconContext } from 'react-icons';
import * as RiIcons from 'react-icons/ri';
import { toast } from 'react-toastify';
import CustomConfirmAlert from '../common/CustomConfirmAlert';
import TokenManager from '../utilities/tokenManager';


const ManageDeleteRole = ({ deleteUrl, refreshUrl, setRoleData, idName }) => {
    const token =  TokenManager.getToken();
    const decodedToken = TokenManager.getDecodedToken();
    const userCompanyID = decodedToken.company_id;

    // Call endpoint to delete doc first
    const deleteArchivedDoc = () => {
        // Confirmation dialogue for deleting role
        const message = `Are you sure you want to delete this role? Click confirm to proceed.`;
        const handler = (onClose) => handleDeleteRole(onClose);
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
        const handleDeleteRole = (onClose) => {
            axios.delete(deleteUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    axios.get(refreshUrl, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                        .then((res) => {
                            // Set role data
                            setRoleData(() => {
                                return res.data.results.map((data, index) => {
                                    return ({
                                        ...data,
                                        serialNo: index + 1,
                                        created_at: dayjs(new Date(data.created_at)).format("MMMM D, YYYY h:mm A"),
                                        updated_at: dayjs(new Date(data.updated_at)).format("MMMM D, YYYY h:mm A"),
                                        action_delete: `${process.env.REACT_APP_BASEURL}/company/${userCompanyID}/role/${data.role_id}`
                                    });
                                })
                            })
                            onClose();
                            toast.success(<>Success!<br />Message: <b>Role Deleted!</b></>);
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
                    onClose();
                    let errCode = "Error!";
                    let errMsg = "Error!"
                    if (err.response !== undefined) {
                        errCode = err.response.status;
                        errMsg = err.response.data.message;
                    }
                    toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
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

export default ManageDeleteRole;