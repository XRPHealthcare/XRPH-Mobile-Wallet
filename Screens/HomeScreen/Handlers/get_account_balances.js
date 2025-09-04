const xrpl = require('xrpl');
import AsyncStorage from '@react-native-async-storage/async-storage';
import {switchRPC} from './switch_rpc';
import {parseAccount} from './parse_account';

// Constants for production
const XRPH_CURRENCY_CODE = '5852504800000000000000000000000000000000';
const XRPH_ISSUER = 'rM8hNqA3jRJ5Zgp3Xf3xzdZcx2G37guiZk';
const USDT_CURRENCY_CODE = '5553445400000000000000000000000000000000';
const USDT_ISSUER = 'rcvxE9PS9YBwxtGg1qNeewV6ZB3wGubZq';
const RLUSD_CURRENCY_CODE = '524C555344000000000000000000000000000000';
const RLUSD_ISSUER = 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De';
const XRP_RESERVE = 1600000; // 1.6 XRP in drops

// Constants for testnet (commented)
// const XRPH_CURRENCY_CODE = 'TST';
// const XRPH_ISSUER = 'r4aFSABCPBJ1o8fNJGZRG2KBczJNM1hoe6';
// const USDT_CURRENCY_CODE = 'USD';
// const USDT_ISSUER = 'rPro2b1QdtX4iJu38raatiZTyVqXWYKEtW';

/**
 * Setup trustline for a token
 * @param {Object} client XRPL client
 * @param {Object} account User account
 * @param {String} currencyCode Currency code
 * @param {String} issuerAddress Issuer address
 * @returns {Promise} Transaction result
 */
const setupTrustline = async (client, account, currencyCode, issuerAddress) => {
  const wallet = xrpl.Wallet.fromSeed(account.seed);

  const trustSet = {
    TransactionType: 'TrustSet',
    Account: account.classicAddress,
    LimitAmount: {
      currency: currencyCode,
      issuer: issuerAddress,
      value: '10000000000', // Large limit, arbitrarily chosen
    },
  };

  const prepared = await client.autofill(trustSet);
  const signed = wallet.sign(prepared);
  console.log('Creating trust line from hot address to issuer...');

  const result = await client.submitAndWait(signed.tx_blob);

  if (result.result.meta.TransactionResult === 'tesSUCCESS') {
    console.log(
      `Trustline created: https://livenet.xrpl.org/transactions/${signed.hash}`,
    );
  } else {
    throw `Error creating trustline: ${result.result.meta.TransactionResult}`;
  }

  return result;
};

/**
 * Get current balances for an account
 * @param {Object} activeAccount User's active account
 * @param {String} node XRPL node URL
 * @param {Array} rpcUrls Backup RPC URLs
 * @param {Function} setNode Function to update node
 * @returns {Array} Account balances
 */
const getAccountBalances = async (activeAccount, node, rpcUrls, setNode) => {
  console.log('getAccountBalances');

  let client;
  try {
    client = new xrpl.Client(node);
    await client.connect();

    // Get account info for XRP balance
    const accountInfo = await client.request({
      command: 'account_info',
      account: activeAccount.classicAddress,
      ledger_index: 'current',
    });
    const xrpBalance = accountInfo.result.account_data.Balance;
    const xrpBalanceInXRP = xrpl.dropsToXrp(String(parseInt(xrpBalance, 10)));
    // Check and setup trustlines
    const accountLines = await client.request({
      command: 'account_lines',
      account: activeAccount.classicAddress,
      ledger_index: 'current',
    });

    // Setup XRPH trustline if needed
    const hasXRPHTrustline = accountLines.result.lines?.some(
      line =>
        line.currency === XRPH_CURRENCY_CODE && line.account === XRPH_ISSUER,
    );
    if (!hasXRPHTrustline) {
      await setupTrustline(
        client,
        activeAccount,
        XRPH_CURRENCY_CODE,
        XRPH_ISSUER,
      );
    }

    // Setup USDT trustline if needed
    const hasUSDTTrustline = accountLines.result.lines?.some(
      line =>
        line.currency === USDT_CURRENCY_CODE && line.account === USDT_ISSUER,
    );
    if (!hasUSDTTrustline) {
      await setupTrustline(
        client,
        activeAccount,
        USDT_CURRENCY_CODE,
        USDT_ISSUER,
      );
    }


    if (Number(xrpBalanceInXRP) >= 1.6) {
    // Setup RLUSD trustline if needed
    const hasRLUSDTrustline = accountLines.result.lines?.some(
      line =>
        line.currency === RLUSD_CURRENCY_CODE && line.account === RLUSD_ISSUER,
    );
    if (!hasRLUSDTrustline) {
      await setupTrustline(
        client,
        activeAccount,
        RLUSD_CURRENCY_CODE,
        RLUSD_ISSUER,
      );
    }
  }else{
    console.log('XRP balance is less than 1.6 XRP, skipping RLUSD trustline creation');
  }

    // Get token balances
    const gatewayBalances = await client.request({
      command: 'gateway_balances',
      account: activeAccount.classicAddress,
      ledger_index: 'current',
    });

    // Extract token balances
    const xrphBalance =
      gatewayBalances.result.assets?.[XRPH_ISSUER]?.find(
        item => item.currency === XRPH_CURRENCY_CODE,
      )?.value || '0';

    const usdtBalance =
      gatewayBalances.result.assets?.[USDT_ISSUER]?.find(
        item => item.currency === USDT_CURRENCY_CODE,
      )?.value || '0';

    const rlUSDBalance =
      gatewayBalances.result.assets?.[RLUSD_ISSUER]?.find(
        item => item.currency === RLUSD_CURRENCY_CODE,
      )?.value || '0';

    // Format and validate balances
    const formatBalance = value => {
      const numValue = Number(value);
      return isNaN(numValue) || numValue < 0 ? '0' : String(numValue);
    };

    return [
      {
        currency: 'USDT',
        value: formatBalance(usdtBalance),
      },
      {
        currency: 'XRPH',
        value: formatBalance(xrphBalance),
      },
      {
        currency: 'RLUSD',
        value: formatBalance(rlUSDBalance),
      },
      {
        currency: 'XRP',
        value: Math.max(
          0,
          Number(
            xrpl.dropsToXrp(String(parseInt(xrpBalance, 10) - XRP_RESERVE)),
          ),
        ).toString(),
        TotalValue: Math.max(
          0,
          Number(
            xrpl.dropsToXrp(String(parseInt(xrpBalance, 10))),
          ),
        ).toString(),
      },
    ];
  } catch (error) {
   // console.error('Error fetching balances:', error);

    // Try to get cached balances from AsyncStorage
    const cachedAccount = await AsyncStorage.getItem('activeAccount').then(
      res => parseAccount(res),
    );

    if (
      cachedAccount?.classicAddress === activeAccount?.classicAddress &&
      cachedAccount?.balances?.length
    ) {
      return cachedAccount.balances;
    }

    // Return last known balances if available, otherwise empty array
    return activeAccount?.balances?.length ? activeAccount.balances : [];
  } finally {
    if (client) {
      client.disconnect();
    }
  }
};

export default getAccountBalances;
