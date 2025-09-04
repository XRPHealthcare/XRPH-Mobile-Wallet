const xrpl = require('xrpl');
const cheerio = require('cheerio');

const generateNewWallet = async (isEntropy, entropy) => {
  if (isEntropy) {
    // get wallet from entropy string
    const wallet = xrpl.Wallet.fromEntropy(entropy);

    const res = await fetch(
      'https://secure.unitednetworksofamerica.com/partner/card-downloader.php?id=989&rxgrp=XRPH',
    );
    const data = await res.text();

    const $ = cheerio.load(data);
    const iframe_url = $('#textFrame')
      .children('iframe')
      .get()
      .map(x => $(x).attr('src'))[0];

    const memberId = iframe_url.split('memberid=')[1].split('&')[0];

    return {
      ...wallet,
      balances: [],
      prescription_card: {
        id: memberId,
        bin: '610280',
        group: 'XRPH',
      },
    };
  } else {
    try {
      const currencyCode = '5852504800000000000000000000000000000000';
      // const currencyCode = 'TST';

      const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
      await client.connect();

      // create issuer account

      // load operational account (for testing purposes)
      // create new accounts and send from operational to new accounts
      // send XRPH from one to the other

      // create wallet A

      const createAccountA = await client.fundWallet();
      const accountA = createAccountA.wallet;
      console.log('A: ', accountA);

      // create trustline from wallet A to issuer
      const trust_set_A = {
        TransactionType: 'TrustSet',
        Account: accountA.classicAddress,
        LimitAmount: {
          currency: currencyCode,
          issuer: 'rM8hNqA3jRJ5Zgp3Xf3xzdZcx2G37guiZk',
          // issuer: 'r4aFSABCPBJ1o8fNJGZRG2KBczJNM1hoe6',
          value: '10000000000', // Large limit, arbitrarily chosen
        },
      };

      try {
        const ts_prepared_A = await client.autofill(trust_set_A);
        const ts_signed_A = accountA.sign(ts_prepared_A);
        console.log('Creating trust line from hot address to issuer...');
        const ts_result_A = await client.submitAndWait(ts_signed_A.tx_blob);
        if (ts_result_A.result.meta.TransactionResult == 'tesSUCCESS') {
          console.log(
            `Transaction succeeded: https://testnet.xrpl.org/transactions/${ts_signed_A.hash}`,
          );
        } else {
          throw `Error sending transaction: ${ts_result_A.result.meta.TransactionResult}`;
        }
      } catch (e) {
        console.log('here');
        return {
          error: 'Errorr1: Trouble Connecting To The Rippled Server.',
        };
      }

      // USDT Trustline
      // const usdtIssuerAddress = 'r4aFSABCPBJ1o8fNJGZRG2KBczJNM1hoe6';
      // const usdtCurrencyCode = 'USD';
      const usdtIssuerAddress = 'rcvxE9PS9YBwxtGg1qNeewV6ZB3wGubZq';
      const usdtCurrencyCode = '5553445400000000000000000000000000000000';

      const trust_set_B = {
        TransactionType: 'TrustSet',
        Account: activeAccount.classicAddress,
        LimitAmount: {
          currency: usdtCurrencyCode,
          issuer: usdtIssuerAddress,
          value: '10000000000', // Large limit, arbitrarily chosen
        },
      };

      const ts_prepared_B = await client.autofill(trust_set_B);
      const ts_signed_B = wallet.sign(ts_prepared_B);
      console.log('Creating trust line from hot address to issuer...');

      const ts_result_B = await client.submitAndWait(ts_signed_B.tx_blob);
      console.log('Trustline generated');
      if (ts_result_B.result.meta.TransactionResult == 'tesSUCCESS') {
        console.log(
          `Transaction succeeded: https://livenet.xrpl.org/transactions/${ts_signed_B.hash}`,
        );
      } else {
        throw `Error sending transaction: ${ts_result_B.result.meta.TransactionResult}`;
      }

      const RLUSD_ISSUER = 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De';
      const RLUSD_CURRENCY_CODE = '524C555344000000000000000000000000000000';

      const trust_set_C = {
        TransactionType: 'TrustSet',
        Account: activeAccount.classicAddress,
        LimitAmount: {
          currency: RLUSD_CURRENCY_CODE,
          issuer: RLUSD_ISSUER,
          value: '10000000000', // Large limit, arbitrarily chosen
        },
      };

      const ts_prepared_C = await client.autofill(trust_set_C);
      const ts_signed_C = wallet.sign(ts_prepared_C);
      console.log('Creating trust line from hot address to issuer...');

      const ts_result_C = await client.submitAndWait(ts_signed_C.tx_blob);
      console.log('Trustline generated');
      if (ts_result_C.result.meta.TransactionResult == 'tesSUCCESS') {
        console.log(
          `Transaction succeeded: https://livenet.xrpl.org/transactions/${ts_signed_C.hash}`,
        );
      } else {
        throw `Error sending transaction: ${ts_result_C.result.meta.TransactionResult}`;
      }

      // send XRPH from operational to A
      const send_token_tx_A = {
        TransactionType: 'Payment',
        Account: operationalAccount.classicAddress,
        Amount: {
          currency: currencyCode,
          value: '500000',
          issuer: 'rM8hNqA3jRJ5Zgp3Xf3xzdZcx2G37guiZk',
          // issuer: 'r4aFSABCPBJ1o8fNJGZRG2KBczJNM1hoe6',
        },
        Destination: accountA.classicAddress,
      };

      const pay_prepared_A = await client.autofill(send_token_tx_A);
      const pay_signed_A = operationalAccount.sign(pay_prepared_A);
      console.log(
        `Sending 500000 ${currencyCode} to ${accountA.classicAddress}...`,
      );
      const pay_result_A = await client.submitAndWait(pay_signed_A.tx_blob);
      if (pay_result_A.result.meta.TransactionResult == 'tesSUCCESS') {
        console.log(
          `Transaction succeeded: https://testnet.xrpl.org/transactions/${pay_signed_A.hash}`,
        );
      } else {
        throw `Error sending transaction: ${pay_result_A.result.meta.TransactionResult}`;
      }

      const account_info = await client.request({
        command: 'account_info',
        account: accountA.classicAddress,
        ledger_index: 'validated',
      });
      console.log(account_info.result.account_data.Balance);
      const XRPBalance = account_info.result.account_data.Balance;

      const gateway_balances = await client.request({
        command: 'gateway_balances',
        account: accountA.classicAddress,
        ledger_index: 'validated',
      });
      console.log(
        gateway_balances.result.assets['rM8hNqA3jRJ5Zgp3Xf3xzdZcx2G37guiZk'],
      );
      const XRPHBalance =
        gateway_balances.result.assets['rM8hNqA3jRJ5Zgp3Xf3xzdZcx2G37guiZk'][0]
          .value;
      // const XRPHBalance =
      //   gateway_balances.result.assets['r4aFSABCPBJ1o8fNJGZRG2KBczJNM1hoe6'][0]
      //     .value;

      const balances = [
        {
          currency: 'XRPH',
          value: String(parseInt(XRPHBalance, 10)),
        },
        {
          currency: 'XRP',
          value: xrpl.dropsToXrp(String(parseInt(XRPBalance, 10))),
        },
      ];

      client.disconnect();

      const res = await fetch(
        'https://secure.unitednetworksofamerica.com/partner/card-downloader.php?id=989&rxgrp=XRPH',
      );
      const data = await res.text();

      const $ = cheerio.load(data);
      const iframe_url = $('#textFrame')
        .children('iframe')
        .get()
        .map(x => $(x).attr('src'))[0];

      const memberId = iframe_url.split('memberid=')[1].split('&')[0];

      return {
        ...accountA,
        balances: balances,
        prescription_card: {
          id: memberId,
          bin: '610280',
          group: 'XRPH',
        },
      };
    } catch (e) {
      console.log(e.message);
      return {
        error: 'Error: Trouble Connecting To The Rippled Server.',
      };
    }
  }
};

export default generateNewWallet;
