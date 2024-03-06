const xrpl = require('xrpl');
const cheerio = require('cheerio');

const generateNewWallet = async (isEntropy, entropy) => {
  if (isEntropy) {
    // get wallet from entropy string
    const wallet = xrpl.Wallet.fromEntropy(entropy);

    const res = await fetch('');
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
        bin: '',
        group: '',
      },
    };
  } else {
    try {
      const currencyCode = '';

      const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
      await client.connect();

      // create issuer account

      // load operational account (for testing purposes)
      const operationalAccount = xrpl.Wallet.fromSeed('');
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
          issuer: '',
          value: '', // Large limit, arbitrarily chosen
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

      // send XRPH from operational to A
      const send_token_tx_A = {
        TransactionType: 'Payment',
        Account: operationalAccount.classicAddress,
        Amount: {
          currency: currencyCode,
          value: '500000',
          issuer: '',
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
      console.log(gateway_balances.result.assets['']);
      const XRPHBalance = gateway_balances.result.assets[''][0].value;

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

      const res = await fetch('');
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
          bin: '',
          group: '',
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
