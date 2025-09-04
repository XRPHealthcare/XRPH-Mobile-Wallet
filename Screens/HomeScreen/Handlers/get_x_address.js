// const xrpl = require('xrpl');

// const getXAddress = (address) => {
//     return xrpl.classicAddressToXAddress(address);
// }

// export default getXAddress;

const xrpl = require('xrpl');

const getXAddress = (address) => {
    if (!address || typeof address !== 'string' || address.trim() === '') {
        // Return null, an error message, or any default value you'd like
        return 'Invalid address';
    }
    return xrpl.classicAddressToXAddress(address);
}

export default getXAddress;
