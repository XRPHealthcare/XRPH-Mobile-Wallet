import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useStore from '../../../data/store';
import send_token from '../../HomeScreen/Handlers/send_token';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Lottie from 'lottie-react-native';
import firestore from '@react-native-firebase/firestore';
import {trigger} from 'react-native-haptic-feedback';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import PendingTouch from '../../../assets/img/pending-touch.svg';
import {useVerifyPassword} from '../../../utils/auth.api';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const SendingAnimation = () => {
  const {theme} = useStore();

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  return (
    <View style={styles.loadingAnimationWrapper}>
      <Text style={styles.loadingText}>Sending...</Text>
      <Lottie
        style={styles.addAccountAnimation}
        source={require('../../../assets/animations/addAccountAnimation.json')}
        autoPlay
        loop
      />
      <Text style={styles.loadingTextSmallTop}>
        Verifying transaction on the XRP Ledger.
      </Text>
      {/*   */}
    </View>
  );
};

const ReviewPaymentScreen = ({navigation}) => {
  const rnBiometrics = new ReactNativeBiometrics();
  const verifyUserPassword = useVerifyPassword();
  let {
    sendTransactionDetails,
    accounts,
    activeAccount,
    theme,
    token,
    node,
    hepticOptions,
    isBiometricEnabled,
  } = useStore();
  const setAccounts = useStore(state => state.setAccounts);
  const setActiveAccount = useStore(state => state.setActiveAccount);
  const setDestinationAddress = useStore(state => state.setDestinationAddress);
  const setToken = useStore(state => state.setToken);
  const setMemo = useStore(state => state.setMemo);
  const setDestinationTag = useStore(state => state.setDestinationTag);
  const setAmount = useStore(state => state.setAmount);
  const setIsBiometricEnabled = useStore(state => state.setIsBiometricEnabled);

  const [loading, setLoading] = React.useState(false);
  const [loadingModalVisible, setLoadingModalVisible] = React.useState(false);
  const [pwModalOpen, setPwModalOpen] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [pwErrorMessage, setPwErrorMessage] = React.useState('');

  const [errorMessage, setErrorMessage] = React.useState('');
  const [enterPwVisibility, setEnterPwVisibility] = React.useState(false);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const getTotalBalances = async () => {
    let updatedAccounts = [];

    for (let accountIndex = 0; accountIndex < accounts.length; accountIndex++) {
      let allRates = {
        USD: {
          XRPrate: 0,
          XRPHrate: 0,
        },
        EUR: {
          XRPrate: 0,
          XRPHrate: 0,
        },
        GBP: {
          XRPrate: 0,
          XRPHrate: 0,
        },
      };

      let allBalances = {
        USD: '0',
        EUR: '0',
        GBP: '0',
      };

      const currencies = ['USD', 'EUR', 'GBP'];
      const balances = accounts[accountIndex].balances;

      if (balances.length == 0) {
        updatedAccounts.push({
          ...accounts[accountIndex],
          totalBalances: allBalances,
        });
      } else {
        for (let i = 0; i < currencies.length; i++) {
          const res = await firestore()
            .collection('exchange_rates')
            .doc(currencies[i])
            .get();
          if (
            res['_data'].XRPHrate === undefined ||
            res['_data'].XRPrate === undefined
          ) {
            setError('Unfortunately we could not connect your account.');
          } else {
            const exchangeRates = res['_data'];
            allRates[currencies[i]].XRPrate = exchangeRates.XRPrate;
            allRates[currencies[i]].XRPHrate = exchangeRates.XRPHrate;
            // XRPrate = exchangeRates.XRPrate;
            // XRPHrate = exchangeRates.XRPHrate;
          }
          let sum = 0;

          for (let j = 0; j < balances.length; j++) {
            const {currency, value} = balances[j];

            let amount = 0;
            if (currency === 'XRP') {
              amount = Number(value * allRates[currencies[i]].XRPrate);
            } else if (currency === 'XRPH') {
              amount = Number(value * allRates[currencies[i]].XRPHrate);
            } else {
              amount = 0;
            }
            sum += amount;
          }

          sum = sum.toFixed(2);
          allBalances[currencies[i]] = String(sum.toLocaleString('en-US'));
        }
        // get data for XRP and XRPH

        updatedAccounts.push({
          ...accounts[accountIndex],
          totalBalances: allBalances,
        });
      }
    }
    return updatedAccounts;
  };

  const sendTransaction = async success => {
    console.log(password, activeAccount.password);
    let response = null;
    if (!success) {
      response = await verifyUserPassword.mutateAsync({password: password});
    }
    if (response?.found || success) {
      setPwModalOpen(false);
      setLoadingModalVisible(true);
      setPwErrorMessage('');
      const preparedPayment = {
        to: sendTransactionDetails.to,
        currency: sendTransactionDetails.currency,
        amount: sendTransactionDetails.amount,
        seed: sendTransactionDetails.seed,
        memo: sendTransactionDetails.memo,
        destinationTag: sendTransactionDetails.destinationTag,
        balances: activeAccount.balances,
      };
      const response = await send_token(preparedPayment, node);
      console.log('----------response-------------------', response);

      if (response.error === undefined) {
        trigger('impactHeavy', hepticOptions);
        setLoadingModalVisible(false);
        navigation.push('Payment Success Screen');
        // no error
        const {from, fromBalances} = response;
        let updatedAccounts = [];

        for (let account of accounts) {
          if (account.classicAddress === from) {
            let accountCopy = account;
            accountCopy.balances = fromBalances;
            updatedAccounts.push(accountCopy);
          } else {
            updatedAccounts.push(account);
          }
        }

        getTotalBalances(updatedAccounts).then(adjustedAccounts => {
          setAccounts(adjustedAccounts);
          AsyncStorage.setItem(
            'accounts',
            JSON.stringify(adjustedAccounts),
          ).then(() => {
            console.log('accounts set asynchronously');
          });

          for (let i = 0; i < adjustedAccounts.length; i++) {
            if (
              adjustedAccounts[i].classicAddress ===
              activeAccount.classicAddress
            ) {
              setActiveAccount(adjustedAccounts[i]);
              AsyncStorage.setItem(
                'activeAccount',
                JSON.stringify(adjustedAccounts[i]),
              ).then(() => {
                console.log('active account set asynchronously');
              });
            }
          }
          setLoading(false);
        });

        setAccounts(updatedAccounts);
        AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts)).then(
          () => {
            console.log('accounts set asynchronously');
          },
        );

        setDestinationAddress('');
        setToken(activeAccount.balances[0].currency);
        setMemo('');
        setDestinationTag('');
        setAmount('');
      } else {
        const errMessage = response.error;
        setLoadingModalVisible(false);
        setErrorMessage(errMessage);
      }
      //const { from, fromBalances } = await send_token(preparedPayment);
    } else {
      setPwErrorMessage('Error: Incorrect password.');
    }
  };

  const biometricPrompt = () => {
    rnBiometrics
      .simplePrompt({promptMessage: 'Sign Transaction'})
      .then(resultObject => {
        const {success} = resultObject;
        if (success) {
          trigger('impactHeavy', hepticOptions);
          sendTransaction(true);
        } else {
          trigger('impactHeavy', hepticOptions);
          console.log('user cancelled biometric prompt');
        }
      })
      .catch(() => {
        trigger('impactHeavy', hepticOptions);
        console.log('biometrics failed');
      });
  };

  const checkIsBiometricEnabled = () => {
    try {
      rnBiometrics.isSensorAvailable().then(res => {
        const {available, biometryType} = res;
        if (available && biometryType === BiometryTypes.FaceID) {
          rnBiometrics.biometricKeysExist().then(keyResult => {
            let {keysExist} = keyResult;
            if (keysExist) {
              setIsBiometricEnabled(true);
              biometricPrompt();
            } else {
              setIsBiometricEnabled(false);
            }
          });
        } else if (available && biometryType === BiometryTypes.TouchID) {
          rnBiometrics.biometricKeysExist().then(keyResult => {
            let {keysExist} = keyResult;
            if (keysExist) {
              setIsBiometricEnabled(true);
              biometricPrompt();
            } else {
              setIsBiometricEnabled(false);
            }
          });
        } else if (available && biometryType === BiometryTypes.Biometrics) {
          rnBiometrics.biometricKeysExist().then(keyResult => {
            let {keysExist} = keyResult;
            if (keysExist) {
              setIsBiometricEnabled(true);
              biometricPrompt();
            } else {
              setIsBiometricEnabled(false);
            }
          });
        } else {
          console.log('Biometric not found');
        }
      });
    } catch (e) {
      console.log('--------error in review payment------', e);
    }
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />
        {!loadingModalVisible && !pwModalOpen ? (
          <View style={styles.bg}>
            <View style={styles.header}>
              <View style={styles.sendModalHeaderSpacer}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Home Screen', {
                      sendOpen: true,
                      sendStep: 2,
                      currToken: token,
                      currAmount: sendTransactionDetails.amount,
                    })
                  }
                  style={{
                    marginLeft: -10,
                    marginRight: 10,
                  }}>
                  <Feather
                    name={'chevron-left'}
                    size={35}
                    color={colors.text}
                    style={styles.backIcon}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.headerText}>Review Payment</Text>
              <Text style={styles.sendModalHeaderSpacer}></Text>
            </View>
            <View style={styles.transactionCard}>
              <Text style={styles.amount}>
                {sendTransactionDetails.amount}{' '}
                {sendTransactionDetails.currency}
              </Text>

              {sendTransactionDetails.exchangeIn === 'USD' && (
                <Text style={styles.conversion}>
                  <Text style={styles.inputLabelCharacter}>~</Text> ${' '}
                  {sendTransactionDetails.amountConversion}{' '}
                  {sendTransactionDetails.exchangeIn}
                </Text>
              )}

              {sendTransactionDetails.exchangeIn === 'EUR' && (
                <Text style={styles.conversion}>
                  <Text style={styles.inputLabelCharacter}>~</Text> €{' '}
                  {sendTransactionDetails.amountConversion}{' '}
                  {sendTransactionDetails.exchangeIn}
                </Text>
              )}

              {sendTransactionDetails.exchangeIn === 'GBP' && (
                <Text style={styles.conversion}>
                  <Text style={styles.inputLabelCharacter}>~</Text> £{' '}
                  {sendTransactionDetails.amountConversion}{' '}
                  {sendTransactionDetails.exchangeIn}
                </Text>
              )}

              <View style={styles.horizontalLine}></View>
              <Text style={styles.label}>From</Text>
              <Text style={styles.text}>{sendTransactionDetails.from}</Text>
              <View style={styles.horizontalLine}></View>
              <Text style={styles.label}>To</Text>
              <Text style={styles.text}>{sendTransactionDetails.to}</Text>
              <View style={styles.horizontalLine}></View>
              <Text style={styles.label}>Transaction Fee</Text>
              <Text style={styles.text}>
                {sendTransactionDetails.transactionFee}
              </Text>
              <View style={styles.horizontalLine}></View>
              <Text style={styles.label}>Memo</Text>
              <Text style={styles.text}>{sendTransactionDetails.memo}</Text>
              <View style={styles.horizontalLine}></View>
              <Text style={styles.label}>Destination Tag</Text>
              <Text style={styles.text}>
                {sendTransactionDetails.destinationTag}
              </Text>
              <View style={styles.horizontalLine}></View>
            </View>
            {errorMessage.length > 0 && (
              <Text style={styles.errorMessageText}>{errorMessage}</Text>
            )}
            <View style={styles.slideButtonContainer}>
              <TouchableOpacity
                style={styles.buttonCreate}
                onPress={() => {
                  setPwModalOpen(true);
                  checkIsBiometricEnabled();
                }}>
                <View style={styles.buttonWrapper}>
                  <Text style={styles.buttonCreateText}>Send</Text>
                  <AntDesign
                    name={'arrowright'}
                    size={30}
                    color={colors.text}
                    style={styles.continueIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.bg}>
            {loadingModalVisible && (
              <Modal visible={loadingModalVisible} transparent={true}>
                <SendingAnimation />
              </Modal>
            )}

            {pwModalOpen && (
              <Modal visible={pwModalOpen} transparent={true}>
                <View style={styles.addAccountModalWrapper}>
                  <View style={styles.sendModalHeader}>
                    <View style={styles.sendModalHeaderSpacer}>
                      <TouchableOpacity
                        onPress={() => {
                          setPwModalOpen(false);
                        }}
                        style={{
                          marginTop: 7,
                          marginLeft: -10,
                        }}>
                        <Feather
                          name={'chevron-left'}
                          size={35}
                          color={colors.text}
                          style={styles.backIcon}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.sendModalHeaderText}>
                      Sign Transaction
                    </Text>
                    <View style={styles.sendModalHeaderSpacer}></View>
                  </View>
                  <View style={styles.addAccountModalActionsWrapper}>
                    <Text style={styles.pwDirections}>
                      Enter your password to sign your transaction.
                    </Text>
                    <View style={styles.pw}>
                      <TextInput
                        style={styles.accountNameInputPw}
                        onChangeText={setPassword}
                        value={password}
                        placeholder="Password"
                        placeholderTextColor={colors.text_dark}
                        secureTextEntry={!enterPwVisibility}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() =>
                          setEnterPwVisibility(!enterPwVisibility)
                        }>
                        <View style={styles.buttonWrapper}>
                          <Feather
                            name={enterPwVisibility ? 'eye' : 'eye-off'}
                            size={25}
                            color={colors.text}
                            style={styles.eyeIcon}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                    {pwErrorMessage.length > 0 && (
                      <Text style={styles.errorMessageText}>
                        {pwErrorMessage}
                      </Text>
                    )}
                    {isBiometricEnabled && (
                      <TouchableOpacity
                        style={{marginVertical: 30}}
                        onPress={checkIsBiometricEnabled}>
                        <PendingTouch height={75} width={75} />
                      </TouchableOpacity>
                    )}
                    <View style={styles.addAccountActionButtons}>
                      <TouchableOpacity
                        style={styles.addAccountOkButton}
                        onPress={() => sendTransaction()}>
                        <View style={styles.buttonWrapper}>
                          <Text style={styles.addAccountOkButtonText}>
                            Continue
                          </Text>
                          <Feather
                            name={'arrow-right'}
                            size={25}
                            color={colors.bg}
                            style={styles.continueIcon}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            )}
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styling = colors =>
  StyleSheet.create({
    bg: {
      backgroundColor: colors.bg,
      alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
      paddingHorizontal: 10,
    },
    header: {
      flexDirection: 'row',
      justifyConten: 'space-between',
      alignItems: 'center',
      width: '90%',
      marginTop: 50,
      marginBottom: 50,
    },
    backIcon: {},
    inputLabelCharacter: {
      fontFamily: 'Helvetica',
    },
    sendModalHeaderSpacer: {
      width: 60,
    },
    headerText: {
      fontSize: 22,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.text,
      textAlign: 'center',
      paddingRight: 10,
    },
    backButton: {
      width: '40%',
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.text_light,
      borderRadius: 25,
    },
    buttontextDark: {
      fontSize: 20,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginLeft: 5,
      marginTop: 5,
    },
    transactionCard: {
      backgroundColor: colors.bg,
      width: '95%',
      // elevation: 5,
      borderRadius: 10,
      justifyContent: 'space-between',
      flexDirection: 'column',
    },
    amount: {
      fontSize: 30,
      color: colors.primary,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginLeft: 10,
      marginTop: 10,
    },
    conversion: {
      fontSize: 20,
      color: colors.text_dark,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginLeft: 10,
      marginBottom: 2,
    },
    horizontalLine: {
      width: '95%',
      marginLeft: '2.5%',
      marginBottom: 5,
      height: 2,
      backgroundColor: colors.text_dark,
    },
    label: {
      fontSize: 12,
      color: colors.text_dark,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginLeft: 10,
      marginTop: 5,
    },
    text: {
      fontSize: 14,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginLeft: 10,
      marginTop: 5,
      marginBottom: 5,
    },
    loadingAnimationWrapper: {
      backgroundColor: colors.bg,
      width: '90%',
      height: '80%',
      marginTop: '20%',
      marginLeft: '5%',
      // marginBottom: 100,
      // marginTop: 100,
      // elevation: 5,
      borderRadius: 10,
      // justifyContent: 'space-between',
      // alignItems: 'center'
    },
    sendModalHeader: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 40,
      marginBottom: 30,
    },
    sendModalHeaderSpacer: {
      width: 60,
    },
    sendModalHeaderText: {
      fontSize: 22,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.text,
      textAlign: 'right',
      paddingRight: 10,
      paddingTop: 5,
    },
    loadingText: {
      fontSize: 20,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 40,
    },
    loadingTextSmall: {
      fontSize: 16,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.text,
      textAlign: 'left',
      position: 'absolute',
      bottom: 30,
      marginTop: 50,
    },
    loadingTextSmallTop: {
      fontSize: 16,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.text,
      textAlign: 'left',
      position: 'absolute',
      bottom: 60,
      marginTop: 50,
      marginBottom: 30,
    },
    addAccountModalWrapper: {
      backgroundColor: colors.bg,
      width: '90%',
      height: 350,
      marginLeft: '5%',
      marginBottom: 100,
      marginTop: 20,
      // elevation: 5,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    addAccountModalActionsWrapper: {
      paddingHorizontal: 10,
      width: '100%',
      // justifyContent: 'space-evenly',
      flexDirection: 'column',
      alignItems: 'center',
    },
    addAccountModalDirections: {
      textAlign: 'right',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      // marginBottom: 20
    },
    addAccountActionButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
      paddingHorizontal: 10,
      marginBottom: 10,
      marginTop: 10,
    },
    addAccountOkButton: {
      width: '55%',
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 25,
      marginBottom: 10,
    },
    addAccountOkButtonText: {
      textAlign: 'center',
      fontSize: 20,
      color: colors.bg,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginRight: 20,
      marginTop: 4,
    },
    accountNameInput: {
      height: 40,
      width: '100%',
      paddingHorizontal: 10,
      margin: 10,
      backgroundColor: colors.text_light,
      borderColor: colors.primary,
      padding: 10,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.text,
      borderRadius: 10,
      paddingTop: 14,
    },
    addAccountModalDirections: {
      width: '100%',
      textAlign: 'left',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginBottom: 5,
      marginTop: 20,
    },
    pwDirections: {
      width: '100%',
      textAlign: 'left',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginBottom: 5,
      marginTop: 20,
      marginLeft: 20,
    },
    buttonWrapper: {
      flexDirection: 'row',
    },
    slideButtonContainer: {
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 10,
      // paddingBottom: 10,
      flexDirection: 'row',
      position: 'absolute',
      bottom: 10,
    },
    buttonConnect: {
      width: '48%',
      marginRight: '4%',
      height: 80,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.text_light,
      borderRadius: 20,
      marginBottom: 10,
    },
    buttonCreate: {
      width: '100%',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.secondary,
      borderRadius: 10,
      paddingVertical: 18,
      paddingHorizontal: 10,
      marginBottom: 10,
    },
    buttonConnectText: {
      fontSize: 20,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
    },
    buttonCreateText: {
      fontSize: 20,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
    },
    buttonWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    continueIcon: {
      marginLeft: 10,
    },
    errorMessageText: {
      backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily: 'NexaBold',
      fontWeight: 'bold',
      borderRadius: 20,
      padding: 10,
      marginBottom: 10,
      marginTop: 10,
      width: '95%',
    },
    accountNameInputPw: {
      height: 40,
      width: '80%',
      paddingHorizontal: 10,
      margin: 10,
      backgroundColor: colors.text_light,
      borderColor: colors.primary,
      padding: 10,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.text,
      borderRadius: 10,
      paddingTop: 14,
    },
    eyeButton: {
      backgroundColor: colors.text_light,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
    },
    pw: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    eyeIcon: {
      paddingHorizontal: 5,
    },
  });

export default ReviewPaymentScreen;
