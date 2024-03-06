const xrpl = require("xrpl");

const isValidAddress = (address) => {
    return xrpl.isValidAddress(address);
}

export default isValidAddress;