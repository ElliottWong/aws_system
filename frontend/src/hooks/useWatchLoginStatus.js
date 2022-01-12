import React, { useEffect, useCallback } from 'react'

const useWatchLoginStatus = () => {
    const syncLogout = useCallback(event => {
        if (event.key === "logout") {
            window.location.reload();
        }
    }, []);

    useEffect(() => {
        window.addEventListener("storage", syncLogout)
        return () => {
            window.localStorage.removeItem("logout");
            window.removeEventListener("storage", syncLogout)
        }

    }, [syncLogout]);
}

export default useWatchLoginStatus;