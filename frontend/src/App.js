import React, { useState, useEffect, useCallback } from 'react';
import Routes from './Routes.js';
import ErrorBoundary from "./pages/ErrorBoundary";
import axios from 'axios';
import TokenManager from './utilities/tokenManager';
import ErrorCard from './common/ErrorCard.js';
import Loading from './common/Loading.js';

const App = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const verifyUser = useCallback(async () => {
        setLoading(() => true);
        await getRefreshToken();
        setLoading(() => false);
    }, []);

    const getRefreshToken = async () => {
        try {
            console.log("attempted to refresh token again");
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${process.env.REACT_APP_BASEURL}/refresh`, {}, { withCredentials: true });
            console.log(res);
            if (res.status === 200) {
                const accessToken = res.data.results.token;

                TokenManager.setToken(accessToken);
                axios.defaults.headers.common['Authorization'] = `bearer ${accessToken}`;

                // call refreshToken every 30 minutes to renew the authentication token.
                setTimeout(getRefreshToken, 30 * 60 * 1000);
            } else {
                TokenManager.logout();
            }
            setError(() => false);
        } catch (error) {
            console.log(error);
            if (error.response?.status !== 401) {
                setError(() => true);
                TokenManager.logout();
            }
            TokenManager.setMessage(error.response?.data.message);
        }
    };

    useEffect(() => {
        verifyUser();
    }, []);

    return (
        <>
            <ErrorBoundary>
                {
                    error ?
                        <ErrorCard />
                        :
                        loading ?
                            <Loading /> :
                            <Routes />
                }
            </ErrorBoundary>
        </>
    )
}

export default App;