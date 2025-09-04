import AccountSettingsScreen from '../Screens/SettingsScreens/Components/AccountSettingsScreen';
import AlertsSettingsScreen from '../Screens/SettingsScreens/Components/AlertsSettingsScreen';
import AppearanceSettingsScreen from '../Screens/SettingsScreens/Components/AppearanceSettingsScreen';
import PrivacySettingsScreen from '../Screens/SettingsScreens/Components/PrivacySettingsScreen';
import HelpSettingsScreen from '../Screens/SettingsScreens/Components/HelpSettingsScreen';
import AboutSettingsScreen from '../Screens/SettingsScreens/Components/AboutSettingsScreen';
import NodeSettingsScreen from '../Screens/SettingsScreens/Components/NodeSettingsScreen';
import WalletConnectionScreen from '../Screens/SettingsScreens/Components/WalletConnectionScreen';
import SettingsScreen from '../Screens/SettingsScreens/Components/SettingsScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
function SettingRoutes() {
  return (
    <Stack.Navigator initialRouteName="Settings Screen">
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
        name="Node Settings Screen"
        component={NodeSettingsScreen}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Wallet Connection Screen"
        component={WalletConnectionScreen}
      />
    </Stack.Navigator>
  );
}

export default SettingRoutes;
