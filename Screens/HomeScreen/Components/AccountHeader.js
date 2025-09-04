import React from 'react';

import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import useStore from '../../../data/store';
import {light, dark} from '../../../assets/colors/colors';
import SelectDropdown from 'react-native-select-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useLogin} from '../../../utils/auth.api';
import getAccountBalances from '../Handlers/get_account_balances';
import AccountSwitchConfirmation from './AccountSwitchConfirmation';
import {Text} from 'react-native';

AntDesign.loadFont();
FontAwesome.loadFont();

const AccountHeader = props => {
  const userLogin = useLogin();
  const dropdownRef = React.useRef(null);
  let {accounts, theme, activeAccount, node, rpcUrls} = useStore();
  const setActiveAccount = useStore(state => state.setActiveAccount);
  const setAccounts = useStore(state => state.setAccounts);
  const setNewPadlock = useStore(state => state.setNewPadlock);
  const setToken = useStore(state => state.setToken);
  const setAccountBalances = useStore(state => state.setAccountBalances);
  const setActiveConnections = useStore(state => state.setActiveConnections);
  const setNode = useStore(state => state.setNode);

  const [isConfirmModal, setIsConfirmModal] = React.useState(false);
  const [tempSelect, setTempSelect] = React.useState(null);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const getBalances = async account => {
    const balances = await getAccountBalances(account, node, rpcUrls, setNode);
    AsyncStorage.setItem('accountBalances', JSON.stringify(balances));
    setAccountBalances(balances);
    return balances;
  };

  const onSwitchConfirmation = async () => {
    setIsConfirmModal(false);
    if (accounts?.length > 1) {
      await AsyncStorage.removeItem('swap_sessions');
      setActiveConnections([]);
    }
    await userLogin
      .mutateAsync({
        wallet_address: tempSelect.classicAddress,
        password: tempSelect.password,
      })
      .then(response => {
        setActiveAccount(tempSelect);
        AsyncStorage.setItem('activeAccount', JSON.stringify(tempSelect)).then(
          () => {
            console.log('active account set asynchronously');
          },
        );
        getBalances(tempSelect);
        setToken(tempSelect?.balances[0]);
        setTempSelect(null);
      })
      .catch(err => {
        let findActiveIndex = accounts?.findIndex(
          account => account?.id === activeAccount?.id,
        );
        dropdownRef?.current?.selectIndex(findActiveIndex);
        if (err?.message == 'User with this wallet address not found') {
          let updatedAccounts = accounts?.filter(
            account => account?.id != tempSelect?.id,
          );
          if (updatedAccounts.length === 0) {
            AsyncStorage.clear();
            setAccounts([]);
            setNewPadlock();
            setTimeout(() => props?.navigation?.navigate('Start Screen'), 500);
          } else {
            userLogin
              .mutateAsync({
                wallet_address: updatedAccounts[0]?.classicAddress,
                password: updatedAccounts[0]?.password,
              })
              .then(response => {
                setTempSelect(null);
                setActiveAccount(updatedAccounts[0]);
                AsyncStorage.setItem(
                  'activeAccount',
                  JSON.stringify(updatedAccounts[0]),
                ).then(() => {
                  console.log('active account set asynchronously');
                });
                getBalances(updatedAccounts[0]);
                setAccounts(updatedAccounts);
                AsyncStorage.setItem(
                  'accounts',
                  JSON.stringify(updatedAccounts),
                ).then(() => {
                  console.log('accounts set asynchronously');
                });
              })
              .catch(err => {
                console.log('----------account login erorr', err);
              });
          }
        }
        console.log('----------account switch login erorr', err);
      });
  };

  React.useEffect(() => {
    props?.setIsAccountSwitchLoading(userLogin?.isPending);
  }, [userLogin?.isPending]);

  return (
    <View style={styles.header}>
      <Image
        style={styles.headerImage}
        source={require('../../../assets/img/hero.png')}
      />
      <View>
        <SelectDropdown
          ref={dropdownRef}
          data={accounts}
          defaultValue={activeAccount}
          onSelect={async (selectedItem, index) => {
            console.log(selectedItem);
            if (selectedItem?.id !== activeAccount?.id) {
              setTempSelect(selectedItem);
              if (accounts.length > 1) {
                setIsConfirmModal(true);
              } else {
                onSwitchConfirmation();
              }
            }
          }}
          renderButton={(selectedItem, isOpened) => {
            return (
              <View style={styles.accountsDropdownButton}>
                <Text style={styles.accountsDropdownButtonText}>
                  {(selectedItem && selectedItem.name) || 'Select your Name'}
                </Text>
                <FontAwesome
                  name={isOpened ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.dark_gray}
                />
              </View>
            );
          }}
          renderItem={(item, index, isSelected) => {
            return (
              <View
                style={{
                  ...styles.accountsDropdownItemStyle,
                  ...(isSelected && {backgroundColor: colors.bg}),
                }}>
                <Text style={styles.accountsDropdownText}>{item.name}</Text>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
          dropdownStyle={styles.accountsDropdown}
        />
      </View>
      <TouchableOpacity
        style={styles.addAccountButton}
        onPress={() => props.setAddAccountModalOpen(true)}>
        <AntDesign
          name={'plus'}
          size={25}
          color={colors.text}
          style={styles.addAccountIcon}
        />
      </TouchableOpacity>
      <AccountSwitchConfirmation
        isConfirmModal={isConfirmModal}
        setIsConfirmModal={() => {
          let findActiveIndex = accounts?.findIndex(
            account => account?.id === activeAccount?.id,
          );
          dropdownRef?.current?.selectIndex(findActiveIndex);
          setTempSelect(null);
          setIsConfirmModal(false);
        }}
        onSuccess={onSwitchConfirmation}
      />
    </View>
  );
};

const styling = colors =>
  StyleSheet.create({
    headerImage: {
      width: 50,
      height: 50,
      marginLeft: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
      paddingBottom: 10,
      WIDTH: '90%',
      borderBottomWidth: 1,
      borderBottomColor: colors?.separator_color,
    },
    accountsDropdown: {
      backgroundColor: colors.light_gray_bg,
      borderRadius: 10,
    },
    accountsDropdownButton: {
      width: 250,
      height: 50,
      marginLeft: 8,
      marginRight: 4,
      borderRadius: 8,
      backgroundColor: colors.light_gray_bg,
      paddingLeft: 19,
      paddingRight: 19,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    accountsDropdownButtonText: {
      fontSize: 18,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.dark_gray,
      textAlign: 'left',
      marginLeft: 0,
    },
    accountsDropdownText: {
      fontSize: 18,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginTop: 4,
    },
    addAccountButton: {
      width: 50,
      height: 50,
      marginRight: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border_dashed,
      backgroundColor: colors.light_gray_bg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addAccountIcon: {
      marginTop: 0,
    },
    accountsDropdownItemStyle: {
      padding: 10,
      backgroundColor: colors.bg,
    },
  });

export default AccountHeader;
