import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Image,
  StyleSheet,
  Platform,
  useColorScheme,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {light, dark} from '../../../assets/colors/colors';
import useStore from '../../../data/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import {getAppVersion} from '../../ForceUpdateScreen/Handlers/get_app_version';
import {getVersion} from 'react-native-device-info';
import {useGetLoggedInUser, useLogin} from '../../../utils/auth.api';
import {getRpcs} from '../../HomeScreen/Handlers/get_rpcs';
import {parseAccount} from '../../HomeScreen/Handlers/parse_account';
AntDesign.loadFont();
Feather.loadFont();
MaterialCommunityIcons.loadFont();

const PreloadScreen = ({navigation}) => {
  // Detect System Theme
  const systemTheme = useColorScheme();

  const userLoggedIn = useGetLoggedInUser();
  const userLogin = useLogin();
  const {theme} = useStore();
  const setAppInfo = useStore(state => state.setAppInfo);
  const setRpcUrls = useStore(state => state.setRpcUrls);
  const setAccounts = useStore(state => state.setAccounts);
  const setActiveAccount = useStore(state => state.setActiveAccount);
  const setAccountBalances = useStore(state => state.setAccountBalances);
  const setActiveConnections = useStore(state => state.setActiveConnections);
  const setPin = useStore(state => state.setPin);
  const setNewPadlock = useStore(state => state.setNewPadlock);
  const setTotalBalanceCurrency = useStore(
    state => state.setTotalBalanceCurrency,
  );
  const toggleTheme = useStore(state => state.toggleTheme);
  const setNode = useStore(state => state.setNode);
  const setDynamicLink = useStore(state => state.setDynamicLink);


  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const checkUserLoggedIn = (isLoggedIn, pin) => {
    if (isLoggedIn) {
      if (!pin) {
        navigation.navigate('Set Pin Screen');
      } else {
        navigation.navigate('Enter Pin Screen');
      }
      console.log('logged in');
    } else {
      navigation.navigate('Privacy Policy Screen');
    }
  };

  React.useEffect(() => {
    let userIsLoggedIn = true;
    let defaultRpc = '';
    const currentVersion = getVersion();
    const getData = async () => {
      AsyncStorage.removeItem('triedRPCs');
      const version = await getAppVersion();
      console.log('version---------', version);
      await AsyncStorage.setItem('worker_key', version?.worker_key);
      const activeConnections = await AsyncStorage?.getItem('swap_sessions');
      setActiveConnections(JSON.parse(activeConnections));
      if (version) {
        setAppInfo(version);
      }
      const pin = await AsyncStorage.getItem('pin');
      if (pin !== null) {
        // value previously stored
        setPin(pin);
        // navigation.navigate('Start Screen');
      }

      const accountBalances = await AsyncStorage.getItem('accountBalances');
      if (accountBalances) {
        setAccountBalances(JSON.parse(accountBalances));
      }
      const accounts = await AsyncStorage.getItem('accounts');
      if (accounts !== null) {
        // value previously stored
        setAccounts(JSON.parse(accounts));
      } else {
        userIsLoggedIn = false;
      }
      console.log('accounts',accounts);

      const activeAccount = await AsyncStorage.getItem('activeAccount');
      if (activeAccount !== null) {
        const userToken = await AsyncStorage.getItem('token');
        const currentAccount = parseAccount(activeAccount);
        if (!userToken) {
          console.log('------------calling login api');
          await userLogin
            .mutateAsync({
              wallet_address: currentAccount.classicAddress,
              password: currentAccount.password,
            })
            .then(response => {
              console.log('--------------user login response', response);
            })
            .catch(err => {
              console.log('----------account login erorr', err);
            });
        }
        // value previously stored
        await userLoggedIn
          .mutateAsync()
          .then(async userResponse => {
            const tempAccount = {
              ...userResponse,
              ...currentAccount,
            };
            console.log('---------temp account', defaultRpc);
            if (userResponse?.isDefaultRPC) {
              // await AsyncStorage.setItem(
              //   'node',
              //   'wss://still-dark-gas.xrp-mainnet.quiknode.pro/f9dcecb9b67cabf67e067252b0eeb99947496f00/',
              // );
              await AsyncStorage.setItem('node', defaultRpc);
            }
            setActiveAccount(tempAccount);
            AsyncStorage.setItem(
              'activeAccount',
              JSON.stringify(tempAccount),
            ).then(() => {
              console.log('active account set asynchronously');
            });
          })
          .catch(err => {
            if (err?.message == 'User with this wallet address not found') {
              const parsedAccounts = JSON.parse(accounts);
              let updatedAccounts = parsedAccounts?.filter(
                account => account?.id != currentAccount?.id,
              );
              if (updatedAccounts.length === 0) {
                AsyncStorage.clear();
                setAccounts([]);
                setNewPadlock();
                setTimeout(() => navigation.navigate('Start Screen'), 500);
              } else {
                userLogin
                  .mutateAsync({
                    wallet_address: updatedAccounts[0]?.classicAddress,
                    password: updatedAccounts[0]?.password,
                  })
                  .then(response => {
                    setActiveAccount(updatedAccounts[0]);
                    AsyncStorage.setItem(
                      'activeAccount',
                      JSON.stringify(updatedAccounts[0]),
                    ).then(() => {
                      console.log('active account set asynchronously');
                    });
                    setAccounts(updatedAccounts);
                    AsyncStorage.setItem(
                      'accounts',
                      JSON.stringify(updatedAccounts),
                    ).then(() => {
                      console.log('accounts set asynchronously');
                    });
                  })
                  .catch(err => {
                    console.log('----------account login erorr', err);
                  });
              }
            } else {
              setActiveAccount(parseAccount(activeAccount));
              AsyncStorage.setItem('activeAccount', activeAccount).then(() => {
                console.log('active account set asynchronously');
              });
            }
            console.log('---------------get logged in user', err);
          });
      } else {
        userIsLoggedIn = false;
      }
      const theme = await AsyncStorage.getItem('theme');
      if (theme !== null) {
        // value previously stored
        // if (systemTheme === 'dark') {
          if (theme === 'dark') {
          toggleTheme('dark');
        } else {
          toggleTheme(theme);
        }
      }

      const totalBalanceCurrency = await AsyncStorage.getItem(
        'totalBalanceCurrency',
      );
      if (totalBalanceCurrency !== null) {
        // value previously stored
        setTotalBalanceCurrency(totalBalanceCurrency);
      }

      const currentNode = await AsyncStorage.getItem('node');
      if (currentNode !== null) {
        // value previously stored
        setNode(currentNode);
      }
      if (Platform.OS === 'ios') {
        if (
          version?.ios_version != currentVersion &&
          version?.is_force_updated
        ) {
          navigation.navigate('Force Update Screen');
        } else {
          checkUserLoggedIn(userIsLoggedIn, pin);
        }
      } else {
        if (
          version?.android_version != currentVersion &&
          version?.is_force_updated
        ) {
          navigation.navigate('Force Update Screen');
        } else {
          checkUserLoggedIn(userIsLoggedIn, pin);
        }
      }
    };

    // const handleDynamicLinks = async link => {
    //   // console.log('-------------link ---------------', link);
    //   let decodedLink = decodeURIComponent(link?.url);
    //   setDynamicLink(decodedLink);
    //   // console.log('----------------------1234 app running issue----------', userIsLoggedIn)
    //   if (userIsLoggedIn) {
    //     navigation.navigate('Home Screen');
    //   }
    // };

    const handleDynamicLinks = async (link) => {
       console.log('-------------link ---------------', link);
      try {
        // Check if the link object exists and contains a valid URL
        if (!link?.url) {
          console.error('Dynamic link is invalid or missing URL');
          return; // Exit early if the link is not valid
        }
    
        let decodedLink = decodeURIComponent(link.url);  // Decode the URL safely
        setDynamicLink(decodedLink); // Update the state with the decoded link
    
        // Navigate to the home screen if the user is logged in
        if (userIsLoggedIn) {
          console.log("i am called dynamic link",userIsLoggedIn)
          // navigation.navigate('Home Screen');
        }
      } catch (error) {
        console.error('Error handling dynamic link:', error);
      }
    };

    getRpcs().then(rpc => {
      setRpcUrls(rpc?.rpc);
      defaultRpc = rpc?.rpc?.[0];
    });
    getData().catch(e => console.log(e.messsage));

    dynamicLinks()
      .getInitialLink()
      .then(link => {
        // console.log('------------------inside iniital link-------', link);
        if (link?.url) {
        let decodedLink = decodeURIComponent(link?.url);
        setDynamicLink(decodedLink);
        }
        //   console.log('----------------------1234 foreground issue----------')
      });

    const unsubscribe = dynamicLinks().onLink(handleDynamicLinks);
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    toggleTheme(theme === 'dark' ? 'dark' : 'light');
  }, [systemTheme]);

  return (
    <GestureHandlerRootView>
      <StatusBar />
      <ScrollView contentContainerStyle={styles.bg}>
        <Image
          style={styles.introImage}
          source={
            theme === 'light'
              ? require('../../../assets/img/intro_logo.png')
              : require('../../../assets/img/intro_logo_dark.png')
          }
        />
      </ScrollView>
    </GestureHandlerRootView>
  );
};

const styling = colors =>
  StyleSheet.create({
    bg: {
      backgroundColor: colors.bg,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      paddingHorizontal: 0,
      // fontFamily: Platform.OS === "ios" ? "LeagueSpartanMedium" : "LeagueSpartanMedium", fontWeight: Platform.OS === "ios" ? "bold" : "100",
    },
    introImage: {
      width: 366,
      height: 200,
      marginTop: 200,
    },
  });

export default PreloadScreen;
