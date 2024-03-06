import React from 'react';

import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import {light, dark} from '../../../assets/colors/colors';
import Pin from './Pin';
import useStore from '../../../data/store';
import Feather from 'react-native-vector-icons/Feather';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';

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

  const styles = styling(colors);

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
          <StatusBar />
          <View style={styles.header}>
            <View>
              <Image
                style={styles.headerImage}
                source={require('../../../assets/img/hero.png')}
              />
            </View>
            <View>
              <Text style={styles.headerText}>Settings</Text>
              <Text style={styles.accountNameText}>{activeAccount.name}</Text>
            </View>
          </View>
          <View style={styles.settingsWrapper}>
            <View style={styles.settingsButtonContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Privacy Settings Screen')}>
                <Feather
                  name={'chevron-left'}
                  size={35}
                  color={colors.text}
                  style={styles.backIcon}
                />
              </TouchableOpacity>
              <Text style={styles.actionButtonText}>Change Pin</Text>
            </View>
            <View style={styles.hl}></View>
            <View></View>
            <View style={styles.sendModalHeader}>
              <Text style={styles.sendModalHeaderText}>
                Enter Your Current Pin
              </Text>
            </View>
            <Text style={styles.directionText}>
              Please enter the 6-digit pin for your account.
            </Text>
          </View>
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
              <Text style={styles.attemptsRemainingText}>
                {numAttempts} attempts remaining.
              </Text>
            </View>
          ) : (
            <View style={styles.loadingAnimationWrapper}>
              <Text style={styles.directionText}>Max attempts reached.</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
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
    hl: {
      marginTop: 10,
      width: '100%',
      height: 3,
      backgroundColor: colors.text_light,
    },
    headerImage: {
      width: 50,
      height: 50,
      marginLeft: 0,
      marginTop: 0,
    },
    header: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      marginBottom: 10,
    },
    headerText: {
      fontSize: 18,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      textAlign: 'right',
      marginTop: 5,
    },
    accountNameText: {
      fontSize: 16,
      color: colors.primary,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      textAlign: 'right',
      marginTop: 10,
    },
    settingsButtonContainer: {
      backgroundColor: colors.bg,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: 20,
      marginTop: 10,
    },
    settingsWrapper: {
      width: '100%',
      paddingHorizontal: 5,
      paddingVertical: 1,
      backgroundColor: colors.bg,
      borderRadius: 10,
    },

    buttonWrapper: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
    },
    actionButtonText: {
      color: colors.text,
      fontSize: 20,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      textAlign: 'center',
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
      justifyContent: 'center',
      alignItems: 'center',
      width: '80%',
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
    },
    addAccountOkButton: {
      width: 160,
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 20,
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
    attemptsRemainingText: {
      fontSize: 18,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaLight',
      marginTop: 20,
      marginBottom: 30,
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
      // backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      borderRadius: 20,
      paddingTop: 10,
      paddingBottom: 10,
    },
  });

export default ChangePinScreen;
