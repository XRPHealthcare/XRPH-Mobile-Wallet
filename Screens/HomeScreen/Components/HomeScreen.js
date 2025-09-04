import React, {useEffect} from 'react';

import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
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
import AddAccountModal from './AddAccountModal';
import AccountActions from './AccountActions';
import ReceiveModal from './ReceiveModal';
import TxModal from './TxModal';
import getAccountBalances from '../Handlers/get_account_balances';
import checkConnectionStatus from '../../StartScreen/Handlers/xrpl_connection_status';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {trigger} from 'react-native-haptic-feedback';
import Alert from '../../../components/Alert';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import RNExitApp from 'react-native-exit-app';
import StakeInfo from '../../StakeScreen/Components/StakeInfo';
import {
  useGetAddressBook,
  useGetPrices,
  useGetUserPortfolio,
} from '../../../utils/wallet.api';
import {socket} from '../../../utils/socket';
import {parseAccount} from '../Handlers/parse_account';
import {useNetInfoInstance} from '@react-native-community/netinfo';
import MaintenanceAlert from './MaintenanceAlert';
import {firebase} from '@react-native-firebase/firestore';
import ScanSetting from '../../SettingsScreens/Components/ScanSetting';
import {getPaymentInfo} from '../../../utils/magazine';
import XRPHAI from './XRPHAI';
import PrescriptionCard from './PrescriptionCard';
import NewsCard from './NewsCard';
import MagazineCard from './MagazineCard';
import HealthCare from './Healthcare';
import {useGetNews} from '../../../utils/new.api';
import getTransactionHistory from '../../TransactionHistoryScreen/Handlers/get_transaction_history';
import {getTotalBalances} from '../../../utils/functions/balance';
import {useLogin} from '../../../utils/auth.api';

