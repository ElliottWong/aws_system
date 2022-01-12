// Error can be custom codes e.g. 1 for "Error in routing"

/**
 * Standard format for backend responses
 * @param {boolean} OK Whether the request was dealt successfully
 * @param {number} status The HTTP response status 
 * @param {string} [message="No message"] Backend response message, should be short
 * @param {*} [data] Any data in response
 * @param {*} [error] An error
 * @returns {{}} An object
 */
const createResJSON = (OK, status, message = 'No message', data, error) => {
    if (OK) {
        // no empty arrays
        // const isEmptyArray = Array.isArray(data) && data.length === 0;
        // if (isEmptyArray) data = undefined;

        // coerce null into undef
        if (data === null) data = undefined;

        return {
            OK, status,
            message, results: data
        };
    }

    // not ok should not be used
    // in favour of custom error handling
    return {
        OK, status,
        message, error
    };
};

// COMMON STATUS CODE RESPONSES

const success200 = (data) => createResJSON(true, 200, 'Success', data);

const success201 = (data) => createResJSON(true, 201, 'Successfully created', data);

// i found out its pointless to do 204 because it will literally not respond with anything
const success204 = () => createResJSON(true, 204);

const error400 = (error) => createResJSON(false, 400, 'Error in request syntax', null, error);

const error401 = (error) => createResJSON(false, 401, 'Reauthentication required', null, error);

const error403 = (error) => createResJSON(false, 403, 'Forbidden action', null, error);

const error404 = (error = { message: 'Not found' }) => createResJSON(false, 404, 'Not found', null, error);

const error500 = (error) => createResJSON(false, 500, 'Internal error', null, { name: error.name ?? 'UnknownError', message: error.message ?? 'No message' });

module.exports = {
    createResJSON,
    responses: {
        success200,
        success201,
        success204,
        error400,
        error401,
        error403,
        error404,
        error500
    }
};
