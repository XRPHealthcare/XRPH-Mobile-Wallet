const firestore = require('@react-native-firebase/firestore');
console.log(typeof firestore);

const getExchangeRates = async (exchangeFrom, exchangeIn) => {

    let XRPrate = 0;
    let XRPHrate = 0;

    const res = await firestore().collection('exchange_rates').doc(exchangeIn).get();
    console.log(res);
    if (res['_data'].XRPHrate === undefined || res['_data'].XRPrate === undefined) {
        setError("Unfortunately we could not connect your account.");
    } else {
        const exchangeRates = res['_data'];
        XRPrate = exchangeRates.XRPrate;
        XRPHrate = exchangeRates.XRPHrate;
    }

    if (exchangeFrom === 'XRP') {
        return XRPrate;
    } else if (exchangeFrom === 'XRPH') {
        return XRPHrate;
    } else {
        return 0;
    }
}

export default getExchangeRates;
