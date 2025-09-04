import React, {useState} from 'react';

import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  TextInput,
  Image,
  ImageBackground,
} from 'react-native';

import _ from 'lodash';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useStore from '../../../data/store';
// import getTotalBalances from '../../Pin/Handlers/get_total_balances';
import checkConnectionStatus from '../../StartScreen/Handlers/xrpl_connection_status';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import {trigger} from 'react-native-haptic-feedback';
import PendingTouch from '../../../assets/img/pending-touch.svg';
import {switchRPC} from '../../HomeScreen/Handlers/switch_rpc';

const xrpl = require('xrpl');

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const BiometricScreen = ({route, navigation}) => {
  let {activeAccount, theme, hepticOptions, node, rpcUrls} = useStore();
  const rnBiometrics = new ReactNativeBiometrics();

  const setToken = useStore(state => state.setToken);
  const setNode = useStore(state => state.setNode);
  const [isConnected, setIsConnected] = React.useState(false);
  const [isAmountRequest, setIsAmountRequest] = useState(false);

  const [step, setStep] = React.useState(1);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const detectConnection = rpcNode => {
    checkConnectionStatus(rpcNode).then(res => {
      if (res) {
        setIsConnected(true);
        console.log('connected');
      } else {
        setIsConnected(false);
        // switchRPC(rpcNode, rpcUrls).then(res => {
        //   setNode(res);
        //   detectConnection(res);
        // });
        console.log('not connected');
      }
    });
  };

  React.useEffect(() => {
    if (activeAccount.balances.length > 0) {
      console.log('setTOken in biometric screen');
      setToken(activeAccount.balances[0]);
    }

    detectConnection(node);
  }, []);

  const enableBioMetric = () => {
    rnBiometrics.createKeys().then(resultObject => {
      const {publicKey} = resultObject;
      trigger('impactHeavy', hepticOptions);
      if (publicKey) {
        goToHome();
      }
    });
  };

  goToHome = () => {
    navigation.navigate('Home Screen');
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />
        <View style={styles.bg}>
          <Text style={styles.title}>XRPH</Text>
          <View>
            <PendingTouch height={120} width={120} style={styles.touch} />
            <Text style={styles.question}>Use Face ID or Touch ID?</Text>
            <Text style={styles.description}>
              To make your account safer, you can activate the Biometric
              Authentication (FaceID / TouchID).
            </Text>
          </View>
          <View>
            <TouchableOpacity onPress={enableBioMetric}>
              <ImageBackground
                source={require('../../../assets/img/bg-gradient.png')}
                resizeMode="cover"
                style={{
                  marginTop: 20,
                  borderRadius: 20,
                }}>
                <View style={styles.buttonPrimary}>
                  <Text style={styles.buttonTextPrimary}>Yes</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonSecondary} onPress={goToHome}>
              <Text style={styles.buttonTextSecondary}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styling = colors =>
  StyleSheet.create({
    safeView: {
      backgroundColor: colors.bg,
    },
    bg: {
      backgroundColor: colors.bg,
      //   alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingBottom: 80,
    },
    title: {
      textAlign: 'center',
      marginTop: 20,
      color: colors.text,
      fontSize: 28,
      fontWeight: '700',
    },
    touch: {
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: 20,
    },
    question: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
      marginTop: 50,
      textAlign: 'center',
    },
    description: {
      color: colors.light_text,
      fontSize: 14,
      fontWeight: '400',
      marginTop: 12,
      textAlign: 'center',
    },
    buttonPrimary: {
      borderRadius: 10,
      height: 50,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonSecondary: {
      backgroundColor: colors.light_gray_bg,
      borderRadius: 10,
      height: 50,
      marginTop: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonTextPrimary: {
      color: colors.bg,
      fontSize: 18,
      fontWeight: '500',
    },
    buttonTextSecondary: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '500',
    },
  });

export default BiometricScreen;
