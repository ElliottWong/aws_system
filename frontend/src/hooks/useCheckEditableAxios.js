import { useState, useEffect } from "react";
import axios from 'axios';
import TokenManager from "../utilities/tokenManager";

const useCheckEditableAxios = (url) => {
    // State declarations
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const token = TokenManager.getToken();

    useEffect(() => {
        const checkIfCanEdit = async (firstUrl, secondUrl, thirdUrl) => {
            try {
                // GET document table data
                const checkIfEmployeeCanEdit = await axios.get(firstUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
        
                // GET basic details of the active document, and all the status of the document
                const checkIfPendingExist = await axios.get(secondUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
        
                const checkIfRejectedExist = await axios.get(thirdUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setResponse(() => {
                    return ({
                        checkIfEmployeeCanEdit,
                        checkIfPendingExist,
                        checkIfRejectedExist
                    })
                });
            } catch (error) {
                console.log("An error occured in useDocAxios.js", error);
                setError(() => (error));
            }
        };
        if (url != null) {
            checkIfCanEdit(url.firstUrl, url.secondUrl, url.thirdUrl);
        }
    }, [url]);

    return [response, error];
}

export default useCheckEditableAxios;