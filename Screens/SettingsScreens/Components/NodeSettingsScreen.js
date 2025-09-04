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
  Pressable,
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
import {useUpdateAccount} from '../../../utils/auth.api';
import {
  ArrowSqrLeftBlackIcon,
  ArrowSqrLeftWhiteIcon,
} from '../../../assets/img/new-design';
import LinearGradient from 'react-native-linear-gradient';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const NodeSettingsScreen = ({navigation}) => {
  const updateUser = useUpdateAccount();
  const {activeAccount, theme, node, accounts, rpcUrls} = useStore();
  const setNode = useStore(state => state.setNode);
  const setAccounts = useStore(state => state.setAccounts);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors, theme);

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
            <Pressable onPress={() => navigation.navigate('Settings Screen')}>
              {theme === 'dark' ? (
                <ArrowSqrLeftWhiteIcon />
              ) : (
                <ArrowSqrLeftBlackIcon />
              )}
            </Pressable>
            <Text style={styles.headerHeading}>Nodes</Text>
            <Text style={{width: 20}}></Text>
          </View>
          <Image
            source={require('../../../assets/img/new-design/bg-gradient.png')}
            style={styles.greenShadow}
          />

          <ScrollView style={styles.settingsWrapper}>
            <View style={[styles.column, {gap: 16}]}>
              <Text style={styles.label}>Default Node</Text>
              {rpcUrls
                ?.filter(rpc => rpc?.includes('quiknode'))
                .map((rpc, idx) => (
                  <LinearGradient
                    colors={['#37C3A6', '#AF45EE']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={{
                      padding: rpc === node ? 1 : 0,
                      borderRadius: 8,
                    }}
                    key={idx}>
                    <Pressable
                      style={[
                        styles.settingCard,
                        {borderWidth: rpc === node ? 0 : 1, gap: 16},
                      ]}
                      onPress={() => changeNode(rpc)}>
                      <View
                        style={{
                          height: 20,
                          width: 20,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor:
                            rpc === node ? colors.primary : '#E0E0E0',
                          padding: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <View
                          style={{
                            height: 15,
                            width: 15,
                            borderRadius: 15,
                            backgroundColor:
                              rpc === node ? colors.primary : '#E0E0E0',
                          }}
                        />
                      </View>
                      <View style={[styles.column, {gap: 6, marginTop: -3}]}>
                        <Text
                          style={{
                            fontSize: 16,
                            color: colors.text,
                            fontFamily:
                              Platform.OS === 'ios'
                                ? 'LeagueSpartanMedium'
                                : 'LeagueSpartanMedium',
                            fontWeight: '500',
                          }}>
                          XRPH Default Node
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: theme === 'dark' ? '#F8F8F8' : '#636363',
                            fontFamily:
                              Platform.OS === 'ios'
                                ? 'LeagueSpartanMedium'
                                : 'LeagueSpartanMedium',
                            fontWeight: '400',
                          }}>
                          {rpc?.length > 40 ? rpc?.slice(0, 39) + '...' : rpc}{' '}
                        </Text>
                      </View>
                    </Pressable>
                  </LinearGradient>
                ))}
            </View>
            <View
              style={[
                styles.column,
                {gap: 16, marginTop: 24, marginBottom: 16},
              ]}>
              <Text style={styles.label}>Public Node</Text>
            </View>

            {rpcUrls
              ?.filter(rpc => !rpc?.includes('quiknode'))
              ?.map((rpc, idx) => (
                <LinearGradient
                  colors={['#37C3A6', '#AF45EE']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={{
                    padding: node === rpc ? 1 : 0,
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                  key={idx}>
                  <Pressable
                    onPress={() => changeNode(rpc)}
                    style={[
                      styles.settingCard,
                      {borderWidth: node !== rpc ? 1 : 0, gap: 16},
                    ]}>
                    <View
                      style={{
                        height: 20,
                        width: 20,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: rpc === node ? colors.primary : '#E0E0E0',
                        padding: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <View
                        style={{
                          height: 15,
                          width: 15,
                          borderRadius: 15,
                          backgroundColor:
                            rpc === node ? colors.primary : '#E0E0E0',
                        }}
                      />
                    </View>
                    <View style={[styles.column, {gap: 6, marginTop: -3}]}>
                      <Text
                        style={{
                          fontSize: 16,
                          color: colors.text,
                          fontFamily:
                            Platform.OS === 'ios'
                              ? 'LeagueSpartanMedium'
                              : 'LeagueSpartanMedium',
                          fontWeight: '500',
                        }}>
                        Node {idx + 1}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: theme === 'dark' ? '#F8F8F8' : '#636363',
                          fontFamily:
                            Platform.OS === 'ios'
                              ? 'LeagueSpartanMedium'
                              : 'LeagueSpartanMedium',
                          fontWeight: '400',
                        }}>
                        {rpc?.length > 40 ? rpc?.slice(0, 39) + '...' : rpc}{' '}
                        {rpc?.includes('quiknode') && ' (Default)'}{' '}
                      </Text>
                    </View>
                  </Pressable>
                </LinearGradient>
              ))}
          </ScrollView>
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
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 30,
      backgroundColor:
        theme === 'dark'
          ? 'rgba(26, 26, 26, 0.77)'
          : 'rgba(255, 255, 255, 0.77)',
      borderBottomEndRadius: 32,
      borderBottomStartRadius: 32,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    headerHeading: {
      fontSize: 18,
      fontWeight: '700',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      color: colors.text,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: theme === 'dark' ? '#F8F8F8' : '#636363',
    },
    settingCard: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#414141' : '#fff',
      backgroundColor: theme === 'dark' ? '#202020' : '#fff',
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 16,
      zIndex: 1000,
    },
    greenShadow: {
      position: 'absolute',
      top: 0,
      zIndex: -1,
      marginTop: -250,
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
      paddingHorizontal: 20,
      paddingVertical: 24,
      // backgroundColor: colors.bg_gray,
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

export default NodeSettingsScreen;
