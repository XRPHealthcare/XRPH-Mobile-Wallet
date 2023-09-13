import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PreloadScreen from './Screens/StartScreen/Components/PreloadScreen';
import StartScreen from './Screens/StartScreen/Components/StartScreen';
import PadlockInitialScreen from './Screens/PadlockScreens/Components/PadlockInitialScreen';
import PadlockFinalScreen from './Screens/PadlockScreens/Components/PadlockFinalScreen';
import InputPadlockScreen from './Screens/PadlockScreens/Components/InputPadlockScreen';
import InputWalletAddressScreen from './Screens/PadlockScreens/Components/InputWalletAddressScreen';
import HomeScreen from './Screens/HomeScreen/Components/HomeScreen';
import ReviewPaymentScreen from './Screens/PaymentScreens/Components/ReviewPaymentScreen';
import PaymentSuccessScreen from './Screens/PaymentScreens/Components/PaymentSuccessScreen';
import TransactionsScreen from './Screens/TransactionHistoryScreen/Components/TransactionsScreen';
import PrivacyPolicyScreen from './Screens/StartScreen/Components/PrivacyPolicyScreen';
import CouponScreen from './Screens/CouponScreen/Components/CouponScreen';
import SettingsScreen from './Screens/SettingsScreens/Components/SettingsScreen';
import AccountSettingsScreen from './Screens/SettingsScreens/Components/AccountSettingsScreen';
import AlertsSettingsScreen from './Screens/SettingsScreens/Components/AlertsSettingsScreen';
import AppearanceSettingsScreen from './Screens/SettingsScreens/Components/AppearanceSettingsScreen';
import PrivacySettingsScreen from './Screens/SettingsScreens/Components/PrivacySettingsScreen';
import HelpSettingsScreen from './Screens/SettingsScreens/Components/HelpSettingsScreen';
import AboutSettingsScreen from './Screens/SettingsScreens/Components/AboutSettingsScreen';
import SetPinScreen from './Screens/Pin/Components/SetPinScreen';
import EnterPinScreen from './Screens/Pin/Components/EnterPinScreen';

const Stack = createNativeStackNavigator();

const App = () => {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Preload Screen">  
      <Stack.Screen
          options={{headerShown: false}}
          name="Preload Screen"
          component={PreloadScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Start Screen"
          component={StartScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Padlock Initial Screen"
          component={PadlockInitialScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Padlock Final Screen"
          component={PadlockFinalScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Home Screen"
          component={HomeScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Review Payment Screen"
          component={ReviewPaymentScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Payment Success Screen"
          component={PaymentSuccessScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Transactions Screen"
          component={TransactionsScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Coupon Screen"
          component={CouponScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Settings Screen"
          component={SettingsScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Account Settings Screen"
          component={AccountSettingsScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Alerts Settings Screen"
          component={AlertsSettingsScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Appearance Settings Screen"
          component={AppearanceSettingsScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Privacy Settings Screen"
          component={PrivacySettingsScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Help Settings Screen"
          component={HelpSettingsScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="About Settings Screen"
          component={AboutSettingsScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Set Pin Screen"
          component={SetPinScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Enter Pin Screen"
          component={EnterPinScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Input Wallet Address Screen"
          component={InputWalletAddressScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Input Padlock Screen"
          component={InputPadlockScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Privacy Policy Screen"
          component={PrivacyPolicyScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


export default App;
