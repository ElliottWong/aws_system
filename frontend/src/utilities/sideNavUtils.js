import { getUserSideNavStatus, saveUserSideNavStatus } from './localStorageUtils.js';

export const getSideNavStatus = () => {
    const tempSideNavStatus = getUserSideNavStatus();

    // Default value
    if (tempSideNavStatus == null || tempSideNavStatus === "true") {
        saveUserSideNavStatus(true);
        return true;
    }
    saveUserSideNavStatus(false);
    return false;
}