import React, {useEffect} from 'react';

import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Platform,
  AppState,
  ActivityIndicator,
  Text,
  Pressable,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import _, {set} from 'lodash';
import {GestureHandlerRootView, ScrollView} from 'react-native-gesture-handler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import RNExitApp from 'react-native-exit-app';
import {useNetInfoInstance} from '@react-native-community/netinfo';
import {firebase} from '@react-native-firebase/firestore';
import useStore from '../../../data/store';
import MaintenanceAlert from '../../HomeScreen/Components/MaintenanceAlert';
import {
  useGetAddressBook,
  useGetPrices,
  useGetUserPortfolio,
} from '../../../utils/wallet.api';
import {dark, light} from '../../../assets/colors/colors';
import AccountActions from '../../HomeScreen/Components/AccountActions';
import TokenContainer from '../../HomeScreen/Components/TokenContainer';
import ReceiveModal from '../../HomeScreen/Components/ReceiveModal';
import TxModal from '../../HomeScreen/Components/TxModal';
import Alert from '../../../components/Alert';
import {socket} from '../../../utils/socket';
import {parseAccount} from '../../HomeScreen/Handlers/parse_account';
import getAccountBalances from '../../HomeScreen/Handlers/get_account_balances';
import TransactionsCard from '../../TransactionHistoryScreen/Components/TransactionsCard';
import {getTotalBalances} from '../../../utils/functions/balance';
import checkConnectionStatus from '../../StartScreen/Handlers/xrpl_connection_status';
import getTransactionHistory from '../../TransactionHistoryScreen/Handlers/get_transaction_history';
import LinearGradient from 'react-native-linear-gradient';
import Success from '../../../components/Success';

