import React, {useEffect} from 'react';

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
  KeyboardAvoidingView,
} from 'react-native';
import {light, dark} from '../../../assets/colors/colors';
import Pin from './Pin';
import useStore from '../../../data/store';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import AntDesign from 'react-native-vector-icons/AntDesign';
import RNExitApp from 'react-native-exit-app';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  ArrowSqrLeftBlackIcon,
  ArrowSqrLeftWhiteIcon,
} from '../../../assets/img/new-design';

Feather.loadFont();
AntDesign.loadFont();

const SetPinScreen = ({route, navigation}) => {
  const params = route?.params;
  const rnBiometrics = new ReactNativeBiometrics();
  const {theme} = useStore();
  const setPin = useStore(state => state.setPin);

  const [isBiometricEnabled, setIsBiometricEnabled] = React.useState(false);
  const [isPinSet, toggleIsPinSet] = React.useState(false);
  const [newPin, setNewPin] = React.useState('');
  const [doesPinMatch, setDoesPinMatch] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors, theme);

  const confirmPin = () => {
    if (newPin.length !== 6) {
      setErrorMessage('Please enter 6 digit pin.');
      return;
    }
    console.log('pin set: ', newPin);
    toggleIsPinSet(true);
    setPin(newPin);
    setNewPin('');

    AsyncStorage.setItem('pin', newPin).then(() => {
      console.log('set');
    });
  };

  const onVerificationSuccess = () => {
    setDoesPinMatch(true);
  };

  const onContinue = () => {
    console.log('onContinue triggered');
    console.log('isBiometricEnabled: ', isBiometricEnabled);
    console.log('doesPinMatch: ', doesPinMatch);
    if (!doesPinMatch) {
      setErrorMessage(`Pin doesn't match. Please use correct one.`);
      return;
    }

    if (isBiometricEnabled) {
      navigation.navigate('Biometric Screen');
    } else {
      navigation.navigate('Home Screen');
    }
    setNewPin('');
    toggleIsPinSet(false);
  };

  const onChangePin = newPin => {
    setNewPin(newPin);
    if (newPin.length !== 6) {
      setDoesPinMatch(false);
    }
  };

  const checkIsBiometricEnabled = () => {
    try {
      rnBiometrics.isSensorAvailable().then(res => {
        const {available, biometryType} = res;
        if (available && biometryType === BiometryTypes.FaceID) {
          setIsBiometricEnabled(true);
        } else if (available && biometryType === BiometryTypes.TouchID) {
          setIsBiometricEnabled(true);
        } else if (available && biometryType === BiometryTypes.Biometrics) {
          setIsBiometricEnabled(true);
        } else {
          console.log('Biometric not found');
        }
      });
    } catch (e) {
      console.log('-------error in Set Pin Screen----', e);
    }
  };

  const gestureEndListener = e => {
    if (
      e?.data?.action?.type === 'GO_BACK' ||
      e?.data?.action?.type === 'POP'
    ) {
      RNExitApp.exitApp();
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  }, [errorMessage]);

  useEffect(() => {
    checkIsBiometricEnabled();
    const gestureHandler = navigation.addListener(
      'beforeRemove',
      gestureEndListener,
    );
    return gestureHandler;
  }, []);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={colors.bg}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.bg}>
            <View style={styles.header}>
              <Pressable
                onPress={() => {
                  if (isPinSet) {
                    toggleIsPinSet(false);
                  } else {
                    if (params?.backEnabled) {
                      navigation?.navigate('Change Pin Screen');
                    }
                  }
                }}>
                {theme === 'dark' ? (
                  <ArrowSqrLeftWhiteIcon />
                ) : (
                  <ArrowSqrLeftBlackIcon />
                )}
              </Pressable>
              <Text style={styles.headerHeading}>Set Pin</Text>
              <Text style={{width: 20}}></Text>
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
            {/* <View style={styles.sendModalHeader}>
            <Text style={styles.sendModalHeaderText}>
              {isPinSet ? 'Verify Your Pin' : 'Set A 6-Digit Pin'}
            </Text>
          </View> */}
            <View
              style={{
                paddingHorizontal: 20,
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '100%',
              }}>
              <Text style={styles.directionText}>
                {!isPinSet
                  ? 'Set a new account pin'
                  : 'Please verify your new pin.'}
              </Text>
              {errorMessage?.length > 0 && (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              )}
            </View>
            <View style={styles.loadingAnimationWrapper}>
              {isPinSet ? (
                <Pin
                  role={'verify'}
                  onSuccess={onVerificationSuccess}
                  onFailure={() => console.log('Epic fail')}
                  pin={newPin}
                  setPin={onChangePin}
                />
              ) : (
                <View>
                  <Pin
                    role={'set'}
                    onSuccess={() => navigation.navigate('Home Screen')}
                    onFailure={() => console.log('Epic fail')}
                    pin={newPin}
                    setPin={setNewPin}
                  />
                  <Text
                    style={[
                      styles.directionText,
                      {
                        marginTop: 8,
                        fontSize: 12,
                      },
                    ]}>
                    This pin will be used to unlock the app.
                  </Text>
                </View>
              )}

              {isPinSet ? (
                <TouchableOpacity
                  style={[
                    styles.addAccountOkButton,
                    {
                      backgroundColor: doesPinMatch
                        ? colors.primary
                        : colors.text_light,
                    },
                  ]}
                  onPress={onContinue}>
                  <View style={styles.buttonWrapper}>
                    <Text
                      style={[
                        styles.addAccountOkButtonText,
                        {color: doesPinMatch ? colors.bg : colors.text},
                      ]}>
                      Continue
                    </Text>
                    <Feather
                      name={'arrow-right'}
                      size={24}
                      color={doesPinMatch ? colors.bg : colors.text}
                      style={styles.continueIcon}
                    />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.addAccountOkButton}
                  onPress={confirmPin}>
                  <View style={styles.buttonWrapper}>
                    <Text style={styles.addAccountOkButtonText}>Continue</Text>
                    <Feather
                      name={'arrow-right'}
                      size={24}
                      color={colors.bg}
                      style={styles.continueIcon}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
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
    headerImage: {
      width: 279,
      height: 53,
      marginTop: 24,
      marginLeft: 0,
    },
    loadingAnimationWrapper: {
      width: '100%',
      marginBottom: 8,
      marginTop: 16,
      paddingHorizontal: 20,
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '80%',
    },
    sendModalHeader: {
      width: '100%',
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 10,
    },
    sendModalHeaderText: {
      fontSize: 18,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'center',
      marginTop: 50,
    },
    addAccountOkButton: {
      width: '100%',
      height: 44,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    addAccountOkButtonText: {
      textAlign: 'center',
      fontSize: 16,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginRight: 8,
      marginTop: Platform.OS === 'ios' ? 5 : 0,
    },
    directionText: {
      fontSize: 14,
      color: colors.text_gray,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanLight',
      marginTop: 48,
      textAlign: 'start',
    },
    buttonWrapper: {
      flexDirection: 'row',
    },
    bottomSpacer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '80%',
      // marginLeft: '10%'
    },
    errorMessage: {
      color: '#ff6961',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      borderRadius: 20,
      paddingTop: 10,
      paddingBottom: 10,
      textAlign: 'start',
    },
  });

export default SetPinScreen;
