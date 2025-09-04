import React, {useRef} from 'react';

import {Text, StyleSheet, View, TouchableOpacity, Platform} from 'react-native';
import useStore from '../../../data/store';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import RBSheet from 'react-native-raw-bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useLogin} from '../../../utils/auth.api';
import getAccountBalances from '../Handlers/get_account_balances';
import AccountSwitchConfirmation from './AccountSwitchConfirmation';
import AddAccountModal from './AddAccountModal';
import getTransactionHistory from '../../TransactionHistoryScreen/Handlers/get_transaction_history';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const MyAccounts = props => {
  const userLogin = useLogin();

  const bottomSheetRef = useRef(null);
  let {activeAccount, theme, accounts, node, rpcUrls} = useStore();
  const setIsAccountSwitchLoading = useStore(
    state => state.setIsAccountSwitchLoading,
  );
  const setActiveAccount = useStore(state => state.setActiveAccount);
  const setTxHistory = useStore(state => state.setTxHistory);
  const setTxHistoryLoading = useStore(state => state.setTxHistoryLoading);
  const setAccounts = useStore(state => state.setAccounts);
  const setNewPadlock = useStore(state => state.setNewPadlock);
  const setToken = useStore(state => state.setToken);
  const setAccountBalances = useStore(state => state.setAccountBalances);
  const setNode = useStore(state => state.setNode);

  const [isConfirmModal, setIsConfirmModal] = React.useState(false);
  const [tempSelect, setTempSelect] = React.useState(null);
  const [addAccountModalOpen, setAddAccountModalOpen] = React.useState(false);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const rbSheetStyles = {
    container: {
      backgroundColor: colors.bg,
      paddingVertical: 32,
      paddingHorizontal: 20,
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
    },
  };

  const prepareNewAccountCreation = () => {
    setNewPadlock();
    setAddAccountModalOpen(false);
    closeSheet();
     //set transaction history to null when user switched account
     setTxHistory([]);
    props?.navigation?.navigate('Start Screen');
  };

  const getBalances = async account => {
    const balances = await getAccountBalances(account, node, rpcUrls, setNode);
    AsyncStorage.setItem('accountBalances', JSON.stringify(balances));
    setAccountBalances(balances);
    return balances;
  };

  const onSwitchConfirmation = async () => {
    console.log("onSwitchConfirmation call");
    
     setIsAccountSwitchLoading(true);
    setIsConfirmModal(false);
    //set transaction history to null when user switched account
    setTxHistory([]);
    closeSheet();
    await userLogin
      .mutateAsync({
        wallet_address: tempSelect.classicAddress,
        password: tempSelect.password,
      })
      .then(async response => {
        setActiveAccount(tempSelect);
        AsyncStorage.setItem('activeAccount', JSON.stringify(tempSelect)).then(
          () => {
            console.log('active account set asynchronously');
          },
        );
        setTxHistoryLoading(true);
        setTxHistory([]);
        const history = await getTransactionHistory(tempSelect, node);
        setTxHistory(history);
        setTxHistoryLoading(false);
         getBalances(tempSelect);
         setToken(tempSelect?.balances[0]);
        // setTempSelect(null);
        setIsAccountSwitchLoading(false);
        setTempSelect(null);
      })
      .catch(err => {
        // let findActiveIndex = accounts?.findIndex(
        //   account => account?.id === activeAccount?.id,
        // );
        // dropdownRef?.current?.selectIndex(findActiveIndex);
        if (err?.message == 'User with this wallet address not found') {
          let updatedAccounts = accounts?.filter(
            account => account?.id != tempSelect?.id,
          );
          if (updatedAccounts.length === 0) {
            AsyncStorage.clear();
            setAccounts([]);
            setTxHistory([]);
            setNewPadlock();
            setTimeout(() => props?.navigation?.navigate('Start Screen'), 500);
            setIsAccountSwitchLoading(false);
          } else {
            userLogin
              .mutateAsync({
                wallet_address: updatedAccounts[0]?.classicAddress,
                password: updatedAccounts[0]?.password,
              })
              .then(async response => {
                setTempSelect(null);
                setActiveAccount(updatedAccounts[0]);
                AsyncStorage.setItem(
                  'activeAccount',
                  JSON.stringify(updatedAccounts[0]),
                ).then(() => {
                  console.log('active account set asynchronously');
                });
                setTxHistoryLoading(true);
                const history = await getTransactionHistory(
                  updatedAccounts[0],
                  node,
                );
                setTxHistory(history);
                setTxHistoryLoading(false);
                getBalances(updatedAccounts[0]);
                setAccounts(updatedAccounts);
                AsyncStorage.setItem(
                  'accounts',
                  JSON.stringify(updatedAccounts),
                ).then(() => {
                  console.log('accounts set asynchronously');
                });
                closeSheet();
                setIsAccountSwitchLoading(false);
              })
              .catch(err => {
                console.log('----------account login erorr', err);
                setIsAccountSwitchLoading(false);
              });
          }
        }
        console.log('----------account switch login erorr', err);
        setIsAccountSwitchLoading(false);
      })
      .finally(() => {
        setIsAccountSwitchLoading(false);
      });
  };

  const closeSheet = () => {
    props.setMyAccountsOpen(false);
    bottomSheetRef?.current?.close();
  };

  React.useEffect(() => {
    if (props.myAccountsOpen) {
      bottomSheetRef?.current?.open();
    } else {
      bottomSheetRef?.current?.close();
    }
  }, [props.myAccountsOpen]);

  return (
    <React.Fragment>
      <RBSheet
        ref={bottomSheetRef}
        height={420}
        customStyles={rbSheetStyles}
        closeOnPressBack={false}
        closeOnPressMask={false}>
        <View>
          <View style={styles.bottomHeader}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.text,
                fontFamily: 'LeagueSpartanBold',
              }}>
              My Accounts
            </Text>
            <TouchableOpacity onPress={closeSheet}>
              <AntDesign name={'close'} color={colors.text} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{height: 260}}>
            <View style={[styles.column, {gap: 12, marginTop: 20}]}>
              {accounts?.map((account, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    if (account?.id !== activeAccount?.id) {
                      setTempSelect(account);
                      if (accounts.length > 1) {
                        setIsConfirmModal(true);
                      } else {
                        onSwitchConfirmation();
                      }
                    }
                  }}>
                  {activeAccount?.classicAddress === account?.classicAddress ? (
                    <LinearGradient
                      colors={['#37C3A6', '#AF45EE']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={[styles.gradientBorder]}>
                      <View
                        style={[
                          styles.accountCard,
                          {backgroundColor: colors.bg},
                        ]}>
                        <View
                          style={[
                            styles.row,
                            {gap: 12, alignItems: 'flex-start'},
                          ]}>
                          <LinearGradient
                            colors={['#37C3A6', '#AF45EE']}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                            style={[styles.checkbox, {marginTop: 3}]}>
                            <View style={[styles.checkIcon]}>
                              <View
                                style={{
                                  height: 12,
                                  width: 12,
                                  backgroundColor: colors.primary,
                                  borderRadius: 50,
                                }}></View>
                            </View>
                          </LinearGradient>
                          <View style={[styles.column, {gap: 2}]}>
                            <Text style={styles.name}>{account?.name}</Text>
                            <Text style={styles.address}>
                              {account?.classicAddress}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.accountCard,
                        {
                          backgroundColor:
                            theme === 'dark' ? '#202020' : '#f8f8f8',
                        },
                      ]}>
                      <View
                        style={[
                          styles.row,
                          {gap: 12, alignItems: 'flex-start'},
                        ]}>
                        <View
                          style={[
                            styles.checkbox,
                            {backgroundColor: '#e0e0e0', marginTop: 3},
                          ]}>
                          <View
                            style={[
                              styles.checkIcon,
                              {
                                backgroundColor:
                                  theme === 'dark' ? '#202020' : '#f8f8f8',
                              },
                            ]}>
                            <View
                              style={{
                                height: 12,
                                width: 12,
                                backgroundColor: '#e0e0e0',
                                borderRadius: 50,
                              }}></View>
                          </View>
                        </View>
                        <View style={[styles.column, {gap: 2}]}>
                          <Text style={styles.name}>{account?.name}</Text>
                          <Text style={styles.address}>
                            {account?.classicAddress}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={{marginTop: 20,marginBottom:Platform.OS=='ios'?15:0}}>
            <TouchableOpacity
              onPress={() => {
                setAddAccountModalOpen(true);
              }}
              style={[
                styles.addButton,
                {
                  backgroundColor:
                    theme === 'dark' ? colors.primary : '#f8f8f8',
                },
              ]}>
              <AntDesign name="plus" color="#1a1a1a" size={20} />
              <Text style={styles.addButtonText}>Add Account</Text>
            </TouchableOpacity>
          </View>
        </View>
        <AccountSwitchConfirmation
          isConfirmModal={isConfirmModal}
          setIsConfirmModal={() => {
            setTempSelect(null);
            setIsConfirmModal(false);
          }}
          onSuccess={onSwitchConfirmation}
        />
        <AddAccountModal
          addAccountModalOpen={addAccountModalOpen}
          setAddAccountModalOpen={setAddAccountModalOpen}
          prepareNewAccountCreation={prepareNewAccountCreation}
        />
      </RBSheet>
    </React.Fragment>
  );
};

const styling = colors =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
    },
    bottomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    paymentRequest: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
    },
    addButtonText: {
      fontSize: 16,
      color: '#1a1a1a',
      fontWeight: '500',
      fontFamily: 'LeagueSpartanMedium',
    },
    gradientBorder: {
      padding: 1.5,
      borderRadius: 8,
    },
    accountCard: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
    },
    checkbox: {
      borderRadius: 50,
      padding: 1,
      height: 20,
      width: 20,
    },
    checkIcon: {
      height: 18,
      width: 18,
      backgroundColor: colors.bg,
      borderRadius: 50,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: {
      fontFamily: 'LeagueSpartanMedium',
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    address: {
      fontFamily: 'LeagueSpartanRegular',
      fontSize: 14,
      fontWeight: '400',
      color: '#8F92A1',
    },
    addButton: {
      padding: 10,
      borderRadius: 8,
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      justifyContent: 'center',
      height: 44,
    },
  });

export default React.memo(MyAccounts);
