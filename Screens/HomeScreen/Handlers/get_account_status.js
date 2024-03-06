const xrpl = require('xrpl');

const getAccountStatus = async (address, node) => {
  const client = new xrpl.Client(node);
  await client.connect();

  const account_info_A = await client.request({
    command: 'account_info',
    account: address,
    ledger_index: 'validated',
  });
  client.disconnect();
  return account_info_A.result;
};

export default getAccountStatus;
