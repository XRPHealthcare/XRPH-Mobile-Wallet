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
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import _ from 'lodash';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import {light, dark} from '../../../assets/colors/padlockColors';
import useStore from '../../../data/store';
import {WebView} from 'react-native-webview';
import RNExitApp from 'react-native-exit-app';

AntDesign.loadFont();
Feather.loadFont();

const PrivacyPolicyScreen = ({navigation}) => {
  const {theme, accounts} = useStore();
  const [checked1, setChecked1] = React.useState(false);
  const [checked2, setChecked2] = React.useState(false);
  const [isDisabled, setDisabled] = React.useState(true);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const check1 = newValue => {
    setChecked1(newValue);
    if (checked2 && newValue) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  };

  const check2 = newValue => {
    setChecked2(newValue);
    if (checked1 && newValue) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  };

  const gestureEndListener = () => {
    console.log('------this function was called 0', accounts);
    if (accounts.length === 0) {
      RNExitApp.exitApp();
    }
  };
  React.useEffect(() => {
    const gestureHandler = navigation.addListener(
      'beforeRemove',
      gestureEndListener,
    );
    return gestureHandler;
  }, []);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg, height: '100%'}}>
        <StatusBar />
        <View style={styles.bg}>
          <Image
            style={styles.headerImage}
            source={
              theme === 'light'
                ? require('../../../assets/img/header_logo.png')
                : require('../../../assets/img/header_logo_dark.png')
            }
          />
        </View>
        <ScrollView contentContainerStyle={styles.webviewWrapper}>
          <WebView
            source={{
              uri: 'https://app.termly.io/document/privacy-policy/009bdc0b-42be-4fa8-932e-b7e233e467f9',
            }}
            style={{height: 1000}}
          />
        </ScrollView>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={{
              borderColor: checked1 ? '#08F685' : '#eeeeee',
              borderWidth: 3,
              backgroundColor: colors.bg,
              width: 32,
              height: 32,
              borderRadius: 16,
            }}
            onPress={() => check1(!checked1)}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
              }}>
              <Feather
                name={'check'}
                size={20}
                color={checked1 ? '#08F685' : colors.bg}
                style={styles.fingerIcon}
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.ppText}>
            I acknowledge that I have read the Privacy Policy.
          </Text>
        </View>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={{
              borderColor: checked2 ? '#08F685' : '#eeeeee',
              borderWidth: 3,
              backgroundColor: colors.bg,
              width: 32,
              height: 32,
              borderRadius: 16,
            }}
            onPress={() => check2(!checked2)}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
              }}>
              <Feather
                name={'check'}
                size={20}
                color={checked2 ? '#08F685' : colors.bg}
                style={styles.fingerIcon}
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.ppText}>
            I acknowledge that I agree to the Privacy Policy.
          </Text>
        </View>
        <View style={styles.slideButtonContainer}>
          {/* <TouchableOpacity style={styles.buttonConnect} onPress={() => navigation.navigate('Start Screen')}>
                      <View style={styles.buttonWrapper}>
                          <Text style={styles.buttonConnectText}>Back</Text>
                      </View>
                  </TouchableOpacity>  */}
          <TouchableOpacity
            style={{
              backgroundColor: isDisabled
                ? colors.text_light
                : colors.secondary,
              width: '100%',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center',
              borderRadius: 10,
              paddingVertical: 18,
              paddingHorizontal: 10,
              marginBottom: 10,
            }}
            onPress={() => navigation.navigate('Start Screen')}
            disabled={isDisabled}>
            <View style={styles.buttonWrapper}>
              <Text style={styles.buttonCreateText}>Continue</Text>
              <AntDesign
                name={'arrowright'}
                size={30}
                color={colors.text}
                style={styles.continueIcon}
              />
            </View>
          </TouchableOpacity>
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
      justifyContent: 'space-between',
      // height: '100%',
      paddingHorizontal: 10,
    },
    headerImage: {
      width: 350,
      height: 65,
      marginTop: 10,
      marginBottom: 10,
      marginLeft: -20,
    },
    directionsContainer: {
      marginTop: 20,
      width: '100%',
      flex: 1,
      paddingHorizontal: 10,
    },
    welcomeText: {
      fontSize: 42,
      color: colors.text,
      marginBottom: -10,
    },
    ppText: {
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanLight',
      fontSize: 12,
      marginRight: 20,
      marginLeft: 20,
      marginTop: 8,
      color: colors.text,
    },
    directionText: {
      fontSize: 18,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanLight',
      marginTop: 5,
    },
    note: {
      fontWeight: 'bold',
    },
    padlockBottom: {
      height: 6,
    },
    padlock: {
      backgroundColor: colors.text_light,
      borderRadius: 10,
      width: '95%',
      alignItems: 'center',
      justifyContent: 'space-evenly',
    },
    slideButtonContainer: {
      // alignSelf: 'flex-end',
      width: '100%',
      paddingHorizontal: 10,
      paddingBottom: 10,
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxContainer: {
      alignSelf: 'flex-end',
      width: '100%',
      paddingHorizontal: 10,
      paddingVertical: 5,
      flexDirection: 'row',
    },
    slideButtonThumbStyle: {
      borderRadius: 10,
      backgroundColor: colors.bg,
      width: 80,
      elevation: 0,
    },
    slideButtonContainerStyle: {
      backgroundColor: colors.text_light,
      borderRadius: 20,
      elevation: 0,
    },
    slideButtonUnderlayStyle: {
      backgroundColor: colors.secondary,
      borderRadius: 10,
    },
    slideButtonTitleStyle: {
      marginLeft: 20,
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.bg,
    },
    inputLabelCharacter: {
      fontFamily: 'Helvetica',
    },
    addAccountModalWrapper: {
      backgroundColor: colors.bg,
      width: '90%',
      height: 330,
      marginLeft: '5%',
      // marginBottom: 100,
      marginTop: 40,
      elevation: 5,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    addAccountModalActionsWrapper: {
      paddingHorizontal: 10,
      width: '100%',
      // justifyContent: 'space-evenly',
      flexDirection: 'column',
      alignItems: 'center',
    },
    addAccountModalDirections: {
      textAlign: 'right',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      // marginBottom: 20
    },
    addAccountActionButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
      marginTop: 10,
      marginLeft: 10,
    },
    addAccountOkButton: {
      width: 200,
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 20,
      marginBottom: 10,
    },
    addAccountBackButton: {
      width: 200,
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.text_dark,
      borderRadius: 20,
      marginBottom: 10,
    },
    addAccountOkButtonText: {
      textAlign: 'center',
      fontSize: 20,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginRight: 20,
    },
    sendModalHeader: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 10,
    },
    sendModalHeaderSpacer: {
      width: 10,
    },
    sendModalHeaderText: {
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'center',
    },
    accountNameInput: {
      height: 40,
      width: '100%',
      paddingHorizontal: 10,
      margin: 10,
      backgroundColor: colors.text_light,
      borderColor: colors.primary,
      padding: 10,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      borderRadius: 10,
    },
    addAccountModalDirections: {
      width: '100%',
      textAlign: 'left',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginBottom: 5,
      marginTop: 20,
    },
    buttonWrapper: {
      flexDirection: 'row',
    },
    buttonConnect: {
      width: '48%',
      marginRight: '4%',
      height: 80,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.text_light,
      borderRadius: 20,
      marginBottom: 10,
    },
    buttonCreate: {},
    buttonConnectText: {
      fontSize: 20,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    buttonCreateText: {
      fontSize: 20,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    buttonWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    continueIcon: {
      marginLeft: 10,
    },
    errorMessage: {
      marginBottom: 80,
      padding: 10,
      backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily: 'LeagueSpartanMedium',
      fontWeight: 'bold',
      borderRadius: 20,
    },
    errorMessageText: {
      backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily: 'LeagueSpartanMedium',
      fontWeight: 'bold',
      borderRadius: 20,
      padding: 10,
      marginBottom: 10,
      width: '100%',
    },
  });

export default PrivacyPolicyScreen;
