const firestore = require('@react-native-firebase/firestore');
console.log(typeof firestore);

const getExchangeRates = async (exchangeFrom, exchangeIn) => {
  //     const response = await fetch("https://api.livecoinwatch.com/coins/single", {
  //        method: 'POST',
  //        headers: {
  //            Accept: 'application/json',
  //            'Content-Type': 'application/json',
  //            'X-Api-Key': '25e019d0-afde-4331-9ec0-56bf9323cdb5'
  //        },
  //        body: JSON.stringify({
  //            currency: exchangeIn,
  //            code: exchangeFrom,
  //            meta: true
  //        })
  //    });
  //    const tokenJson = await response.json();
  //    const tokenRate = tokenJson.rate;
  //    console.log(tokenJson.rate);

  //    return tokenRate;

  let XRPrate = 0;
  let XRPHrate = 0;
  let USDTrate = 0;

  const res = await firestore()
    .collection('exchange_rates')
    .doc(exchangeIn)
    .get();
  console.log(res);
  if (
    res['_data'].XRPHrate === undefined ||
    res['_data'].XRPrate === undefined ||
    res['_data'].USDTrate === undefined
  ) {
    setError('Unfortunately we could not connect your account.');
  } else {
    const exchangeRates = res['_data'];
    XRPrate = exchangeRates.XRPrate;
    XRPHrate = exchangeRates.XRPHrate;
    USDTrate = exchangeRates.USDTrate;
  }

  if (exchangeFrom === 'XRP') {
    return XRPrate;
  } else if (exchangeFrom === 'XRPH') {
    return XRPHrate;
  } else if (exchangeFrom === 'USDT') {
    return USDTrate;
  } else {
    return 0;
  }
};

export default getExchangeRates;
