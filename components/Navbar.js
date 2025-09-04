import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';

import {light, dark} from '../assets/colors/colors';
import useStore from '../data/store';
import {trigger} from 'react-native-haptic-feedback';
import {
  CardActiveDarkIcon,
  CardActiveIcon,
  CardInActiveIcon,
  HomeActiveDarkIcon,
  HomeActiveIcon,
  HomeInactiveIcon,
  SettingActiveDarkIcon,
  SettingActiveIcon,
  SettingInActiveIcon,
  TransactionActiveDarkIcon,
  TransactionActiveIcon,
  TransactionInactiveIcon,
  WalletActiveDarkIcon,
  WalletActiveIcon,
  WalletInactiveIcon,
} from '../assets/img/new-design';
const Navbar = props => {
  const {theme, hepticOptions} = useStore();
  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  return (
    <View style={styles.navigationButtons}>
      <View style={styles.navigationButton}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => {
            trigger('impactMedium', hepticOptions);
            props.navigation.navigate('Home Screen');
          }}>
          <View style={styles.buttonWrapper}>
            {props.activeIcon == 'home' ? (
              theme === 'dark' ? (
                <HomeActiveDarkIcon style={styles.stakeIcon} />
              ) : (
                <HomeActiveIcon style={styles.stakeIcon} />
              )
            ) : (
              <HomeInactiveIcon style={styles.stakeIcon} />
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.navigationButton}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => {
            trigger('impactMedium', hepticOptions);
            props.navigation.navigate('Wallet Screen');
          }}>
          <View style={styles.buttonWrapper}>
            {props.activeIcon == 'wallet' ? (
              theme === 'dark' ? (
                <WalletActiveDarkIcon style={styles.stakeIcon} />
              ) : (
                <WalletActiveIcon style={styles.stakeIcon} />
              )
            ) : (
              <WalletInactiveIcon style={styles.stakeIcon} />
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.navigationButton}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => {
            trigger('impactMedium', hepticOptions);
            props.navigation.navigate('Transactions Screen');
          }}>
          <View style={styles.buttonWrapper}>
            {props.activeIcon == 'transactions' ? (
              theme === 'dark' ? (
                <TransactionActiveDarkIcon style={styles.stakeIcon} />
              ) : (
                <TransactionActiveIcon style={styles.stakeIcon} />
              )
            ) : (
              <TransactionInactiveIcon style={styles.stakeIcon} />
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.navigationButton}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => {
            trigger('impactMedium', hepticOptions);
            props.navigation.navigate('Coupon Screen');
          }}>
          <View style={styles.buttonWrapper}>
            {props.activeIcon == 'coupon' ? (
              theme === 'dark' ? (
                <CardActiveDarkIcon style={styles.stakeIcon} />
              ) : (
                <CardActiveIcon style={styles.stakeIcon} />
              )
            ) : (
              <CardInActiveIcon style={styles.stakeIcon} />
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.navigationButton}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => {
            trigger('impactMedium', hepticOptions);
            props.navigation.navigate('Settings Screen');
          }}>
          <View style={styles.buttonWrapper}>
            {props.activeIcon == 'settings' ? (
              theme === 'dark' ? (
                <SettingActiveDarkIcon style={styles.stakeIcon} />
              ) : (
                <SettingActiveIcon style={styles.stakeIcon} />
              )
            ) : (
              <SettingInActiveIcon style={styles.stakeIcon} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styling = colors =>
  StyleSheet.create({
    navigationButtons: {
      width: '100%',
      paddingVertical: 16,
      paddingHorizontal: 24,
      gap: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      backgroundColor: 'red',
      marginTop: 5,
      boxShadow: '0px -2px 22.6px 0px rgba(0, 0, 0, 0.03)',
    },
    navigationButton: {
      width: 50,
      height: 35,
      marginBottom: 5,
      backgroundColor: 'transparent',
    },
    transactionIcon: {
      marginTop: 14,
      marginLeft: 10,
    },
    exchangeIcon: {
      marginTop: 4,
      marginLeft: 10,
    },
    homeIcon: {
      marginTop: 0,
      marginLeft: 5,
    },
    stakeIcon: {
      marginTop: 10,
      marginLeft: 10,
    },
    couponIcon: {
      marginTop: 3,
      marginLeft: 10,
    },
    settingsIcon: {
      marginTop: 9,
      marginLeft: 10,
    },
    buttonWrapper: {
      flexDirection: 'row',
    },
    txUpdate: {
      width: 15,
      height: 15,
      backgroundColor: colors.primary,
      position: 'absolute',
      borderRadius: 15,
      left: 45,
      top: 0,
      marginTop: 15,
    },
  });

export default Navbar;
