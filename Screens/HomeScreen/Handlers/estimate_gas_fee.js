const xrpl = require('xrpl');
const {switchRPC} = require('./switch_rpc');

const getEstimatedFee = async node => {
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
  const serverInfo = await client.request({
    id: 1,
    command: 'server_info',
  });
  client.disconnect();
  return {
    fee:
      Number(serverInfo?.result?.info?.load_factor) *
        Number(serverInfo?.result?.info?.validated_ledger?.base_fee_xrp) ||
      '0.00001',
  };
};

export default getEstimatedFee;
