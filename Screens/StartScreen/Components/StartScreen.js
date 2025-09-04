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
} from 'react-native';
import SlideButton from 'rn-slide-button';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {light, dark} from '../../../assets/colors/colors';
import useStore from '../../../data/store';
import checkConnectionStatus from '../Handlers/xrpl_connection_status';
import RNExitApp from 'react-native-exit-app';
import {switchRPC} from '../../HomeScreen/Handlers/switch_rpc';

AntDesign.loadFont();
Feather.loadFont();
MaterialCommunityIcons.loadFont();

const StartScreen = ({navigation}) => {
  const {theme, accounts, node, rpcUrls} = useStore();
  const setNode = useStore(state => state.setNode);

  const [isConnected, setIsConnected] = React.useState(true);

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
        // switchRPC(node, rpcUrls).then(res => {
        //   setNode(res);
        //   detectConnection(res);
        // });
        setIsConnected(false);
        console.log('not connected');
      }
    });
  };

  React.useEffect(() => {
    detectConnection(node);
  }, []);

  const gestureEndListener = () => {
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
  }, [accounts]);

  return (
    <GestureHandlerRootView>
      <StatusBar />
      <ScrollView contentContainerStyle={styles.bg}>
        {accounts.length > 0 && (
          <View style={styles.settingsButtonContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Home Screen')}
              style={{marginTop: 20}}>
              <Feather name={'chevron-left'} size={35} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}
        <Image
          style={styles.introImage}
          source={
            theme === 'light'
              ? require('../../../assets/img/intro_logo.png')
              : require('../../../assets/img/intro_logo_dark.png')
          }
        />
        {isConnected && (
          <View style={styles.slideButtonContainer}>
            <TouchableOpacity
              style={styles.buttonConnect}
              onPress={() => navigation.navigate('Input Padlock Screen')}>
              <View style={styles.buttonWrapper}>
                <Text style={styles.buttonConnectText}>
                  Connect Existing Account
                </Text>
                <MaterialCommunityIcons
                  name={'cube-send'}
                  size={30}
                  color={colors.bg}
                  style={styles.continueIcon}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonCreate}
              onPress={() => navigation.navigate('Padlock Initial Screen')}>
              <View style={styles.buttonWrapper}>
                <Text style={styles.buttonCreateText}>Create New Account</Text>
                <MaterialCommunityIcons
                  name={'cube-scan'}
                  size={30}
                  color={colors.bg}
                  style={styles.continueIcon}
                />
              </View>
            </TouchableOpacity>
          </View>
        )}
        {!isConnected && (
          <View style={styles.slideButtonContainer}>
            <Text style={styles.errorMessageText}>
              Error: Cannot connect to the Rippled server. Please make sure you
              are connected to wifi.
            </Text>
            <TouchableOpacity
              style={styles.buttonConnect}
              onPress={() => detectConnection(node)}>
              <View style={styles.buttonWrapper}>
                <Text style={styles.buttonConnectText}>Retry</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
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
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    settingsButtonContainer: {
      position: 'absolute',
      left: 0,
      marginLeft: 5,
      marginTop: 10,
    },
    introImage: {
      width: 366,
      height: 200,
      marginTop: 130,
    },
    slideButtonContainer: {
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 10,
      paddingBottom: 10,
    },
    slideButtonThumbStyle: {
      borderRadius: 10,
      backgroundColor: colors.bg,
      width: 80,
      elevation: 0,
    },
    slideButtonContainerStyle: {
      backgroundColor: colors.text_light,
      borderRadius: 10,
      elevation: 0,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    slideButtonUnderlayStyle: {
      backgroundColor: colors.text_light,
    },
    slideButtonTitleStyle: {
      fontSize: 20,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    buttonConnect: {
      width: '100%',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.text,
      borderRadius: 10,
      paddingVertical: 18,
      paddingHorizontal: 10,
      marginBottom: 10,
    },
    buttonCreate: {
      width: '100%',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 18,
      paddingHorizontal: 10,
      marginBottom: 12,
    },
    buttonConnectText: {
      fontSize: 18,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    buttonCreateText: {
      fontSize: 18,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    buttonWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    continueIcon: {
      marginLeft: 20,
    },
    backIcon: {
      marginRight: 10,
    },
    errorMessageText: {
      backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily: 'LeagueSpartanMedium',
      fontWeight: 'bold',
      borderRadius: 20,
      padding: 10,
      marginBottom: 10,
      marginTop: 10,
      width: '100%',
    },
  });

export default StartScreen;
