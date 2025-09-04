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
import _ from 'lodash';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import {light, dark} from '../../../assets/colors/padlockColors';
import useStore from '../../../data/store';
import PadlockInputRow from './PadlockInputRow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import getWalletFromEntropy from '../Handlers/get_wallet_from_entropy';
import getAccountBalances from '../../HomeScreen/Handlers/get_account_balances';
import {trigger} from 'react-native-haptic-feedback';
import {useGetWallet, useLogin} from '../../../utils/auth.api';
import AddAccountAnimation from '../../LoadingScreens/Components/AddAccountAnimation';
import {useGetPrices} from '../../../utils/wallet.api';
import {getTotalBalances} from '../../../utils/functions/balance';

// import getTotalBalances from '../../Pin/Handlers/get_total_balances';

AntDesign.loadFont();
Feather.loadFont();

const InputPadlockScreen = ({navigation}) => {
  const useLoginUser = useLogin();
  const checkWalletExist = useGetWallet();
  const getExchangePrices = useGetPrices();
  const {theme, accounts, hepticOptions, node, rpcUrls} = useStore();
  const setAccounts = useStore(state => state.setAccounts);
  const setActiveAccount = useStore(state => state.setActiveAccount);
  const setLoginWalletAddress = useStore(state => state.setLoginWalletAddress);
  const setAccountBalances = useStore(state => state.setAccountBalances);
  const setActiveConnections = useStore(state => state.setActiveConnections);
  const setNode = useStore(state => state.setNode);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const [padlockInput, setPadlockInput] = React.useState({
    A: ['_', '_', '_', '_', '_', '_'],
    B: ['_', '_', '_', '_', '_', '_'],
    C: ['_', '_', '_', '_', '_', '_'],
    D: ['_', '_', '_', '_', '_', '_'],
    E: ['_', '_', '_', '_', '_', '_'],
    F: ['_', '_', '_', '_', '_', '_'],
    G: ['_', '_', '_', '_', '_', '_'],
    H: ['_', '_', '_', '_', '_', '_'],
  });

// account one
  // const [padlockInput, setPadlockInput] = React.useState({
  //   A: ['8', '2', '2', '0', '7', '8'],
  //   B: ['7', '0', '7', '7', '6', '9'],
  //   C: ['6', '9', '9', '2', '3', '6'],
  //   D: ['2', '4', '1', '0', '3', '6'],
  //   E: ['1', '5', '8', '5', '3', '0'],
  //   F: ['6', '8', '8', '9', '3', '2'],
  //   G: ['2', '0', '0', '8', '7', '0'],
  //   H: ['3', '2', '9', '8', '8', '5'],
  // });

  //account two
  //   const [padlockInput, setPadlockInput] = React.useState({
  //   A: ['2', '2', '0', '9', '5', '6'],
  //   B: ['1', '6', '5', '3', '6', '1'],
  //   C: ['6', '2', '5', '1', '0', '9'],
  //   D: ['5', '2', '7', '6', '9', '4'],
  //   E: ['1', '8', '8', '1', '3', '9'],
  //   F: ['8', '8', '4', '7', '5', '6'],
  //   G: ['7', '2', '7', '9', '0', '9'],
  //   H: ['6', '2', '6', '3', '1', '5'],
  // });

  const [connectAccountModalOpen, setConnectAccountModalOpen] =
    React.useState(false);
  const [walletRetrieved, setWalletRetrieved] = React.useState('');
  const [accountPassword, setAccountPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [enterPwVisibility, setEnterPwVisibility] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  

  const updatePadlock = (padlockKey, padlockIndex, padlockValue) => {
    console.log(padlockInput);
    const prevState = padlockInput;
    let newValueArray = padlockInput[padlockKey];
    newValueArray[padlockIndex] = padlockValue;
    setPadlockInput({...prevState, [padlockKey]: newValueArray});
    console.log(padlockKey, padlockIndex, padlockValue);
    console.log(padlockInput);
  };

  const checkPadlock = async () => {
    if (checkWalletExist?.isPending) {
      return;
    }
    // turn padlock into entropy
    // use entropy to get a wallet
    // if wallet address = classicAddress
    // then user continues
    const entropyString =
      padlockInput['A'].join('') +
      ' ' +
      padlockInput['B'].join('') +
      ' ' +
      padlockInput['C'].join('') +
      ' ' +
      padlockInput['D'].join('') +
      ' ' +
      padlockInput['E'].join('') +
      ' ' +
      padlockInput['F'].join('') +
      ' ' +
      padlockInput['G'].join('') +
      ' ' +
      padlockInput['H'].join('');
    console.log(entropyString);
    if (entropyString?.includes('_')) {
      setError('Please complete the passcode combination!');
      setTimeout(() => {
        setError('');
      }, 5000);
      return;
    }
    const wallet = getWalletFromEntropy(entropyString);
    setWalletRetrieved(wallet);
    console.log(wallet);
    // continue to passcode enter
    setConnectAccountModalOpen(true);
  };

  // const getAccountBalance = async () => {
  //     const adjustedAccounts = await getTotalBalances(accounts);
  //     return adjustedAccounts;
  // }

  const loginUser = async () => {
    if (useLoginUser?.isPending || checkWalletExist?.isPending) {
      return;
    }
    if (!walletRetrieved) {
      setError('Please enter your passcode combination!');
      setTimeout(() => {
        setError('');
      }, 5000);
      return;
    }
    await checkWalletExist
      .mutateAsync(walletRetrieved?.classicAddress)
      .then(async res => {
        console.log('----------------user Exist response------------', res);
        const checkAlreadyLogged = accounts?.find(
          account => account?.classicAddress === res?.user?.wallet_address,
        );
        if (checkAlreadyLogged) {
          setError('Account already logged in!');
          setTimeout(() => {
            setError('');
          }, 5000);
        } else {
          setError('');
          const fbAccount = {...res?.user, ...walletRetrieved};
          await useLoginUser
            .mutateAsync({
              wallet_address: fbAccount?.wallet_address,
              password: accountPassword,
            })
            .then(async response => {
              setLoading(true);
              let updatedNewAccount = {
                ...fbAccount,
                password: accountPassword,
              };
              console.log('updatedNewAccount 1', updatedNewAccount);
              await AsyncStorage.removeItem('swap_sessions');
              setActiveConnections([]);
              setActiveAccount(updatedNewAccount);
              AsyncStorage.setItem(
                'activeAccount',
                JSON.stringify(updatedNewAccount),
              ).then(() => {
                console.log('active account set asynchronously');
              });
              const balances = await getAccountBalances(
                updatedNewAccount,
                node,
                rpcUrls,
                setNode,
              );
              setAccountBalances(balances);
              console.log('balances 1', balances);
              updatedNewAccount = {
                ...updatedNewAccount,
                balances,
                password: accountPassword,
                prescription_card: {
                  id: fbAccount?.card_id,
                  bin: '610280',
                  group: 'XRPH',
                },
              };

              let updatedAccounts = accounts;
              updatedAccounts.push(updatedNewAccount);
              console.log('updatedAccounts 1', updatedAccounts);
              // new
              const exchangeRates = await getExchangePrices.mutateAsync();
              const adjustedAccounts = await getTotalBalances(
                updatedAccounts,
                exchangeRates,
              );

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
                  updatedNewAccount.classicAddress
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

              // setAccounts(updatedAccounts);
              // AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts)).then(() => {
              //     console.log('accounts set asynchronously');
              // })

              // setActiveAccount(updatedNewAccount);
              // AsyncStorage.setItem('activeAccount', JSON.stringify(updatedNewAccount)).then(() => {
              //     console.log('active account set asynchronously');
              // })

              // reset state
              setLoginWalletAddress('');
              console.log('logged in');
              setLoading(false);
              console.log('updatedAccounts', updatedAccounts);
              console.log(
                'updatedAccounts.length',
                updatedAccounts.length,
                adjustedAccounts.length,
              );
              const pin = await AsyncStorage.getItem('pin');

              if (!pin) {
                navigation.navigate('Set Pin Screen');
              } else {
                navigation.navigate('Home Screen');
              }
              setConnectAccountModalOpen(false);
            })
            .catch(err => {
              setError(err.message || 'Incorrect password.');
            });
        }
      })
      .catch(err => {
        trigger('impactHeavy', hepticOptions);
        setError(
          `${err.message}` || `Your account does not exist, please try again!`,
        );
        setTimeout(() => {
          setError('');
        }, 5000);
      });
  };

  const backFromPw = () => {
    setConnectAccountModalOpen(false);
    setError('');
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />
        {!loading && !connectAccountModalOpen && (
          <View style={styles.bg}>
            <View style={[styles.column, {gap: 10}]}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Start Screen')}>
                <Feather
                  name={'chevron-left'}
                  size={35}
                  color={colors.text}
                  style={styles.backIcon}
                />
              </TouchableOpacity>
              <Image
                style={styles.headerImage}
                source={
                  theme === 'light'
                    ? require('../../../assets/img/header_logo.png')
                    : require('../../../assets/img/header_logo_dark.png')
                }
              />
              <View style={styles.directionsContainer}>
                <Text style={styles.directionText}>
                  Enter your passcode combination that you wrote down when your
                  account was created.
                </Text>
                {error.length > 0 && (
                  <Text style={styles.errorMessageText}>Error: {error}</Text>
                )}
              </View>
            </View>
            <View style={[styles.column, {gap: 10, alignItems: 'center'}]}>
              <ScrollView
                automaticallyAdjustKeyboardInsets={true}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}>
                <View style={styles.padlock}>
                  <PadlockInputRow letter={'A'} updatePadlock={updatePadlock} />
                  <PadlockInputRow letter={'B'} updatePadlock={updatePadlock} />
                  <PadlockInputRow letter={'C'} updatePadlock={updatePadlock} />
                  <PadlockInputRow letter={'D'} updatePadlock={updatePadlock} />
                  <PadlockInputRow letter={'E'} updatePadlock={updatePadlock} />
                  <PadlockInputRow letter={'F'} updatePadlock={updatePadlock} />
                  <PadlockInputRow letter={'G'} updatePadlock={updatePadlock} />
                  <PadlockInputRow letter={'H'} updatePadlock={updatePadlock} />
                  <View style={styles.padlockBottom} />
                </View>
              </ScrollView>
            </View>
            <View style={styles.slideButtonContainer}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.secondary,
                  width: '100%',
                  alignItems: 'center',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  borderRadius: 10,
                  paddingVertical: 18,
                  paddingHorizontal: 10,
                }}
                onPress={checkPadlock}>
                <View style={styles.buttonWrapper}>
                  <Text style={styles.buttonCreateText}>
                    {checkWalletExist?.isPending ? 'Processing...' : 'Continue'}
                  </Text>
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
        )}

        {connectAccountModalOpen && !loading && (
          <View style={styles.modalBg}>
            <Modal visible={connectAccountModalOpen} transparent={true}>
              <View style={styles.addAccountModalWrapper}>
                <View style={[styles.row, {marginTop: 10}]}>
                  <TouchableOpacity onPress={() => backFromPw()}>
                    <Feather
                      name={'chevron-left'}
                      size={35}
                      color={colors.text}
                      style={styles.backIcon}
                    />
                  </TouchableOpacity>
                  <View style={styles.sendModalHeader}>
                    <Text style={styles.sendModalHeaderText}>
                      Login To Your Account
                    </Text>
                  </View>
                  <View></View>
                </View>
                <View style={styles.addAccountModalActionsWrapper}>
                  <Text key={'Text'} style={styles.addAccountModalDirections}>
                    Wallet Address
                  </Text>
                  <TextInput
                    style={[styles.accountNameInputPw, {width: '100%'}]}
                    // onChangeText={setAccountPassword}
                    value={walletRetrieved?.classicAddress}
                    placeholder="Wallet Address"
                    placeholderTextColor={colors.text_dark}
                    key={'Input'}
                  />
                  <Text key={'Text'} style={styles.addAccountModalDirections}>
                    Please enter your password.
                  </Text>
                  <View style={styles.pw} key="view">
                    <TextInput
                      style={styles.accountNameInputPw}
                      onChangeText={setAccountPassword}
                      value={accountPassword}
                      placeholder="Password"
                      placeholderTextColor={colors.text_dark}
                      key={'Input'}
                      secureTextEntry={!enterPwVisibility}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setEnterPwVisibility(!enterPwVisibility)}>
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

                  {error.length > 0 && (
                    <Text style={styles.errorMessagePw}>Error: {error}</Text>
                  )}
                  <View style={styles.addAccountActionButtons}>
                    <TouchableOpacity
                      style={styles.addAccountOkButton}
                      onPress={loginUser}>
                      <View style={styles.buttonWrapper}>
                        <Text style={styles.addAccountOkButtonText}>
                          {useLoginUser?.isPending ||
                          checkWalletExist?.isPending
                            ? 'Processing...'
                            : 'Continue'}
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
          </View>
        )}

        {loading && (
          <View style={styles.bgMiddle}>
            <AddAccountAnimation />
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
      paddingHorizontal: 10,
      paddingVertical: 10,
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      gap: 10,
    },
    modalBg: {
      backgroundColor: colors.bg,
      paddingHorizontal: 10,
      paddingVertical: 10,
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
    },
    bgMiddle: {
      backgroundColor: colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      height: '100%',
      paddingHorizontal: 10,
    },
    loadingText: {
      fontSize: 18,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginTop: 100,
    },
    headerImage: {
      width: 350,
      height: 65,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    directionsContainer: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'column',
      gap: 10,
    },
    welcomeText: {
      fontSize: 42,
      color: colors.text,
      marginBottom: -10,
    },
    directionText: {
      fontSize: 18,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanLight',
      marginTop: 5,
    },
    note: {
      fontWeight: 'bold',
    },
    padlockBottom: {
      height: 6,
    },
    padlock: {
      backgroundColor: colors.text_light,
      borderRadius: 10,
      width: '97%',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    slideButtonContainer: {
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 13,
      flexDirection: 'row',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    addAccountModalWrapper: {
      backgroundColor: colors.bg,
      width: '100%',
      paddingHorizontal: 30,
      height: 330,
      marginBottom: 100,
      marginTop: 40,
      // elevation: 5,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    addAccountModalActionsWrapper: {
      width: '100%',
      // justifyContent: 'space-evenly',
      flexDirection: 'column',
      alignItems: 'center',
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
      marginBottom: 10,
      marginTop: 10,
      marginLeft: 10,
    },
    addAccountOkButton: {
      width: 200,
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      borderRadius: 20,
      marginBottom: 10,
      backgroundColor: colors.primary,
    },
    addAccountBackButton: {
      width: 110,
      height: 50,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: colors.text_dark,
      borderRadius: 20,
      marginBottom: 10,
      marginRight: 10,
    },
    addAccountOkButtonText: {
      textAlign: 'center',
      fontSize: 20,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginRight: 20,
      marginTop: Platform.OS === 'ios' ? 5 : 0,
    },
    addAccountOkButtonTextNorm: {
      textAlign: 'center',
      fontSize: 20,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginLeft: 10,
      marginRight: 20,
      marginTop: Platform.OS === 'ios' ? 5 : 0,
    },
    sendModalHeader: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    sendModalHeaderSpacer: {
      width: 10,
    },
    sendModalHeaderText: {
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'center',
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
    buttonWrapper: {
      flexDirection: 'row',
    },
    gradientContinue: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 60,
      borderRadius: 10,
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
    buttonCreate: {},
    buttonConnectText: {
      fontSize: 20,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    buttonCreateText: {
      fontSize: 20,
      color: colors.text,
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
    },
    errorMessage: {
      marginBottom: 80,
      padding: 10,
      backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      borderRadius: 20,
    },
    errorMessagePw: {
      marginBottom: 10,
      padding: 10,
      backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      borderRadius: 20,
    },
    errorMessageText: {
      backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      borderRadius: 20,
      padding: 10,
      marginBottom: 10,
      width: '95%',
    },
    accountNameInputPw: {
      height: 40,
      width: '88%',
      paddingHorizontal: 10,
      marginRight: 10,
      marginTop: 10,
      marginBottom: 10,
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

export default InputPadlockScreen;
