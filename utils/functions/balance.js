const DEFAULT_CURRENCIES = ['USD', 'EUR', 'GBP'];

/**
 * Initialize rates object for all supported currencies
 * @returns {Object} Default rates structure
 */
const initializeRates = () => {
  return DEFAULT_CURRENCIES.reduce((acc, currency) => {
    acc[currency] = {
      XRPrate: 0,
      XRPHrate: 0,
      USDTrate: 0,
      RLUSDrate: 0,
    };
    return acc;
  }, {});
};

/**
 * Initialize balances object for all supported currencies
 * @returns {Object} Default balances structure
 */
const initializeBalances = () => {
  return DEFAULT_CURRENCIES.reduce((acc, currency) => {
    acc[currency] = '0';
    return acc;
  }, {});
};

/**
 * Calculate token amount based on currency and rates
 * @param {string} currency Token currency (XRP, XRPH, USDT)
 * @param {number} value Token value
 * @param {Object} rates Exchange rates
 * @returns {number} Calculated amount
 */
const calculateTokenAmount = (currency, value, rates) => {
  switch (currency) {
    case 'XRP':
      return Number(value * rates.XRPrate);
    case 'XRPH':
      return Number(value * rates.XRPHrate);
    case 'USDT':
      return Number(value * rates.USDTrate);
    case 'RLUSD':
      return Number(value * rates.RLUSDrate);
    default:
      return 0;
  }
};

/**
 * Get total balances for all accounts
 * @param {Array} accounts Array of account objects with balances
 * @param {Object} exchangeRates Exchange rates from API response
 * @returns {Array} Updated accounts with total balances
 */
const getTotalBalances = async (accounts = [], exchangeRates = {}) => {
  try {
    // Validate inputs
    if (!Array.isArray(accounts)) {
      console.warn('getTotalBalances: accounts parameter must be an array');
      return [];
    }

    if (!exchangeRates || typeof exchangeRates !== 'object') {
      console.warn(
        'getTotalBalances: exchangeRates parameter must be an object',
      );
      return accounts;
    }

    let updatedAccounts = [];

    for (const account of accounts) {
      const allRates = initializeRates();
      const allBalances = initializeBalances();
      const balances = account?.balances || [];
      // If account has no balances, add with default values
      if (balances.length === 0) {
        updatedAccounts.push({
          ...account,
          totalBalances: allBalances,
        });
        continue;
      }

      // Update rates for each currency
      for (const currency of DEFAULT_CURRENCIES) {
        const exchangeCurrency = currency.toLowerCase();
        const rates = exchangeRates[exchangeCurrency];

        if (!rates?.XRPH || !rates?.XRP || !rates?.USDT || !rates?.RLUSD) {
          console.warn(`Missing exchange rates for ${currency}`);
          continue;
        }

        allRates[currency] = {
          XRPrate: rates.XRP,
          XRPHrate: rates.XRPH,
          USDTrate: rates.USDT,
          RLUSDrate: rates.RLUSD,
        };

        // Calculate total balance for each currency
        let sum = balances.reduce((total, {currency: tokenCurrency, value}) => {
          return (
            total +
            calculateTokenAmount(tokenCurrency, value, allRates[currency])
          );
        }, 0);

        // Format and validate sum
        sum = sum.toFixed(2);
        sum = Math.max(0, sum); // Ensure non-negative
        allBalances[currency] = Number(sum);
      }

      updatedAccounts.push({
        ...account,
        totalBalances: allBalances,
      });
    }

    return updatedAccounts;
  } catch (error) {
    console.error('Error calculating total balances:', error);
    return accounts; // Return original accounts on error
  }
};

export {getTotalBalances};
