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
import SlideButton from 'rn-slide-button';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useStore from '../../../data/store';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const PaymentSuccessScreen = ({navigation}) => {
  let {sendTransactionDetails, theme, activeAccount} = useStore();

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
            <View style={styles.circle}>
              <Feather
                name={'check'}
                size={50}
                color={colors.bg}
                style={styles.checkIcon}
              />
            </View>
            <Text style={styles.headerText}>Payment Success!</Text>
          </View>
          <View style={styles.transactionCard}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={styles.amount}>
                {sendTransactionDetails.amount}{' '}
              </Text>
              <Text style={styles.amountCurrency}>
                {sendTransactionDetails.currency}
              </Text>
            </View>
            <View style={[styles.horizontalLine, {marginTop: 32}]}></View>
            <Text style={[styles.label, {marginTop: 16}]}>From</Text>
            <Text style={styles.text}>{sendTransactionDetails.from}</Text>
            <Text style={[styles.label, {marginTop: 12}]}>To</Text>
            <Text style={styles.text}>{sendTransactionDetails.to}</Text>
            <Text style={[styles.label, {marginTop: 12}]}>Transaction Fee</Text>
            <Text style={styles.text}>
              {sendTransactionDetails.transactionFee}
            </Text>
            <View style={[styles.horizontalLine, {marginVertical: 16}]}></View>
            <Text style={[styles.label]}>Memo</Text>
            <Text style={styles.text}>{sendTransactionDetails.memo}</Text>
            <Text style={[styles.label, {marginTop: 12}]}>Destination Tag</Text>
            <Text style={styles.text}>
              {sendTransactionDetails.destinationTag}
            </Text>
          </View>
          <View style={styles.visitMarketplace}>
            <TouchableOpacity
              style={styles.visitMarketplaceButton}
              onPress={() => navigation.navigate('Home Screen')}>
              <View style={styles.buttonWrapper}>
                <Text style={styles.actionButtonText}>Back to Home Screen</Text>
                <AntDesign
                  name={'right'}
                  size={20}
                  color={colors.bg}
                  style={styles.visitIcon}
                />
              </View>
            </TouchableOpacity>
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
      paddingHorizontal: 20,
    },
    visitMarketplace: {
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 10,
      position: 'absolute',
      bottom: 10,
    },
    visitMarketplaceButton: {
      width: '100%',
      height: 44,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 8,
      position: 'absolute',
      bottom: 10,
    },
    visitIcon: {
      marginTop: 2,
      marginLeft: 5,
    },
    buttonWrapper: {
      flexDirection: 'row',
    },
    actionButtonText: {
      color: colors.bg,
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    header: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '90%',
      marginTop: 20,
      marginBottom: 20,
    },
    circle: {
      width: 75,
      height: 75,
      borderRadius: 50,
      backgroundColor: colors.secondary,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkIcon: {
      marginTop: 5,
    },
    inputLabelCharacter: {
      fontFamily: 'Helvetica',
    },
    headerText: {
      fontSize: 26,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      alignSelf: 'center',
      marginTop: 30,
    },
    transactionCard: {
      backgroundColor: colors.bg_otp_input,
      borderWidth: 1,
      borderColor: colors.border_gray,
      width: '100%',
      // elevation: 5,
      borderRadius: 20,
      justifyContent: 'space-between',
      flexDirection: 'column',
      paddingVertical: 24,
      paddingHorizontal: 14,
    },
    accountName: {
      fontSize: 22,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '700' : '700',
    },
    accountAddress: {
      fontSize: 12,
      color: colors.text_gray,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '700' : '700',
    },
    amount: {
      fontSize: 36,
      color: '#03F982',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '700' : '700',
    },
    amountCurrency: {
      fontSize: 20,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '700' : '700',
    },
    conversion: {
      marginTop: 4,
      fontSize: 14,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginBottom: 2,
    },
    horizontalLine: {
      width: '100%',
      height: 2,
      backgroundColor: theme === 'dark' ? '#414141' : '#f8f8f8',
    },
    label: {
      fontSize: 12,
      color: colors.text_gray,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    text: {
      fontSize: 12,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginTop: 4,
    },
  });

export default PaymentSuccessScreen;
