import React from 'react';
import {Image, StyleSheet, View, Text, Platform} from 'react-native';
import {light, dark} from '../../../assets/colors/colors';
import useStore from '../../../data/store';
import USDTico from '../../../assets/img/thether_ico.svg';
import {useGetPrices} from '../../../utils/wallet.api';

const TokenRow = props => {
  const getExchangePrices = useGetPrices();
  const {theme, totalBalanceCurrency} = useStore();

  const [prices, setPrices] = React.useState(null);

  let imgSrc = '';
  if (props.currency === 'XRPH') {
    imgSrc = require('../../../assets/img/hero.png');
  } else if (props.currency === 'XRP') {
    imgSrc = require('../../../assets/img/xrp-logo.png');
  } else if (props.currency === 'RLUSD') {
    imgSrc = require('../../../assets/img/new-design/rlusd-icon.png');
  } else {
    if (theme === 'dark') {
      imgSrc = require('../../../assets/img/unknown_token_dark.png');
    } else {
      imgSrc = require('../../../assets/img/unknown_token_light.png');
    }
  }

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const getCurrencySymbol =
    totalBalanceCurrency === 'USD'
      ? '$'
      : totalBalanceCurrency === 'EUR'
        ? '€'
        : '£';
  const findEqPrice = async () => {
    const prices = await getExchangePrices?.mutateAsync();
    setPrices(prices);
  };

  const coinPrice = () => {
    if (prices) {
      const currencyMap = {
        USDT: {
          USD: prices?.usd?.USDT,
          EUR: prices?.eur?.USDT,
          GBP: prices?.gbp?.USDT,
        },
        XRP: {
          USD: prices?.usd?.XRP,
          EUR: prices?.eur?.XRP,
          GBP: prices?.gbp?.XRP,
        },
        XRPH: {
          USD: prices?.usd?.XRPH,
          EUR: prices?.eur?.XRPH,
          GBP: prices?.gbp?.XRPH,
        },
        RLUSD: {
          USD: prices?.usd?.RLUSD,
          EUR: prices?.eur?.RLUSD,
          GBP: prices?.gbp?.RLUSD,
        },
      };

      const currencyPrice =
        currencyMap[props?.currency]?.[totalBalanceCurrency];
      return Number(
        currencyPrice * Number(props?.balance) || 0,
      )?.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
    }
    return 0;
  };

  React.useEffect(() => {
    findEqPrice();
  }, []);

  return (
    <View style={styles.tokenRowWrapper}>
      <View
        style={{
          flexDirection: 'row',
        }}>
        {props?.currency === 'USDT' ? (
          <USDTico style={styles.tokenRowImage} height={32} width={32} />
        ) : (
          <Image style={styles.tokenRowImage} source={imgSrc} />
        )}
        <Text style={styles.tokenRowCurrency}>{props.currency}</Text>
      </View>
      <View style={{flexDirection: 'column', alignItems: 'flex-end'}}>
        <Text style={styles.tokenRowBalance}>
          {isNaN(Number(props?.balance))
            ? 0
            : Number(props?.balance) < 0
              ? 0
              : Number(props?.balance)?.toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                })}
        </Text>
        <Text style={styles.eqPrice}>
          {getCurrencySymbol}
          {coinPrice()}
        </Text>
      </View>
    </View>
  );
};

const styling = colors =>
  StyleSheet.create({
    tokenRowWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // backgroundColor: 'red',
    },
    tokenRowImage: {
      width: 32,
      height: 32,
      marginLeft: 10,
      marginRight: 10,
    },
    tokenRowCurrency: {
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      fontSize: 14,
      color: colors.text,
      marginTop: 5,
    },
    tokenRowBalance: {
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      fontSize: 14,
      color: colors.text,
    },
    eqPrice: {
      color: colors.text,
      fontSize: 10,
    },
  });

export default TokenRow;
