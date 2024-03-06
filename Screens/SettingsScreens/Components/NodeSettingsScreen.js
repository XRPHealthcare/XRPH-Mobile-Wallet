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
import Navbar from '../../../components/Navbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUpdateAccount} from '../../../utils/auth.api';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const NodeSettingsScreen = ({navigation}) => {
  const updateUser = useUpdateAccount();
  const {activeAccount, theme, node, accounts} = useStore();
  const setNode = useStore(state => state.setNode);
  const setAccounts = useStore(state => state.setAccounts);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const changeNode = async newNode => {
    setNode(newNode);
    AsyncStorage.setItem('node', newNode).then(() => {
      console.log('node set asynchronously', newNode);
    });
    if (activeAccount?.isDefaultRPC) {
      let updatedAccounts = [];

      for (let account of accounts) {
        if (account.classicAddress === activeAccount.classicAddress) {
          let accountCopy = account;
          accountCopy.isDefaultRPC = false;
          updatedAccounts.push(accountCopy);

          await updateUser
            .mutateAsync({
              payload: {isDefaultRPC: false},
              id: account.id,
            })
            .then(res => {
              console.log('------------rpc update response', res);
            })
            .catch(err => {
              console.log('-----------rpc change error', err);
            });
        } else {
          updatedAccounts.push(account);
        }
      }

      setAccounts(updatedAccounts);
      AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts)).then(
        () => {
          console.log('accounts set asynchronously');
        },
      );
    }
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
              <Text style={styles.actionButtonText}>Nodes</Text>
            </View>
            <View style={styles.hl}></View>
            <View style={styles.setting}>
              <TouchableOpacity
                style={styles.setting}
                onPress={() => changeNode('wss://xrplcluster.com/')}>
                <Text style={styles.settingText}>wss://xrplcluster.com</Text>
                <Feather
                  name={'check'}
                  size={20}
                  color={
                    node === 'wss://xrplcluster.com/'
                      ? colors.primary
                      : colors.bg
                  }
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
              <TouchableOpacity
                style={styles.setting}
                onPress={() => changeNode('wss://xrpl.ws/')}>
                <Text style={styles.settingText}>xrpl.ws</Text>
                <Feather
                  name={'check'}
                  size={20}
                  color={node === 'wss://xrpl.ws/' ? colors.primary : colors.bg}
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
              <TouchableOpacity
                style={styles.setting}
                onPress={() => changeNode('wss://s2.ripple.com/')}>
                <Text style={styles.settingText}>s2.ripple.com</Text>
                <Feather
                  name={'check'}
                  size={20}
                  color={
                    node === 'wss://s2.ripple.com/' ? colors.primary : colors.bg
                  }
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
          <Navbar activeIcon="settings" navigation={navigation} />
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
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
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
    headerImage: {
      width: 50,
      height: 50,
      marginLeft: 0,
      marginTop: 0,
    },
    backIcon: {
      marginLeft: -10,
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
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      textAlign: 'right',
      marginTop: 5,
    },
    accountNameText: {
      fontSize: 16,
      color: colors.primary,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
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
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
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

export default NodeSettingsScreen;
