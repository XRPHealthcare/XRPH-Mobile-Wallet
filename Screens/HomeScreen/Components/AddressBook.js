import React, {useRef, useState} from 'react';

import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import useStore from '../../../data/store';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useDeleteWalletAddress} from '../../../utils/wallet.api';
import RBSheet from 'react-native-raw-bottom-sheet';
import {ScrollView} from 'react-native-gesture-handler';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const AddressBook = props => {
  const deleteWalletAddress = useDeleteWalletAddress();
  const bottomSheetRef = useRef(null);
  let {activeAccount, theme} = useStore();

  const [selected, setSelected] = useState(-1);
  const [errorType, setErrorType] = useState('error');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(false);

  // variables

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const rbSheetStyles = {
    container: {
      backgroundColor: colors.bg,
      paddingTop: 20,
      borderTopRightRadius: 15,
      borderTopLeftRadius: 15,
    },
  };

  React.useEffect(() => {
    if (props.isAddressBook) {
      bottomSheetRef?.current?.open();
    } else {
      bottomSheetRef?.current?.close();
    }
  }, [props.isAddressBook]);

  const closeSheet = () => {
    props.setAddressBook(false);
    bottomSheetRef?.current?.close();
  };

  const confirmDelete = () => {
    deleteWalletAddress
      ?.mutateAsync(deleteId)
      .then(res => {
        setIsDeleteConfirm(false);
        setErrorType('success');
        setErrorMessage('Address deleted successfully!');
      })
      .catch(err => {
        setErrorType('error');
        setErrorMessage(
          err?.message || 'Something went wrong, Please try again!',
        );
      });
  };

  React.useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorType('error');
        setErrorMessage('');
      }, 3000);
    }
  }, [errorMessage]);

  return (
    <React.Fragment>
      <RBSheet
        ref={bottomSheetRef}
        height={550}
        customStyles={rbSheetStyles}
        closeOnPressBack={false}
        closeOnPressMask={false}>
        <ScrollView>
          <View style={styles.bottomWrapper}>
            <View style={styles.bottomHeader}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: colors.text,
                }}>
                Address Book
              </Text>
              <TouchableOpacity onPress={closeSheet}>
                <MaterialCommunityIcons
                  name={'close'}
                  color={colors.text}
                  size={30}
                />
              </TouchableOpacity>
            </View>
            {errorMessage?.length > 0 && (
              <View>
                <Text
                  style={[
                    styles.errorAlert,
                    {
                      backgroundColor:
                        errorType === 'error' ? '#ff6961' : colors.secondary,
                    },
                  ]}>
                  {errorMessage}
                </Text>
              </View>
            )}
            {props?.addressBookLoading ? (
              <ActivityIndicator size={25} color={colors?.primary} />
            ) : !props?.addressBook?.length ? (
              <View>
                <Text style={styles.noAddressAlert}>No address found.</Text>
              </View>
            ) : (
              props?.addressBook?.map((address, idx) => (
                <View style={styles.addressBook} key={idx}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelected(idx);
                      props?.setDestinationAddress(address?.walletAddress);
                      closeSheet();
                    }}
                    style={styles.addressWrapper}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {address?.walletLabel?.[0]}
                      </Text>
                    </View>
                    <View style={styles.addressInfo}>
                      <Text style={styles.label}>{address?.walletLabel}</Text>
                      <Text style={styles.address}>
                        {address?.walletAddress?.slice(0, 4)}******
                        {address?.walletAddress?.slice(-4)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.row}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelected(idx);
                        props?.setDestinationAddress(address?.walletAddress);
                        closeSheet();
                      }}
                      style={{
                        borderColor:
                          selected === idx
                            ? theme === 'dark'
                              ? colors.secondary
                              : colors?.primary
                            : colors.text_dark,
                        borderWidth: 2,
                        backgroundColor:
                          selected === idx
                            ? theme === 'dark'
                              ? colors.secondary
                              : colors.primary
                            : colors.bg,
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        marginRight: 3,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          height: '100%',
                        }}>
                        <Feather
                          name={'check'}
                          size={12}
                          color={selected === idx ? '#fff' : colors.bg}
                        />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        props?.setAddressToUpdate(address);
                        props?.setUpdateAddressBook(true);
                        closeSheet();
                      }}>
                      <MaterialCommunityIcons
                        name={'pencil'}
                        color={colors.text}
                        size={20}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setDeleteId(address?.id);
                        closeSheet();
                        setIsDeleteConfirm(true);
                      }}>
                      {deleteWalletAddress?.isPending ? (
                        <ActivityIndicator size={20} color="#ff6961" />
                      ) : (
                        <MaterialCommunityIcons
                          name={'delete'}
                          color="#ff6961"
                          size={20}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </RBSheet>
      <Modal visible={isDeleteConfirm} transparent={true}>
        <View style={styles.addAccountModalWrapper}>
          <View style={styles.sendModalHeader}>
            <View style={styles.sendModalHeaderSpacer}></View>
            <Text style={styles.sendModalHeaderText}>Confirm Deletion</Text>
            <TouchableOpacity
              style={styles.sendModalCloseButton}
              onPress={() => setIsDeleteConfirm(false)}>
              <Text style={styles.sendModalHeaderText}>X</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addAccountModalActionsWrapper}>
            <Text style={styles.addAccountModalDirections}>
              Are you sure you want to Delete?
            </Text>
            <View style={styles.addAccountActionButtons}>
              <TouchableOpacity
                style={styles.addAccountOkButton}
                onPress={() => confirmDelete()}
                disabled={deleteWalletAddress?.isPending}>
                {deleteWalletAddress?.isPending ? (
                  <ActivityIndicator size={20} color={colors.bg} />
                ) : (
                  <Text style={styles.addAccountOkButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </React.Fragment>
  );
};

const styling = colors =>
  StyleSheet.create({
    bottomWrapper: {
      paddingLeft: 20,
      paddingRight: 20,
      paddingBottom: 20,
    },
    bottomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    addressWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      width: '40%',
      marginBottom: 20,
    },
    addressInfo: {
      flexDirection: 'column',
      justifyContent: 'center',
      width: '100%',
      gap: 10,
    },
    label: {
      fontSize: 14,
      color: colors.text,
    },
    address: {
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      fontSize: 16,
      color: colors.text,
    },
    addressBook: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
    },
    noAddressAlert: {
      color: colors.text,
      textAlign: 'center',
      marginTop: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      fontSize: 16,
    },
    avatar: {
      height: 48,
      width: 48,
      borderRadius: 50,
      backgroundColor: colors.light_gray_bg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 22,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textTransform: 'capitalize',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    errorAlert: {
      marginBottom: 10,
      marginTop: -10,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      padding: 10,
      width: '100%',
      textAlign: 'center',
      position: 'absolute',
      zIndex: 1000,
      color: colors.text,
      borderRadius: 6,
    },
    addAccountModalWrapper: {
      position: 'absolute',
      top: '40%',
      backgroundColor: colors.bg,
      width: '90%',
      // height: 300,
      marginLeft: '5%',
      // marginBottom: '60%',
      elevation: 5,
      borderRadius: 10,
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000000',
      shadowOffset: {width: 5, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 20,
      borderRadius: 10,
      zIndex: 1000,
    },
    addAccountModalActionsWrapper: {
      paddingHorizontal: 10,
      marginTop: 20,
    },
    addAccountModalDirections: {
      textAlign: 'left',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanLight',
      marginBottom: 20,
    },
    addAccountActionButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
      marginTop: 10,
      marginLeft: 10,
    },
    addAccountOkButton: {
      width: 100,
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 10,
    },
    addAccountOkButtonText: {
      textAlign: 'center',
      fontSize: 16,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    sendModalHeader: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    sendModalHeaderSpacer: {
      width: 10,
    },
    sendModalHeaderText: {
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'center',
    },
  });

export default AddressBook;
