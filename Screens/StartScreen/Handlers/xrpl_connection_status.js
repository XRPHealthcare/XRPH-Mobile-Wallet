const xrpl = require('xrpl');

const checkConnectionStatus = async node => {
  try {
    const client = new xrpl.Client(
      node,
      {
        connectionTimeout: 60000,
      }
    );
    await client.connect();
    client.disconnect();
    return true;
  } catch (e) {
    console.log('-----------error-------', e);
    console.log(e.message);
    return false;
  }
};

export default checkConnectionStatus;
