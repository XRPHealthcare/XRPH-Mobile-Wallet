const xrpl = require('xrpl');
const moment = require('moment');

const getCurrencyString = currencyCode => {
  try {
    // If it's already a 3-letter code, return it as is
    if (currencyCode.length === 3) {
      return currencyCode;
    }
    // Only try to convert if it's a hex string
    return xrpl.convertHexToString(currencyCode);
  } catch (e) {
    // If conversion fails, return the original code
    console.log('Currency conversion warning:', currencyCode);
    return currencyCode;
  }
};

const getTransactionHistory = async (account, node, limit = 100) => {
  let client;
  try {
    // To get All history, we are adding S2 Node hardcoded.
    client = new xrpl.Client('wss://s2.ripple.com/');
    // client = new xrpl.Client('wss://testnet.xrpl-labs.com/');
    await client.connect();

    // Initialize variables for pagination
    let marker = undefined;
    let transactions = [];
    let hasMore = true;

    // Fetch transactions in batches until we have enough or there are no more
    while (hasMore && transactions.length < limit) {
      const request = {
        command: 'account_tx',
        account: account.classicAddress,
        // Use validated ledgers only for consistency
        ledger_index_min: -1,
        ledger_index_max: -1,
        // Limit each batch request
        limit: Math.min(limit - transactions.length, 200),
        forward: false, // Get most recent first
      };
      if (marker) {
        request.marker = marker;
      }

      const response = await client.request(request);

      if (
        !response?.result?.transactions ||
        response.result.transactions.length === 0
      ) {
        hasMore = false;
        break;
      }

      transactions = [...transactions, ...response.result.transactions];

      // Update marker for next page
      marker = response.result.marker;
      hasMore = marker !== undefined;
    }
    let formattedHistory = [];
    for (let i = 0; i < transactions.length; i++) {
      let transaction = {
        accountInvolved: '',
        transactionType: '',
        amount: '',
        month: 'xx',
        day: 'xx',
        year: 'xxxx',
        currency: 'XRP',
        hash: '',
      };

      const tx = transactions[i].tx;
      transaction.accountInvolved = tx.Account;

      if (transactions[i].meta.TransactionResult !== 'tesSUCCESS') {
        transaction.transactionType = 'Payment Failed';
        transaction.accountInvolved = tx.Destination;
      } else {
        switch (tx.TransactionType) {
          case 'Payment':
            if (tx.Destination === account.classicAddress) {
              transaction.transactionType = 'Payment Received';
            } else {
              transaction.accountInvolved = tx.Destination;
              transaction.transactionType = 'Payment Sent';
            }
            break;
          case 'TrustSet':
            transaction.transactionType = 'Set Trustline';
            break;
          case 'AccountSet':
            transaction.transactionType = 'Set Account';
            break;
          default:
            transaction.transactionType = tx.TransactionType;
            break;
        }
      }

      transaction.hash = tx.hash;

      if (tx.Amount) {
        if (typeof tx.Amount === 'object') {
          transaction.amount = Number(tx.Amount.value).toLocaleString('en-US');
          transaction.currency = getCurrencyString(tx.Amount.currency);
        } else {
          transaction.amount = Number(
            Number(tx.Amount) * Math.pow(10, -6),
          ).toLocaleString('en-US');
        }
      } else if (tx.LimitAmount) {
        if (typeof tx.LimitAmount === 'object') {
          transaction.amount = Number(tx.LimitAmount.value).toLocaleString(
            'en-US',
          );
          transaction.currency = getCurrencyString(tx.LimitAmount.currency);
        } else {
          transaction.amount = Number(
            Number(tx.LimitAmount) * Math.pow(10, -6),
          ).toLocaleString('en-US');
        }
      }

      const formattedDate = moment
        .unix(Number(tx.date) + 946684800)
        .format('MMDDYYYY');

      let month = formattedDate.substring(0, 2);
      if (month.at(0) === '0') {
        month = month.at(1);
      }
      let day = formattedDate.substring(2, 4);
      if (day.at(0) === '0') {
        day = day.at(1);
      }
      let year = formattedDate.substring(4, 8);

      transaction.month = month;
      transaction.day = day;
      transaction.year = year;

      formattedHistory.push(transaction);
    }

    return formattedHistory;
  } catch (e) {
    console.log('Transaction History Error:', e.message);
    return {
      error: 'Error: Trouble Connecting To The Rippled Server.',
    };
  } finally {
    if (client) {
      client.disconnect();
    }
  }
};

export default getTransactionHistory;
