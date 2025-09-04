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
  Platform,
  Pressable,
} from 'react-native';
import {light, dark} from '../../../assets/colors/colors';
import Pin from './Pin';
import useStore from '../../../data/store';
import Feather from 'react-native-vector-icons/Feather';
// import getTotalBalances from '../Handlers/get_total_balances';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import {trigger} from 'react-native-haptic-feedback';
import PendingTouch from '../../../assets/img/pending-touch.svg';
import {useGetPrices} from '../../../utils/wallet.api';
import getAccountBalances from '../../HomeScreen/Handlers/get_account_balances';
import {parseAccount} from '../../HomeScreen/Handlers/parse_account';
import RNExitApp from 'react-native-exit-app';
import {
  ArrowSqrLeftBlackIcon,
  ArrowSqrLeftWhiteIcon,
} from '../../../assets/img/new-design';
Feather.loadFont();

const MAX_ATTEMPTS = 8;

const EnterPinScreen = ({navigation}) => {
  const getExchangePrices = useGetPrices();
  const rnBiometrics = new ReactNativeBiometrics();
  const {
    theme,
    accounts,
    activeAccount,
    hepticOptions,
    isBiometricEnabled,
    node,
  } = useStore();
  const setAccounts = useStore(state => state.setAccounts);
  const setActiveAccount = useStore(state => state.setActiveAccount);
  const setAccountBalances = useStore(state => state.setAccountBalances);
  const setStakingBalances = useStore(state => state.setStakingBalances);
  const setIsBiometricEnabled = useStore(state => state.setIsBiometricEnabled);
  const [newPin, setNewPin] = React.useState('');
  const [numAttempts, setNumAttempts] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState('');

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors, theme);

  const onVerificationSuccess = () => {
    navigation.navigate('Home Screen');
    setNewPin('');
  };

  const biometricPrompt = () => {
    rnBiometrics
      .simplePrompt({promptMessage: 'Confirm Biometric'})
      .then(resultObject => {
        const {success} = resultObject;
        if (success) {
          trigger('impactHeavy', hepticOptions);
          onVerificationSuccess();
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
      console.log('------error in Enter pin screen', e);
    }
  };

  const getActiveAccountBalances = async account => {
    const balances = await getAccountBalances(account, node);
    AsyncStorage.setItem('accountBalances', JSON.stringify(balances));
    setAccountBalances(balances);
  };

  const gestureEndListener = e => {
    if (
      e?.data?.action?.type === 'GO_BACK' ||
      e?.data?.action?.type === 'POP'
    ) {
      RNExitApp.exitApp();
    }
  };

  React.useEffect(() => {
    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  }, [errorMessage]);

  React.useEffect(() => {
    checkIsBiometricEnabled();

    AsyncStorage.getItem('stakingBalances').then(res => {
      if (res) {
        setStakingBalances(parseAccount(res));
      }
    });
    AsyncStorage.getItem('activeAccount').then(res => {
      if (res) {
        setActiveAccount(parseAccount(res));
        getActiveAccountBalances(parseAccount(res));
      }
    });

    const getBalances = async () => {
      // getTotalBalances(accounts)
      //   .then(updatedAccounts => {
      //     console.log(updatedAccounts);
      //     for (let i = 0; i < updatedAccounts.length; i++) {
      //       if (
      //         updatedAccounts[i].classicAddress === activeAccount.classicAddress
      //       ) {
      //         setActiveAccount(updatedAccounts[i]);
      //         AsyncStorage.setItem(
      //           'activeAccount',
      //           JSON.stringify(updatedAccounts[i]),
      //         ).then(() => {
      //           console.log('active account set asynchronously');
      //         });
      //       }
      //     }
      //     setAccounts(updatedAccounts);
      //     AsyncStorage.setItem(
      //       'accounts',
      //       JSON.stringify(updatedAccounts),
      //     ).then(() => {
      //       console.log('active account set asynchronously');
      //     });
      //   })
      //   .catch(err => {
      //     console.log('1: ', err.message);
      //   });
    };

    getBalances().catch(err => console.log(err.message));
    const gestureHandler = navigation.addListener(
      'beforeRemove',
      gestureEndListener,
    );
    return gestureHandler;
  }, []);

  return (
    <View style={styles.bg}>
      <View style={styles.header}>
        <Text style={styles.headerHeading}>Verify Your Pin</Text>
      </View>
      <Image
        source={require('../../../assets/img/new-design/bg-gradient.png')}
        style={styles.greenShadow}
      />
      <Image
        style={styles.headerImage}
        source={
          theme === 'light'
            ? require('../../../assets/img/header_logo.png')
            : require('../../../assets/img/header_logo_dark.png')
        }
      />
      {numAttempts < MAX_ATTEMPTS ? (
        <View
          style={{
            width: '100%',
            paddingHorizontal: 20,
          }}>
          <Text key="2" style={styles.directionText}>
            Please enter your pin
          </Text>
        </View>
      ) : (
        <></>
      )}
      <ScrollView contentContainerStyle={styles.loadingAnimationWrapper}>
        {numAttempts < MAX_ATTEMPTS ? (
          <Pin
            role={'verify'}
            onSuccess={onVerificationSuccess}
            onFailure={() => {
              setErrorMessage('Incorrent Pin. Please enter correct pin.');
              setNumAttempts(prev => prev + 1);
            }}
            pin={newPin}
            setPin={setNewPin}
          />
        ) : (
          <Text style={styles.sendModalHeaderText}>
            You have been locked out of your account.
          </Text>
        )}
        {errorMessage?.length > 0 && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
        {numAttempts > 0 && (
          <Text style={styles.attemptsLeft}>
            {MAX_ATTEMPTS - numAttempts} attempts remaining.
          </Text>
        )}
        {isBiometricEnabled ? (
          <View
            style={{marginTop: 48, marginLeft: 'auto', marginRight: 'auto'}}>
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
              onPress={biometricPrompt}>
              <PendingTouch height={75} width={75} />
            </TouchableOpacity>
          </View>
        ) : (
          ''
        )}
      </ScrollView>
    </View>
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
    wrapper: {
      width: '100%',
      // height: '100%',
      paddingHorizontal: 20,
      paddingVertical: 24,
      borderRadius: 10,
    },
    greenShadow: {
      position: 'absolute',
      top: 0,
      zIndex: -1,
      marginTop: -250,
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
      justifyContent: 'center',
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
    loadingAnimationWrapper: {
      paddingHorizontal: 20,
      width: '100%',
      // marginLeft: '5%',
      marginBottom: 8,
      marginTop: 16,
    },
    headerImage: {
      width: 279,
      height: 53,
      marginTop: 24,
      marginLeft: 0,
    },
    sendModalHeaderText: {
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: '',
      color: colors.text_gray,
      textAlign: 'center',
      flex: 1,
      flexWrap: 'wrap',
    },
    directionText: {
      fontSize: 14,
      color: colors.text_gray,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanLight',
      marginTop: 48,
      textAlign: 'start',
    },
    errorMessage: {
      // backgroundColor: colors.text,
      color: '#EF4444',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      borderRadius: 20,
      paddingTop: 10,
      paddingBottom: 10,
    },
    attemptsLeft: {
      fontSize: 12,
      color: '#EF4444',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanLight',
      textAlign: 'start',
    },
  });

export default EnterPinScreen;
