const xrpl = require('xrpl');

(async () => {
  // const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  // await client.connect();

  // const createAccountA = await client.fundWallet();
  // const accountA = createAccountA.wallet;

  // console.log(accountA);
  const address = '';
  const newWallet = xrpl.Wallet.fromEntropy('');
  console.log(newWallet.classicAddress); // true

  console.log(xrpl.isValidAddress(''));
  console.log(xrpl.isValidAddress('x'));

  // this works, but account needs to be funded in order for it to be active
})();
