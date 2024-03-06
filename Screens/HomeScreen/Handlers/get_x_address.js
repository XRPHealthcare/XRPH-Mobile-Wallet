const xrpl = require('xrpl');

const getXAddress = (address) => {
    return xrpl.classicAddressToXAddress(address);
}

export default getXAddress;