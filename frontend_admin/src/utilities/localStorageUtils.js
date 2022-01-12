// Set user's side navigation collapsed status
export const saveUserSideNavStatus = (sideNavStatus) => {
    localStorage.setItem('sideNavStatus', sideNavStatus);
}

// Return user's side navigation collapsed status
export const getUserSideNavStatus = () => {
    return localStorage.getItem('sideNavStatus') || null;
}

// Return the user's token
export const getToken = () => {
    return localStorage.getItem('token') || null;
}

// Return the user's first name and last name
export const getUserDisplayName = () => {
    return localStorage.getItem('displayName') || null;
}

// Return user's job title
export const getUserJobTitle= () => {
    return localStorage.getItem('jobTitle') || null;
}

// Return username
export const getUsername = () => {
    return localStorage.getItem('username') || null;
}

// Return user's email
export const getUserEmail = () => {
    return localStorage.getItem('email') || null;
}
// Return user's company alias
export const getUserCompanyAlias = () => {
    return localStorage.getItem('companyAlias') || null;
}

// Return the user's company name
export const getUserCompanyName = () => {
    return localStorage.getItem('companyName') || null;
}

// Return the user's company id
export const getUserCompanyID = () => {
    return localStorage.getItem('companyID') || null;
}

// Set the user's token when signing in
export const saveUserData = (token, displayName, jobTitle, username, email, companyID, companyAlias, companyName) => {
    localStorage.setItem('token', token);
    localStorage.setItem('displayName', displayName);
    localStorage.setItem('jobTitle', jobTitle);
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    localStorage.setItem('companyID', companyID);
    localStorage.setItem('companyAlias', companyAlias);
    localStorage.setItem('companyName', companyName);
}

// Clear user's localStorage
export const clearLocalStorage = () => {
    localStorage.clear();
}