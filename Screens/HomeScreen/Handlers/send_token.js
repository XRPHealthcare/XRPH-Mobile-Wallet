const xrpl = require('xrpl');

const send_token = async (
  {seed, to, currency, amount, memo, destinationTag, balances},
  node,
) => {
  try {
    const issuerAddress = '';
    const currencyCode =
      currency === 'XRP'
        ? currency
        : xrpl.convertStringToHex(currency).padEnd(40, 0);

    const client = new xrpl.Client(node);
    await client.connect();
    console.log('connected');

    const accountA = xrpl.Wallet.fromSeed(seed);
    const from = accountA.classicAddress;

    let send_token_tx_A_to_B = {};
    console.log(seed + ' ' + to + ' ' + currency + ' ' + amount);

    if (currencyCode === 'XRP') {
      send_token_tx_A_to_B = {
        TransactionType: 'Payment',
        Account: accountA.classicAddress,
        Amount: String(parseInt(amount * Math.pow(10, 6))),
        Destination: to,
        DestinationTag: destinationTag === '' ? 1 : Number(destinationTag),
        Memos: [
          {
            Memo: {
              MemoData: Buffer.from(memo).toString('hex').toUpperCase(),
            },
          },
        ],
      };
    } else {
      send_token_tx_A_to_B = {
        TransactionType: 'Payment',
        Account: accountA.classicAddress,
        Amount: {
          currency: currencyCode,
          value: amount,
          issuer: issuerAddress, // this is wrong, if currency === xrph then its right, otherwise use account
        },
        Destination: to,
        DestinationTag: destinationTag === '' ? 1 : Number(destinationTag),
        Memos: [
          {
            Memo: {
              MemoData: Buffer.from(memo).toString('hex').toUpperCase(),
            },
          },
        ],
      };
    }
    console.log(send_token_tx_A_to_B);

    const pay_prepared_A_to_B = await client.autofill(send_token_tx_A_to_B);

    console.log('Pay Prep');
    console.log(xrpl.dropsToXrp(Number(pay_prepared_A_to_B.Fee)));
    const pay_signed_A_to_B = accountA.sign(pay_prepared_A_to_B);
    console.log(
      `Sending ${amount} ${currencyCode} from ${accountA.classicAddress} to ${to}...`,
    );
    const pay_result_A_to_B = await client.submitAndWait(
      pay_signed_A_to_B.tx_blob,
    );
    if (pay_result_A_to_B.result.meta.TransactionResult == 'tesSUCCESS') {
      console.log(
        `Transaction succeeded: https://livenet.xrpl.org/transactions/${pay_signed_A_to_B.hash}`,
      );
    } else {
      throw `Error sending transaction: ${pay_result_A_to_B.result.meta.TransactionResult}`;
    }

    // redo - we know what they are sending so we just need the fee and the amount, then simply subtract from balances
    console.log(balances);

    let fromBalances = balances;

    for (let i = 0; i < balances.length; i++) {
      if (balances[i].currency === 'XRP') {
        // let XRPAfterFee = String(Number(balances[i].value)-Number(xrpl.dropsToXrp(Number(pay_prepared_A_to_B.Fee))));
        fromBalances[i].value = String(
          Number(fromBalances[i].value) -
            xrpl.dropsToXrp(Number(pay_prepared_A_to_B.Fee)),
        );
        if (balances[i].currency === currency) {
          fromBalances[i].value = String(
            Number(fromBalances[i].value) - Number(amount),
          );
        }
      } else {
        if (balances[i].currency === currency) {
          fromBalances[i].value = String(
            Number(fromBalances[i].value) - Number(amount),
          );
        }
      }
    }

    // const account_info_A = await client.request({
    //     command: "account_info",
    //     account: accountA.classicAddress,
    //     ledger_index: "validated",
    // })
    // console.log(account_info_A.result.account_data.Balance);
    // const XRPBalanceA = account_info_A.result.account_data.Balance;

    // const gateway_balances_A = await client.request({
    //     command: "gateway_balances",
    //     account: accountA.classicAddress,
    //     ledger_index: "validated",
    // })
    // let assets = gateway_balances_A.result.assets;

    // let bals = {
    //     "XRP": xrpl.dropsToXrp(String(parseInt(XRPBalanceA, 10)-12000000))
    // };

    // for (let key in assets) {

    //     for (let i = 0; i < assets[key].length; i++) {
    //         console.log('Object: ', assets[key][i]);
    //         let currency = "";
    //         if (assets[key][i].currency.length > 3) { // currency code is either 3 digit or long hex
    //             currency = Buffer.from(assets[key][i].currency, 'hex').toString('utf8').replace(/\0/g, '');;
    //         } else {
    //             currency = assets[key][i].currency;
    //         }

    //         if (bals.hasOwnProperty(currency)) {
    //             // update
    //             let val = Number(bals[currency]);
    //             val += Number(assets[key][i].value);
    //             bals[currency] = String(parseInt(val, 10));
    //         } else {
    //             // add
    //             bals[currency] = String(parseInt(assets[key][i].value, 10));
    //         }
    //     }

    // }

    // let fromBalances = [];
    // for (let key in bals) {
    //     if (key.toString() === 'XRPH') {
    //         fromBalances.unshift({
    //             currency: key.toString(),
    //             value: bals[key]
    //         })
    //     } else {
    //         fromBalances.push({
    //             currency: key.toString(),
    //             value: bals[key]
    //         })
    //     }
    // }

    // console.log(fromBalances);

    client.disconnect();

    return {
      from,
      fromBalances,
    };
  } catch (e) {
    console.log('--------------------error in send--------------', e);
    return {
      error:
        'Error: Trouble Connecting To The Rippled Server. Please check your internet connection.',
    };
  }
};

export default send_token;
