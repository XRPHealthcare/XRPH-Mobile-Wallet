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
  TextInput,
  Platform,
} from 'react-native';
import {light, dark} from '../../../assets/colors/colors';
import useStore from '../../../data/store';
import Feather from 'react-native-vector-icons/Feather';
import isValidAddress from '../../HomeScreen/Handlers/validate_address';
import {trigger} from 'react-native-haptic-feedback';

Feather.loadFont();

const InputWalletAddressScreen = ({navigation}) => {
  const {theme, hepticOptions} = useStore();
  const setLoginWalletAddress = useStore(state => state.setLoginWalletAddress);
  const [walletAddress, setWalletAddress] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const saveAddresssAndContinue = () => {
    if (isValidAddress(walletAddress)) {
      setLoginWalletAddress(walletAddress);
      navigation.navigate('Input Padlock Screen');
    } else {
      setErrorMessage('Please enter a valid XRPL wallet address.');
      trigger('impactHeavy', hepticOptions);
    }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.header}>
        <Image
          style={styles.headerImage}
          source={
            theme === 'light'
              ? require('../../../assets/img/header_logo.png')
              : require('../../../assets/img/header_logo_dark.png')
          }
        />
        <Text style={styles.sendModalHeaderText}>
          Connect A Pre-Existing Account
        </Text>
        <Text style={styles.directionText}>
          Please enter the wallet address for your account.
        </Text>
      </View>
      <View style={styles.loadingAnimationWrapper}>
        <TextInput
          style={styles.accountNameInput}
          onChangeText={setWalletAddress}
          value={walletAddress}
          placeholder="Wallet Address"
          placeholderTextColor={colors.text_dark}
        />
        {errorMessage.length > 0 && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Start Screen')}>
            <View style={styles.buttonWrapper}>
              <Feather
                name={'arrow-left'}
                size={25}
                color={colors.text}
                style={styles.continueIcon}
              />
              <Text style={styles.backButtonText}>Back</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addAccountOkButton}
            onPress={saveAddresssAndContinue}>
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
        </View>
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
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: 320,
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
    backButton: {
      width: 100,
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.text_light,
      borderRadius: 20,
    },
    backButtonText: {
      fontSize: 20,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginLeft: 5,
      marginTop: 5,
    },
    headerImage: {
      width: 350,
      height: 65,
      marginTop: 10,
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
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'center',
      marginTop: 50,
    },
    addAccountOkButton: {
      width: 200,
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
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginRight: 20,
      marginTop: 5,
    },
    directionText: {
      fontSize: 18,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanLight',
      marginTop: 30,
      textAlign: 'center',
    },
    buttonWrapper: {
      flexDirection: 'row',
    },
    accountNameInput: {
      height: 40,
      width: 320,
      paddingHorizontal: 10,
      margin: 5,
      backgroundColor: colors.text_light,
      borderColor: colors.primary,
      padding: 10,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      borderRadius: 10,
      paddingTop: 14,
    },
    errorMessage: {
      // backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily: 'LeagueSpartanMedium',
      fontWeight: 'bold',
      borderRadius: 20,
      paddingTop: 10,
      paddingBottom: 10,
    },
  });

export default InputWalletAddressScreen;
