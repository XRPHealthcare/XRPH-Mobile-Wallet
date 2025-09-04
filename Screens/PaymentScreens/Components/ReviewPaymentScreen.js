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
  Pressable,
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
import LottieView from 'lottie-react-native';
import firestore from '@react-native-firebase/firestore';
import {trigger} from 'react-native-haptic-feedback';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import PendingTouch from '../../../assets/img/pending-touch.svg';
import {useVerifyPassword} from '../../../utils/auth.api';
import {useGetPrices} from '../../../utils/wallet.api';
import {
  ArrowSqrLeftBlackIcon,
  ArrowSqrLeftWhiteIcon,
} from '../../../assets/img/new-design';
import {getTotalBalances} from '../../../utils/functions/balance';

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

  const styles = styling(colors, theme);

  return (
    <View style={styles.loadingAnimationWrapper}>
      <Text style={styles.loadingText}>Sending...</Text>
      <LottieView
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
  const getExchangePrices = useGetPrices();
  let {
    sendTransactionDetails,
    accounts,
    activeAccount,
    theme,
    token,
    node,
    rpcUrls,
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
  const setNode = useStore(state => state.setNode);

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

  const styles = styling(colors, theme);

  const sendTransaction = async success => {
    setLoading(true);
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
      const response = await send_token(
        preparedPayment,
        node,
        rpcUrls,
        setNode,
      );
      console.log('----------response-------------------', response);

      if (response.error === undefined) {
        setLoading(false);
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

        const exchangeRates = await getExchangePrices.mutateAsync();
        const adjustedAccounts = await getTotalBalances(
          updatedAccounts,
          exchangeRates,
        );

        setAccounts(adjustedAccounts);
        AsyncStorage.setItem('accounts', JSON.stringify(adjustedAccounts)).then(
          () => {
            console.log('accounts set asynchronously');
          },
        );

        for (let i = 0; i < adjustedAccounts.length; i++) {
          if (
            adjustedAccounts[i].classicAddress === activeAccount.classicAddress
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
        setLoading(false);
      }
      //const { from, fromBalances } = await send_token(preparedPayment);
    } else {
      setLoading(false);
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
      <SafeAreaView style={{backgroundColor: colors.bg_gray}}>
        <StatusBar />
        {!loadingModalVisible && !pwModalOpen ? (
          <View style={styles.bg}>
            <View style={styles.header}>
              <Pressable
                onPress={() =>
                  navigation.navigate('Home Screen', {
                    sendOpen: true,
                    sendStep: 2,
                    currToken: token,
                    currAmount: sendTransactionDetails.amount,
                  })
                }>
                {theme === 'dark' ? (
                  <ArrowSqrLeftWhiteIcon />
                ) : (
                  <ArrowSqrLeftBlackIcon />
                )}
              </Pressable>
              <Text style={styles.headerHeading}>Review Payment</Text>
              <Text style={{width: 20}}></Text>
            </View>
            <Image
              source={require('../../../assets/img/new-design/bg-gradient.png')}
              style={styles.greenShadow}
            />
            <View
              style={{
                width: '100%',
                paddingHorizontal: 20,
                marginTop: 8,
              }}>
              <View style={styles.transactionCard}>
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text style={styles.accountName}>{activeAccount?.name} </Text>
                  <Text style={styles.accountAddress}>
                    {activeAccount?.classicAddress}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 24,
                  }}>
                  <Text style={styles.amount}>
                    {sendTransactionDetails.amount}{' '}
                  </Text>
                  <Text style={styles.amountCurrency}>
                    {sendTransactionDetails.currency}
                  </Text>
                </View>

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

                <View style={[styles.horizontalLine, {marginTop: 32}]}></View>
                <Text style={[styles.label, {marginTop: 16}]}>From</Text>
                <Text style={styles.text}>{sendTransactionDetails.from}</Text>
                <Text style={[styles.label, {marginTop: 12}]}>To</Text>
                <Text style={styles.text}>{sendTransactionDetails.to}</Text>
                <Text style={[styles.label, {marginTop: 12}]}>
                  Transaction Fee
                </Text>
                <Text style={styles.text}>
                  {sendTransactionDetails.transactionFee}
                </Text>
                <View
                  style={[styles.horizontalLine, {marginVertical: 16}]}></View>
                <Text style={[styles.label]}>Memo</Text>
                <Text style={styles.text}>{sendTransactionDetails.memo}</Text>
                <Text style={[styles.label, {marginTop: 12}]}>
                  Destination Tag
                </Text>
                <Text style={styles.text}>
                  {sendTransactionDetails.destinationTag}
                </Text>
              </View>
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
                  <Text style={styles.buttonCreateText}>Confirm Transfer</Text>
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
                <View
                  style={[
                    styles.addAccountModalWrapper,
                    {
                      paddingTop: Platform.OS === 'ios' ? 25 : 0,
                    },
                  ]}>
                  <View style={styles.header}>
                    <Pressable onPress={() => setPwModalOpen(false)}>
                      {theme === 'dark' ? (
                        <ArrowSqrLeftWhiteIcon />
                      ) : (
                        <ArrowSqrLeftBlackIcon />
                      )}
                    </Pressable>
                    <Text style={styles.headerHeading}>Sign Transaction</Text>
                    <Text style={{width: 20}}></Text>
                  </View>
                  <Image
                    source={require('../../../assets/img/new-design/bg-gradient.png')}
                    style={styles.greenShadow}
                  />
                  <View style={styles.addAccountModalActionsWrapper}>
                    <View
                      style={{
                        width: '100%',
                      }}>
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
                              size={24}
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
                        <View
                          style={{
                            marginTop: 48,
                            marginLeft: 'auto',
                            marginRight: 'auto',
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 10,
                            }}>
                            <View
                              style={{
                                height: 1,
                                width: '45%',
                                backgroundColor: colors.text_gray,
                              }}
                            />
                            <Text
                              style={[
                                styles.attemptsLeft,
                                {fontSize: 14, textAlign: 'center'},
                              ]}>
                              OR
                            </Text>
                            <View
                              style={{
                                height: 1,
                                width: '45%',
                                backgroundColor: colors.text_gray,
                              }}
                            />
                          </View>
                          <TouchableOpacity
                            style={{
                              marginTop: 48,
                              marginLeft: 'auto',
                              marginRight: 'auto',
                            }}
                            onPress={checkIsBiometricEnabled}>
                            <PendingTouch height={75} width={75} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    <View style={styles.addAccountActionButtons}>
                      <TouchableOpacity
                        style={styles.addAccountOkButton}
                        onPress={() => {
                          if (!loading) {
                            sendTransaction();
                          }
                        }}
                        disabled={loading}>
                        <View style={styles.buttonWrapper}>
                          <Text style={styles.addAccountOkButtonText}>
                            Continue
                          </Text>
                          <Feather
                            name={'arrow-right'}
                            size={24}
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

const styling = (colors, theme) =>
  StyleSheet.create({
    bg: {
      backgroundColor: colors.bg_gray,
      alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 30,
      backgroundColor:
        theme === 'dark'
          ? 'rgba(26, 26, 26, 0.77)'
          : 'rgba(255, 255, 255, 0.77)',
      borderBottomEndRadius: 32,
      borderBottomStartRadius: 32,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    headerHeading: {
      fontSize: 18,
      fontWeight: '700',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      color: colors.text,
    },
    greenShadow: {
      position: 'absolute',
      top: 0,
      zIndex: -1,
      marginTop: -250,
    },
    attemptsLeft: {
      fontSize: 12,
      color: colors.text_gray,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanLight',
      textAlign: 'start',
    },
    inputLabelCharacter: {
      fontFamily: 'Helvetica',
    },
    sendModalHeaderSpacer: {
      width: 60,
    },
    headerText: {
      fontSize: 22,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
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
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginLeft: 5,
      marginTop: 5,
    },
    transactionCard: {
      backgroundColor: colors.bg_otp_input,
      borderWidth: 1,
      borderColor: colors.border_gray,
      width: '100%',
      // elevation: 5,
      borderRadius: 20,
      justifyContent: 'space-between',
      flexDirection: 'column',
      paddingVertical: 24,
      paddingHorizontal: 14,
    },
    accountName: {
      fontSize: 22,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '700' : '700',
    },
    accountAddress: {
      fontSize: 12,
      color: colors.text_gray,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '700' : '700',
    },
    amount: {
      fontSize: 36,
      color: '#03F982',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '700' : '700',
    },
    amountCurrency: {
      fontSize: 20,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '700' : '700',
    },
    conversion: {
      marginTop: 4,
      fontSize: 14,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginBottom: 2,
    },
    horizontalLine: {
      width: '100%',
      height: 2,
      backgroundColor: theme === 'dark' ? '#414141' : '#f8f8f8',
    },
    label: {
      fontSize: 12,
      color: colors.text_gray,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    text: {
      fontSize: 12,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginTop: 4,
    },
    loadingAnimationWrapper: {
      backgroundColor: colors.bg_gray,
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
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'right',
      paddingRight: 10,
      paddingTop: 5,
    },
    loadingText: {
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 30,
    },
    loadingTextSmall: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'left',
      position: 'absolute',
      bottom: 30,
      marginTop: 50,
    },
    loadingTextSmallTop: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'center',
      position: 'absolute',
      bottom: 60,
      marginTop: 60,
      marginBottom: 20,
    },
    addAccountModalWrapper: {
      backgroundColor: colors.bg_gray,
      width: '100%',
      height: '100%',
      // elevation: 5,
      borderRadius: 10,
      alignItems: 'center',
    },
    addAccountModalActionsWrapper: {
      paddingHorizontal: 20,
      width: '100%',
      justifyContent: 'space-between',
      flexDirection: 'column',
      alignItems: 'center',
      flex: 1,
    },
    addAccountModalDirections: {
      textAlign: 'right',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      // marginBottom: 20
    },
    addAccountActionButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
      marginBottom: 10,
      marginTop: 10,
    },
    addAccountOkButton: {
      width: '100%',
      height: 44,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 8,
      marginBottom: 10,
    },
    addAccountOkButtonText: {
      textAlign: 'center',
      fontSize: 16,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    accountNameInput: {
      height: 40,
      width: '100%',
      paddingHorizontal: 10,
      margin: 10,
      backgroundColor: colors.text_light,
      borderColor: colors.primary,
      padding: 10,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      borderRadius: 10,
      paddingTop: 14,
    },
    addAccountModalDirections: {
      width: '100%',
      textAlign: 'left',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginBottom: 5,
      marginTop: 20,
    },
    pwDirections: {
      width: '100%',
      textAlign: 'left',
      fontSize: 14,
      color: colors.text_gray,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginTop: 24,
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
      backgroundColor: colors.primary,
      borderRadius: 8,
      marginBottom: 10,
      height: 44,
    },
    buttonConnectText: {
      fontSize: 20,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    buttonCreateText: {
      fontSize: 16,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    buttonWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    continueIcon: {
      marginLeft: 10,
      marginTop: 4,
    },
    errorMessageText: {
      backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily: 'LeagueSpartanMedium',
      fontWeight: 'bold',
      borderRadius: 20,
      padding: 10,
      marginBottom: 10,
      marginTop: 10,
      width: '95%',
    },
    accountNameInputPw: {
      height: 54,
      width: '100%',
      paddingLeft: 14,
      paddingRight: 34,
      paddingVertical: 15,
      backgroundColor: colors.bg_otp_input,
      borderColor: colors.border_gray,
      borderWidth: 1,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      borderRadius: 10,
    },
    eyeButton: {
      position: 'absolute',
      right: 0,
      marginRight: 14,
    },
    pw: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative',
      marginTop: 16,
    },
    eyeIcon: {
      paddingHorizontal: 5,
    },
    addAccountAnimation: {
      height: '100%',
      width: '100%',
    },
  });

export default ReviewPaymentScreen;
