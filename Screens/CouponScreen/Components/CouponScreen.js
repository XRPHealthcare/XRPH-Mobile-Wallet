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
import {WebView} from 'react-native-webview';
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
  CVSDarkIcon,
  CVSLightIcon,
  KrogerDarkIcon,
  KrogerLightIcon,
  LogoBgIcon,
  PharmaDarkIcon,
  PharmaLightIcon,
  RiteAidDarkIcon,
  RiteAidLightIcon,
  SafewayDarkIcon,
  SafewayLightIcon,
  WalgererDarkIcon,
  WalgererLightIcon,
  WalmartDarkIcon,
  WalmartLightIcon,
  WeisDarkIcon,
  WeisLightIcon,
} from '../../../assets/img/new-design';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const CouponScreen = ({navigation}) => {
  const {activeAccount, theme} = useStore();

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors, theme);

  const COUPON_SUPPORTED_PHARMACIES = [
    {
      name: 'cvs',
      light: <CVSLightIcon />,
      dark: <CVSDarkIcon />,
    },
    {
      name: 'walgreens',
      light: <WalgererLightIcon />,
      dark: <WalgererDarkIcon />,
    },
    {
      name: 'walmart',
      light: <WalmartLightIcon />,
      dark: <WalmartDarkIcon />,
    },
    {
      name: 'safeway',
      light: <SafewayLightIcon />,
      dark: <SafewayDarkIcon />,
    },
    {
      name: 'pharma',
      light: (
        <Image
          source={require('../../../assets/img/new-design/coupon/pharma-light.png')}
          style={styles.pharmaIcon}
        />
      ),
      dark: (
        <Image
          source={require('../../../assets/img/new-design/coupon/pharma-dark.png')}
          style={styles.pharmaIcon}
        />
      ),
    },
    {
      name: 'Kroger',
      light: <KrogerLightIcon />,
      dark: <KrogerDarkIcon />,
    },
    {
      name: 'rite-aid',
      light: <RiteAidLightIcon />,
      dark: <RiteAidDarkIcon />,
    },
    {
      name: 'weis',
      light: <WeisLightIcon />,
      dark: <WeisDarkIcon />,
    },
  ];
  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />
        <View style={styles.bg}>
          <View style={styles.header}>
            <View
              style={[
                styles.row,
                {
                  gap: 8,
                },
              ]}>
              <Image
                style={styles.headerImage}
                source={require('../../../assets/img/hero.png')}
              />
              <Text style={styles.headerText}>
                XRPH Prescription Savings Card
              </Text>
            </View>
            <View style={[styles.prescription_card]}>
              <Image
                style={styles.prescription_card_img}
                source={require('../../../assets/img/new-design/xrph-card.png')}
              />
              <Text style={styles.card_id}>
                {activeAccount.prescription_card?.id}
              </Text>
              <Text style={styles.card_bin}>
                {activeAccount.prescription_card?.bin}
              </Text>
              <Text style={styles.card_group}>
                {activeAccount.prescription_card?.group}
              </Text>
            </View>
            <LogoBgIcon style={styles.heroBgLogo} />
          </View>
          <View style={styles.pharmaWrapper}>
            <View style={styles.buttonWrapper}>
              <Feather
                name={'check'}
                size={20}
                color={colors.primary}
                style={styles.fingerIcon}
              />
              <Text style={styles.pharmatext}>
                XRPH Prescription Savings Card will save you up to 80
                <Text style={styles.otherChar}>%</Text> on your prescriptions
                and medications with unlimited use.
              </Text>
            </View>
            <View style={styles.buttonWrapper}>
              <Feather
                name={'check'}
                size={20}
                color={colors.primary}
                style={styles.fingerIcon}
              />
              <Text style={styles.pharmatext}>
                Receive XRPH rewards each time your card is used at 68,000+
                pharmacies across the US, including CVS, Walgreens, and Walmart.
              </Text>
            </View>
          </View>
          <Image
            source={require('../../../assets/img/new-design/bg-gradient.png')}
            style={styles.greenShadow}
          />

          <ScrollView>
            <View style={styles.brandsWrapper}>
              {COUPON_SUPPORTED_PHARMACIES.map((pharmacy, index) => (
                <View key={index} style={styles.brandsImage}>
                  {pharmacy[theme]}
                </View>
              ))}
            </View>
          </ScrollView>
          <Text style={styles.moretext}>And many more...</Text>
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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
    },
    headerImage: {
      width: 50,
      height: 50,
      marginLeft: 0,
      marginTop: 0,
    },
    header: {
      width: '100%',
      paddingHorizontal: 20,
      paddingTop: 29,
      paddingBottom: 19,
      flexDirection: 'column',
      gap: 24,
      backgroundColor:
        theme === 'dark'
          ? 'rgba(26, 26, 26, 0.77)'
          : 'rgba(255, 255, 255, 0.77)',
      borderBottomEndRadius: 40,
      borderBottomStartRadius: 40,
    },
    heroBgLogo: {
      position: 'absolute',
      right: 0,
      marginRight: -10,
      top: 60,
    },
    headerText: {
      fontSize: 14,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '700' : '700',
    },
    prescription_card: {
      position: 'relative',
    },
    prescription_card_img: {
      width: '100%',
      height: 250,
      objectFit: 'contain',
    },
    accountNameText: {
      fontSize: 16,
      color: colors.primary,
      fontFamily:
        Platform.OS === 'ios'
          ? 'LeagueSpartanMedium-Light'
          : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginTop: 10,
      textAlign: 'right',
    },
    pharmaIcon: {
      height: 45,
      width: 98.88,
    },
    greenShadow: {
      position: 'absolute',
      top: 0,
      zIndex: -1,
      marginTop: -100,
    },
    pharmatext: {
      fontSize: 12,
      color: theme === 'dark' ? '#f8f8f8' : '#636363',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginBottom: 10,
      textAlign: 'left',
      width: '90%',
    },
    moretext: {
      fontSize: 14,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      //   marginTop: 10,
      marginBottom: 5,
      textAlign: 'center',
      width: '100%',
    },
    otherChar: {
      fontFamily: 'Helvetica',
    },
    couponWrapper: {
      width: '100%',
      marginTop: 30,
      backgroundColor: colors.primary,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      elevation: 10,
    },
    brandsWrapper: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 8,
      paddingHorizontal: 20,
      marginTop: 24,
    },
    brandsImage: {
      // width: '100%',
      // aspectRatio: 2,
    },
    pharmaWrapper: {
      width: '100%',
      marginTop: 24,
      // backgroundColor: colors.bg_gray,
      borderRadius: 10,
      paddingHorizontal: 20,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    couponImage: {
      width: '100%',
      aspectRatio: 1.7,
      // height: 100
      // flex: 1
    },
    pharmacies: {
      width: 225,
      height: 280,
    },
    card_id: {
      position: 'absolute',
      top: 86,
      left: 80,
      fontSize: 12,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: '#000000',
    },
    card_bin: {
      position: 'absolute',
      top: 112,
      left: 80,
      fontSize: 12,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: '#000000',
    },
    card_group: {
      position: 'absolute',
      top: 138,
      left: 80,
      fontSize: 12,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: '#000000',
    },
    buttonWrapper: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    imageRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      marginBottom: 10,
    },
    cvsImage: {
      width: 120,
      height: 50,
    },
    walgreensImage: {
      width: 110,
      height: 25,
      marginLeft: -10,
    },
    walmartImage: {
      width: 140,
      height: 50,
    },
    weisImage: {
      width: 110,
      height: 40,
    },
    safewayImage: {
      width: 140,
      height: 25,
    },
    snsImage: {
      width: 120,
      height: 36,
    },
    krogerImage: {
      width: 53,
      height: 40,
    },
    riteaidImage: {
      width: 46,
      height: 40,
    },
  });

export default CouponScreen;
