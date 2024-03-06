const xrpl = require('xrpl');
const moment = require('moment');

const getTransactionHistory = async (account, node) => {
  let client;
  try {
    // To get All history, we are adding S2 Node hardecoded.
    client = new xrpl.Client('wss://s2.ripple.com/');
    // client = new xrpl.Client('wss://testnet.xrpl-labs.com/');
    await client.connect();

    const history = await client.request({
      command: 'account_tx',
      account: account.classicAddress,
      ledger_index: 'current',
      ledger_index_min: -1,
      ledger_index_max: -1,
    });

    let formattedHistory = [];
    console.log('history', history);
    for (let i = 0; i < history.result.transactions.length; i++) {
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

      transaction.accountInvolved = history.result.transactions[i].tx.Account;
      const tx = history.result.transactions[i].tx;
      console.log(tx);

      if (
        history.result.transactions[i].meta.TransactionResult !== 'tesSUCCESS'
      ) {
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

      if (history.result.transactions[i].tx.Amount) {
        if (typeof history.result.transactions[i].tx.Amount === 'object') {
          transaction.amount = Number(
            history.result.transactions[i].tx.Amount.value,
          ).toLocaleString('en-US');
          transaction.currency = xrpl.convertHexToString(
            history.result.transactions[i].tx.Amount.currency,
          );
        } else {
          transaction.amount = Number(
            Number(history.result.transactions[i].tx.Amount) * Math.pow(10, -6),
          ).toLocaleString('en-US'); //
        }
      } else if (history.result.transactions[i].tx.LimitAmount) {
        if (typeof history.result.transactions[i].tx.LimitAmount === 'object') {
          transaction.amount = Number(
            history.result.transactions[i].tx.LimitAmount.value,
          ).toLocaleString('en-US');
          transaction.currency = xrpl.convertHexToString(
            history.result.transactions[i].tx.LimitAmount.currency,
          );
        } else {
          transaction.amount = Number(
            Number(history.result.transactions[i].tx.LimitAmount) *
              Math.pow(10, -6),
          ).toLocaleString('en-US'); //
        }
      }

      const formattedDate = moment
        .unix(Number(history.result.transactions[i].tx.date) + 946684800)
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
    console.log(e.message);
    return {
      error: 'Error: Trouble Connecting To The Rippled Server.',
    };
  } finally {
    client.disconnect();
  }
};

export default getTransactionHistory;
