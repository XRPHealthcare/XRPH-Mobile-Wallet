import React from 'react';

import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  Linking,
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
import UpdateIco from '../../../assets/img/update-ico.svg';
import UpdateIcoD from '../../../assets/img/update-ico-d.svg';
import LinearGradient from 'react-native-linear-gradient';
import RNExitApp from 'react-native-exit-app';

const xrpl = require('xrpl');

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const ForceUpdateScreen = ({route, navigation}) => {
  let {theme, appInfo} = useStore();

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const gestureEndListener = e => {
    if (
      e?.data?.action?.type === 'GO_BACK' ||
      e?.data?.action?.type === 'POP'
    ) {
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
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />
        <View style={styles.bg}>
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 52,
            }}>
            <Image
              source={require('../../../assets/img/hero.png')}
              style={styles.logo}
            />
            <View
              style={{
                marginTop: 15,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: theme === 'dark' ? '#fff' : '#000',
                  fontSize: 16,
                  fontWeight: Platform.OS === 'ios' ? 'semibold' : '600',
                }}>
                XRPH{' '}
              </Text>
              <Text
                style={{
                  color: theme === 'dark' ? '#fff' : '#000',
                  fontSize: 16,
                  fontWeight: Platform.OS === 'ios' ? 'semibold' : '600',
                }}>
                Wallet
              </Text>
            </View>
          </View>

          <View>
            {theme === 'dark' ? (
              <UpdateIcoD
                height={70}
                width={70}
                style={{marginLeft: 'auto', marginRight: 'auto'}}
              />
            ) : (
              <UpdateIco
                height={70}
                width={70}
                style={{marginLeft: 'auto', marginRight: 'auto'}}
              />
            )}
            <Text
              style={[
                styles.question,
                {
                  maxWidth: 240,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                },
              ]}>
              A new version of XRPH app is available
            </Text>
            <Text
              style={[
                styles.description,
                {
                  color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#8F92A1',
                  maxWidth: 320,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                },
              ]}>
              {appInfo?.msg}
            </Text>
          </View>
          <View>
            <Text
              style={[
                styles.description,
                {color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#8F92A1'},
              ]}>
              Latest Version{' '}
              {Platform.OS === 'ios'
                ? appInfo?.ios_version
                : appInfo?.android_version}
            </Text>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Linking.openURL(
                    'https://apps.apple.com/pk/app/xrph-wallet/id6451218628',
                  );
                } else {
                  Linking.openURL(
                    'https://play.google.com/store/apps/details?id=com.xrphwallet',
                  );
                }
              }}>
              <LinearGradient
                colors={['#37C3A6', '#AF45EE']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.submitGradient}>
                <Text style={styles.submitButtonText}>Get it now</Text>
              </LinearGradient>
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
      paddingBottom: 30,
    },
    logo: {
      height: 56,
      width: 56,
    },
    question: {
      color: colors.dark_text,
      fontSize: 24,
      fontWeight: Platform.OS === 'ios' ? 'semibold' : '600',
      marginTop: 24,
      textAlign: 'center',
      maxWidth: 255,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    description: {
      fontSize: 14,
      fontWeight: Platform.OS === 'ios' ? 'normal' : '400',
      marginTop: 16,
      textAlign: 'center',
    },
    submitButton: {
      width: '100%',
      borderRadius: 10,
      height: 58,
      marginTop: 24,
    },
    submitGradient: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButtonText: {
      fontSize: 18,
      fontWeight: Platform.OS === 'ios' ? 'medium' : '500',
      color: '#fff',
    },
  });

export default ForceUpdateScreen;
