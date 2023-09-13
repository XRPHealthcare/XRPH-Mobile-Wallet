const xrpl = require('xrpl');

const getAccountStatus = async (address) => {
    // check if account is on ledger or not
    // rNnFHe8PcZtFQkeM6EofvhqmWAt4f5UUxy

    const client = new xrpl.Client("wss://xrplcluster.com/");
    await client.connect();

    const account_info_A = await client.request({
        command: "account_info",
        account: address,
        ledger_index: "validated",
    })
    client.disconnect();
    return account_info_A.result;
}

export default getAccountStatus;