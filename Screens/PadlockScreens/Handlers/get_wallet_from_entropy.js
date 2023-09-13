const xrpl = require('xrpl');

const getWalletFromEntropy = (entropyString) => {
    return xrpl.Wallet.fromEntropy(entropyString);
}

export default getWalletFromEntropy;