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
import Navbar from '../../../components/Navbar';

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

  const styles = styling(colors);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />
        <View style={styles.bg}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image
                style={styles.headerImage}
                source={require('../../../assets/img/hero.png')}
              />
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.headerText}>
                XRPH Prescription Savings Card
              </Text>
              <Text style={styles.accountNameText}>{activeAccount.name}</Text>
            </View>
          </View>

          <View style={styles.couponWrapper}>
            <Image
              style={styles.couponImage}
              source={require('../../../assets/img/blank_coupon.png')}
            />
          </View>
          <Text style={styles.card_id}>
            {activeAccount.prescription_card.id}
          </Text>
          <Text style={styles.card_bin}>
            {activeAccount.prescription_card.bin}
          </Text>
          <Text style={styles.card_group}>
            {activeAccount.prescription_card.group}
          </Text>

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

          <ScrollView>
            <View style={styles.imageRow}>
              <Image
                style={styles.cvsImage}
                source={require('../../../assets/img/cvs_logo.png')}
              />
              <Image
                style={styles.walgreensImage}
                source={require('../../../assets/img/walgreens_logo.png')}
              />
              <Image
                style={styles.walmartImage}
                source={require('../../../assets/img/walmart_logo.png')}
              />
            </View>
            <View style={styles.imageRow}>
              {theme === 'light' ? (
                <Image
                  style={styles.safewayImage}
                  source={require('../../../assets/img/safeway_logo_dark.png')}
                />
              ) : (
                <Image
                  style={styles.safewayImage}
                  source={require('../../../assets/img/safeway_logo.png')}
                />
              )}
              <Image
                style={styles.snsImage}
                source={require('../../../assets/img/stopandshop_logo.png')}
              />
            </View>
            <View style={styles.imageRow}>
              <Image
                style={styles.krogerImage}
                source={require('../../../assets/img/kroger_logo.png')}
              />
              <Image
                style={styles.riteaidImage}
                source={require('../../../assets/img/riteaid_logo.png')}
              />
              <Image
                style={styles.weisImage}
                source={require('../../../assets/img/weis_logo.png')}
              />
            </View>
          </ScrollView>
          <Text style={styles.moretext}>And many more...</Text>
          <Navbar activeIcon="coupon" navigation={navigation} />
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
      paddingHorizontal: 10,
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
      fontFamily: Platform.OS === 'ios' ? 'NexaLight' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      textAlign: 'right',
      marginTop: 5,
    },
    accountNameText: {
      fontSize: 16,
      color: colors.primary,
      fontFamily: Platform.OS === 'ios' ? 'NexaLight' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginTop: 10,
      textAlign: 'right',
    },
    pharmatext: {
      fontSize: 14,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaLight' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginBottom: 10,
      textAlign: 'left',
      width: '90%',
    },
    moretext: {
      fontSize: 16,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaLight' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      //   marginTop: 10,
      marginBottom: -5,
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
    pharmaWrapper: {
      width: '100%',
      marginTop: 20,
      marginBottom: 10,
      backgroundColor: colors.bg,
      borderRadius: 10,
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
      top: 182,
      left: 80,
      fontSize: 18,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: '#000000',
    },
    card_bin: {
      position: 'absolute',
      top: 208,
      left: 80,
      fontSize: 18,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: '#000000',
    },
    card_group: {
      position: 'absolute',
      top: 235,
      left: 80,
      fontSize: 18,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: '#000000',
    },
    buttonWrapper: {
      flexDirection: 'row',
      width: '95%',
    },
    fingerIcon: {
      marginRight: 10,
    },
    imageRow: {
      width: '110%',
      marginLeft: '-8%',
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
