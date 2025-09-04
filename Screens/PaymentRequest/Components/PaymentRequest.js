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
import {GestureHandlerRootView, ScrollView} from 'react-native-gesture-handler';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useStore from '../../../data/store';
// import getTotalBalances from '../../Pin/Handlers/get_total_balances';
import QRCode from 'react-native-qrcode-svg';
import {Share} from 'react-native';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import firestore from '@react-native-firebase/firestore';
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Alert from '../../../components/Alert';
import {useGetPrices} from '../../../utils/wallet.api';
import LinearGradient from 'react-native-linear-gradient';
import BackHeader from '../../../components/BackHeader';
import HorizontalLineWithText from '../../../components/saperator/HorizontalLineWithText';
import QRCodeView from '../../../components/QRCodeView';
import HorizontalLine from '../../../components/saperator/HorizontalLine';

const xrpl = require('xrpl');

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const PaymentRequest = ({route, navigation}) => {
  const getExchangePrices = useGetPrices();
  let {activeAccount, theme, exchangeTo, tokenRate, token, accountBalances} =
    useStore();
  const setExchangeRate = useStore(state => state.setExchangeRate);
  const setRateLoading = useStore(state => state.setRateLoading);

  const setToken = useStore(state => state.setToken);
  const setTokenRate = useStore(state => state.setTokenRate);
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
  }, []);

  goToHome = () => {
    navigation.navigate('Home Screen');
  };
  const shareRequestPayment = async () => {
    try {
      const params = amount>0
        ? `name=${activeAccount?.name}&address=${activeAccount?.classicAddress}&token=${token?.currency}&amount=${amount}`
        : `name=${activeAccount?.name}&address=${activeAccount?.classicAddress}&token=${token?.currency}`;
      if (!token?.currency) {
        setIsErrorAlert(true);
        setErrorMsg('Please select token from list!');
      } else {
        let encodedParams = encodeURIComponent(params);
        const link = await dynamicLinks().buildShortLink({
          link: `http://xrphwallet.page.link/?${encodedParams}`,
          ios: {
            bundleId: 'com.xrphealthcare.xrphwallet',
            appStoreId: '6451218628',
          },
          android: {
            packageName: 'com.xrphwallet',
          },
          domainUriPrefix: 'https://xrphwallet.page.link',
          social: {
            title:
              isAmountRequest && Number(amount) > 0
                ? `${activeAccount?.name} is requesting ${amount} ${token?.currency}`
                : `${activeAccount?.name} is requesting ${token?.currency}`,
            descriptionText:
              'Introducing the XRP Healthcare Decentralized Mobile Wallet: Empowering Users with Unparalleled Control, Savings, and Rewards.',
            imageUrl:
              'https://firebasestorage.googleapis.com/v0/b/xrphwallet.appspot.com/o/assets%2FGroup%2032.jpg?alt=media&token=7f678b1e-cee2-47c2-ab75-4e2040a367a1',
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
    let USDTrate = 0;
    let RLUSDrate = 0;

    const response = await getExchangePrices.mutateAsync();
    const exchangeCurrency = exchangeIn?.toLowerCase();

    if (
      response[exchangeCurrency].XRPH === undefined ||
      response[exchangeCurrency].XRP === undefined ||
      response[exchangeCurrency].USDT === undefined ||
      response[exchangeCurrency].RLUSD === undefined
    ) {
      setError('Unfortunately we could not connect your account.');
    } else {
      XRPrate = response[exchangeCurrency].XRP;
      XRPHrate = response[exchangeCurrency].XRPH;
      USDTrate = response[exchangeCurrency].USDT;
      RLUSDrate = response[exchangeCurrency].RLUSD;
    }

    if (exchangeFrom === 'XRP') {
      return XRPrate;
    } else if (exchangeFrom === 'XRPH') {
      return XRPHrate;
    } else if (exchangeFrom === 'USDT') {
      return USDTrate;
    } else if (exchangeFrom === 'RLUSD') {
      return RLUSDrate;
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
        <BackHeader
            title={'Payment Request'}
            backOnPress={()=>navigation.goBack()}
            />
<View>
<HorizontalLineWithText text={'Scan For Secure XRP Transfer'} color={colors.bg_gray_2} textColor={colors.text_color_gray_1}/>
</View>
            
            <View style={styles.qrSection}>
<QRCodeView
data={activeAccount?.classicAddress}
color={colors.text}
theme={theme}
/>
</View>
<HorizontalLine color={colors.bg_gray_2} widthStyle={true}/>
      
          <ScrollView style={{marginHorizontal:20}} automaticallyAdjustKeyboardInsets={true}>
            {/* <View style={styles.requestWrapper}>
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
            </View> */}
            {/* {isAmountRequest && ( */}
              {/* // <TouchableWithoutFeedback onPress={dismissKeyboard}> */}

              <View>
            <Text style={styles.label}>Accord</Text>
            <View style={styles.receiverWrapper}>
              {/* <Text style={styles.receiverName}>{activeAccount?.name}</Text> */}
              <Text style={styles.receiverName}>To</Text>
              <Text style={styles.receiverAdress}>
                {activeAccount?.classicAddress}
              </Text>
            </View>
          </View>

              <View>
                <View style={styles.sendModalTokenWrapper}>
                <Text style={styles.label}>
                    Token/Network
                  </Text>

                  <View style={styles.sendModalToken}>
                    <SelectDropdown
                      data={[
                        {
                          currency: 'USDT',
                          value:
                            accountBalances?.find(
                              bnlc => bnlc.currency == 'USDT',
                            )?.value || 0,
                        },
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
                        {
                          currency: 'RLUSD',
                          value:
                            accountBalances?.find(
                              bnlc => bnlc.currency == 'RLUSD',
                            )?.value || 0,
                        },
                      ]}
                      defaultValue={token}
                      onSelect={(selectedItem, index) => {
                        setToken(selectedItem);
                        fetchExchangeRates(selectedItem.currency, exchangeTo);
                        const completeRate = parseFloat(tokenRate * amount);
                        setExchangeRate(String(completeRate));
                      }}
                      renderButton={(selectedItem, isOpened) => {
                        return (
                          <View style={styles.currencyDropdownButton}>
                            <Text style={styles.currencyDropdownButtonText}>
                              {(selectedItem && selectedItem.currency) ||
                                'XRPH'}
                            </Text>
                            <FontAwesome
                              name={isOpened ? 'chevron-up' : 'chevron-down'}
                              size={15}
                              color={colors.text}
                              style={{marginRight: 15}}
                            />
                          </View>
                        );
                      }}
                      renderItem={(item, index, isSelected) => {
                        return (
                          <View
                            style={{
                              ...styles.currencyDropdownItemStyle,
                              ...(isSelected && {backgroundColor: colors.bg}),
                            }}>
                            <Text style={styles.currencyDropdownText}>
                              {item.currency}
                            </Text>
                          </View>
                        );
                      }}
                      dropdownStyle={styles.dropdownMenuStyle}
                    />
                  </View>
                </View>
                {/* <View> */}
                  <View  style={{...styles.formInputContainer}}>
                  <Text style={[styles.receiverName,{marginTop:5,marginLeft:2}]}>Amount</Text>
                  <TextInput
                  style={{...styles.formInput, color: colors.text}}
                  placeholder="0"
                  placeholderTextColor={colors.text}
                  value={amount}
                  onChangeText={e => setAmount(e)}
                  keyboardType={
                    Platform.OS === 'ios' ? 'decimal-pad' : 'decimal-pad'
                  }
                  returnKeyType={'done'}
                />
                  </View>
                {/* <TextInput
                  style={{...styles.formInput, color: colors.dark_gray}}
                  placeholder="0"
                  value={amount}
                  onChangeText={e => setAmount(e)}
                  keyboardType={
                    Platform.OS === 'ios' ? 'decimal-pad' : 'decimal-pad'
                  }
                  returnKeyType={'done'}
                /> */}
                {/* </View> */}
                <Text style={styles.label}>
                Approximate Amount
                  </Text>
                <View
                  style={styles.currencyContainer}>
                  <Text
                    style={{
                      fontSize: 15,
                      marginRight: 2,
                      color: colors.text,
                      fontWeight: '600',
                    }}>
                    ≈{'  '}$
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
                    style={styles.currencyTitleStyle}>
                    USD
                  </Text>
                </View>
              </View>
              {/* // </TouchableWithoutFeedback> */}
            {/* )} */}


  <TouchableOpacity
                onPress={() => {
                  shareRequestPayment();
                }}>
                <LinearGradient
                  colors={['#37C3A6', '#AF45EE']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.paymentRequest}>
                  <Text style={styles.paymentRequestText}>
                  Share Details
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
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
      // paddingHorizontal: 20,
      
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
      fontWeight: '700',
    },
    qrSection: {
      marginTop: 2,
      borderRadius: 8,
      padding: 20,
      // backgroundColor: colors.light_gray_bg,
      // flexDirection: 'row',
      justifyContent: 'center',
      alignItems:'center'
    },
    qrWrapper: {
      padding: 15,
      borderWidth: 4,
      borderColor: colors.dark_gray_border,
      borderRadius: 6,
    },
    label: {
       marginTop: 15,
      textAlign: 'left',
      fontSize: 16,
      color: colors.text_color_gray_1,
    },
    receiverWrapper: {
      marginTop: 6,
      borderRadius: 12,
      borderWidth:1,
      borderColor:colors.border_gray_light,
      padding: 8,
      paddingHorizontal:15,
      backgroundColor: colors.backGround_color_2,
    },
    receiverName: {
      fontSize: 14,
      // color: colors.text_color_gray_1,
      color:colors.text_placeholder_gray
      // fontWeight: '600',
    },
    receiverAdress: {
      fontSize: 14,
      fontWeight: '600',
      marginTop: 5,
      color: colors.text,
    },
    requestWrapper: {
      marginTop: 34,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    requestAmountText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    formInputContainer: {
       marginTop: 13,
      paddingVertical:5,
      paddingHorizontal:12,
      backgroundColor: colors.backGround_color_2,
      fontSize: 22,
      borderRadius: 12,
      borderColor:colors.border_gray_light,
      borderWidth:1,
    },
    formInput: {
      // marginTop: 5,
      flex:1,
      fontSize: 14,
       height: 40,
      color: colors.text,
      fontWeight: '600',
     
    },
    formInput2: {
      // backgroundColor: colors.light_gray_bg,
      fontSize: 14,
      padding: 0,
      marginRight: 20,
      color: colors.text,
      fontWeight: '600',
    },
    sendModalTokenWrapper: {
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    sendModalToken: {
      borderRadius: 12,
      borderWidth:1,
      borderColor:colors.border_gray_light,
      marginTop: 6,
      
    },
    currencyDropdownItemStyle: {
      padding: 15,
      backgroundColor: colors.bg,
    },
    dropdownMenuStyle: {
      backgroundColor: colors.light_gray_bg,
      borderRadius: 10,
    },
    currencyDropdownText: {
      fontSize: 18,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: '600',
    },
    currencyDropdownButton: {
      width: '100%',
      height: 60,
      marginTop: 0,
      borderRadius: 10,
      backgroundColor: colors.backGround_color_2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:'space-between'
      // gap: 270,
    },
    currencyDropdownButtonText: {
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: '600',
      fontSize: 16,
      textAlign: 'left',
      marginLeft: 0,
      color: colors.text,
      padding: 10,
    },
    paymentRequest: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      marginTop: 20,
      marginBottom:10,
      
    },
    paymentRequestText: {
      textAlign: 'center',
      fontSize: 18,
      color: '#fff',
    },
    currencyContainer:
      {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor:colors.border_gray_light,
        borderWidth:1,
        height: 60,
        padding: 10,
        marginTop: 5,
        marginBottom: 20,
        borderRadius: 12,
        backgroundColor: colors.backGround_color_2,
      },
      currencyTitleStyle:{
          fontSize: 14,
          position: 'absolute',
          right: 0,
          marginRight: 15,
          color: colors.text,
          fontWeight: '600',
      }
    
  });

export default PaymentRequest;