const xrpl = require('xrpl');
FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const WalletScreen = ({route, navigation}) => {
  const txHashRef = React.useRef(null);
  const [isFirstLaunch, setIsFirstLaunch] = React.useState(true);
  const setTxHistory = useStore(state => state.setTxHistory);
  const {
    netInfo: {isConnected: isInternetConnected},
    refresh,
  } = useNetInfoInstance();
  const isFocused = useIsFocused();
  const {
    data: addressBook,
    isLoading: addressBookLoading,
    refetch: refetchAddressBook,
  } = useGetAddressBook();

  const {data: stakingBalance, refetch} = useGetUserPortfolio();

  const getExchangePrices = useGetPrices();
  let {
    activeConnections,
    activeAccount,
    token,
    amount,
    accounts,
    stakingBalances,
    theme,
    node,
    rpcUrls,
    isAccountSwitchLoading,
  } = useStore();
  const setAccountBalances = useStore(state => state.setAccountBalances);
  const setToken = useStore(state => state.setToken);
  const setAmount = useStore(state => state.setAmount);
  const setExchangeRate = useStore(state => state.setExchangeRate);
  const setTokenRate = useStore(state => state.setTokenRate);
  const setRateLoading = useStore(state => state.setRateLoading);
  const setAccounts = useStore(state => state.setAccounts);
  const setActiveAccount = useStore(state => state.setActiveAccount);
  const setStakingBalances = useStore(state => state.setStakingBalances);
  const setNode = useStore(state => state.setNode);
  const setActiveConnections = useStore(state => state.setActiveConnections);
  const [sendModalOpen, setSendModalOpen] = React.useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = React.useState(false);
  const [txModalOpen, setTxModalOpen] = React.useState(false);
  const [txUpdate, setTxUpdate] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  const [isErrorAlert, setIsErrorAlert] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState('');
  const [connectionConfirmation, setConnectionConfirmation] =
    React.useState(false);
  const [isSwapRequest, setIsSwapRequest] = React.useState(false);
  const [copiedModalOpen, setCopiedModalOpen] = React.useState(false);

  const [step, setStep] = React.useState(1);
  const [swapRequest, setSwapRequest] = React.useState(null);
  const [channelHash, setChannelHash] = React.useState('');
  const appState = React.useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = React.useState(
    appState.current,
  );
  const [appStatus, setAppStatus] = React.useState(null);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const updateUserStakingBalance = async stakingBalance => {
    const alreadyExists = stakingBalances?.find(
      account => account.classicAddress === activeAccount.classicAddress,
    );
    if (!alreadyExists) {
      const newAccount = {
        classicAddress: activeAccount?.classicAddress,
        stakingBalance: stakingBalance,
      };
      setStakingBalances([...stakingBalances, newAccount]);
      await AsyncStorage.setItem(
        'stakingBalances',
        JSON.stringify([...stakingBalances, newAccount]),
      );
    } else {
      const updatedAccounts = stakingBalances?.map(account => {
        if (account?.classicAddress === activeAccount?.classicAddress) {
          return {
            ...account,
            stakingBalance: stakingBalance,
          };
        }
        return account;
      });
      setStakingBalances(updatedAccounts);
      await AsyncStorage.setItem(
        'stakingBalances',
        JSON.stringify(updatedAccounts),
      );
    }
  };

  const getBalances = async account => {
    const balances = await getAccountBalances(account, node, rpcUrls, setNode);
    setAccountBalances(balances);
    AsyncStorage.setItem('accountBalances', JSON.stringify(balances));
    return balances;
  };

  const refreshBalances = async (showLoading = true) => {
    console.warn('refreshBalances called from wallet');
    try {
      // Check connection first
      const isConnected = await checkConnectionStatus(node);
      if (!isConnected) {
        console.warn('No connection to XRPL node');
        setIsErrorAlert(true);
        setAlertMsg(
          'Unable to connect to network. Please check your connection.',
        );
        return;
      }

      if (showLoading) {
        setLoading(true);
      }

      // Load and validate accounts data
      const [localAccounts, localActiveAccount] = await Promise.all([
        AsyncStorage.getItem('accounts'),
        AsyncStorage.getItem('activeAccount'),
      ]);

      const accounts = parseAccount(localAccounts) || [];
      const activeAccount = parseAccount(localActiveAccount);

      if (!activeAccount?.classicAddress) {
        console.warn('No valid active account found');
        return;
      }

      // Get exchange rates and balances in parallel
      const [exchangeRates, balances] = await Promise.all([
        getExchangePrices.mutateAsync(),
        getBalances(activeAccount),
      ]);

      if (!exchangeRates || !balances) {
        throw new Error('Failed to fetch rates or balances');
      }

      // Validate balances
      if (balances.error) {
        console.error('Error fetching balances:', balances.error);
        throw new Error(balances.error);
      }

      // Update accounts with new balances
      const updatedAccounts = accounts.map(account => {
        if (account.classicAddress === activeAccount.classicAddress) {
          const balancesChanged = !_.isEqual(account.balances, balances);

          if (balancesChanged) {
            // Trigger updates only if balances actually changed
            setTxModalOpen(true);
            setTxUpdate(true);

            return {
              ...account,
              balances: balances,
            };
          }
          setTxUpdate(false);
        }
        return account;
      });

      // Calculate and validate total balances
      const adjustedAccounts = await getTotalBalances(
        updatedAccounts,
        exchangeRates,
      );

      if (!adjustedAccounts?.length) {
        console.warn('No accounts after balance calculation');
        return;
      }

      // Verify calculated balances
      const hasValidBalances = adjustedAccounts.some(account => {
        const totalBalances = account.totalBalances || {};
        return Object.values(totalBalances).some(
          balance => parseFloat(balance) > 0,
        );
      });

      if (!hasValidBalances) {
        console.warn(
          'All accounts showing zero balances - possible calculation error',
        );
        // Consider retrying or using cached values
      }

      // Update state and storage atomically
      const updates = [];

      // Filter and deduplicate accounts
      const uniqueAccounts = [
        ...new Set(adjustedAccounts.map(acc => acc.classicAddress)),
      ]
        .map(address =>
          adjustedAccounts.find(acc => acc.classicAddress === address),
        )
        .filter(Boolean);

      if (uniqueAccounts.length) {
        updates.push(
          AsyncStorage.setItem('accounts', JSON.stringify(uniqueAccounts)),
          setAccounts(uniqueAccounts),
        );
      }

      // Update active account
      const updatedActiveAccount = uniqueAccounts.find(
        acc => acc.classicAddress === activeAccount.classicAddress,
      );

      if (updatedActiveAccount) {
        updates.push(
          AsyncStorage.setItem(
            'activeAccount',
            JSON.stringify(updatedActiveAccount),
          ),
          setActiveAccount(updatedActiveAccount),
        );
      }

      await Promise.all(updates);
    } catch (error) {
      console.error('Error refreshing balances:', error);
      setIsErrorAlert(true);
      setAlertMsg(
        error.message || 'Error updating balances. Please try again.',
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
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

  const fetchTrxHistory = async () => {
    const history = await getTransactionHistory(activeAccount, node);
    console.log('history in wallet screen', history);
    setTxHistory(history);
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

  const closeTxModal = () => {
    setTxUpdate(false);
    setTxModalOpen(false);
  };

  const goToTxHistory = () => {
    closeTxModal();
    navigation.navigate('Transactions');
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
      (e?.data?.action?.type === 'GO_BACK' ||
        e?.data?.action?.type === 'POP') &&
      isFocused &&
      accounts?.length !== 0
    ) {
      RNExitApp.exitApp();
    }
  };

  const removeConnectedSwappedDevice = async token => {
    try {
      if (activeConnections) {
        const filteredDevices = activeConnections?.filter(
          device => device?.token != token,
        );
        await AsyncStorage?.setItem(
          'swap_sessions',
          JSON.stringify(filteredDevices),
        );
        setActiveConnections(filteredDevices);
      }
    } catch (e) {
      console.log('-------------err disconnect', e);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeAccount?.balances?.length > 0 && !token) {
      setToken(activeAccount.balances[0]);
    }

    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          refreshBalances(false);
        }

        appState.current = nextAppState;
        setAppStateVisible(appState.current);
      },
    );

    return () => {
      subscription.remove();
    };
  }, [node, isConnected]);

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

  useEffect(() => {
    if (channelHash) {
      setConnectionConfirmation(true);
    }
  }, [channelHash]);

  React.useEffect(() => {
    function onListen(value) {
      // console.log('---------value', value);
      setSwapRequest(value);
      setIsSwapRequest(true);
    }

    function onDisonnectListed(value) {
      // console.log('---------value', value);
      removeConnectedSwappedDevice(value?.token);
    }

    for (let idx in activeConnections) {
      if (activeConnections?.[idx]?.session_token) {
        socket.on(
          `swap-request-mobile-${activeConnections?.[idx]?.session_token}`,
          onListen,
        );
      }
      let channel_hash = activeConnections?.[idx]?.channel_data_hash;
      if (channel_hash) {
        socket.on(`disconnect-connection-${channel_hash}`, onDisonnectListed);
      }
    }

    return () => {
      for (let idx in activeConnections) {
        if (activeConnections?.[idx]?.session_token) {
          socket.off(
            `swap-request-mobile-${activeConnections?.[idx]?.session_token}`,
            onListen,
          );
        }
        let channel_hash = activeConnections?.[idx]?.channel_data_hash;
        if (channel_hash) {
          socket.off(`disconnect-connection-${channel_hash}`);
        }
      }
    };
  }, [activeConnections]);

  React.useEffect(() => {
    const gestureHandler = navigation.addListener(
      'beforeRemove',
      gestureEndListener,
    );
    return gestureHandler;
  }, [isFocused, accounts]);

  React.useEffect(() => {
    if (!isInternetConnected && !isFirstLaunch) {
      setIsErrorAlert(true);
      setAlertMsg('Please check your internet connection.');
    } else {
      refetchAddressBook();
      socket.connect();
      refreshBalances(false).catch(error => {
        console.error('Error refreshing balances on connection change:', error);
      });
    }
    setIsFirstLaunch(false);
  }, [isInternetConnected]);

  React.useEffect(() => {
    fetchTrxHistory();
    const unsubscribe = firebase
      .firestore()
      .collection('app_info')
      .onSnapshot(
        querySnapshot => {
          const items = [];
          querySnapshot.forEach(documentSnapshot => {
            items.push({
              ...documentSnapshot.data(),
              key: documentSnapshot.id,
            });
          });
          setAppStatus(items[0]);
        },
        error => {
          console.error('Error fetching data: ', error);
        },
      );

    socket.connect();

    return () => {
      unsubscribe();
      socket.disconnect();
    };
  }, []);

  React.useEffect(() => {
    if (stakingBalance) {
      updateUserStakingBalance(stakingBalance);
    }
  }, [stakingBalance]);

  React.useEffect(() => {
    const connectAndPing = async () => {
      const client = new xrpl.Client(node, {
        connectionTimeout: 60000,
      });

      await client.connect();

      const intervalId = setInterval(() => {
        console.log(
          'Sending ping from wallet screen...',
          client?.isConnected(),
        );
        // if (client?.isConnected()) {
        client
          .request({
            command: 'ping',
          })
          .then(() => {
            console.log('Ping sent and pong received.');
          })
          .catch(async error => {
            console.error('Ping failed from wallet:', error);
            // Optional: Reconnect or handle failure as needed
            clearInterval(intervalId);
            await client.disconnect();
            connectAndPing(); // Reconnect and ping again
          });
        // }
      }, 60000); // Ping every 60 seconds

      client.on('transaction', ev => {
        console.log(
          'transaction received from wallet..............................',
        );
        if (txHashRef.current !== ev.transaction.hash) {
          txHashRef.current = ev.transaction.hash;
          // console.log(JSON.stringify(ev, null, 2));
          refetch();
          refreshBalances(false);
        }
      });

      await client.request({
        command: 'subscribe',
        accounts: [activeAccount?.classicAddress],
      });

      return () => {
        clearInterval(intervalId);
        client.disconnect();
      };
    };

    connectAndPing();
  }, [activeAccount.classicAddress, isInternetConnected]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // const isConnected = await checkConnectionStatus(node);
        console.warn('called from active/inactive home');
        refreshBalances(false);
      }
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup any pending state updates
      setLoading(false);
      setIsErrorAlert(false);
    };
  }, []);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />
        <View style={styles.bg}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.homeWrapper}>
              {appStatus?.isMaintenance && (
                <MaintenanceAlert
                  msg={appStatus?.maintenanceMessage}
                  title={appStatus?.maintenanceTitle}
                />
              )}
              <AccountActions
                fetchExchangeRates={fetchExchangeRates}
                setReceiveModalOpen={() =>
                  navigation.navigate('ReceivePayment')
                }
                loading={loading}
                setErrorMsg={msg => setAlertMsg(msg)}
                setErrorAlert={setIsErrorAlert}
                navigation={navigation}
              />
              <LinearGradient
                colors={[colors.vividViolet, colors.royalPurple]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.alert}>
                <ImageBackground
                  resizeMode="contain"
                  source={require('../../../assets/img/savingcardbackground.png')}
                  tintColor={colors.white}
                  style={styles.backgroundImageStyle}>
                  <Text style={[styles.alertText, {marginTop: 5}]}>
                    The Savings Card has now moved to the XRPH AI App.
                  </Text>
                  <View style={styles.lineStyle} />
                  <Text style={styles.alertText}>
                    Crypto rewards have been discontinued to help preserve XRPH
                    token scarcity and value.
                  </Text>
                </ImageBackground>
              </LinearGradient>
              <View style={{paddingHorizontal: 20, width: '100%'}}>
                <TokenContainer loading={loading} />
              </View>
              <View
                style={{
                  paddingHorizontal: 20,
                  width: '100%',
                  marginTop: 24,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={[styles.heading]}>Transaction History</Text>
                  <Pressable
                    onPress={() => {
                      navigation?.navigate('Transactions');
                    }}>
                    <Text style={[styles.viewText]}>View All</Text>
                  </Pressable>
                </View>
                <View style={{marginTop: 16, flexDirection: 'column', gap: 8}}>
                  <TransactionsCard
                    setCopiedModalOpen={setCopiedModalOpen}
                    isWallet={true}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <ReceiveModal
            receiveModalOpen={receiveModalOpen}
            setReceiveModalOpen={setReceiveModalOpen}
            navigation={navigation}
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
            top={50}
          />
        </View>
        {copiedModalOpen && (
          <Success
            isOpen={copiedModalOpen}
            setIsOpen={setCopiedModalOpen}
            message={'Copied to Clipboard'}
            type={'success'}
          />
        )}
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
      backgroundColor: colors.bg_gray,
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
      backgroundColor: colors.bg_gray,
      height: '100%',
    },
    homeWrapper: {
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      flex: 1,
      paddingBottom: 20,
    },
    heading: {
      fontSize: 18,
      fontWeight: '700',
      fontFamily: 'LeagueSpartanBold',
      color: colors.text,
    },
    viewText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.text,
      fontFamily: 'LeagueSpartanMedium',
    },

    addAccountModalWrapper: {
      position: 'absolute',
      top: 20,
      backgroundColor: colors.secondary,
      width: '96%',
      marginLeft: '3%',
      height: 30,
      elevation: 10,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    copyModalHeader: {
      width: '100%',
      height: 30,
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    copyModalHeaderSpacer: {
      flexDirection: 'row',
    },
    sendModalHeaderText: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'left',
    },
    sendModalHeaderTextName: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'left',
      marginTop: 4,
    },
    checkIcon: {
      marginLeft: 10,
    },
    alert: {
      width: '93%',
      elevation: 10,
      borderRadius: 10,
      marginTop: 15,
      marginHorizontal: 13,
      borderWidth: 1.5,
      borderColor: colors.white,
    },
    backgroundImageStyle: {
      padding: 10,
      paddingHorizontal: 18,
    },
    alertText: {
      fontSize: 13,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.white,
      lineHeight: 20,
    },
    lineStyle: {
      height: 2,
      backgroundColor: colors.line_color,
      marginTop: 13,
      marginBottom: 9,
    },
  });

export default WalletScreen;
