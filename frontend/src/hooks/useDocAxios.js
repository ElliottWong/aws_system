import { useState, useEffect } from "react";
import axios from 'axios';
import TokenManager from "../utilities/tokenManager";

/*
    Custom hook for obtaining data
*/

const useDocAxios = (url) => {
    // State declarations
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const token = TokenManager.getToken();
    useEffect(() => {
        const fetchDocData = async (firstUrl, secondUrl) => {
            try {
                // GET document table data
                const resultDocTable = await axios.get(firstUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // GET basic details of the active document, and all the status of the document
                const resultHeaderData = await axios.get(secondUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setResponse(() => {
                    return ({
                        resultDocTable: resultDocTable.data,
                        resultHeaderData: resultHeaderData.data
                    })
                });
            } catch (error) {
                console.log("An error occured in useDocAxios.js", error);
                setError(() => (error));
            }
        }
        if (url != null) {
            fetchDocData(url.firstUrl, url.secondUrl);
        }
    }, [url]);

    return [response, error];
}

export default useDocAxios;