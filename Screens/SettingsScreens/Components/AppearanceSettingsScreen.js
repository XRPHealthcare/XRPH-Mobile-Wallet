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
  Switch,
  Touchable,
  Platform,
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
import AsyncStorage from '@react-native-async-storage/async-storage';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const AppearanceSettingsScreen = ({navigation}) => {
  const {activeAccount, theme} = useStore();
  const toggleTheme = useStore(state => state.toggleTheme);

  // const [darkMode, setDarkMode] = React.useState(theme); // --> get from store

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const changeTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    toggleTheme(newTheme);
    AsyncStorage.setItem('theme', newTheme).then(() => {
      console.log('theme set asynchronously');
    });
  };

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
              <Text style={styles.headerText}>Settings</Text>
              <Text style={styles.accountNameText}>{activeAccount.name}</Text>
            </View>
          </View>
          <ScrollView style={styles.settingsWrapper}>
            <View style={styles.settingsButtonContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings Screen')}>
                <Feather
                  name={'chevron-left'}
                  size={35}
                  color={colors.text}
                  style={styles.backIcon}
                />
              </TouchableOpacity>
              <Text style={styles.actionButtonText}>Appearance</Text>
            </View>
            <View style={styles.hl}></View>
            <View style={styles.setting}>
              <TouchableOpacity style={styles.setting} onPress={changeTheme}>
                <Text style={styles.settingText}>Day Mode</Text>
                <Feather
                  name={'check'}
                  size={20}
                  color={theme === 'light' ? colors.primary : colors.bg}
                  style={styles.fingerIcon}
                />
              </TouchableOpacity>
              {/* <Switch
                            trackColor={{false: colors.text_light, true: colors.secondary}}
                            thumbColor={colors.text_dark}
                            ios_backgroundColor={colors.text_light}
                            onValueChange={changeTheme}
                            value={theme === 'light' ? false : true}
                        /> */}
            </View>
            <View style={styles.setting}>
              <TouchableOpacity style={styles.setting} onPress={changeTheme}>
                <Text style={styles.settingText}>Night Mode</Text>
                <Feather
                  name={'check'}
                  size={20}
                  color={theme === 'dark' ? colors.primary : colors.bg}
                  style={styles.fingerIcon}
                />
              </TouchableOpacity>
              {/* <Switch
                            trackColor={{false: colors.text_light, true: colors.secondary}}
                            thumbColor={colors.text_dark}
                            ios_backgroundColor={colors.text_light}
                            onValueChange={changeTheme}
                            value={theme === 'light' ? false : true}
                        /> */}
            </View>
            <View style={styles.hl}></View>
          </ScrollView>
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
    backButton: {
      width: 50,
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    setting: {
      width: '100%',
      height: 50,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    settingText: {
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    textAndIconWrapper: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      width: '50%',
    },
    spacer: {
      width: 50,
    },
    hl: {
      width: '100%',
      height: 3,
      backgroundColor: colors.text_light,
    },
    backIcon: {
      marginLeft: -10,
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
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      textAlign: 'right',
      marginTop: 5,
    },
    accountNameText: {
      fontSize: 16,
      color: colors.primary,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginTop: 10,
      textAlign: 'right',
    },
    settingsWrapper: {
      width: '100%',
      paddingHorizontal: 5,
      paddingVertical: 1,
      backgroundColor: colors.bg,
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
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      textAlign: 'center',
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

export default AppearanceSettingsScreen;
