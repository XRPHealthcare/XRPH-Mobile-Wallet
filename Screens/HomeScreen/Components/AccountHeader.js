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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useLogin} from '../../../utils/auth.api';
import getAccountBalances from '../Handlers/get_account_balances';

AntDesign.loadFont();
FontAwesome.loadFont();

const AccountHeader = props => {
  const userLogin = useLogin();
  let {accounts, theme, activeAccount, node} = useStore();
  const setActiveAccount = useStore(state => state.setActiveAccount);
  const setToken = useStore(state => state.setToken);
  const setAccountBalances = useStore(state => state.setAccountBalances);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const getBalances = async account => {
    const balances = await getAccountBalances(account, node);
    setAccountBalances(balances);
    return balances;
  };

  React.useEffect(() => {
    props?.setIsAccountSwitchLoading(userLogin?.isLoading);
  }, [userLogin?.isLoading]);

  return (
    <View style={styles.header}>
      <Image
        style={styles.headerImage}
        source={require('../../../assets/img/hero.png')}
      />
      <View>
        <SelectDropdown
          data={accounts}
          defaultValue={activeAccount}
          onSelect={async (selectedItem, index) => {
            console.log(selectedItem);
            await userLogin
              .mutateAsync({
                wallet_address: selectedItem.classicAddress,
                password: selectedItem.password,
              })
              .then(response => {
                setActiveAccount(selectedItem);
                getBalances(selectedItem);
                AsyncStorage.setItem(
                  'activeAccount',
                  JSON.stringify(selectedItem),
                ).then(() => {
                  console.log('active account set asynchronously');
                });
                setToken(selectedItem?.balances[0]);
              })
              .catch(err => {
                console.log('----------account switch login erorr', err);
              });
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            // text represented after item is selected
            // if data array is an array of objects then return selectedItem.property to render after item is selected
            return selectedItem.name;
          }}
          rowTextForSelection={(item, index) => {
            // text represented for each item in dropdown
            // if data array is an array of objects then return item.property to represent item in dropdown
            return item.name;
          }}
          defaultButtonText={activeAccount.name}
          dropdownStyle={styles.accountsDropdown}
          buttonStyle={styles.accountsDropdownButton}
          buttonTextStyle={styles.accountsDropdownButtonText}
          rowTextStyle={styles.accountsDropdownText}
          renderDropdownIcon={isOpened => {
            return (
              <FontAwesome
                name={isOpened ? 'angle-up' : 'angle-down'}
                size={30}
                color={colors.dark_gray}
              />
            );
          }}
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
    },
    accountsDropdownButtonText: {
      fontSize: 18,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.dark_gray,
      textAlign: 'left',
      marginLeft: 0,
    },
    accountsDropdownText: {
      fontSize: 18,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
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
  });

export default AccountHeader;
