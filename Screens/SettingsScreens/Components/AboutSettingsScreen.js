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
  Pressable,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useStore from '../../../data/store';
import {
  ArrowSqrLeftBlackIcon,
  ArrowSqrLeftWhiteIcon,
} from '../../../assets/img/new-design';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const AboutSettingsScreen = ({navigation}) => {
  const {activeAccount, theme} = useStore();

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors, theme);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />
        <View style={styles.bg}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.navigate('Settings Screen')}>
              {theme === 'dark' ? (
                <ArrowSqrLeftWhiteIcon />
              ) : (
                <ArrowSqrLeftBlackIcon />
              )}
            </Pressable>
            <Text style={styles.headerHeading}>About</Text>
            <Text style={{width: 20}}></Text>
          </View>
          <Image
            source={require('../../../assets/img/new-design/bg-gradient.png')}
            style={styles.greenShadow}
          />

          <ScrollView style={styles.settingsWrapper}>
            <View style={styles.settingLong}>
              <Text style={styles.label}>
                The XRP Healthcare Decentralized Mobile Wallet is a
                non-custodial wallet backed by the XRP Ledger. This gives our
                users complete control over their wallet - making sure every
                transaction is completely safe, secure, and anonymous.
              </Text>
            </View>
            <View style={[styles.settingLong, {marginTop: 20}]}>
              <Text style={styles.label}>
                The first Pharma and Healthcare platform to be built on the XRP
                Ledger. XRP Healthcare (XRPH) is an innovative, scalable
                solutions company utilizing Web3 technology to revolutionize the
                way people access and afford healthcare services globally.
              </Text>
            </View>
          </ScrollView>
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
    backButton: {
      width: 50,
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    textAndIconWrapper: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      width: '50%',
    },
    setting: {
      width: '100%',
      height: 50,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    settingText: {
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    settingTextLong: {
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanLight',
      marginTop: 5,
      marginBottom: 5,
    },
    spacer: {
      width: 50,
    },
    hl: {
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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
    },
    label: {
      fontSize: 12,
      fontWeight: '500',
      color: theme === 'dark' ? '#F8F8F8' : '#636363',
    },
    value: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    settingCard: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#414141' : '#ededed',
      backgroundColor: theme === 'dark' ? '#202020' : '#fff',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 14,
      zIndex: 1000,
    },
    headerText: {
      fontSize: 18,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      textAlign: 'right',
      marginTop: 5,
    },
    accountNameText: {
      fontSize: 16,
      color: colors.primary,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginTop: 10,
      textAlign: 'right',
    },
    greenShadow: {
      position: 'absolute',
      top: 0,
      zIndex: -1,
      marginTop: -250,
    },
    settingsWrapper: {
      width: '100%',
      paddingHorizontal: 20,
      paddingVertical: 24,
      // backgroundColor: colors.bg_gray,
      borderRadius: 10,
    },
    settingsButtonContainer: {
      // width: '107%',
      backgroundColor: colors.bg,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginBottom: 10,
      gap: 20,
    },
    settingsButton: {
      width: '100%',
      backgroundColor: colors.bg,
      height: 50,
      flexDirection: 'row',
    },
    buttonWrapper: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
    },
    actionButtonText: {
      color: colors.text,
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      textAlign: 'center',
    },
    backIcon: {
      marginLeft: -10,
    },

    visitIcon: {
      position: 'absolute',
      right: 0,
    },
    securityIcon: {
      marginLeft: 5,
      marginRight: 25,
    },
    supportIcon: {
      marginLeft: 1,
      marginRight: 22,
    },
    aboutIcon: {
      marginLeft: 3,
      marginRight: 22,
    },
  });

export default AboutSettingsScreen;
