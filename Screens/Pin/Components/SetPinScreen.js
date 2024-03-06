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
} from 'react-native';
import {light, dark} from '../../../assets/colors/colors';
import Pin from './Pin';
import useStore from '../../../data/store';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';

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

  const styles = styling(colors);

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

  useEffect(() => {
    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  }, [errorMessage]);

  useEffect(() => {
    checkIsBiometricEnabled();
  }, []);

  return (
    <View style={styles.bg}>
      <View style={styles.header}>
        {isPinSet ? (
          <View>
            <TouchableOpacity
              onPress={() => {
                toggleIsPinSet(false);
              }}>
              <Feather
                name={'chevron-left'}
                size={35}
                color={colors.text}
                style={styles.backIcon}
              />
            </TouchableOpacity>
          </View>
        ) : (
          params?.backEnabled && (
            <View>
              <TouchableOpacity
                onPress={() => {
                  navigation?.goBack();
                }}>
                <Feather
                  name={'chevron-left'}
                  size={35}
                  color={colors.text}
                  style={styles.backIcon}
                />
              </TouchableOpacity>
            </View>
          )
        )}
        <Image
          style={styles.headerImage}
          source={
            theme === 'light'
              ? require('../../../assets/img/header_logo.png')
              : require('../../../assets/img/header_logo_dark.png')
          }
        />
        <View style={styles.sendModalHeader}>
          <Text style={styles.sendModalHeaderText}>
            {isPinSet ? 'Verify Your Pin' : 'Set A 6-Digit Pin'}
          </Text>
        </View>
        <Text style={styles.directionText}>
          {!isPinSet
            ? 'Please input a new pin for your account. This will be used to unlock the app.'
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
          <Pin
            role={'set'}
            onSuccess={() => navigation.navigate('Home Screen')}
            onFailure={() => console.log('Epic fail')}
            pin={newPin}
            setPin={setNewPin}
          />
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
                size={25}
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
                size={25}
                color={colors.bg}
                style={styles.continueIcon}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styling = colors =>
  StyleSheet.create({
    bg: {
      backgroundColor: colors.bg,
      alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
      paddingHorizontal: 20,
    },
    header: {
      marginTop: 40,
    },
    loadingAnimationWrapper: {
      backgroundColor: colors.bg,
      width: '100%',
      height: 130,
      // marginLeft: '5%',
      marginBottom: 100,
      marginTop: 30,
      // elevation: 5,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '80%',
    },
    headerImage: {
      width: 350,
      height: 65,
      marginTop: 20,
      marginLeft: 0,
    },
    addAccountAnimation: {
      marginLeft: 0,
    },
    sendModalHeader: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 10,
    },
    sendModalHeaderText: {
      fontSize: 20,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.text,
      textAlign: 'center',
      marginTop: 50,
      marginLeft: -20,
    },
    addAccountOkButton: {
      width: 160,
      height: 50,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      borderRadius: 20,
      backgroundColor: colors.primary,
    },
    addAccountOkButtonText: {
      textAlign: 'center',
      fontSize: 20,
      color: colors.bg,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginRight: 20,
      marginTop: Platform.OS === 'ios' ? 5 : 0,
    },
    backButton: {
      width: 100,
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.text_light,
      borderRadius: 20,
    },
    buttontextDark: {
      fontSize: 20,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginLeft: 5,
      marginTop: Platform.OS === 'ios' ? 5 : 0,
    },
    directionText: {
      fontSize: 18,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaLight',
      marginTop: 30,
      textAlign: 'center',
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
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      borderRadius: 20,
      paddingTop: 10,
      paddingBottom: 10,
      textAlign: 'center',
    },
  });

export default SetPinScreen;
