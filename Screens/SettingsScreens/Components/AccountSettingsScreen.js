import React from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {trigger} from 'react-native-haptic-feedback';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import {dark, light} from '../../../assets/colors/colors';
import {
  ArrowSqrLeftBlackIcon,
  ArrowSqrLeftWhiteIcon,
  CopyIconDarkIcon,
  CopyIconLightIcon,
  EditIconDarkIcon,
  EditIconLightIcon,
} from '../../../assets/img/new-design';
import Success from '../../../components/Success';
import useStore from '../../../data/store';
import {
  useDeleteAccount,
  useLogin,
  useUpdateAccount,
  useVerifyPassword,
} from '../../../utils/auth.api';
import getAccountBalances from '../../HomeScreen/Handlers/get_account_balances';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const AccountSettingsScreen = ({navigation}) => {
  const updateUser = useUpdateAccount();
  const useLoginUser = useLogin();
  const checkUserPassword = useVerifyPassword();
  const deleteUserAccount = useDeleteAccount();
  const {activeAccount, accounts, theme, node, rpcUrls, hepticOptions} =
    useStore();
  const setAccounts = useStore(state => state.setAccounts);
  const setActiveAccount = useStore(state => state.setActiveAccount);
  const setNewPadlock = useStore(state => state.setNewPadlock);
  const setAccountBalances = useStore(state => state.setAccountBalances);
  const setActiveConnections = useStore(state => state.setActiveConnections);
  const setNode = useStore(state => state.setNode);
  const setTxHistory = useStore(state => state.setTxHistory);

  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [askModalOpen, setAskModalOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [accountName, setAccountName] = React.useState(activeAccount.name);
  const [accountPassword, setAccountPassword] = React.useState('');
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [nonzeroErrorMessage, setNonzeroErrorMessage] = React.useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  let [copiedModalOpen, setCopiedModalOpen] = React.useState(false);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors, theme);

  const getBalances = async account => {
    const balances = await getAccountBalances(account, node, rpcUrls, setNode);
    setAccountBalances(balances);
    return balances;
  };

  const checkName = name => {
    if (name.length >= 2) {
      setNameErrorMessage('');
      return true;
    }
    setNameErrorMessage(
      'Error: Account name must be at least 2 characters long.',
    );
    return false;
  };

  const copyToClipboard = () => {
    Clipboard.setString(activeAccount.classicAddress);
    setCopiedModalOpen(true);
    trigger('notificationSuccess', hepticOptions);
    setTimeout(() => {
      setCopiedModalOpen(false);
    }, 2000);
  };

  const editAccountName = async () => {
    if (checkName(accountName)) {
      let updatedAccounts = [];

      for (let account of accounts) {
        if (account.classicAddress === activeAccount.classicAddress) {
          let accountCopy = account;
          accountCopy.name = accountName;
          await updateUser
            .mutateAsync({
              payload: {name: accountName},
              id: account.id,
            })
            .then(res => {
              updatedAccounts.push(accountCopy);
              setActiveAccount(accountCopy);
              AsyncStorage.setItem(
                'activeAccount',
                JSON.stringify(accountCopy),
              ).then(() => {
                console.log('accounts set asynchronously');
              });
            });
        } else {
          updatedAccounts.push(account);
        }
      }

      setAccounts(updatedAccounts);
      setEditModalOpen(false);
      AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts)).then(
        () => {
          console.log('accounts set asynchronously');
        },
      );
    }
  };

  const confirmBalancesAreEmpty = () => {
    let isZero = true;
    for (let i = 0; i < activeAccount.balances.length; i++) {
      if (activeAccount.balances[i].currency === 'XRP') {
        if (parseInt(activeAccount.balances[i].value) > 2) {
          isZero = false;
        }
      } else {
        if (parseInt(activeAccount.balances[i].value) > 0) {
          isZero = false;
        }
      }
    }
    return isZero;
  };

  const askToDelete = () => {
    // check the balances...if all balances are 0 then account CAN be delete else show error
    if (confirmBalancesAreEmpty()) {
      setAskModalOpen(false);
      setDeleteModalOpen(true);
    } else {
      // error
      setNonzeroErrorMessage(
        'Error: Your account must have no more than 2 XRP and exactly 0 of any other currency in order to delete.',
      );
      setTimeout(() => {
        setNonzeroErrorMessage('');
      }, 5000);
    }
  };

  const deleteAccount = async () => {
    await checkUserPassword
      .mutateAsync({password: accountPassword})
      .then(async res => {
        if (res?.found) {
          await deleteUserAccount
            .mutateAsync(activeAccount?.id)
            .then(async response => {
              console.log('------------delete response', response);
              let updatedAccounts = accounts?.filter(
                account => account?.id != activeAccount?.id,
              );
              setTxHistory([]);
              await AsyncStorage.removeItem('swap_sessions');
              setActiveConnections([]);
              if (updatedAccounts.length === 0) {
                AsyncStorage.clear();
                setAccounts([]);
                setNewPadlock();
                setDeleteModalOpen(false);
                setTimeout(() => navigation.navigate('Start Screen'), 500);
              } else {
                useLoginUser
                  .mutateAsync({
                    wallet_address: updatedAccounts[0]?.classicAddress,
                    password: updatedAccounts[0]?.password,
                  })
                  .then(response => {
                    getBalances(updatedAccounts[0]);
                    setActiveAccount(updatedAccounts[0]);
                    AsyncStorage.setItem(
                      'activeAccount',
                      JSON.stringify(updatedAccounts[0]),
                    ).then(() => {
                      console.log('active account set asynchronously');
                    });
                    setAccounts(updatedAccounts);
                    AsyncStorage.setItem(
                      'accounts',
                      JSON.stringify(updatedAccounts),
                    ).then(() => {
                      console.log('accounts set asynchronously');
                    });

                    setTimeout(() => navigation.navigate('Home Screen'), 500);
                  })
                  .catch(err => {
                    setPasswordErrorMessage(
                      err.message || 'Can not login default user!',
                    );
                  });
              }
            })
            .catch(error => {
              setPasswordErrorMessage(error.message);
              setTimeout(() => {
                setPasswordErrorMessage('');
              }, 5000);
              console.log('------------user delete account errr', error);
            });
        } else {
          setPasswordErrorMessage('Incorrect Password, Please try again!');
          setTimeout(() => {
            setPasswordErrorMessage('');
          }, 5000);
        }
      })
      .catch(err => {
        setPasswordErrorMessage(err.message);
      });
  };

  const closeAskModal = () => {
    setAskModalOpen(false);
    setNonzeroErrorMessage('');
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg_gray}}>
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
            <Text style={styles.headerHeading}>Manage Account</Text>
            <Text style={{width: 20}}></Text>
          </View>
          <Image
            source={require('../../../assets/img/new-design/bg-gradient.png')}
            style={styles.greenShadow}
          />
          <ScrollView style={styles.settingsWrapper}>
            <View style={[styles.column]}>
              <Text style={styles.label}>Name</Text>
              <View style={[styles.settingCard]}>
                <Text style={styles.value}>{activeAccount?.name}</Text>
                <Pressable onPress={() => setEditModalOpen(true)}>
                  {theme === 'dark' ? (
                    <EditIconDarkIcon />
                  ) : (
                    <EditIconLightIcon />
                  )}
                </Pressable>
              </View>
            </View>
            <View
              style={[
                styles.column,
                {
                  marginTop: 16,
                },
              ]}>
              <Text style={styles.label}>Wallet</Text>
              <View style={[styles.settingCard]}>
                <Text
                  style={[
                    styles.value,
                    {
                      fontSize: 12,
                    },
                  ]}>
                  {activeAccount?.classicAddress}
                </Text>
                <Pressable onPress={() => copyToClipboard()}>
                  {theme === 'dark' ? (
                    <CopyIconDarkIcon />
                  ) : (
                    <CopyIconLightIcon />
                  )}
                </Pressable>
              </View>
            </View>
            <Pressable
              style={[styles.deleteBtn]}
              onPress={() => setAskModalOpen(true)}>
              <Text style={styles.deleteBtnText}>Delete Account</Text>
            </Pressable>
          </ScrollView>

          <Modal visible={editModalOpen} transparent={true}>
            <View style={{flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingContainer}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}>
                  <View style={styles.addAccountModalWrapperBottomSheet}>
                    <View style={styles.sendModalHeader}>
                      <Text style={styles.sendModalHeaderText}>
                        Edit Account Name
                      </Text>
                      <TouchableOpacity
                        style={styles.sendModalCloseButton}
                        onPress={() => {
                          setAccountName(activeAccount.name);
                          setEditModalOpen(false);
                        }}>
                        <Text style={styles.sendModalHeaderCross}>X</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.addAccountModalActionsWrapper}>
                      <TextInput
                        style={styles.accountNameInput}
                        onChangeText={setAccountName}
                        value={accountName}
                        placeholder="Account Name"
                        placeholderTextColor={colors.text_dark}
                      />
                      {nameErrorMessage.length > 0 && (
                        <Text style={styles.errorMessageText}>
                          {nameErrorMessage}
                        </Text>
                      )}
                      <View
                        style={[
                          styles.addAccountActionButtons,
                          {marginTop: 10},
                        ]}>
                        <TouchableOpacity
                          style={[
                            styles.noButton,
                            {
                              backgroundColor: colors.cancel_btn_bg,
                              borderColor: colors.cancel_btn_bg,
                            },
                          ]}
                          onPress={() => {
                            setAccountName(activeAccount.name);
                            setEditModalOpen(false);
                          }}>
                          <View style={styles.saveButton}>
                            <Text
                              style={[
                                styles.addAccountOkButtonText,
                                {
                                  color: colors.text_dark,
                                },
                              ]}>
                              Cancel
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.gradientWrapper}
                          onPress={editAccountName}>
                          <LinearGradient
                            colors={['#37C3A6', '#AF45EE']}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                            style={styles.gradientBtnContainer}>
                            <Text style={styles.gradientBtnText}>Save</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </Modal>

          <Modal visible={askModalOpen} transparent={true}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View style={styles.addAccountModalWrapper}>
                <View style={styles.sendModalHeader}>
                  <Text
                    style={[
                      styles.sendModalHeaderText,
                      {
                        fontSize: 17,
                        textAlign: 'left',
                      },
                    ]}>
                    Are you sure you want to delete your account?
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text_dark,
                    textAlign: 'left',
                  }}>
                  This process will not be reversible!
                </Text>
                {nonzeroErrorMessage.length === 0 ? (
                  <View style={styles.addAccountModalActionsWrapper}>
                    <View style={styles.addAccountActionButtons}>
                      <TouchableOpacity
                        style={styles.noButton}
                        onPress={closeAskModal}>
                        <View style={styles.saveButton}>
                          <Text
                            style={[
                              styles.addAccountOkButtonText,
                              {
                                color: colors.text_dark,
                              },
                            ]}>
                            Cancel
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.addAccountOkButton}
                        onPress={askToDelete}>
                        <View style={styles.saveButton}>
                          <Text style={styles.addAccountOkButtonText}>Yes</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.errorMessageText}>
                    {nonzeroErrorMessage}
                  </Text>
                )}
              </View>
            </View>
          </Modal>

          <Modal visible={deleteModalOpen} transparent={true}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View style={styles.addAccountModalWrapper}>
                <View style={styles.sendModalHeader}>
                  <Text
                    style={[
                      styles.sendModalHeaderText,
                      {
                        fontSize: 17,
                        textAlign: 'left',
                      },
                    ]}>
                    Enter Your Password To Delete This Account
                  </Text>
                </View>
                <View style={styles.addAccountModalActionsWrapper}>
                  <TextInput
                    style={styles.accountNameInput}
                    onChangeText={setAccountPassword}
                    value={accountPassword}
                    placeholder="Password"
                    placeholderTextColor={colors.text_dark}
                  />
                  {passwordErrorMessage.length > 0 && (
                    <Text style={styles.errorMessageText}>
                      {passwordErrorMessage}
                    </Text>
                  )}
                  <View style={styles.addAccountActionButtons}>
                    <TouchableOpacity
                      style={styles.noButton}
                      onPress={() => setDeleteModalOpen(false)}>
                      <View style={styles.saveButton}>
                        <Text
                          style={[
                            styles.addAccountOkButtonText,
                            {
                              color: colors.text_dark,
                            },
                          ]}>
                          Cancel
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteAccountButton}
                      onPress={deleteAccount}>
                      <View style={styles.saveButton}>
                        <Text style={styles.deleteAccountButtonText}>
                          Delete My Account
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>

          {copiedModalOpen && (
            <Success
              isOpen={copiedModalOpen}
              setIsOpen={setCopiedModalOpen}
              message={'Copied to Clipboard'}
              type={'success'}
            />
          )}
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
    saveButton: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    sendModalHeader: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sendModalHeaderText: {
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '700',
      color: colors.text,
      textAlign: 'center',
    },
    sendModalHeaderCross: {
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 5,
      padding: 5,
    },
    sendModalHeaderTextLeft: {
      fontSize: 18,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'left',
      marginRight: 10,
      width: '90%',
    },
    addAccountModalWrapper: {
      backgroundColor: colors.bg,
      width: '90%',
      padding: 24,
      marginBottom: 100,
      marginTop: 100,
      elevation: 5,
      shadowColor: '#000000',
      shadowOffset: {width: 5, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 20,
      borderRadius: 16,
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
    },
    addAccountModalWrapperBottomSheet: {
      backgroundColor: colors.bg,
      width: '100%',
      padding: 24,
      paddingBottom: 30,
      elevation: 5,
      shadowColor: '#000000',
      shadowOffset: {width: 5, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 20,
      // borderRadius: 16,
      borderTopRightRadius: 30,
      borderTopLeftRadius: 30,
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
    },

    addAccountModalWrapperLong: {
      backgroundColor: colors.bg,
      width: '90%',
      height: 240,
      // marginLeft: '5%',
      marginBottom: 100,
      marginTop: 100,
      elevation: 5,
      shadowColor: '#000000',
      shadowOffset: {width: 5, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 20,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    addAccountModalActionsWrapper: {
      width: '100%',
      // justifyContent: 'space-evenly',
      flexDirection: 'column',
      gap: 16,
      alignItems: 'center',
    },
    addAccountActionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
      width: '100%',
    },
    addAccountOkButton: {
      width: '48%',
      height: 48,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 8,
      marginBottom: 10,
    },
    noButton: {
      width: '48%',
      height: 48,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.text_dark,
    },
    yesButton: {
      width: 100,
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.text_dark,
      borderRadius: 25,
      marginBottom: 10,
      marginRight: 10,
    },
    addAccountOkButtonText: {
      textAlign: 'center',
      fontSize: 16,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    accountNameInput: {
      width: '100%',
      height: 55,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderColor: colors.text_input_background,
      borderWidth: 1,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: '#8F92A1',
      backgroundColor: colors.text_input_background,
      fontSize: 14,
      borderRadius: 8,
    },

    sendModalHeaderSpacer: {
      width: 10,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 30,
      backgroundColor:
        theme === 'dark'
          ? 'rgba(26, 26, 26, 0.77)'
          : 'rgba(255, 255, 255, 0.77)',
      borderBottomEndRadius: 40,
      borderBottomStartRadius: 40,
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
    greenShadow: {
      position: 'absolute',
      top: 0,
      zIndex: -1,
      marginTop: -250,
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
    value: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    settingCard: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#414141' : '#ededed',
      backgroundColor: theme === 'dark' ? '#202020' : '#fff',
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
      zIndex: 1000,
    },
    deleteBtn: {
      marginTop: 24,
      padding: 10,
      borderRadius: 8,
      backgroundColor: '#FFEFF2',
      height: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteBtnText: {
      color: '#EE4563',
      fontSize: 16,
      fontWeight: '600',
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

    settingsWrapper: {
      width: '100%',
      paddingHorizontal: 20,
      paddingVertical: 24,
      // backgroundColor: colors.bg_gray,
    },
    addAccountModalCopyWrapper: {
      position: 'absolute',
      top: 50,
      backgroundColor: colors.secondary,
      width: '100%',
      height: 30,
      elevation: 10,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginLeft: 20,
      marginRight: 20,
    },
    copyModalHeader: {
      width: '100%',
      height: 30,
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    copyModalHeaderSpacer: {
      flexDirection: 'row',
    },

    checkIcon: {
      marginLeft: 10,
    },

    errorMessageText: {
      backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      borderRadius: 20,
      padding: 10,
      marginBottom: 10,
      width: '100%',
    },

    deleteAccountButton: {
      width: '48%',
      height: 48,
      borderRadius: 8,
      backgroundColor: '#ff6961',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteAccountButtonText: {
      textAlign: 'center',
      fontSize: 16,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    gradientBtnContainer: {
      width: '48%',
      height: 48,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      borderRadius: 8,
      marginBottom: 10,
    },
    gradientBtnText: {
      textAlign: 'center',
      fontSize: 18,
      color: '#fff',
    },
    gradientWrapper: {
      width: '100%', // match cancel button
      height: 48,
      borderRadius: 8,
      marginBottom: 10,
    },
    keyboardAvoidingContainer: {
      width: '100%',
      position: 'absolute',
      bottom: 0,
    },
  });

export default AccountSettingsScreen;
