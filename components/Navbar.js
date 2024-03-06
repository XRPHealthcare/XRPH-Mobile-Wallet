import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';

import {light, dark} from '../assets/colors/colors';
import useStore from '../data/store';
import {trigger} from 'react-native-haptic-feedback';
import StakeActiveIco from '../assets/img/stakeIco.svg';
import StakeIco from '../assets/img/stake-w.svg';
import StakeIcoDark from '../assets/img/stake-d.svg';
import HistoryActiveIco from '../assets/img/history-active-ico.svg';
import HistoryIco from '../assets/img/history-ico.svg';
import HistoryIcoDark from '../assets/img/history-ico-d.svg';
import HomeActiveIco from '../assets/img/home-active-ico.svg';
import HomeIco from '../assets/img/home-ico.svg';
import HomeIcoDark from '../assets/img/home-ico-d.svg';
import WalletActiveIco from '../assets/img/wallet-active-ico.svg';
import WalletIco from '../assets/img/wallet-ico.svg';
import WalletIcoDark from '../assets/img/wallet-ico-d.svg';
import SettingsActiveIco from '../assets/img/settings-active-ico.svg';
import SettingsIco from '../assets/img/settings-ico.svg';
import SettingsIcoDark from '../assets/img/settings-ico-d.svg';
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
            props.navigation.navigate('Transactions Screen');
          }}>
          <View style={styles.buttonWrapper}>
            {props.activeIcon == 'transactions' ? (
              <HistoryActiveIco style={styles.transactionIcon} />
            ) : theme === 'dark' ? (
              <HistoryIcoDark style={styles.transactionIcon} />
            ) : (
              <HistoryIco style={styles.transactionIcon} />
            )}
          </View>
        </TouchableOpacity>
      </View>
      {props.txUpdate && <View style={styles.txUpdate}></View>}

      <View style={styles.navigationButton}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => {
            trigger('impactMedium', hepticOptions);
            props.navigation.navigate('Home Screen');
          }}>
          <View style={styles.buttonWrapper}>
            {props.activeIcon == 'home' ? (
              <HomeActiveIco style={styles.stakeIcon} />
            ) : theme === 'dark' ? (
              <HomeIcoDark style={styles.stakeIcon} />
            ) : (
              <HomeIco style={styles.stakeIcon} />
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.navigationButton}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => {
            trigger('impactMedium', hepticOptions);
            props.navigation.navigate('Stake Screen');
          }}>
          <View style={styles.buttonWrapper}>
            {props.activeIcon == 'stake' ? (
              <StakeActiveIco style={styles.stakeIcon} />
            ) : theme === 'dark' ? (
              <StakeIcoDark style={styles.stakeIcon} />
            ) : (
              <StakeIco style={styles.stakeIcon} />
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
              <WalletActiveIco style={styles.stakeIcon} />
            ) : theme === 'dark' ? (
              <WalletIcoDark style={styles.stakeIcon} />
            ) : (
              <WalletIco style={styles.stakeIcon} />
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
              <SettingsActiveIco style={styles.settingsIcon} />
            ) : theme === 'dark' ? (
              <SettingsIcoDark style={styles.settingsIcon} />
            ) : (
              <SettingsIco style={styles.settingsIcon} />
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
      paddingVertical: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      borderTopColor: colors?.separator_color,
      borderTopWidth: 1,
      marginTop: 5,
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
