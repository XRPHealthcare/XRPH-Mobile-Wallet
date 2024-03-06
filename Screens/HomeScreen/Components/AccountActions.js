import React from 'react';

import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Modal,
  Platform,
} from 'react-native';
import useStore from '../../../data/store';
import {light, dark} from '../../../assets/colors/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import SelectDropdown from 'react-native-select-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import ClipIco from '../../../assets/img/clipboard.svg';
import ArrowSend from '../../../assets/img/arrow-send.svg';
import ArrowSendD from '../../../assets/img/arrow-send-d.svg';
import ArrowRec from '../../../assets/img/arrow-receive.svg';
import ArrowRecD from '../../../assets/img/arrow-receive-d.svg';

// const colors = light; // eventually put this in state
AntDesign.loadFont();
FontAwesome.loadFont();
Feather.loadFont();
MaterialCommunityIcons.loadFont();

const AccountActions = props => {
  let {activeAccount, theme, totalBalanceCurrency} = useStore();
  const setTotalBalanceCurrency = useStore(
    state => state.setTotalBalanceCurrency,
  );
  let [copiedModalOpen, setCopiedModalOpen] = React.useState(false);
  let [cantSendModalOpen, setCantSendModalOpen] = React.useState(false);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const openSendModal = () => {
    if (activeAccount.balances.length > 0) {
      props.setSendModalOpen(true);
    } else {
      setCantSendModalOpen(true);
      setTimeout(() => {
        setCantSendModalOpen(false);
      }, 2000);
    }
  };

  const refactorAddress = address => {
    const firstThree = address?.slice(0, 4);
    const lastThree = address?.slice(-4);
    return firstThree + '...' + lastThree;
  };

  const copyToClipboard = () => {
    Clipboard.setString(activeAccount.classicAddress);
    setCopiedModalOpen(true);
    setTimeout(() => {
      setCopiedModalOpen(false);
    }, 2000);
  };

  return (
    <React.Fragment>
      <LinearGradient
        colors={['#37C3A6', '#AF45EE']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.accountInformation}>
        <Text style={styles.accountName}>{activeAccount?.name}</Text>
        <View style={styles.balanceWrapper}>
          {totalBalanceCurrency === 'USD' && (
            <Text style={styles.accountBalance}>
              ${' '}
              {props?.loading
                ? 'Loading...'
                : activeAccount?.totalBalances?.[totalBalanceCurrency] || 0}
            </Text>
          )}

          {totalBalanceCurrency === 'EUR' && (
            <Text style={styles.accountBalance}>
              €{' '}
              {props?.loading
                ? 'Loading...'
                : activeAccount?.totalBalances?.[totalBalanceCurrency] || 0}
            </Text>
          )}

          {totalBalanceCurrency === 'GBP' && (
            <Text style={styles.accountBalance}>
              £{' '}
              {props?.loading
                ? 'Loading...'
                : activeAccount?.totalBalances?.[totalBalanceCurrency] || 0}
            </Text>
          )}

          <SelectDropdown
            data={['USD', 'EUR', 'GBP']}
            onSelect={(selectedItem, index) => {
              console.log(selectedItem);
              setTotalBalanceCurrency(selectedItem);
              AsyncStorage.setItem('totalBalanceCurrency', selectedItem).then(
                () => {
                  console.log('currency set asynchronously');
                },
              );
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              // text represented after item is selected
              // if data array is an array of objects then return selectedItem.property to render after item is selected
              return selectedItem;
            }}
            rowTextForSelection={(item, index) => {
              // text represented for each item in dropdown
              // if data array is an array of objects then return item.property to represent item in dropdown
              return item;
            }}
            defaultButtonText={totalBalanceCurrency}
            dropdownStyle={styles.accountsDropdown}
            buttonStyle={styles.accountsDropdownButton}
            buttonTextStyle={styles.accountsDropdownButtonText}
            rowTextStyle={styles.accountsDropdownText}
            renderDropdownIcon={isOpened => {
              return (
                <FontAwesome
                  name={isOpened ? 'angle-up' : 'angle-down'}
                  size={20}
                  color={colors.white}
                />
              );
            }}
          />
        </View>
        <View style={styles.walletAddressAndClipboardWrapper}>
          <Text style={styles.walletAddress}>
            {refactorAddress(activeAccount?.classicAddress)}
          </Text>
          <TouchableOpacity onPress={copyToClipboard}>
            <ClipIco height={24} width={24} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.sendButton} onPress={openSendModal}>
          <View style={styles.buttonWrapper}>
            {theme === 'dark' ? <ArrowSendD /> : <ArrowSend />}
            <Text style={styles.actionButtonText}>Send</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.receiveButton}
          onPress={() => props.setReceiveModalOpen(true)}>
          <View style={styles.buttonWrapper}>
            {theme === 'dark' ? <ArrowRecD /> : <ArrowRec />}

            <Text style={styles.actionButtonTextOutline}>Receive</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* <Modal
                visible={copiedModalOpen}
                transparent={true}
            > */}
      {copiedModalOpen && (
        <View style={styles.addAccountModalWrapper}>
          <View style={styles.sendModalHeader}>
            <View style={styles.sendModalHeaderSpacer}>
              <Text style={styles.sendModalHeaderTextName}>
                Copied to Clipboard
              </Text>
              <AntDesign
                name={'check'}
                size={20}
                color={colors.text}
                style={styles.checkIcon}
              />
            </View>
            <TouchableOpacity
              style={styles.sendModalCloseButton}
              onPress={() => setCopiedModalOpen(false)}>
              <Text style={styles.sendModalHeaderText}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {cantSendModalOpen && (
        <View style={styles.addAccountModalWrapperThick}>
          <View style={styles.sendModalHeader}>
            <View style={styles.sendModalHeaderSpacer2}>
              <Text style={styles.sendModalHeaderTextName2}>
                Unable to send from unfunded account.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.sendModalCloseButton}
              onPress={() => setCantSendModalOpen(false)}>
              <Text style={styles.sendModalHeaderText}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </React.Fragment>
  );
};

const styling = colors =>
  StyleSheet.create({
    accountInformation: {
      flexDirection: 'column',
      marginTop: 20,
      width: '100%',
      borderRadius: 16,
      padding: 16,
    },
    accountName: {
      fontSize: 16,
      color: '#fff',
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginBottom: 5,
    },
    walletAddressAndClipboardWrapper: {
      backgroundColor: colors.dark_gray_bg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginTop: 5,
      marginBottom: 5,
    },
    balanceWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
      paddingBottom: 10,
    },
    walletAddress: {
      fontSize: 16,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: '#fff',
    },
    accountBalance: {
      marginTop: Platform.OS === 'ios' ? 10 : 0,
      paddingTop: 5,
      paddingBottom: Platform.OS === 'ios' ? 5 : 0,
      height: 40,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: '#fff',
      fontSize: 26,
    },
    actionButtons: {
      marginTop: 10,
      gap: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    sendButton: {
      width: '48%',
      height: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 24,
    },
    buttonWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    receiveButton: {
      width: '48%',
      height: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg,
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 24,
    },
    actionButtonText: {
      color: colors.bg,
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
    },
    actionButtonTextOutline: {
      color: colors.primary,
      fontSize: 16,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
    },

    addAccountModalWrapper: {
      position: 'absolute',
      top: 0,
      backgroundColor: colors.secondary,
      width: '100%',
      height: 30,
      elevation: 10,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    addAccountModalWrapperThick: {
      position: 'absolute',
      top: 0,
      backgroundColor: colors.secondary,
      width: '100%',
      height: 30,
      elevation: 10,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    addAccountModalActionsWrapper: {
      paddingHorizontal: 10,
    },

    sendModalHeaderText: {
      fontSize: 16,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.text,
      textAlign: 'left',
    },
    sendModalHeaderTextName: {
      fontSize: 16,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.text,
      textAlign: 'left',
      marginTop: 4,
    },
    sendModalHeaderTextName2: {
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.text,
      textAlign: 'left',
      marginTop: 4,
      flexWrap: 'wrap',
    },
    sendModalHeader: {
      width: '100%',
      height: 30,
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sendModalHeaderSpacer: {
      flexDirection: 'row',
    },
    sendModalHeaderSpacer2: {
      flexDirection: 'row',
      // width: '60%'
    },
    checkIcon: {
      marginLeft: 10,
    },

    accountsDropdown: {
      backgroundColor: '#9223D5',
      borderRadius: 10,
    },
    accountsDropdownRow: {
      flexDirection: 'row',
      alignSelf: 'center',
    },
    accountsDropdownButton: {
      width: 90,
      height: 42,
      borderRadius: 10,
      backgroundColor: '#9223D5',
      marginTop: 10,
      paddingHorizontal: 12,
    },
    accountsDropdownButtonText: {
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: '#fff',
      fontSize: 14,
      marginTop: 4,
    },
    accountsDropdownText: {
      fontSize: 14,
      color: '#fff',
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginTop: 4,
    },
  });

export default AccountActions;
