import jwtDecode from "jwt-decode";
import axios from 'axios';

const tokenManager = () => {
    console.log("token manager has been run");
    let accessToken = null;
    let message = "";

    const getToken = () => accessToken;

    const getDecodedToken = () => {
        if (accessToken) {
            return jwtDecode(accessToken);
        } else {
            return null;
        }
    };

    const setToken = (pToken) => {
        accessToken = pToken;
        return true;
    };

    const removeToken = () => {
        accessToken = null;
        return true;
    };

    const logout = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_BASEURL}/logout`, {}, {withCredentials: true});
            window.localStorage.setItem("logout", Date.now());
            accessToken = null;
            return true;
        } catch (error) {
            console.log(error);
            console.log(error.response)
            return false;
        };
    };

    const getMessage = () => message;

    const setMessage = (pMsg) => {
        message = pMsg;
        return true;
    };

    return {
        getToken,
        getDecodedToken,
        setToken,
        removeToken,
        logout,
        getMessage,
        setMessage
    };
};

export default tokenManager();