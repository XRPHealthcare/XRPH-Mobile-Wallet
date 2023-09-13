const xrpl = require('xrpl');


const getAccountBalances = async (activeAccount) => {

    try {
        const issuerAddress = "rM8hNqA3jRJ5Zgp3Xf3xzdZcx2G37guiZk";
        const client = new xrpl.Client("wss://xrplcluster.com/");
        await client.connect();

        const account_info_B = await client.request({
            command: "account_info",
            account: activeAccount.classicAddress,
            ledger_index: "validated",
        })
        console.log('b: ', account_info_B.result.account_data.Balance);
        const XRPBalanceB = account_info_B.result.account_data.Balance;

        const account_lines = await client.request({
            command: "account_lines",
            account: activeAccount.classicAddress,
            ledger_index: "validated",
        })
        if (account_lines.result.lines.length === 0) {
            // establish trustline
            const wallet = xrpl.Wallet.fromSeed(activeAccount.seed);

            const currencyCode = "5852504800000000000000000000000000000000";
            const issuerAddress = "rM8hNqA3jRJ5Zgp3Xf3xzdZcx2G37guiZk";

            const trust_set_A = {
                TransactionType: "TrustSet",
                Account: activeAccount.classicAddress,
                LimitAmount: {
                    currency: currencyCode,
                    issuer: issuerAddress,
                    value: "10000000000" // Large limit, arbitrarily chosen
                }
            }
            const ts_prepared_A = await client.autofill(trust_set_A)
            const ts_signed_A = wallet.sign(ts_prepared_A)
            console.log("Creating trust line from hot address to issuer...")
            const ts_result_A = await client.submitAndWait(ts_signed_A.tx_blob)
            if (ts_result_A.result.meta.TransactionResult == "tesSUCCESS") {
                console.log(`Transaction succeeded: https://livenet.xrpl.org/transactions/${ts_signed_A.hash}`)
            } else {
                throw `Error sending transaction: ${ts_result_A.result.meta.TransactionResult}`
            }
        }

        try {
            const gateway_balances_B = await client.request({
                command: "gateway_balances",
                account: activeAccount.classicAddress,
                ledger_index: "validated",
            })
            console.log(gateway_balances_B.result.assets[issuerAddress]);
            let XRPHBalanceB = 0;
            for (let i = 0; i < gateway_balances_B.result.assets[issuerAddress].length; i++) {
                XRPHBalanceB += gateway_balances_B.result.assets[issuerAddress][i].value;
            }
            console.log(parseInt(XRPBalanceB, 10));
            const updatedBalances = [
                {
                    currency: "XRPH",
                    value: String(parseInt(XRPHBalanceB, 10))
                },
                {
                    currency: "XRP",
                    value: xrpl.dropsToXrp(String(parseInt(XRPBalanceB, 10)-12000000))
                }, 
            ];

            return updatedBalances;
        } catch (e) {
            console.log('k');

            return [
                {
                    currency: "XRP",
                    value: xrpl.dropsToXrp(String(parseInt(XRPBalanceB, 10)-12000000))
                }
            ];
        }

    } catch (e) {
        return [];
    }
}

export default getAccountBalances;