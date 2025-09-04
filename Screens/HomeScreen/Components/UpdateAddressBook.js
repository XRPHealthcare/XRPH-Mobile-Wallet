import React, {useRef} from 'react';

import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
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
import {TextInput} from 'react-native';
import {useUpdateWalletAddressToBook} from '../../../utils/wallet.api';
import isValidAddress from '../Handlers/validate_address';
import RBSheet from 'react-native-raw-bottom-sheet';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const UpdateAddressBook = props => {
  const bottomSheetRef = useRef(null);
  let {activeAccount, theme} = useStore();
  const updateWalletAddress = useUpdateWalletAddressToBook();

  const [addressForm, setAddressForm] = React.useState({
    walletLabel: '',
    walletAddress: '',
    walletAddressId: '',
  });
  const [errorMessage, setErrorMessage] = React.useState('');
  const [errorType, setErrorType] = React.useState('error');

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

  const closeSheet = () => {
    props.setUpdateAddressBook(false);
    bottomSheetRef?.current?.close();
  };

  React.useEffect(() => {
    if (props.updateAddressBook) {
      bottomSheetRef?.current?.open();
    } else {
      bottomSheetRef?.current?.close();
    }
  }, [props.updateAddressBook]);

  React.useEffect(() => {
    setAddressForm({
      walletLabel: props?.addressToUpdate?.walletLabel,
      walletAddress: props?.addressToUpdate?.walletAddress,
      walletAddressId: props?.addressToUpdate?.id,
    });
  }, [props.addressToUpdate]);

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
        height={400}
        customStyles={rbSheetStyles}
        closeOnPressBack={false}
        closeOnPressMask={false}>
        <View style={styles.bottomWrapper}>
          <ScrollView
            automaticallyAdjustKeyboardInsets={true}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}>
            <View style={styles.bottomHeader}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: colors.text,
                }}>
                Update Address Book
              </Text>
              <TouchableOpacity onPress={closeSheet}>
                <MaterialCommunityIcons
                  name={'close'}
                  color={colors.text}
                  size={30}
                />
              </TouchableOpacity>
            </View>

            <View style={{marginTop: 12}}>
              <Text style={styles.wallet}>Label</Text>
              <TextInput
                style={styles.toAddressInput}
                placeholder="Label"
                placeholderTextColor={colors.text_dark}
                value={addressForm?.walletLabel}
                onChangeText={text => {
                  setAddressForm({
                    ...addressForm,
                    walletLabel: text,
                  });
                }}
              />
            </View>
            <View>
              <Text style={styles.wallet}>Wallet Address</Text>
              <TextInput
                style={styles.toAddressInput}
                placeholder="Wallet Address"
                placeholderTextColor={colors.text_dark}
                value={addressForm?.walletAddress}
                onChangeText={text => {
                  setAddressForm({
                    ...addressForm,
                    walletAddress: text,
                  });
                }}
              />
            </View>
            {errorMessage?.length > 0 && (
              <View>
                <Text
                  style={[
                    styles.errorAlert,
                    {color: errorType === 'error' ? '#ff6961' : colors.primary},
                  ]}>
                  {errorMessage}
                </Text>
              </View>
            )}
            <View>
              <TouchableOpacity
                disabled={updateWalletAddress?.isPending}
                onPress={() => {
                  if (
                    !addressForm?.walletLabel ||
                    !addressForm?.walletAddress
                  ) {
                    setErrorMessage('Please fill all fields!');
                  } else if (!isValidAddress(addressForm?.walletAddress)) {
                    setErrorMessage('Invalid wallet address!');
                  } else if (
                    activeAccount?.classicAddress === addressForm?.walletAddress
                  ) {
                    setErrorMessage('Can not save own address!');
                  } else {
                    updateWalletAddress
                      ?.mutateAsync(addressForm)
                      .then(res => {
                        setErrorType('success');
                        setErrorMessage('Address updated successfully!');
                        setTimeout(() => {
                          closeSheet();
                        }, 1000);
                      })
                      .catch(err => {
                        setErrorMessage(
                          err?.message ||
                            'Something went wrong, please try again!',
                        );
                      });
                  }
                }}>
                <LinearGradient
                  colors={['#37C3A6', '#AF45EE']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={[
                    styles.paymentRequest,
                    {marginTop: errorMessage?.length > 0 ? 0 : 20},
                  ]}>
                  {updateWalletAddress?.isPending ? (
                    <ActivityIndicator size={25} color="#fff" />
                  ) : (
                    <Text style={styles.paymentRequestText}>Update</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </RBSheet>
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
    },

    wallet: {
      marginTop: 20,
      fontSize: 14,
      color: colors.text,
    },
    toAddressInput: {
      backgroundColor: colors.light_gray_bg,
      borderColor: colors.primary,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      fontSize: 16,
      color: colors.text,
      width: '100%',
      marginTop: 10,
      padding: 15,
      borderRadius: 8,
    },
    errorAlert: {
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      padding: 10,
      width: '100%',
      textAlign: 'center',
    },
    paymentRequest: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
    },
    paymentRequestText: {
      textAlign: 'center',
      fontSize: 18,
      color: '#fff',
    },
    addAccountModalWrapper: {
      position: 'absolute',
      top: 50,
      backgroundColor: colors.secondary,
      width: '100%',
      height: 30,
      elevation: 10,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    sendModalHeaderText: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'left',
    },
    sendModalHeaderTextName: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'left',
      marginTop: 4,
    },
    sendModalHeader: {
      width: '100%',
      height: 100,
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      // alignItems: 'center',
      marginTop: 50,
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
  });

export default UpdateAddressBook;
