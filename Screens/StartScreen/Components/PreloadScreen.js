import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Image,
  StyleSheet,
  Platform,
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
AntDesign.loadFont();
Feather.loadFont();
MaterialCommunityIcons.loadFont();

const PreloadScreen = ({navigation}) => {
  const userLoggedIn = useGetLoggedInUser();
  const userLogin = useLogin();
  const {theme} = useStore();
  const setAppInfo = useStore(state => state.setAppInfo);
  const setAccounts = useStore(state => state.setAccounts);
  const setActiveAccount = useStore(state => state.setActiveAccount);
  const setPin = useStore(state => state.setPin);
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

  const checkUserLoggedIn = isLoggedIn => {
    if (isLoggedIn) {
      navigation.navigate('Enter Pin Screen');
      console.log('logged in');
    } else {
      navigation.navigate('Privacy Policy Screen');
    }
  };

  React.useEffect(() => {
    let userIsLoggedIn = true;
    const currentVersion = getVersion();
    const getData = async () => {
      // AsyncStorage.clear();
      const version = await getAppVersion();
      if (version) {
        setAppInfo(version);
      }
      const pin = await AsyncStorage.getItem('pin');
      if (pin !== null) {
        // value previously stored
        setPin(pin);
        // navigation.navigate('Start Screen');
      } else {
        userIsLoggedIn = false;
      }
      console.log(pin);

      const accounts = await AsyncStorage.getItem('accounts');
      if (accounts !== null) {
        // value previously stored
        setAccounts(JSON.parse(accounts));
      } else {
        userIsLoggedIn = false;
      }
      console.log(accounts);

      const activeAccount = await AsyncStorage.getItem('activeAccount');
      if (activeAccount !== null) {
        const userToken = await AsyncStorage.getItem('token');
        const currentAccount = JSON.parse(activeAccount);
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
            console.log('---------temp account', tempAccount);
            if (userResponse?.isDefaultRPC) {
              await AsyncStorage.setItem('node', 'wss://s2.ripple.com/');
              // await AsyncStorage.setItem(
              //   'node',
              //   'wss://testnet.xrpl-labs.com/',
              // );
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
            setActiveAccount(JSON.parse(activeAccount));
            AsyncStorage.setItem(
              'activeAccount',
              JSON.stringify(activeAccount),
            ).then(() => {
              console.log('active account set asynchronously');
            });
            console.log('---------------get logged in user', err);
          });
      } else {
        userIsLoggedIn = false;
      }
      console.log(activeAccount);

      const theme = await AsyncStorage.getItem('theme');
      if (theme !== null) {
        // value previously stored
        toggleTheme(theme);
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
          checkUserLoggedIn(userIsLoggedIn);
        }
      } else {
        if (
          version?.android_version != currentVersion &&
          version?.is_force_updated
        ) {
          navigation.navigate('Force Update Screen');
        } else {
          checkUserLoggedIn(userIsLoggedIn);
        }
      }
    };

    const handleDynamicLinks = async link => {
      // console.log('-------------link ---------------', link);
      let decodedLink = decodeURIComponent(link?.url);
      setDynamicLink(decodedLink);
      // console.log('----------------------1234 app running issue----------', userIsLoggedIn)
      if (userIsLoggedIn) {
        navigation.navigate('Home Screen');
      }
    };

    getData().catch(e => console.log(e.messsage));

    dynamicLinks()
      .getInitialLink()
      .then(link => {
        // console.log('------------------inside iniital link-------', link);
        let decodedLink = decodeURIComponent(link?.url);
        setDynamicLink(decodedLink);
        //   console.log('----------------------1234 foreground issue----------')
      });

    const unsubscribe = dynamicLinks().onLink(handleDynamicLinks);
    return () => unsubscribe();
  }, []);

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
      // fontFamily: Platform.OS === "ios" ? "NexaBold" : "NexaBold", fontWeight: Platform.OS === "ios" ? "bold" : "100",
    },
    introImage: {
      width: 366,
      height: 200,
      marginTop: 200,
    },
  });

export default PreloadScreen;
