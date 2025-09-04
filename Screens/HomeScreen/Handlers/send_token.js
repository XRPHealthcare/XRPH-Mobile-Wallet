import {switchRPC} from './switch_rpc';

const xrpl = require('xrpl');

const send_token = async (
  {seed, to, currency, amount, memo, destinationTag, balances},
  node,
  rpcUrls,
  setNode,
) => {
  try {
    const coins = [
      {
        currency: '5852504800000000000000000000000000000000',
        issuer: 'rM8hNqA3jRJ5Zgp3Xf3xzdZcx2G37guiZk',
      },
      {
        currency: '5553445400000000000000000000000000000000',
        issuer: 'rcvxE9PS9YBwxtGg1qNeewV6ZB3wGubZq',
      },
      {
        currency: '524C555344000000000000000000000000000000',
        issuer: 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De',
      },
    ];
    // const coins = [
    //   {
    //     currency: 'TST',
    //     issuer: 'r4aFSABCPBJ1o8fNJGZRG2KBczJNM1hoe6',
    //   },
    //   {
    //     currency: 'USD',
    //     issuer: 'rPro2b1QdtX4iJu38raatiZTyVqXWYKEtW',
    //   },
    // ];

    const currencyCode =
      currency === 'XRP'
        ? currency
        : xrpl.convertStringToHex(currency).padEnd(40, 0);

    const currentIssuer = coins.find(coin => coin?.currency === currencyCode);
    const issuerAddress = currentIssuer?.issuer;

    const client = new xrpl.Client(node);
    try {
      await client.connect();
    } catch (e) {
      // switchRPC(node, rpcUrls).then(res => {
      //   setNode(res);
      //   send_token(
      //     {seed, to, currency, amount, memo, destinationTag, balances},
      //     node,
      //     rpcUrls,
      //     setNode,
      //   );
      // });
    }
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
        Flags: 131072,
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

    client.disconnect();

    return {
      from,
      fromBalances,
    };
  } catch (e) {
    console.log('--------------------error in send--------------', e);
    // Check if the error string contains 'tecPATH_DRY' to handle this specific case
  if (typeof e === 'string' && e.includes('tecPATH_DRY')) {
    return {
      error:
        'Please ensure that 1.7 XRP is reserved to establish the RLUSD Trustline, as transactions cannot be completed without it',
    };
  }

    return {
      error:
        'Error: Trouble Connecting To The Rippled Server. Please check your internet connection.',
    };
  }
};

export default send_token;
