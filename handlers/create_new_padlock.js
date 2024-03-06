const xrpl = require('xrpl');

const generateRandomNumber = () => {
  const min = 100000;
  const max = 999999;
  return Math.random() * (max - min) + min;
};

const checkIsNewAccount = async wallet => {
  try {
    const client = new xrpl.Client('wss://testnet.xrpl-labs.com/');
    await client.connect();
    const account_info = await client.request({
      command: 'account_info',
      account: wallet.classicAddress,
      ledger_index: 'validated',
    });
    console.log(account_info.result);
    client.disconnect();
    return false;
  } catch (e) {
    if (xrpl.isValidAddress(wallet.classicAddress)) {
      return true;
    }
    return false;
  }
};

export const createNewPadlock = () => {
  // returns an object with letters A-H as keys and 6 digits as the value
  // 6 digits = 99999 to 1000000

  let padlock = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
    G: 0,
    H: 0,
  };
  const initialValues = Array.from({length: 8}, () =>
    Math.floor(generateRandomNumber()),
  );
  let values = [];

  for (let i = 0; i < 8; i++) {
    values[i] = initialValues[i].toString().split('');
  }

  let i = 0;
  for (const key in padlock) {
    padlock[key] = values[i];
    i += 1;
  }

  const entropyString =
    padlock['A'].join('') +
    ' ' +
    padlock['B'].join('') +
    ' ' +
    padlock['C'].join('') +
    ' ' +
    padlock['D'].join('') +
    ' ' +
    padlock['E'].join('') +
    ' ' +
    padlock['F'].join('') +
    ' ' +
    padlock['G'].join('') +
    ' ' +
    padlock['H'].join('');
  // console.log(padlock);
  // console.log("Entropy String: ", entropyString);
  const wallet = xrpl.Wallet.fromEntropy(entropyString);

  checkIsNewAccount(wallet).then(res => {
    if (res) {
      console.log('Account Does Not Exist');
      return padlock;
    } else {
      console.log('Account Exists');
      createNewPadlock();
    }
    // createNewPadlock();
  });
  // fetch account data
  // looking for an error of actNotFound

  return padlock;
};
