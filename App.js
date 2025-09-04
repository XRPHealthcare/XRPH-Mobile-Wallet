import React, { useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PreloadScreen from './Screens/StartScreen/Components/PreloadScreen';
import StartScreen from './Screens/StartScreen/Components/StartScreen';
import PadlockInitialScreen from './Screens/PadlockScreens/Components/PadlockInitialScreen';
import PadlockFinalScreen from './Screens/PadlockScreens/Components/PadlockFinalScreen';
import InputPadlockScreen from './Screens/PadlockScreens/Components/InputPadlockScreen';
import ChangePasswordScreen from './Screens/PadlockScreens/Components/ChangePasswordScreen';
import InputWalletAddressScreen from './Screens/PadlockScreens/Components/InputWalletAddressScreen';
import ReviewPaymentScreen from './Screens/PaymentScreens/Components/ReviewPaymentScreen';
import PaymentSuccessScreen from './Screens/PaymentScreens/Components/PaymentSuccessScreen';
import PrivacyPolicyScreen from './Screens/StartScreen/Components/PrivacyPolicyScreen';
import SetPinScreen from './Screens/Pin/Components/SetPinScreen';
import EnterPinScreen from './Screens/Pin/Components/EnterPinScreen';
import ChangePinScreen from './Screens/Pin/Components/ChangePinScreen';
import PaymentRequest from './Screens/PaymentRequest/Components/PaymentRequest';
import BiometricScreen from './Screens/BiometricScreen/Components/BiometricScreen';
import StakeScreen from './Screens/StakeScreen/Components/StakeScreen';
import ReceivePayment from './Screens/PaymentScreens/Components/ReceivePayment';

import BugReportScreen from './Screens/BugReportsScreen/Components/BugReportScreen';
import ForceUpdateScreen from './Screens/ForceUpdateScreen/Components/ForceUpdateScreen';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Alert, LogBox} from 'react-native';
import DashboardRoutes from './routes/Dashboard';
import SendScreen from './Screens/PaymentScreens/Components/SendScreen';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();
LogBox.ignoreLogs([
  /^[Reanimated] Tried to modify key `reduceMotion` of an object which has been already passed to a worklet/,
]);
const App = () => {
  return (
    <NavigationContainer>
      <QueryClientProvider client={queryClient}>
        <Stack.Navigator initialRouteName="Preload Screen">
          <Stack.Screen
            options={{headerShown: false}}
            name="Preload Screen"
            component={PreloadScreen}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name="Force Update Screen"
            component={ForceUpdateScreen}
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
            name="Payment Request"
            component={PaymentRequest}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name="ReceivePayment"
            component={ReceivePayment}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name="Send Screen"
            component={SendScreen}
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
            name="Biometric Screen"
            component={BiometricScreen}
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
            name="Change Password Screen"
            component={ChangePasswordScreen}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name="Privacy Policy Screen"
            component={PrivacyPolicyScreen}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name="Change Pin Screen"
            component={ChangePinScreen}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name="Stake Screen"
            component={StakeScreen}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name="Bug Report Screen"
            component={BugReportScreen}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name="Home Screen"
            component={DashboardRoutes}
          />
        </Stack.Navigator>
      </QueryClientProvider>
    </NavigationContainer>
  );
};

// export default App;
export default Sentry.wrap(App);
