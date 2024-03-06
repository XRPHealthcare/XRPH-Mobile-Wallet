import React from 'react';

import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Platform,
  AppState,
  ActivityIndicator,
  Text,
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
import Navbar from '../../../components/Navbar';
import AccountHeader from './AccountHeader';
import AddAccountModal from './AddAccountModal';
import AccountActions from './AccountActions';
import TokenContainer from './TokenContainer';
import SendModal from './SendModal';
import ReceiveModal from './ReceiveModal';
import TxModal from './TxModal';
// import getExchangeRates from '../Handlers/get_exchange_rates';
import firestore from '@react-native-firebase/firestore';
import getAccountBalances from '../Handlers/get_account_balances';
// import getTotalBalances from '../../Pin/Handlers/get_total_balances';
import checkConnectionStatus from '../../StartScreen/Handlers/xrpl_connection_status';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {trigger} from 'react-native-haptic-feedback';
import Alert from '../../../components/Alert';
import {useIsFocused} from '@react-navigation/native';
import RNExitApp from 'react-native-exit-app';
import StakeInfo from '../../StakeScreen/Components/StakeInfo';

const xrpl = require('xrpl');

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const HomeScreen = ({route, navigation}) => {
  const isFocused = useIsFocused();
  let {
    activeAccount,
    destinationAddress,
    token,
    tokenRate,
    amount,
    memo,
    destinationTag,
    exchangeTo,
    exchangeRate,
    accounts,
    theme,
    node,
    hepticOptions,
    dynamicLink,
  } = useStore();
  const setNewPadlock = useStore(state => state.setNewPadlock);
  const setAccountBalances = useStore(state => state.setAccountBalances);
  const setSendTransactionDetails = useStore(
    state => state.setSendTransactionDetails,
  );
  const setDestinationAddress = useStore(state => state.setDestinationAddress);
  const setToken = useStore(state => state.setToken);
  const setAmount = useStore(state => state.setAmount);
  const setMemo = useStore(state => state.setMemo);
  const setDestinationTag = useStore(state => state.setDestinationTag);
  const setExchangeRate = useStore(state => state.setExchangeRate);
  const setTokenRate = useStore(state => state.setTokenRate);
  const setRateLoading = useStore(state => state.setRateLoading);
  const setAccounts = useStore(state => state.setAccounts);
  const setActiveAccount = useStore(state => state.setActiveAccount);
  const setDynamicLink = useStore(state => state.setDynamicLink);
  const [addAccountModalOpen, setAddAccountModalOpen] = React.useState(false);
  const [sendModalOpen, setSendModalOpen] = React.useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = React.useState(false);
  const [txModalOpen, setTxModalOpen] = React.useState(false);
  const [txUpdate, setTxUpdate] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [isAccountSwitchLoading, setIsAccountSwitchLoading] =
    React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  const [isErrorAlert, setIsErrorAlert] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState('');

  const [step, setStep] = React.useState(1);
  const appState = React.useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = React.useState(
    appState.current,
  );

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const getAppLaunchLink = async () => {
    try {
      console.log('----------dynamic link---------------', dynamicLink);
      if (!dynamicLink) {
        console.log('-----------no link found---------');
      } else {
        const params = dynamicLink?.split('?')?.[1];
        const paramsArray = params?.split('&');
        if (paramsArray?.length) {
          if (activeAccount.balances.length > 0) {
            setSendModalOpen(true);
            paramsArray?.forEach(param => {
              const [key, value] = param?.split('=');
              if (key === 'address') {
                setDestinationAddress(value || '');
              } else if (key === 'amount') {
                setAmountAndExRate(value || 0);
              } else if (key === 'token') {
                console.log('activeAccount?.balances', activeAccount?.balances);
                console.log('value', value);
                let activeToken = activeAccount?.balances?.find(
                  balance => balance?.currency == value,
                );
                console.log('activeToken', activeToken);
                if (activeToken) {
                  console.log('setTOken in home screen');
                  setToken(activeToken);
                  fetchExchangeRates(activeToken.currency, exchangeTo);
                }
              }
            });
            setDynamicLink('');
          } else {
            setDynamicLink('');
            setIsErrorAlert(true);
            setAlertMsg('Unable to send from unfunded account.');
          }
        }
      }
    } catch {
      //handle errors
    }
  };

  const refreshBalanceListener = () => {
    const addresses = accounts?.map(item => item?.classicAddress) || [];
    const client = new xrpl.Client(node);
    client.connect().then(async () => {
      await client.connection.request({
        command: 'subscribe',
        ledger_index: 'current',
        accounts: addresses,
      });
      client.connection.on('transaction', ev => {
        refreshBalances(false);
      });
      client.connection.on('disconnected', async () => {
        refreshBalanceListener();
      });

      client.connection.on('error', async () => {
        refreshBalanceListener();
      });
      return client.connection.request({
        command: 'subscribe',
        accounts: addresses,
      });
    });
  };

  React.useEffect(() => {
    AsyncStorage.getItem('activeAccount').then(res => {
      if (res) {
        setActiveAccount(JSON.parse(res));
      }
    });
    console.log('activeAccount', JSON.stringify(activeAccount));
    if (activeAccount?.balances?.length > 0 && !token) {
      setToken(activeAccount.balances[0]);
    }
    checkConnectionStatus(node)
      .then(res => {
        if (res) {
          setIsConnected(true);
          console.log('connected');
          refreshBalanceListener();
        } else {
          setIsConnected(false);
          console.log('not connected');
        }
      })
      .then(() => {
        refreshBalances(false);
      });

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        refreshBalances(false);
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, [node, isConnected]);

  React.useEffect(() => {
    getAppLaunchLink();
  }, [dynamicLink]);

  React.useEffect(() => {
    if (route.params !== undefined) {
      let {sendOpen, sendStep, currToken, currAmount} = route.params;
      // open = sendOpen;
      // step = sendStep;
      console.log('PARAMS', route.params);
      setSendModalOpen(sendOpen);
      setStep(sendStep);
      setToken(currToken);
      setAmount(currAmount);
    }
  }, [route.params]);

  // useEffect for getting account balances every 3 seconds
  // monitor balances. when it changes, show notification in home screen
  // and a little circle to the top right of the tx history icon

  const checkConnection = () => {
    checkConnectionStatus(node).then(res => {
      if (res) {
        setIsConnected(true);
        console.log('connected');
      } else {
        setIsConnected(false);
        console.log('not connected');
      }
    });
  };

  const getBalances = async account => {
    const balances = await getAccountBalances(account, node);
    setAccountBalances(balances);
    return balances;
  };

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

  const getAccountBalance = async () => {
    const adjustedAccounts = await getTotalBalances(accounts);
    return adjustedAccounts;
  };

  const refreshBalances = async args => {
    setLoading(true);
    const isConnectedLocal = await checkConnectionStatus(node);
    if (isConnectedLocal || args) {
      console.log('updating');

      const previousSavedAccount = await AsyncStorage.getItem(
        'activeAccount',
      ).then(res => JSON.parse(res || {}));

      console.log('previousSavedAccount', previousSavedAccount);

      getBalances(previousSavedAccount).then(balances => {
        console.log('updated balance', balances);
        let updatedAccounts = [];
        for (let account of accounts) {
          if (account.classicAddress === previousSavedAccount.classicAddress) {
            console.log(account.balances);
            console.log(previousSavedAccount.balances);
            if (_.isEqual(account.balances, balances)) {
              // no update
              console.log('nope');
              setTxUpdate(false);
            } else {
              // update
              trigger('impactMedium', hepticOptions);
              console.log('UPDATE');
              setTxModalOpen(true);
              setTxUpdate(true);
            }
            let accountCopy = account;
            accountCopy.balances = balances;
            updatedAccounts.push(accountCopy);
            setActiveAccount(accountCopy);
            AsyncStorage.setItem(
              'activeAccount',
              JSON.stringify(accountCopy),
            ).then(() => {
              console.log('active account set asynchronously');
            });
          } else {
            updatedAccounts.push(account);
          }
        }
        getTotalBalances(updatedAccounts).then(adjustedAccounts => {
          let adds = new Set();
          let accs = [];
          for (let i = 0; i < adjustedAccounts.length; i++) {
            if (!adds.has(adjustedAccounts[i].classicAddress)) {
              adds.add(adjustedAccounts[i].classicAddress);
              accs.push(adjustedAccounts[i]);
            }
          }
          console.log('adds', adds);
          setAccounts(accs);
          if (accs?.length) {
            AsyncStorage.setItem('accounts', JSON.stringify(accs)).then(() => {
              console.log('accounts set asynchronously');
            });
          } else {
            console.log('previous account will remain active');
          }

          for (let i = 0; i < adjustedAccounts.length; i++) {
            if (
              adjustedAccounts[i].classicAddress ===
              previousSavedAccount.classicAddress
            ) {
              setActiveAccount(adjustedAccounts[i]);
              AsyncStorage.setItem(
                'activeAccount',
                JSON.stringify(adjustedAccounts[i]),
              ).then(() => {
                console.log(
                  'active account set asynchronously&&&&&&&&&&&&&&&&',
                );
              });
            }
          }
        });
      });

      setLoading(false);
    } else {
      setLoading(false);
      // do something to show not connected, like modal
      console.log('not connected');
      setIsErrorAlert(true);
      setAlertMsg('Please check your internet connection.');
    }
  };

  const closeSendModal = () => {
    setSendModalOpen(false);
    setAmount('');
    setExchangeRate(0);
    setDestinationAddress('');
    setMemo('');
    setDestinationTag('');
  };

  const setRates = (newTokenRate, newAmount) => {
    if (amount !== '0') {
      // need to get data on current multipliers in the background
      const xrpToUSD = parseFloat(newTokenRate * newAmount);
      setExchangeRate(String(xrpToUSD));
    } else {
      setExchangeRate('0');
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
      // setXrphRate(newXrphRate);
      setRates(newTokenRate, amount);
      setRateLoading(false);
    } catch (e) {
      console.log(e.message);
    }
  };

  const setAmountAndExRate = amount => {
    try {
      setAmount(String(amount));
      setRates(tokenRate, amount);
    } catch (e) {}
  };

  const prepareNewAccountCreation = () => {
    setNewPadlock();
    setAddAccountModalOpen(false);
    navigation.navigate('Start Screen');
  };

  const reviewSendTransaction = () => {
    const transactionDetails = {
      from: activeAccount.classicAddress,
      to: destinationAddress,
      amount: amount,
      currency: token.currency,
      memo: memo,
      amountConversion: exchangeRate,
      exchangeIn: exchangeTo,
      transactionFee: '0.00008 XRPH',
      seed: activeAccount.seed,
      destinationTag: destinationTag,
    };
    setSendTransactionDetails(transactionDetails);
    setSendModalOpen(false);
    navigation.navigate('Review Payment Screen');
  };

  const closeTxModal = () => {
    setTxUpdate(false);
    setTxModalOpen(false);
  };

  const goToTxHistory = () => {
    closeTxModal();
    navigation.navigate('Transactions Screen');
  };

  const gestureEndListener = e => {
    // console.log('evenet-------------------', e);
    // console.log(
    //   '------this function was called 2-----------',
    //   accounts,
    //   isFocused,
    //   addAccountModalOpen,
    // );
    if (
      e?.data?.action?.type === 'GO_BACK' &&
      isFocused &&
      accounts?.length !== 0
    ) {
      RNExitApp.exitApp();
    }
  };
  React.useEffect(() => {
    const gestureHandler = navigation.addListener(
      'beforeRemove',
      gestureEndListener,
    );
    return gestureHandler;
  }, [isFocused, accounts]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     const onBackPress = () => {
  //       if (receiveModalOpen) {
  //         setReceiveModalOpen(false);
  //       } else {
  //         RNExitApp.exitApp();
  //       }
  //       return true;
  //     };

  //     BackHandler.addEventListener('hardwareBackPress', onBackPress);

  //     return () =>
  //       BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  //   }, [receiveModalOpen]),
  // );

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.g}}>
        <StatusBar />
        <View style={styles.bg}>
          <AccountHeader
            setAddAccountModalOpen={setAddAccountModalOpen}
            setIsAccountSwitchLoading={setIsAccountSwitchLoading}
          />
          <ScrollView
            automaticallyAdjustKeyboardInsets={true}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}>
            <View style={styles.homeWrapper}>
              <AccountActions
                fetchExchangeRates={fetchExchangeRates}
                setReceiveModalOpen={setReceiveModalOpen}
                setSendModalOpen={setSendModalOpen}
                loading={loading}
              />

              <TokenContainer loading={loading} />
              <StakeInfo />
            </View>
          </ScrollView>

          <Navbar
            activeIcon="home"
            txUpdate={txUpdate}
            navigation={navigation}
          />

          <SendModal
            sendModalOpen={sendModalOpen}
            setSendModalOpen={setSendModalOpen}
            closeSendModal={closeSendModal}
            destinationAddress={destinationAddress}
            setAmountAndExRate={setAmountAndExRate}
            fetchExchangeRates={fetchExchangeRates}
            reviewSendTransaction={reviewSendTransaction}
            step={step}
            setStep={setStep}
          />
          <ReceiveModal
            receiveModalOpen={receiveModalOpen}
            setReceiveModalOpen={setReceiveModalOpen}
            navigation={navigation}
          />
          <AddAccountModal
            addAccountModalOpen={addAccountModalOpen}
            setAddAccountModalOpen={setAddAccountModalOpen}
            prepareNewAccountCreation={prepareNewAccountCreation}
          />
          <TxModal
            txModalOpen={txModalOpen}
            closeTxModal={closeTxModal}
            goToTxHistory={goToTxHistory}
          />
          <Alert
            isOpen={isErrorAlert}
            type={'error'}
            message={alertMsg}
            icon={'close'}
            setIsOpen={setIsErrorAlert}
          />
        </View>
        {isAccountSwitchLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#AF45EE" />
            <Text style={{color: '#37C3A6', fontSize: 16}}>
              Switcing Account, Please hold....
            </Text>
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styling = colors =>
  StyleSheet.create({
    safeView: {
      backgroundColor: colors.bg,
    },
    loadingOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      opacity: 0.6,
      backgroundColor: 'black',
      justifyContent: 'center',
      alignItems: 'center',
    },
    bg: {
      backgroundColor: colors.bg,
      alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
    },
    homeWrapper: {
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: 20,
      flex: 1,
    },
    actionButtons: {
      width: '100%',
      marginTop: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    buttonWrapper: {
      flexDirection: 'row',
    },
    actionButtonText: {
      paddingBottom: 10,
      color: colors.text,
      fontSize: 16,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      paddingTop: 10,
      marginTop: 4,
    },
    visitIcon: {
      marginTop: 12,
      marginLeft: 25,
    },
    addAccountText: {
      fontSize: 18,
      color: colors.primary,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
    },
    visitMarketplace: {
      width: '100%',
      paddingHorizontal: 10,
    },
    visitMarketplaceButton: {
      width: '100%',
      alignItems: 'center',
      backgroundColor: colors.secondary,
      borderRadius: 20,
    },
    sendModalWrapper: {
      backgroundColor: colors.bg,
      width: '90%',
      height: '95%',
      marginLeft: '5%',
      marginTop: 15,
      elevation: 5,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sendModalHeader: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    sendModalHeaderSpacer: {
      width: 10,
    },
    sendModalHeaderText: {
      fontSize: 20,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.text,
      textAlign: 'center',
    },
    slideButtonContainer: {
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 10,
      paddingBottom: 10,
    },
    slideButtonThumbStyle: {
      borderRadius: 10,
      backgroundColor: colors.bg,
      width: 80,
      elevation: 0,
    },
    slideButtonContainerStyle: {
      backgroundColor: colors.text_light,
      borderRadius: 10,
      elevation: 0,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
    },
    slideButtonUnderlayStyle: {
      backgroundColor: colors.text_light,
    },
    slideButtonTitleStyle: {
      fontSize: 20,
      color: colors.bg,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginLeft: 50,
    },
  });

export default HomeScreen;