const xrpl = require('xrpl');
FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const HomeScreen = ({route, navigation}) => {
  const txHashRef = React.useRef(null);
  const [isFirstLaunch, setIsFirstLaunch] = React.useState(true);
  const {
    netInfo: {isConnected: isInternetConnected},
  } = useNetInfoInstance();
  const isFocused = useIsFocused();
  const {
    data: addressBook,
    isLoading: addressBookLoading,
    refetch: refetchAddressBook,
  } = useGetAddressBook();
  const {data: newsCards} = useGetNews();
  const {data: userLogin} = useLogin();

  const {data: stakingBalance, refetch} = useGetUserPortfolio();

  const getExchangePrices = useGetPrices();
  let {
    activeConnections,
    activeAccount,
    token,
    tokenRate,
    amount,
    exchangeTo,
    accounts,
    stakingBalances,
    theme,
    node,
    rpcUrls,
    hepticOptions,
    dynamicLink,
    isAccountSwitchLoading,
  } = useStore();
  const setNewPadlock = useStore(state => state.setNewPadlock);
  const setAccountBalances = useStore(state => state.setAccountBalances);
  const setTxHistoryLoading = useStore(state => state.setTxHistoryLoading);
  const setTxHistory = useStore(state => state.setTxHistory);
  const setDestinationAddress = useStore(state => state.setDestinationAddress);
  const setToken = useStore(state => state.setToken);
  const setAmount = useStore(state => state.setAmount);
  const setExchangeRate = useStore(state => state.setExchangeRate);
  const setTokenRate = useStore(state => state.setTokenRate);
  const setRateLoading = useStore(state => state.setRateLoading);
  const setAccounts = useStore(state => state.setAccounts);
  const setActiveAccount = useStore(state => state.setActiveAccount);
  const setStakingBalances = useStore(state => state.setStakingBalances);
  const setDynamicLink = useStore(state => state.setDynamicLink);
  const setNode = useStore(state => state.setNode);
  const setActiveConnections = useStore(state => state.setActiveConnections);
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

  const [swapRequest, setSwapRequest] = React.useState(null);
  const [channelHash, setChannelHash] = React.useState('');
  const appState = React.useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = React.useState(
    appState.current,
  );
  const [appStatus, setAppStatus] = React.useState(null);
  const [scanSettingOpen, setScanSettingOpen] = React.useState(false);
  const [scannedData, setScannedData] = React.useState(null);
  const [isDataLoading, setIsDataLoading] = React.useState(false);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const getAppLaunchLink = async dynamicLink => {
    try {
      console.log('----------dynamic link---------------', dynamicLink, 'test');
      if (!dynamicLink) {
        console.log('-----------no link found---------', 'test this');
      } else {
        const params = dynamicLink?.split('?')?.[1];
        if (params?.includes('channel_hash')) {
          const channel_hash = params?.split('=')?.[1];
          setChannelHash(channel_hash);
          setDynamicLink('');
        } else if (params?.includes('qr_id')) {
          const paramsArray = params?.split('&');
          let qr_id = paramsArray?.[0]?.split('=')?.[1];
          let verify_url = paramsArray?.[1]?.split('=')?.[1];
          try {
            setScanSettingOpen(true);
            setIsDataLoading(true);
            const responseResult = await getPaymentInfo({
              qr_id: qr_id,
              verify_url: verify_url,
            });
            console.log('responseResult-------', responseResult);
            setIsDataLoading(false);
            console.log('parsed data-------', qr_id, responseResult);
            setScanSettingOpen(true);
            setScannedData({qr_id: qr_id, ...responseResult});
          } catch (e) {
            setScanSettingOpen(false);
            setIsDataLoading(false);
            setIsErrorAlert(true);
            setAlertMsg('Invalid Payment Details!');
          }
        } else if (params?.includes('inputAmount')) {
          const paramsArray = params?.split('&');
          let transaction;
          paramsArray?.forEach(param => {
            const [key, value] = param?.split('=');
            if (key === 'fromCoin') {
              transaction = {...transaction, fromCoin: JSON.parse(value)};
            } else if (key === 'toCoin') {
              transaction = {...transaction, toCoin: JSON.parse(value)};
            } else if (key === 'token') {
              transaction = {...transaction, token: value};
            } else if (key === 'inputAmount') {
              transaction = {...transaction, inputAmount: value};
            } else if (key === 'outputAmount') {
              transaction = {...transaction, outputAmount: value};
            } else if (key === 'id') {
              transaction = {...transaction, id: value};
            }
          });
          setSwapRequest({
            token: transaction?.token,
            id: transaction?.id,
            transaction,
          });
          setIsSwapRequest(true);
          setDynamicLink('');
        } else {
          const paramsArray = params?.split('&');
          // console.log("i am called paramsArray",paramsArray);
          if (paramsArray?.length) {
            // console.log("i am called paramsArray length",paramsArray,paramsArray?.length);
            if (activeAccount?.balances?.length > 0) {
              //   console.log("i am called");
              // navigation.navigate('Send Screen');
              setTimeout(() => {
                navigation.navigate('Send Screen');
              }, 50); // Slight delay to let React stabilize
              paramsArray?.forEach(param => {
                const [key, value] = param?.split('=');
                if (key === 'address') {
                  setDestinationAddress(value || '');
                } else if (key === 'amount') {
                  setAmountAndExRate(value || 0);
                } else if (key === 'token') {
                  console.log(
                    'activeAccount?.balances',
                    activeAccount?.balances,
                  );
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
      }
    } catch {
      setDynamicLink('');
      //handle errors
    }
  };

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
    console.log('fetched balance after switch account', balances);

    AsyncStorage.setItem('accountBalances', JSON.stringify(balances));
    return balances;
  };

  const fetchTrxHistory = async () => {
    setTxHistoryLoading(true);
    setTxHistory([]);
    const history = await getTransactionHistory(activeAccount, node);
    setTxHistory(history);
    setTxHistoryLoading(false);
  };

  const refreshBalances = async (showLoading = true) => {
    console.warn('refreshBalances called from home');
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

      console.log(
        '-------- Account holder name------------',
        localActiveAccount,
      );
      console.log('localAccounts', localAccounts);
      // //name
      // console.log('localActiveAccount',localActiveAccount);

      const accounts = parseAccount(localAccounts) || [];
      const activeAccount = parseAccount(localActiveAccount);

      // console.log('accounts',accounts,'activeAccount',activeAccount);

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
            fetchTrxHistory();
            trigger('impactMedium', hepticOptions);
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
          const isConnected = await checkConnectionStatus(node);
          console.warn('called from active/inactive home', isConnected, node);
          refreshBalances(false);
        }

        appState.current = nextAppState;
        setAppStateVisible(appState.current);
      },
    );

    return () => {
      subscription.remove();
    };
  }, [node]);

  React.useEffect(() => {
    console.log('dynamicLink', dynamicLink);

    getAppLaunchLink(dynamicLink);
  }, [dynamicLink]);

  React.useEffect(() => {
    if (route.params !== undefined) {
      let {sendOpen, currToken, currAmount} = route.params;
      if (sendOpen) {
        navigation.navigate('Send Screen');
      }
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
      if (isAccountSwitchLoading) {
        console.log('Account switch in progress, skipping connection...');
        return;
      }
      // console.error('node from home:', node);
      const client = new xrpl.Client(node, {
        connectionTimeout: 60000,
      });

      await client.connect();

      const intervalId = setInterval(() => {
        console.log('Sending ping...', client?.isConnected());
        // if (client?.isConnected()) {
        client
          .request({
            command: 'ping',
          })
          .then(() => {
            console.log('Ping sent and pong received.');
            console.warn('Ping sent and pong received from home');
          })
          .catch(async error => {
            console.error('Ping failed from home:', error);
            // Optional: Reconnect or handle failure as needed
            if (!isAccountSwitchLoading) {
              clearInterval(intervalId);
              await client.disconnect();
              connectAndPing(); // Reconnect and ping again
            }
          });
        // }
      }, 60000); // Ping every 60 seconds

      client.on('transaction', ev => {
        console.log('transaction received..............................');
        if (txHashRef.current !== ev.transaction.hash) {
          txHashRef.current = ev.transaction.hash;
          // console.log(JSON.stringify(ev, null, 2));
          refetch();
          //  console.warn('called from Ping sent and pong received')
          if (!isAccountSwitchLoading) {
            refreshBalances(false);
          }
        }
      });

      if (!isAccountSwitchLoading) {
        await client.request({
          command: 'subscribe',
          accounts: [activeAccount?.classicAddress],
        });
      }

      return () => {
        clearInterval(intervalId);
        client.disconnect();
      };
    };

    if (!isAccountSwitchLoading) {
      connectAndPing();
    }
  }, [
    activeAccount.classicAddress,
    isInternetConnected,
    isAccountSwitchLoading,
  ]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     refreshBalances(false);
  //   }, [])
  // );

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
                setReceiveModalOpen={value => {
                  navigation.navigate('ReceivePayment');
                  // setReceiveModalOpen(value)
                }}
                loading={loading}
                setErrorMsg={msg => setAlertMsg(msg)}
                setErrorAlert={setIsErrorAlert}
                home={true}
                navigation={navigation}
                isStaking={Number(stakingBalance?.totalStakes || 0) > 0}
              />
              {Number(stakingBalance?.totalStakes || 0) > 0 && (
                <View
                  style={[
                    styles.column,
                    {gap: 16, paddingHorizontal: 20, marginTop: 24},
                  ]}>
                  <Text style={styles.heading}>Staking Info</Text>
                  <StakeInfo home={true} navigation={navigation} />
                </View>
              )}
              <View
                style={[
                  styles.column,
                  {gap: 16, paddingHorizontal: 20, marginTop: 24},
                ]}>
                <Text style={styles.heading}>CHAT XRPH AI</Text>
                <XRPHAI />
              </View>
              {/* <View
                style={[
                  styles.column,
                  {gap: 16, paddingHorizontal: 20, marginTop: 24},
                ]}>
                <Text style={styles.heading}>
                  XRPH Prescription Savings Card
                </Text>
                <PrescriptionCard navigation={navigation} />
              </View> */}
              <View
                style={[
                  styles.row,
                  {
                    gap: 16,
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    paddingHorizontal: 20,
                    marginTop: 24,
                  },
                ]}>
                {newsCards?.news?.[0] && (
                  <View style={[styles.column, {gap: 16, width: 160}]}>
                    <Text style={styles.heading}>News</Text>
                    <NewsCard newses={newsCards?.news} />
                  </View>
                )}
                {newsCards?.magazine && (
                  <View style={[styles.column, {gap: 16, width: 160}]}>
                    <Text style={styles.heading}>Magazine</Text>
                    <MagazineCard magazine={newsCards?.magazine} />
                  </View>
                )}
              </View>
              <View
                style={[
                  styles.column,
                  {gap: 16, paddingHorizontal: 20, marginTop: 24},
                ]}>
                <Text style={styles.heading}>XRPH Healthcare Africa</Text>
                <HealthCare />
              </View>
            </View>
          </ScrollView>

          <ScanSetting
            scanSettingOpen={scanSettingOpen}
            setScanSettingOpen={setScanSettingOpen}
            navigation={navigation}
            scannedData={scannedData}
            dataLoading={isDataLoading}
          />

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
          {/* {connectionConfirmation && (
            <ConnectionConfirmation
              connectionConfirmation={connectionConfirmation}
              setConnectionConfirmation={setConnectionConfirmation}
              channelHash={channelHash}
              setChannelHash={setChannelHash}
            />
          )} */}

          {/* <SwapRequest
            isSwapRequest={isSwapRequest}
            setIsSwapRequest={setIsSwapRequest}
            swapRequest={swapRequest}
          /> */}
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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
      width: '100%',
    },
    heading: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '600',
      fontFamily: 'LeagueSpartanMedium',
    },
  });

export default HomeScreen;
