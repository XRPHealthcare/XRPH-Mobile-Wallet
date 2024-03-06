import React, {useState} from 'react';

import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  TextInput,
  Keyboard,
} from 'react-native';

import _ from 'lodash';
import {
  GestureHandlerRootView,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useStore from '../../../data/store';
// import getTotalBalances from '../../Pin/Handlers/get_total_balances';
import checkConnectionStatus from '../../StartScreen/Handlers/xrpl_connection_status';
import QRCode from 'react-native-qrcode-svg';
import {Share} from 'react-native';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import firestore from '@react-native-firebase/firestore';
import SelectDropdown from 'react-native-select-dropdown';
import Alert from '../../../components/Alert';

const xrpl = require('xrpl');

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const PaymentRequest = ({route, navigation}) => {
  let {
    activeAccount,
    theme,
    exchangeRate,
    exchangeTo,
    tokenRate,
    token,
    rateLoading,
    node,
    accountBalances,
  } = useStore();
  const setExchangeRate = useStore(state => state.setExchangeRate);
  const setRateLoading = useStore(state => state.setRateLoading);

  const setToken = useStore(state => state.setToken);
  const setTokenRate = useStore(state => state.setTokenRate);
  const [isConnected, setIsConnected] = React.useState(false);
  const [isAmountRequest, setIsAmountRequest] = useState(false);
  const [isErrorAlert, setIsErrorAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [amount, setAmount] = useState('');

  const [step, setStep] = React.useState(1);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  React.useEffect(() => {
    if (activeAccount.balances.length > 0) {
      setToken(activeAccount.balances[0]);
      fetchExchangeRates(activeAccount.balances[0]?.currency, 'USD');
    }

    checkConnectionStatus(node).then(res => {
      if (res) {
        setIsConnected(true);
        console.log('connected');
      } else {
        setIsConnected(false);
        console.log('not connected');
      }
    });
  }, []);

  goToHome = () => {
    navigation.navigate('Home Screen');
  };
  const shareRequestPayment = async () => {
    try {
      const params = isAmountRequest
        ? `name=${activeAccount?.name}&address=${activeAccount?.classicAddress}&token=${token?.currency}&amount=${amount}`
        : `name=${activeAccount?.name}&address=${activeAccount?.classicAddress}&token=${token?.currency}`;
      if (!token?.currency) {
        setIsErrorAlert(true);
        setErrorMsg('Please select token from list!');
      } else {
        let encodedParams = encodeURIComponent(params);
        const link = await dynamicLinks().buildShortLink({
          link: `http://?${encodedParams}`,
          ios: {
            bundleId: '',
            appStoreId: '',
          },
          android: {
            packageName: '',
          },
          domainUriPrefix: 'https://',
          social: {
            title:
              isAmountRequest && Number(amount) > 0
                ? `${activeAccount?.name} is requesting ${amount} ${token?.currency}`
                : `${activeAccount?.name} is requesting ${token?.currency}`,
            descriptionText:
              'Introducing the XRP Healthcare Decentralized Mobile Wallet: Empowering Users with Unparalleled Control, Savings, and Rewards.',
            imageUrl: '',
          },
        });
        await Share.share({
          message: link,
        });
      }
    } catch (e) {
      setIsErrorAlert(true);
      setErrorMsg(e);
      console.log('----share link error-----', e);
    }
  };

  const getExchangeRates = async (exchangeFrom, exchangeIn) => {
    let XRPrate = 0;
    let XRPHrate = 0;

    const res = await firestore()
      .collection('exchange_rates')
      .doc(exchangeIn)
      .get();
    console.log(res);
    if (
      res['_data'].XRPHrate === undefined ||
      res['_data'].XRPrate === undefined
    ) {
      setError('Unfortunately we could not connect your account.');
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
  };

  const fetchExchangeRates = async (exchangeFrom, exchangeIn) => {
    setRateLoading(true);
    try {
      const newTokenRate = await getExchangeRates(exchangeFrom, exchangeIn);
      setTokenRate(newTokenRate);
      setRateLoading(false);
    } catch (e) {
      console.log(e.message);
    }
  };

  let dismissKeyboard = () => {
    return new Promise((resolve, reject) => {
      Keyboard.dismiss();
      setTimeout(() => {
        resolve();
      }, 5);
    });
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />
        <View style={styles.bg}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goToHome}>
              <MaterialCommunityIcons
                name={'chevron-left'}
                color={colors.text}
                size={30}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Request</Text>
            <TouchableOpacity onPress={shareRequestPayment}>
              <MaterialCommunityIcons
                name={'share-variant-outline'}
                color={colors.text}
                size={20}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.qrSection}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={activeAccount?.classicAddress}
                backgroundColor="transparent"
                color={colors.text}
              />
            </View>
          </View>
          <View>
            <Text style={styles.label}>To</Text>
            <View style={styles.receiverWrapper}>
              <Text style={styles.receiverName}>{activeAccount?.name}</Text>
              <Text style={styles.receiverAdress}>
                {activeAccount?.classicAddress}
              </Text>
            </View>
          </View>
          <ScrollView automaticallyAdjustKeyboardInsets={true}>
            <View style={styles.requestWrapper}>
              <Text style={styles.requestAmountText}>Request with amount</Text>
              <TouchableOpacity
                style={{
                  borderColor: isAmountRequest
                    ? theme === 'dark'
                      ? colors.secondary
                      : colors?.primary
                    : colors.text_dark,
                  borderWidth: 3,
                  backgroundColor: isAmountRequest
                    ? theme === 'dark'
                      ? colors.secondary
                      : colors.primary
                    : colors.bg,
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                }}
                onPress={() => setIsAmountRequest(!isAmountRequest)}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                  }}>
                  <Feather
                    name={'check'}
                    size={20}
                    color={isAmountRequest ? '#fff' : colors.bg}
                  />
                </View>
              </TouchableOpacity>
            </View>
            {isAmountRequest && (
              // <TouchableWithoutFeedback onPress={dismissKeyboard}>
              <View>
                <View style={styles.sendModalTokenWrapper}>
                  <Text
                    style={{
                      marginTop: 24,
                      textAlign: 'left',
                      fontSize: 16,
                      color: colors.text,
                    }}>
                    Token
                  </Text>

                  <View style={styles.sendModalToken}>
                    <SelectDropdown
                      data={[
                        {
                          currency: 'XRP',
                          value:
                            accountBalances?.find(
                              bnlc => bnlc.currency == 'XRP',
                            )?.value || 0,
                        },
                        {
                          currency: 'XRPH',
                          value:
                            accountBalances?.find(
                              bnlc => bnlc.currency == 'XRPH',
                            )?.value || 0,
                        },
                      ]}
                      onSelect={(selectedItem, index) => {
                        setToken(selectedItem);
                        fetchExchangeRates(selectedItem.currency, exchangeTo);
                        const completeRate = parseFloat(tokenRate * amount);
                        setExchangeRate(String(completeRate));
                      }}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        // text represented after item is selected
                        // if data array is an array of objects then return selectedItem.property to render after item is selected
                        return selectedItem.currency;
                      }}
                      rowTextForSelection={(item, index) => {
                        // text represented for each item in dropdown
                        // if data array is an array of objects then return item.property to represent item in dropdown
                        return item.currency;
                      }}
                      defaultButtonText={token?.currency}
                      dropdownStyle={styles.currencyDropdown}
                      buttonStyle={styles.currencyDropdownButton}
                      buttonTextStyle={styles.currencyDropdownButtonText}
                      rowTextStyle={styles.currencyDropdownText}
                      renderDropdownIcon={isOpened => {
                        return (
                          <FontAwesome
                            name={isOpened ? 'angle-up' : 'angle-down'}
                            size={30}
                            color={colors.text}
                          />
                        );
                      }}
                    />
                  </View>
                </View>
                <TextInput
                  style={styles.formInput}
                  placeholder="0"
                  value={amount}
                  onChangeText={e => setAmount(e)}
                  keyboardType={
                    Platform.OS === 'ios' ? 'number-pad' : 'decimal-pad'
                  }
                  returnKeyType={'done'}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.light_gray_bg,
                    padding: 20,
                    marginTop: 20,
                    marginBottom: 20,
                    borderRadius: 12,
                  }}>
                  <Text
                    style={{
                      fontSize: 32,
                      marginRight: 10,
                      color: colors.text,
                      fontWeight: Platform.OS === 'ios' ? 'bold' : '600',
                    }}>
                    ~
                  </Text>
                  <TextInput
                    style={styles.formInput2}
                    placeholder="0"
                    value={Number(tokenRate * amount)
                      ?.toFixed(4)
                      ?.toString()}
                    readOnly
                  />
                  <Text
                    style={{
                      fontSize: 24,
                      color: colors.light_text,
                      position: 'absolute',
                      right: 0,
                      marginRight: 10,
                      backgroundColor: colors.light_gray_bg,
                      fontWeight: Platform.OS === 'ios' ? 'bold' : '600',
                    }}>
                    USD
                  </Text>
                </View>
              </View>
              // </TouchableWithoutFeedback>
            )}
          </ScrollView>
          <Alert
            isOpen={isErrorAlert}
            type={isErrorAlert ? 'error' : 'success'}
            message={errorMsg}
            icon={isErrorAlert ? 'close' : 'check'}
            setIsOpen={setIsErrorAlert}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styling = colors =>
  StyleSheet.create({
    safeView: {
      backgroundColor: colors.dark_bg,
    },
    bg: {
      backgroundColor: colors.dark_bg,
      //   alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
      paddingHorizontal: 10,
    },
    header: {
      width: '100%',
      marginTop: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: colors.text,
    },
    headerTitle: {
      fontSize: 24,
      color: colors.text,
      fontWeight: 700,
    },
    qrSection: {
      marginTop: 32,
      borderRadius: 8,
      padding: 20,
      backgroundColor: colors.light_gray_bg,
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
    },
    qrWrapper: {
      padding: 15,
      borderWidth: 4,
      borderColor: colors.dark_gray_border,
      borderRadius: 6,
    },
    label: {
      marginTop: 44,
      textAlign: 'left',
      fontSize: 16,
      color: colors.text,
    },
    receiverWrapper: {
      marginTop: 10,
      borderRadius: 8,
      backgroundColor: colors.light_gray_bg,
      padding: 15,
    },
    receiverName: {
      fontSize: 16,
      color: colors.dark_text,
      fontWeight: 600,
    },
    receiverAdress: {
      fontSize: 14,
      fontWeight: 400,
      marginTop: 5,
      color: colors.light_text,
    },
    requestWrapper: {
      marginTop: 34,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    requestAmountText: {
      fontSize: 14,
      fontWeight: 500,
      color: colors.text,
    },
    formInput: {
      marginTop: 24,
      padding: 20,
      backgroundColor: colors.light_gray_bg,
      fontSize: 32,
      borderRadius: 12,
      color: colors.light_text,
      fontWeight: Platform.OS === 'ios' ? 'bold' : '600',
    },
    formInput2: {
      backgroundColor: colors.light_gray_bg,
      fontSize: 32,
      padding: 0,
      marginRight: 20,
      color: colors.light_text,
      fontWeight: Platform.OS === 'ios' ? 'bold' : '600',
    },
    sendModalTokenWrapper: {
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    sendModalToken: {
      backgroundColor: colors.light_gray_bg,
      borderRadius: 12,
      marginTop: 10,
    },
    currencyDropdown: {
      backgroundColor: colors.light_gray_bg,
      borderRadius: 12,
    },
    currencyDropdownText: {
      fontSize: 18,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '600',
    },
    currencyDropdownButton: {
      width: '100%',
      height: 80,
      marginTop: 0,
      borderRadius: 10,
      backgroundColor: colors.light_gray_bg,
    },
    currencyDropdownButtonText: {
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '600',
      textAlign: 'left',
      marginLeft: 0,
      color: colors.light_text,
      padding: 10,
    },
  });

export default PaymentRequest;
