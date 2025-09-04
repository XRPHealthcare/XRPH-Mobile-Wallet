import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../Screens/HomeScreen/Components/HomeScreen';
import TransactionsScreen from '../Screens/TransactionHistoryScreen/Components/TransactionsScreen';
import CouponScreen from '../Screens/CouponScreen/Components/CouponScreen';
import useStore from '../data/store';
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
import {dark, light} from '../assets/colors/colors';
import SettingRoutes from './SettingRoutes';
import WalletScreen from '../Screens/WalletScreen/Components/WalletScreen';
import {Alert, Platform, Pressable} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';

import { View,StyleSheet } from 'react-native';
const Tab = createBottomTabNavigator();

function DashboardRoutes() {
  const {theme, hepticOptions,isAccountSwitchLoading} = useStore();

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  return (
    <View style={{ flex: 1 }}>
    <Tab.Navigator
      initialRouteName="Home Screen"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.dark_med,
        tabBarInactiveTintColor: colors.text1,
        tabBarStyle: {
          backgroundColor: colors.bg,
          paddingHorizontal: 20,
          //   borderTopEndRadius: 32,
          //   borderTopStartRadius: 32,
          paddingBottom: Platform.OS=='ios'?28:13,
          paddingTop:16,
          height: Platform.OS=='ios'?90:71,
          borderTopColor:Platform.OS=='ios'? colors.bg :'transparent', // this is key
          borderTopWidth: 0,
          elevation: 0, 
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
        },
      }}>
      <Tab.Screen
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) =>
            color !== colors.dark_med ? (
              <HomeInactiveIcon />
            ) : theme === 'dark' ? (
              <HomeActiveDarkIcon />
            ) : (
              <HomeActiveIcon />
            ),
        }}
        listeners={{
          tabPress: e => {
            trigger('impactMedium', hepticOptions);
          },
        }}
        name="Home"
        component={HomeScreen}
      />
      <Tab.Screen
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: ({color, size}) =>
            color !== colors.dark_med ? (
              <WalletInactiveIcon />
            ) : theme === 'dark' ? (
              <WalletActiveDarkIcon />
            ) : (
              <WalletActiveIcon />
            ),
        }}
        listeners={{
          tabPress: e => {
            trigger('impactMedium', hepticOptions);
          },
        }}
        name="Wallet"
        component={WalletScreen}
      />
      <Tab.Screen
        options={{
          tabBarLabel: 'Transactions',
          tabBarIcon: ({color, size}) =>
            color !== colors.dark_med ? (
              <TransactionInactiveIcon />
            ) : theme === 'dark' ? (
              <TransactionActiveDarkIcon />
            ) : (
              <TransactionActiveIcon />
            ),
        }}
        listeners={{
          tabPress: e => {
            trigger('impactMedium', hepticOptions);
          },
        }}
        name="Transactions"
        component={TransactionsScreen}
      />
      {/* <Tab.Screen
        options={{
          tabBarLabel: 'Card',
          tabBarIcon: ({color, size}) =>
            color !== colors.dark_med ? (
              <CardInActiveIcon />
            ) : theme === 'dark' ? (
              <CardActiveDarkIcon />
            ) : (
              <CardActiveIcon />
            ),
        }}
        listeners={{
          tabPress: e => {
            trigger('impactMedium', hepticOptions);
          },
        }}
        name="Card"
        component={CouponScreen}
      /> */}
      <Tab.Screen
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({color, size}) =>
            color !== colors.dark_med ? (
              <SettingInActiveIcon />
            ) : theme === 'dark' ? (
              <SettingActiveDarkIcon />
            ) : (
              <SettingActiveIcon />
            ),
        }}
        listeners={{
          tabPress: e => {
            trigger('impactMedium', hepticOptions);
          },
        }}
        name="Settings"
        component={SettingRoutes}
      />
    </Tab.Navigator>
    {isAccountSwitchLoading && <View style={[styles.overlay]} pointerEvents="auto" />}
    </View>
  );
}

export default DashboardRoutes;
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    height: Platform.OS === 'ios' ? 90 : 71,
    left: 0,
    right: 0,
     opacity: 0.6,
    backgroundColor: 'black',
    zIndex: 999,
  },
});