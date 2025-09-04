import React from 'react';

import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  Pressable,
} from 'react-native';
import {light, dark} from '../../../assets/colors/colors';
import Pin from './Pin';
import useStore from '../../../data/store';
import Feather from 'react-native-vector-icons/Feather';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ArrowSqrLeftBlackIcon,
  ArrowSqrLeftWhiteIcon,
} from '../../../assets/img/new-design';

Feather.loadFont();

const ChangePinScreen = ({navigation}) => {
  const {theme, activeAccount} = useStore();
  const [isAuthenticated, setIsAuthenticated] = React.useState(true);
  const [numAttempts, setNumAttempts] = React.useState(8);
  const [newPin, setNewPin] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors, theme);

  const onVerificationSuccess = () => {
    // go to set pin screen
    navigation.navigate('Set Pin Screen', {backEnabled: true});
  };

  const onFailure = () => {
    if (numAttempts - 1 <= 0) {
      setIsAuthenticated(false);
    } else {
      setErrorMessage('Incorrent Pin. Please enter correct pin.');
      setNumAttempts(numAttempts - 1);
    }
  };

  const onChangePin = newPin => {
    setNewPin(newPin);
    // if (newPin.length !== 6) {
    //     setDoesPinMatch(false);
    // }
  };

  React.useEffect(() => {
    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  }, [errorMessage]);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={colors.bg}>
        <View style={styles.bg}>
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.navigate('Privacy Settings Screen')}>
              {theme === 'dark' ? (
                <ArrowSqrLeftWhiteIcon />
              ) : (
                <ArrowSqrLeftBlackIcon />
              )}
            </Pressable>
            <Text style={styles.headerHeading}>Change Pin</Text>
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
          <View style={styles.wrapper}>
            <Text style={styles.directionText}>
              Please enter the current 6-digit pin of your account.
            </Text>

            {isAuthenticated ? (
              <View style={styles.loadingAnimationWrapper}>
                <Pin
                  role={'verify'}
                  onSuccess={onVerificationSuccess}
                  onFailure={onFailure}
                  pin={newPin}
                  setPin={onChangePin}
                />
                {errorMessage?.length > 0 && (
                  <Text style={styles.errorMessage}>{errorMessage}</Text>
                )}
                {numAttempts < 8 && (
                  <Text style={styles.attemptsRemainingText}>
                    {numAttempts} attempts remaining.
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.loadingAnimationWrapper}>
                <Text style={styles.directionText}>Max attempts reached.</Text>
              </View>
            )}
          </View>
        </View>
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
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '80%',
    },
    sendModalHeader: {
      width: '100%',
      paddingHorizontal: 10,
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
      marginTop: 48,
    },
    directionText: {
      fontSize: 14,
      color: colors.text_gray,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanLight',
      marginTop: 48,
      textAlign: 'start',
    },
    attemptsRemainingText: {
      fontSize: 12,
      color: '#EF4444',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanLight',
      textAlign: 'start',
    },
    errorMessage: {
      // backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      borderRadius: 20,
      paddingTop: 10,
      paddingBottom: 10,
    },
  });

export default ChangePinScreen;
