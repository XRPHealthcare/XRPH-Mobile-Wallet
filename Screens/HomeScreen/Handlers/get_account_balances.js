const xrpl = require('xrpl');
import AsyncStorage from '@react-native-async-storage/async-storage';

const getAccountBalances = async (activeAccount, node) => {
  console.log('getAccountBalances');
  let hasXRPH = false;
  let XRPHAmount = 0;
  if (activeAccount.hasOwnProperty('balances')) {
    for (let i = 0; i < activeAccount.balances.length; i++) {
      if (activeAccount.balances[i].currency === 'XRPH') {
        hasXRPH = true;
        XRPHAmount = activeAccount.balances[i].value;
      }
    }
  }
  let client;
  try {
    const currencyCode = '';
    const issuerAddress = '';
    client = new xrpl.Client(node);
    await client.connect();

    const account_info_B = await client.request({
      command: 'account_info',
      account: activeAccount.classicAddress,
      ledger_index: 'current',
    });
    const XRPBalanceB = account_info_B.result.account_data.Balance;

    const account_lines = await client.request({
      command: 'account_lines',
      account: activeAccount.classicAddress,
      ledger_index: 'current',
    });

    console.log('account_lines', JSON.stringify(account_lines));
    const currentCurrencyLines = account_lines?.result?.lines?.filter(item => {
      return item?.currency == currencyCode && item?.account == issuerAddress;
    });

    console.log('currentCurrencyLines', currentCurrencyLines);

    if (!currentCurrencyLines?.length) {
      console.log('get_account_balances: account_lines=> condition', true);
      // establish trustline
      const wallet = xrpl.Wallet.fromSeed(activeAccount.seed);

      const issuerAddress = '';

      const trust_set_A = {
        TransactionType: 'TrustSet',
        Account: activeAccount.classicAddress,
        LimitAmount: {
          currency: currencyCode,
          issuer: issuerAddress,
          value: '10000000000', // Large limit, arbitrarily chosen
        },
      };

      const ts_prepared_A = await client.autofill(trust_set_A);
      const ts_signed_A = wallet.sign(ts_prepared_A);
      console.log('Creating trust line from hot address to issuer...');

      const ts_result_A = await client.submitAndWait(ts_signed_A.tx_blob);
      console.log('Trustline generated');
      if (ts_result_A.result.meta.TransactionResult == 'tesSUCCESS') {
        console.log(
          `Transaction succeeded: https://livenet.xrpl.org/transactions/${ts_signed_A.hash}`,
        );
      } else {
        throw `Error sending transaction: ${ts_result_A.result.meta.TransactionResult}`;
      }
    } else {
      console.log('TrustLine already generated');
    }

    try {
      const gateway_balances_B = await client.request({
        command: 'gateway_balances',
        account: activeAccount.classicAddress,
        ledger_index: 'current',
      });

      console.log(gateway_balances_B?.result?.assets?.[issuerAddress]);
      let XRPHBalanceB = 0;
      for (
        let i = 0;
        i < gateway_balances_B?.result?.assets?.[issuerAddress]?.length;
        i++
      ) {
        XRPHBalanceB +=
          gateway_balances_B.result.assets[issuerAddress][i].value;
      }
      console.log(parseInt(XRPBalanceB, 10));
      const updatedBalances = [
        {
          currency: 'XRPH',
          value: String(Number(XRPHBalanceB, 10)),
        },
        {
          currency: 'XRP',
          value: xrpl.dropsToXrp(String(parseInt(XRPBalanceB, 10) - 12000000)),
        },
      ];
      return updatedBalances;
    } catch (e) {
      console.log(e);
      if (hasXRPH) {
        return [
          {
            currency: 'XRPH',
            value: XRPHAmount,
          },
          {
            currency: 'XRP',
            value: xrpl.dropsToXrp(
              String(parseInt(XRPBalanceB, 10) - 12000000),
            ),
          },
        ];
      } else {
        return [
          {
            currency: 'XRP',
            value: xrpl.dropsToXrp(
              String(parseInt(XRPBalanceB, 10) - 12000000),
            ),
          },
          {
            currency: 'XRPH',
            value: 0,
          },
        ];
      }
    }
  } catch (e) {
    console.log('-----------------Err-----------------------', e);
    const lsActiveAccount = await AsyncStorage.getItem('activeAccount').then(
      res => JSON.parse(res || {}),
    );
    if (activeAccount?.classicAddress === lsActiveAccount?.classicAddress) {
      console.log('---------------both are same----------------------');
      if (lsActiveAccount?.balances?.length) {
        return lsActiveAccount.balances;
      } else {
        return [];
      }
    } else {
      return [];
    }
  } finally {
    client.disconnect();
  }
};

export default getAccountBalances;
