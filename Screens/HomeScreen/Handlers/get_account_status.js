const xrpl = require('xrpl');
const {switchRPC} = require('./switch_rpc');

const getAccountStatus = async (address, node, rpcUrls, setNode) => {
  // check if account is on ledger or not
  // rNnFHe8PcZtFQkeM6EofvhqmWAt4f5UUxy
  let client;
  try {
    client = new xrpl.Client(node);
    await client.connect();
  } catch (e) {
    // switchRPC(node, rpcUrls).then(res => {
    //   setNode(res);
    //   getAccountStatus(address, res, rpcUrls, setNode);
    // });
  }

  const account_info_A = await client.request({
    command: 'account_info',
    account: address,
    ledger_index: 'validated',
  });
  client.disconnect();
  return account_info_A.result;
};

export default getAccountStatus;
