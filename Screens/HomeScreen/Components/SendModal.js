import React from 'react';

import {
  Text,
  TextInput,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  Pressable,
  Image,
} from 'react-native';
import isValidAddress from '../Handlers/validate_address';
import useStore from '../../../data/store';
import {light, dark} from '../../../assets/colors/colors';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';

import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import firestore from '@react-native-firebase/firestore';
import getAccountStatus from '../Handlers/get_account_status';
import {trigger} from 'react-native-haptic-feedback';
import SaveToAddressBook from './SaveToAddressBook';
import UpdateAddressBook from './UpdateAddressBook';
import AddressBook from './AddressBook';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import {
  check,
  openSettings,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import {useNetInfoInstance} from '@react-native-community/netinfo';
import {
  ArrowSqrLeftBlackIcon,
  ArrowSqrLeftWhiteIcon,
} from '../../../assets/img/new-design';
import SelectToken from './SelectToken';
import SelectCurrency from './SelectCurrency';
import {GestureHandlerRootView, ScrollView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const SendModal = props => {
  const {
    netInfo: {isConnected},
    refresh,
  } = useNetInfoInstance();
  let {
    activeAccount,
    destinationAddress,
    token,
    tokenRate,
    amount,
    memo,
    destinationTag,
    rateLoading,
    exchangeRate,
    theme,
    exchangeTo,
    node,
    rpcUrls,
    hepticOptions,
    accountBalances,
  } = useStore();
  const setDestinationAddress = useStore(state => state.setDestinationAddress);
  const setToken = useStore(state => state.setToken);
  const setMemo = useStore(state => state.setMemo);
  const setDestinationTag = useStore(state => state.setDestinationTag);
  const setExchangeRate = useStore(state => state.setExchangeRate);
  const setExchangeTo = useStore(state => state.setExchangeTo);
  const setNode = useStore(state => state.setNode);

  const [walletAddressErrorMessage, setWalletAddressErrorMessage] =
    React.useState('');
  const [amountErrorMessage, setAmountErrorMessage] = React.useState('');
  const [isSaveToAddressBook, setIsSaveToAddressBook] = React.useState(false);
  const [isAddressBook, setIsAddressBook] = React.useState(false);
  const [isScanQR, setIsScanQR] = React.useState(false);
  const [isPermission, setIsPemission] = React.useState(false);
  const [addressBookError, setAddressBookError] = React.useState('');
  const [updateAddressBook, setUpdateAddressBook] = React.useState(false);
  const [addressToUpdate, setAddressToUpdate] = React.useState(null);

  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [destTagModalOpen, setDestTagModalOpen] = React.useState(false);
  const [requireDestTagModalOpen, setRequireDestTagModalOpen] =
    React.useState(false);
  const [exchangeObject, setExchangeObject] = React.useState(false);
  const [DTagError, setDTagError] = React.useState('');
  const [bottomMargin, setBottomMargin] = React.useState(0);
  const [undfundedModalOpen, setUnfundedModalOpen] = React.useState(false);
  const [unfundedError, setUnfundedError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [exchanges, setExchanges] = React.useState(new Map());

  const [textFocused, setTextFocused] = React.useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);
  const [isSelectOpen, setIsSelectOpen] = React.useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = React.useState(false);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors, theme);

  const checkWalletAddress = walletAddress => {
    console.log(walletAddress);
    const isValid = isValidAddress(walletAddress);
    if (isValid) {
      if (walletAddress === activeAccount.classicAddress) {
        setWalletAddressErrorMessage('Error: Cannot send to yourself.');
        trigger('impactHeavy', hepticOptions);
        return false;
      } else {
        setWalletAddressErrorMessage('');
        return true;
      }
    } else {
      setWalletAddressErrorMessage('Error: Invalid wallet address.');
      trigger('impactHeavy', hepticOptions);
      return false;
    }
  };

  const checkAmount = amount => {
    if (amount === 0 || amount === '0' || amount === '') {
      setAmountErrorMessage('Error: Amount must be nonzero.');
      trigger('impactHeavy', hepticOptions);
      return false;
    }
    if (Number(token.value) >= Number(amount)) {
      console.log(token);
      setAmountErrorMessage('');
      return true;
    } else {
      setAmountErrorMessage('Error: Amount must not exceed available balance.');
      trigger('impactHeavy', hepticOptions);
      return false;
    }
  };

  const checkIfSendingToExchange = async destinationAddress => {
    try {
      const res = await firestore()
        .collection('exchanges')
        .where('wallet_address', '==', destinationAddress)
        .get();
      console.log();
      return res['_docs'][0]['_data'];
    } catch (e) {
      return undefined;
    }

    // if (res['_data'].XRPHrate === undefined || res['_data'].XRPrate === undefined) {
    //     setError("Unfortunately we could not connect your account.");
    // } else {
    //     const exchangeRates = res['_data'];
    //     allRates[currencies[i]].XRPrate = exchangeRates.XRPrate;
    //     allRates[currencies[i]].XRPHrate = exchangeRates.XRPHrate;
    //     // XRPrate = exchangeRates.XRPrate;
    //     // XRPHrate = exchangeRates.XRPHrate;
    // }
    // rNFugeoj3ZN8Wv6xhuLegUBBPXKCyWLRkB
    // rnABCzGhPNBMEasbgLfJ8mo9NDWm6828mf
  };

  const getExchanges = async () => {
    const res = await firestore().collection('exchanges').get();
    let map = new Map();

    for (let i = 0; i < res['_docs'].length; i++) {
      map.set(
        res['_docs'][i]['_data'].wallet_address,
        res['_docs'][i]['_data'].name,
      );
    }
    console.log(map);
    setExchanges(map);
    // get a map of exchanges
    // get all docs in exchanges DB
    // key: value --> wallet address : name
    // check if dest address is in map (key) then get value
  };

  const reviewSendTx1 = () => {
    setWalletAddressErrorMessage('');
    if (checkWalletAddress(destinationAddress) && checkAmount(amount)) {
      // check firestore to see if sending to an exchange
      // check if unfunded account
      if (exchanges.has(destinationAddress)) {
        setLoading(false);
        setRequireDestTagModalOpen(true);
        console.log(exchanges.get(destinationAddress));
      } else {
        setLoading(true);
        console.log('loading');
        getAccountStatus(destinationAddress, node, rpcUrls, setNode)
          .then(res => {
            if (res.hasOwnProperty('errorCode')) {
              console.log(res.errorCode);
              setWalletAddressErrorMessage(
                'Error: Could not connect to the server.',
              );
              trigger('impactHeavy', hepticOptions);
              setLoading(false);
            } else {
              props.setStep(2);
              setLoading(false); // rNFugeoj3ZN8Wv6xhuLegUBBPXKCyWLRkB
              console.log('done loading, all good');
            }
          })
          .catch(err => {
            setLoading(false);
            console.log('E:------------', err.message); // account unfunded
            if (err.message === 'Account not found.') {
              setUnfundedError(true);
              setUnfundedModalOpen(true);
            } else {
              setWalletAddressErrorMessage(
                'Error: Could not connect to the server.',
              );
              setLoading(false);
            }
            console.log('done loading, error caught');
          });
      }
    }
  };

  const cancelReviewSend = () => {
    setLoading(false);
    props.setStep(1);
    setUnfundedError(false);
    setUnfundedModalOpen(false);
    setRequireDestTagModalOpen(false);
  };

  const reviewSendTx2 = () => {
    setDestTagModalOpen(false);
    props.setStep(1);
    props.reviewSendTransaction();
  };

  const checkDestTag = () => {
    // set reveiw dest modal open
    // click yes --> reviewSendTx2
    // click no --> close modal
    if (destinationTag.length > 0) {
      setDestTagModalOpen(true);
    } else {
      setDestTagModalOpen(false);
      reviewSendTx2();
    }
  };

  const onShow = () => {
    if (activeAccount?.balances?.length > 0) {
      props.fetchExchangeRates(token?.currency, 'USD');
      // props.setAmountAndExRate(0);
      // setToken(activeAccount.balances[0]);
    }
    getExchanges();
  };

  const onClose = () => {
    setWalletAddressErrorMessage('');
    setAmountErrorMessage('');
    //    setToken(activeAccount?.balances?.[0]);
    props.closeSendModal(); // !!!!
  };

  const onCameraOpen = async () => {
    try {
      const result = await launchImageLibrary();
      console.log(result.assets[0].uri);
      const {values} = await RNQRGenerator.detect({
        uri: result.assets[0].uri,
      });
      setDestinationAddress(values[0]);
    } catch (e) {}
  };

  const enterTag = () => {
    if (destinationTag.length > 0) {
      setExchangeObject(true);
      setRequireDestTagModalOpen(false);
      setDTagError('');
      setBottomMargin(0);
      props.reviewSendTransaction();
    } else {
      setDTagError('Error: Destination tag cannot be left empty.');
    }
  };

  // const handleStepper = () => {
  //     if (step === 1) {
  //         setStep(2);
  //     } else if (step === 2) {
  //         setStep(1);
  //     }
  // }

  const continueUnfundedAccount = () => {
    setUnfundedModalOpen(false);
    setUnfundedError(false);
    props.setStep(2);
  };

  let dismissKeyboard = () => {
    setTextFocused(false);
    return new Promise((resolve, reject) => {
      Keyboard.dismiss();
      setTimeout(() => {
        resolve();
      }, 5);
    });
  };

  const clickOutOfDTag = () => {
    setDTagError('');
    setBottomMargin(0);
    setRequireDestTagModalOpen(false);
  };

  const setAmtExRate = amount => {
    props.setAmountAndExRate(amount);
  };

  const setDestinationTagObj = tag => {
    setDestinationTag(tag);
    console.log(exchangeObject);
  };

  const onSuccess = e => {
    setDestinationAddress(e?.data);
    setIsScanQR(false);
  };

  const checkEnoughFee = () => {
    let findXRP = accountBalances.find(
      item => item.currency.toUpperCase() === 'XRP',
    );
    if (findXRP) {
      if (
        Number(findXRP?.value) < 0.00008 ||
        (token?.currency === 'XRP' &&
          Number(Number(findXRP?.value) - Number(amount)) < 0.00008)
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  React.useEffect(() => {
    setTimeout(() => {
      setAddressBookError('');
    }, 3000);
  }, [addressBookError]);

  React.useEffect(() => {
    check(PERMISSIONS.IOS.CAMERA)
      .then(result => {
        switch (result) {
          case RESULTS.DENIED:
            console.log(
              'The permission has not been requested / is denied but requestable',
            );
            request(PERMISSIONS.IOS.CAMERA).then(response => {
              if (response === RESULTS.GRANTED) {
                setIsPemission(false);
              } else {
                if (isScanQR) {
                  setIsScanQR(false);
                  setIsPemission(true);
                }
              }
            });
            break;
          case RESULTS.GRANTED:
            console.log('The permission is granted');
            setIsPemission(false);
            break;
          case RESULTS.BLOCKED:
            console.log('The permission is denied and not requestable anymore');
            if (isScanQR) {
              setIsScanQR(false);
              setIsPemission(true);
            }

            break;
        }
      })
      .catch(error => {
        // …
      });
  }, [isScanQR]);

  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other action
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={colors.bg}>
        <Modal
          visible={props.sendModalOpen}
          transparent={true}
          useNativeDriver={true}
          onShow={onShow}>
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.sendModalWrapper}>
              <View style={styles.header}>
                <Pressable
                  onPress={() => {
                    if (props?.step === 1) {
                      onClose();
                    } else if (props?.step === 2) {
                      props.setStep(1);
                    }
                  }}>
                  {theme === 'dark' ? (
                    <ArrowSqrLeftWhiteIcon />
                  ) : (
                    <ArrowSqrLeftBlackIcon />
                  )}
                </Pressable>
                <Text style={styles.headerHeading}>Send</Text>
                <Text style={{width: 20}}></Text>
              </View>
              <Image
                source={require('../../../assets/img/new-design/bg-gradient.png')}
                style={styles.greenShadow}
              />

              <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}>
                {props.step === 1 && [
                  <View key="1" style={styles.sendModalFromWrapper}>
                    {
                      // FROM
                    }
                    <Text
                      style={[styles.sendModalInputLabel, {marginBottom: 16}]}>
                      From
                    </Text>
                    <View style={styles.sendModalAccount}>
                      <Text style={styles.sendModalInputLabelAcc}>
                        {activeAccount.name}
                      </Text>
                      <Text style={styles.sendModalInputLabelLight}>
                        {activeAccount.classicAddress}
                      </Text>
                    </View>
                  </View>,
                  <View key="2" style={styles.sendModalToWrapper}>
                    {
                      // TO
                    }
                    <Text style={styles.sendModalInputLabel}>To</Text>
                    <View style={[styles.row]}>
                      <TextInput
                        style={styles.toAddressInput}
                        onChangeText={text => {
                          setDestinationAddress(text);
                        }}
                        value={destinationAddress + ''}
                        placeholder="Wallet Address"
                        placeholderTextColor={colors.text_dark}
                        onPressIn={() => setTextFocused(true)}
                        onSubmitEditing={() => setTextFocused(false)}
                      />
                      <TouchableOpacity
                        onPress={() => setIsAddressBook(true)}
                        style={styles.toActionButton}>
                        <AntDesign
                          name={'user'}
                          size={20}
                          color={colors.text}
                          style={styles.backIcon}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.toActionButton}
                        onPress={() => setIsScanQR(true)}>
                        <AntDesign
                          name={'qrcode'}
                          size={20}
                          color={colors.text}
                          style={styles.backIcon}
                        />
                      </TouchableOpacity>
                      {/* <TouchableOpacity style={styles.scanButton} onPress={onCameraOpen}>
                                        <Ionicons name={"scan"} size={20} color={colors.text} />
                                    </TouchableOpacity> */}
                    </View>
                    <View key="err">
                      {addressBookError.length > 0 && (
                        <Text style={styles.addressBookError}>
                          {addressBookError}
                        </Text>
                      )}
                    </View>
                    <View style={styles.saveToAddressBookWrapper}>
                      <TouchableOpacity
                        style={{
                          borderColor: isSaveToAddressBook
                            ? theme === 'dark'
                              ? colors.secondary
                              : colors?.primary
                            : colors.text_dark,
                          borderWidth: 2,
                          backgroundColor: isSaveToAddressBook
                            ? theme === 'dark'
                              ? colors.secondary
                              : colors.primary
                            : colors.bg,
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                        }}
                        onPress={() => {
                          if (destinationAddress) {
                            setIsSaveToAddressBook(!isSaveToAddressBook);
                          } else {
                            setAddressBookError(
                              'Please enter valid wallet address!',
                            );
                          }
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
                            color={isSaveToAddressBook ? '#fff' : colors.bg}
                          />
                        </View>
                      </TouchableOpacity>
                      <Text
                        style={styles.saveToAddressText}
                        onPress={() => {
                          if (destinationAddress) {
                            setIsSaveToAddressBook(!isSaveToAddressBook);
                          } else {
                            setAddressBookError(
                              'Please enter valid wallet address!',
                            );
                          }
                        }}>
                        Save to address book
                      </Text>
                    </View>
                  </View>,
                  <View key="3" style={styles.sendModalTokenWrapper}>
                    {
                      // TOKEN
                    }
                    <Text
                      style={[styles.sendModalInputLabel, {marginBottom: 16}]}>
                      Token
                    </Text>
                    {accountBalances?.length > 0 && (
                      <View style={styles.sendModalToken}>
                        <Pressable
                          onPress={() => {
                            setIsSelectOpen(true);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              gap: 8,
                              alignItems: 'center',
                            }}>
                            <View
                              style={{
                                flexDirection: 'column',
                                gap: 6,
                              }}>
                              <Text style={styles.selectedCurrency}>
                                {(token && token?.currency) || 'Select'}
                              </Text>
                              <Text style={styles.sendModalAvailableBalance}>
                                Available:{' '}
                                {Number(token?.value) < 0 ? 0 : token?.value}
                              </Text>
                            </View>
                          </View>
                          <Feather
                            name={'chevron-down'}
                            size={20}
                            color={colors.text}
                          />
                        </Pressable>
                      </View>
                    )}
                    <Text style={styles.sendModalTransactionFeeLabel}>
                      Transaction Fee: 0.00008 XRP
                    </Text>
                  </View>,
                  <View key="4" style={styles.sendModalAmountWrapper}>
                    {
                      // AMOUNT
                    }
                    <Text
                      style={[styles.sendModalInputLabel, {marginBottom: 16}]}>
                      Amount
                    </Text>
                    <View style={{position: 'relative'}}>
                      <TextInput
                        style={styles.amountInput}
                        onChangeText={setAmtExRate}
                        value={amount}
                        placeholder="0"
                        placeholderTextColor={colors.text_dark}
                        keyboardType={
                          Platform.OS === 'ios' ? 'decimal-pad' : 'decimal-pad'
                        }
                        returnKeyType={'done'}
                        onPressIn={() => setTextFocused(true)}
                        onSubmitEditing={() => setTextFocused(false)}
                      />
                    </View>
                    <View style={styles.sendModalExchangeRate}>
                      {exchangeTo === 'USD' && (
                        <Text style={styles.sendModalConversionLabel}>
                          <Text style={styles.inputLabelCharacter}>~</Text> ${' '}
                          {rateLoading ? 'Loading...' : exchangeRate}
                        </Text>
                      )}
                      {exchangeTo === 'EUR' && (
                        <Text style={styles.sendModalConversionLabel}>
                          <Text style={styles.inputLabelCharacter}>~</Text> €{' '}
                          {rateLoading ? 'Loading...' : exchangeRate}
                        </Text>
                      )}
                      {exchangeTo === 'GBP' && (
                        <Text style={styles.sendModalConversionLabel}>
                          <Text style={styles.inputLabelCharacter}>~</Text> £{' '}
                          {rateLoading ? 'Loading...' : exchangeRate}
                        </Text>
                      )}
                      <Pressable
                        onPress={() => {
                          setIsCurrencyOpen(true);
                        }}>
                        <Feather
                          name={'chevron-down'}
                          size={20}
                          color={colors.text}
                        />
                      </Pressable>
                    </View>
                  </View>,
                  <View key="err">
                    {walletAddressErrorMessage.length > 0 && (
                      <Text style={styles.errorMessageText}>
                        {walletAddressErrorMessage}
                      </Text>
                    )}
                    {amountErrorMessage.length > 0 && (
                      <Text style={styles.errorMessageText}>
                        {amountErrorMessage}
                      </Text>
                    )}
                  </View>,
                ]}
                {props.step === 2 && [
                  <View key="1" style={styles.sendModalTransactionFeeWrapper2}>
                    {
                      // MEMO
                    }
                    <Text style={styles.sendModalInputLabel}>Memo</Text>
                    <TextInput
                      style={styles.accountNameInput}
                      onChangeText={setMemo}
                      value={memo}
                      placeholder="Enter a public memo  (optional)"
                      placeholderTextColor={colors.text_dark}
                      onPressIn={() => setTextFocused(true)}
                    />
                  </View>,
                  <View key="2" style={styles.sendModalTransactionFeeWrapper}>
                    {
                      // DESTINATION TAG
                    }
                    <Text style={styles.sendModalInputLabel}>
                      Destination Tag
                    </Text>
                    <TextInput
                      style={styles.accountNameInput}
                      onChangeText={setDestinationTagObj}
                      value={destinationTag}
                      placeholder="Enter a destination tag  (only for exchanges)"
                      placeholderTextColor={colors.text_dark}
                      editable={exchangeObject === false}
                      onPressIn={() => setTextFocused(true)}
                    />
                    <Text style={styles.note}>Note</Text>
                    <View
                      style={[
                        styles.row,
                        {
                          alignItems: 'flex-start',
                        },
                      ]}>
                      <Text style={styles.sendModalInputLabelLightD}>•</Text>
                      <Text style={styles.sendModalInputLabelLightD}>
                        Destination Tags are NOT required if you are sending to
                        an XRPH Wallet or a XUMM Wallet.
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.row,
                        {
                          alignItems: 'flex-start',
                        },
                      ]}>
                      <Text style={styles.sendModalInputLabelLightD}>•</Text>
                      <Text style={styles.sendModalInputLabelLightD}>
                        This helps identify you as the receiver of the deposit.
                        Don’t forget to add it or your deposit could be lost.
                      </Text>
                    </View>
                  </View>,
                  <View key="3" style={styles.sendActionButtonsContainer}>
                    {!isKeyboardVisible && (
                      <TouchableOpacity
                        style={styles.buttonCreate}
                        onPress={checkDestTag}>
                        <View style={styles.buttonWrapper}>
                          <Text style={styles.buttonCreateText}>
                            Review Payment
                          </Text>
                          <AntDesign
                            name={'arrowright'}
                            size={24}
                            color={colors.bg}
                            style={styles.continueIcon}
                          />
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>,
                ]}
              </ScrollView>

              {!loading && !isKeyboardVisible && props.step === 1 && (
                <View style={styles.sendActionButtonsContainer}>
                  <TouchableOpacity
                    style={styles.buttonCreate}
                    onPress={() => {
                      if (checkEnoughFee()) {
                        reviewSendTx1();
                      } else {
                        setAmountErrorMessage(
                          'Error: Insufficient gas fee, please add some XRP!',
                        );
                        setTimeout(() => {
                          setAmountErrorMessage('');
                        }, 3000);
                      }
                    }}>
                    <View style={styles.buttonWrapper}>
                      <Text style={styles.buttonCreateText}>Continue</Text>
                      <AntDesign
                        name={'arrowright'}
                        size={24}
                        color={colors.bg}
                        style={styles.continueIcon}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>

          <Modal visible={destTagModalOpen} transparent={true}>
            <View style={styles.addAccountModalWrapper}>
              <View style={styles.sendModalHeaderSmall}>
                <Text style={styles.sendModalHeaderSmallText}>
                  Send To This Destination?
                </Text>
              </View>
              <View style={styles.addAccountModalActionsWrapper}>
                <Text style={styles.sendModalInputLabelLeft}>
                  Destination Address
                </Text>
                <View style={styles.sendModalAccountFull}>
                  <Text style={styles.sendModalInputLabelLight}>
                    {destinationAddress}
                  </Text>
                </View>
                <Text style={styles.sendModalInputLabelLeft}>
                  Destination Tag
                </Text>
                <View style={styles.sendModalAccountFull}>
                  <Text style={styles.sendModalInputLabelLight}>
                    {destinationTag}
                  </Text>
                </View>

                <View style={styles.addAccountActionButtons}>
                  <TouchableOpacity
                    style={styles.noButton}
                    onPress={() => setDestTagModalOpen(false)}>
                    <View style={styles.saveButton}>
                      <Text style={styles.addAccountOkButtonText}>No</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.yesButton}
                    onPress={reviewSendTx2}>
                    <View style={styles.saveButton}>
                      <Text style={styles.addAccountOkButtonText}>Yes</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={undfundedModalOpen} transparent={true}>
            <View
              style={[styles.addAccountModalWrapperLong, {bottom: 0}]}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              {unfundedError && isConnected ? (
                <View style={styles.addAccountModalActionsWrapper}>
                  <Text style={styles.sendModalInputLabelLeft1}>
                    Looks like you're sending to an unfunded account.
                  </Text>
                  {token?.currency === 'XRP' && amount >= 1.07 && (
                    <Text style={styles.sendModalInputLabelLeft2}>
                      Please note that 1.7 XRP of your {amount} XRP will be used
                      as a reserve.
                    </Text>
                  )}
                  {token?.currency === 'XRP' && amount < 1.7 && (
                    <Text style={styles.sendModalInputLabelLeft2}>
                      You must send at least 1.7 XRP in order to fund this
                      account.
                    </Text>
                  )}
                  {token?.currency !== 'XRP' && (
                    <Text style={styles.sendModalInputLabelLeft2}>
                      You cannot send non-XRP tokens to an account until it is
                      first funded.
                    </Text>
                  )}

                  {token?.currency === 'XRP' && amount >= 1.7 && (
                    <View style={styles.addAccountActionButtons2}>
                      <TouchableOpacity
                        style={styles.contButton}
                        onPress={continueUnfundedAccount}>
                        <View style={styles.saveButton}>
                          <Text style={styles.addAccountOkButtonText}>
                            Continue
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                  {token?.currency === 'XRP' && amount < 1.7 && (
                    <View style={styles.addAccountActionButtons2}>
                      <TouchableOpacity
                        style={styles.contButton}
                        onPress={() => {
                          setUnfundedModalOpen(false);
                          setUnfundedError(false);
                        }}>
                        <View style={styles.saveButton}>
                          <Text style={styles.addAccountOkButtonText}>
                            Okay
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                  {token?.currency !== 'XRP' && (
                    <View style={styles.addAccountActionButtons2}>
                      <TouchableOpacity
                        style={styles.contButton}
                        onPress={() => {
                          setUnfundedModalOpen(false);
                          setUnfundedError(false);
                        }}>
                        <View style={styles.saveButton}>
                          <Text style={styles.addAccountOkButtonText}>
                            Okay
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ) : token === undefined ? (
                <View style={styles.addAccountModalActionsWrapper}>
                  <Text style={styles.sendModalInputLabelLeft1}>
                    Please reselect the currency you want to send.
                  </Text>
                  <View style={styles.addAccountActionButtons2}>
                    <TouchableOpacity
                      style={styles.contButton}
                      onPress={() => {
                        setUnfundedModalOpen(false);
                        setUnfundedError(false);
                      }}>
                      <View style={styles.saveButton}>
                        <Text style={styles.addAccountOkButtonText}>Okay</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                !isConnected && (
                  <View style={styles.addAccountModalActionsWrapper}>
                    <Text style={styles.sendModalInputLabelLeft1}>
                      Looks like you're not connected to Internet.
                    </Text>
                    <View style={styles.addAccountActionButtons2}>
                      <TouchableOpacity
                        style={styles.contButton}
                        onPress={() => {
                          setUnfundedModalOpen(false);
                          setUnfundedError(false);
                        }}>
                        <View style={styles.saveButton}>
                          <Text style={styles.addAccountOkButtonText}>
                            Okay
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              )}
            </View>
          </Modal>

          <Modal
            visible={requireDestTagModalOpen}
            transparent={true}
            onRequestClose={clickOutOfDTag}>
            {/* <TouchableOpacity 
                        // activeOpacity={1} 
                        // onPressOut={clickOutOfDTag}
                    > */}
            {/* <ScrollView 
                        directionalLockEnabled={true} 
                        > */}
            <TouchableWithoutFeedback onPress={clickOutOfDTag}>
              <View style={{height: '100%', width: '100%'}} />
            </TouchableWithoutFeedback>
            <KeyboardAvoidingView
              style={[
                styles.addAccountModalWrapperLong,
                {bottom: bottomMargin},
              ]}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <TouchableWithoutFeedback>
                <View style={styles.addAccountModalActionsWrapper}>
                  <Text style={styles.sendModalInputLabelLeft1}>
                    It appears you are sending tokens to{' '}
                    {exchanges.get(destinationAddress)}.
                  </Text>
                  <Text style={styles.sendModalInputLabelLeft2}>
                    This address requires a destination tag.
                  </Text>

                  <TextInput
                    style={styles.dtagInput}
                    onChangeText={setDestinationTag}
                    value={destinationTag}
                    placeholder="Enter a destination tag..."
                    placeholderTextColor={colors.text_dark}
                    onFocus={() =>
                      Platform.OS === 'ios' && setBottomMargin(250)
                    }
                    onBlur={() => Platform.OS === 'ios' && setBottomMargin(0)}
                  />
                  {DTagError.length > 0 && (
                    <Text style={styles.errorMessageText}>{DTagError}</Text>
                  )}
                  <View style={styles.addAccountActionButtons2}>
                    <TouchableOpacity
                      style={styles.contButton}
                      onPress={enterTag}>
                      <View style={styles.saveButton}>
                        <Text style={styles.addAccountOkButtonText}>
                          Continue
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
            {/* </ScrollView> */}
            {/* </TouchableOpacity> */}
          </Modal>

          <Modal visible={isScanQR} transparent={true}>
            <View style={styles.cameraParentWrapper}>
              <View style={styles.cameraModalHeader}>
                <View style={styles.sendModalHeaderSpacer}>
                  <TouchableOpacity
                    onPress={() => {
                      setIsScanQR(false);
                    }}
                    style={{
                      marginTop: 8,
                      marginLeft: -10,
                    }}>
                    <Feather
                      name={'chevron-left'}
                      size={35}
                      color={colors.text}
                      style={styles.backIcon}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.sendModalHeaderTextLarge}>
                  {' '}
                  Scan Wallet Address
                </Text>
                <View style={styles.sendModalHeaderSpacer}></View>
              </View>
              <View style={styles.cameraWrapper}>
                <QRCodeScanner
                  onRead={onSuccess}
                  flashMode={RNCamera.Constants.FlashMode.auto}
                  cameraStyle={styles.cameraContainer}
                  showMarker={true}
                />
              </View>
              <View>
                <Text style={styles.cameraText}>
                  Keep your phone steady on QR Code to scan successfully
                </Text>
              </View>
            </View>
          </Modal>
          <Modal visible={isPermission} transparent={true}>
            <View style={styles.addAccountModalWrapper}>
              <View style={styles.sendModalHeader}>
                <View style={styles.sendModalHeaderSpacer}></View>
                <Text style={styles.sendModalHeaderText}>
                  Camera Permission
                </Text>
                <TouchableOpacity
                  style={styles.sendModalCloseButton}
                  onPress={() => setIsPemission(false)}>
                  <Text style={styles.sendModalHeaderText}>X</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.addAccountModalActionsWrapper}>
                <Text style={styles.addAccountModalDirections}>
                  Access to the camera has been denied. You can enable
                  permissions in the Settings.
                </Text>
                <View style={styles.addAccountActionButtons}>
                  <TouchableOpacity
                    style={styles.addAccountOkButton}
                    onPress={() =>
                      openSettings().then(() => {
                        setIsPemission(false);
                      })
                    }>
                    <Text style={styles.addAccountOkButtonText}>
                      Open Settings
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          <SaveToAddressBook
            destinationAddress={destinationAddress}
            saveModalOpen={isSaveToAddressBook}
            setSaveModalOpen={setIsSaveToAddressBook}
          />
          <SelectToken
            isOpen={isSelectOpen}
            onSelect={selectedItem => {
              setToken(selectedItem);
              props.fetchExchangeRates(selectedItem?.currency, exchangeTo);
              const completeRate = parseFloat(tokenRate * amount);
              setExchangeRate(String(completeRate));
              setIsSelectOpen(false);
            }}
            onClose={() => {
              setIsSelectOpen(false);
            }}
          />
          <SelectCurrency
            isOpen={isCurrencyOpen}
            onSelect={selectedItem => {
              setExchangeTo(selectedItem);
              props.fetchExchangeRates(token?.currency, selectedItem);
              props.setAmountAndExRate(amount);
              setIsCurrencyOpen(false);
            }}
            onClose={() => {
              setIsCurrencyOpen(false);
            }}
          />
          <UpdateAddressBook
            addressToUpdate={addressToUpdate}
            updateAddressBook={updateAddressBook}
            setUpdateAddressBook={setUpdateAddressBook}
          />
          <AddressBook
            isAddressBook={isAddressBook}
            setAddressBook={setIsAddressBook}
            setDestinationAddress={setDestinationAddress}
            addressBookLoading={props?.addressBookLoading}
            addressBook={props?.addressBook}
            setUpdateAddressBook={setUpdateAddressBook}
            setAddressToUpdate={setAddressToUpdate}
          />
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styling = (colors, theme) =>
  StyleSheet.create({
    scrollContainer: {
      width: '100%',
      flex: 1,
    },

    scrollContentContainer: {
      paddingBottom: 80, // Add padding to account for bottom buttons
    },

    sendModalWrapper: {
      backgroundColor: colors.bg_gray,
      height: '100%',
      width: '100%',
      elevation: 5,
      shadowColor: '#000000',
      shadowOffset: {width: 5, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 20,
      borderRadius: 10,
      justifyContent: 'flex-start',
      alignItems: 'center',
    },

    sendActionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 20,
      position: 'absolute',
      bottom: 20,
      backgroundColor: colors.bg_gray,
      paddingTop: 10,
    },

    greenShadow: {
      position: 'absolute',
      top: 0,
      zIndex: -1,
      marginTop: -250,
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
    sendModalHeader: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 40,
      marginBottom: 30,
    },
    sendModalHeaderSmall: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      marginBottom: 10,
    },
    sendModalHeaderSpacer: {
      width: 60,
    },
    sendModalHeaderText: {
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'right',
      paddingRight: 10,
    },
    sendModalHeaderSmallText: {
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'center',
      paddingRight: 10,
      width: '100%',
    },
    sendModalHeaderTextLarge: {
      fontSize: 22,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'right',
      paddingRight: 10,
      paddingTop: 10,
    },
    sendModalFromWrapper: {
      width: '100%',
      marginTop: 24,
      paddingHorizontal: 20,
      flexDirection: 'column',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    sendModalAccount: {
      backgroundColor: colors.bg_otp_input,
      borderRadius: 8,
      paddingVertical: 17,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.border_gray,
    },
    sendModalAccountFull: {
      backgroundColor: colors.text_light,
      borderRadius: 5,
      width: '100%',
      padding: 6,
    },
    sendModalInputLabel: {
      fontSize: 14,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text_gray,
      marginBottom: 10,
    },
    sendModalInputLabelAcc: {
      fontSize: 12,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: '#8F92A1',
    },
    sendModalInputLabelLeft: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      // paddingLeft: 5,
      paddingTop: 5,
      paddingBottom: 3,
      alignSelf: 'flex-start',
    },
    sendModalInputLabelLeft1: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      // paddingLeft: 5,
      paddingTop: 5,
      paddingBottom: 3,
      alignSelf: 'flex-start',
      marginTop: 10,
    },
    sendModalInputLabelLeft2: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      // paddingLeft: 5,
      paddingTop: 5,
      paddingBottom: 3,
      alignSelf: 'flex-start',
      marginBottom: 30,
      marginTop: 5,
    },
    sendModalInputLabelLight: {
      fontSize: 14,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text_dark,
    },
    note: {
      marginTop: 18,
      fontSize: 14,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text_dark,
      paddingBottom: 10,
      lineHeight: 16,
    },
    sendModalInputLabelLightD: {
      fontSize: 12,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text_gray,
      lineHeight: 16,
    },
    sendModalToWrapper: {
      width: '100%',
      paddingHorizontal: 20,
      flexDirection: 'column',
      justifyContent: 'space-between',
      marginTop: 18,
    },
    sendModalTokenWrapper: {
      width: '100%',
      paddingHorizontal: 20,
      flexDirection: 'column',
      justifyContent: 'space-between',
      marginTop: 18,
    },
    sendModalToken: {
      backgroundColor: colors.bg_otp_input,
      borderRadius: 8,
      height: 76,
      borderWidth: 1,
      borderColor: colors.border_gray,
      paddingVertical: 15,
      paddingHorizontal: 14,
    },
    sendModalTxFee: {
      backgroundColor: colors.text_light,
      borderRadius: 5,
      marginTop: 5,
    },
    sendModalExchangeRate: {
      backgroundColor: colors.bg_otp_input,
      borderWidth: 1,
      borderColor: colors.border_gray,
      paddingVertical: 5,
      paddingHorizontal: 14,
      borderRadius: 8,
      marginTop: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sendModalAmountWrapper: {
      width: '100%',
      paddingHorizontal: 20,
      flexDirection: 'column',
      justifyContent: 'space-between',
      marginTop: 18,
    },
    inputLabelCharacter: {
      fontFamily: 'Helvetica',
    },
    sendModalConversionLabel: {
      fontSize: 12,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
    },
    sendModalTransactionFeeWrapper: {
      width: '100%',
      paddingHorizontal: 20,
      flexDirection: 'column',
      justifyContent: 'space-between',
      marginBottom: 18,
    },
    sendModalTransactionFeeWrapper2: {
      width: '100%',
      paddingHorizontal: 20,
      flexDirection: 'column',
      justifyContent: 'space-between',
      marginBottom: 18,
      marginTop: 24,
    },
    sendModalTransactionFeeLabel: {
      fontSize: 12,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text_gray,
      paddingTop: 8,
    },
    accountNameInput: {
      height: 54,
      marginTop: 6,
      paddingHorizontal: 14,
      paddingVertical: 15,
      backgroundColor: colors.bg_otp_input,
      borderColor: colors.border_gray,
      borderWidth: 1,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: '#8F92A1',
      fontSize: 14,
      borderRadius: 8,
    },
    dtagInput: {
      height: 40,
      width: '100%',
      paddingHorizontal: 10,
      backgroundColor: colors.text_light,
      borderColor: colors.primary,
      padding: 10,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      borderRadius: 5,
      paddingTop: 14,
    },
    toAddressInput: {
      height: 49,
      paddingHorizontal: 14,
      paddingVertical: 17,
      backgroundColor: colors.bg_otp_input,
      borderColor: colors.border_gray,
      borderWidth: 1,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      fontSize: 14,
      color: colors.text,
      borderRadius: 8,
      width: '67%',
    },
    toActionButton: {
      height: 49,
      width: 48,
      backgroundColor: colors.bg_otp_input,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      borderColor: colors.border_gray,
      borderWidth: 1,
    },
    saveToAddressBookWrapper: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    saveToAddressText: {
      fontSize: 12,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
    },
    cameraParentWrapper: {
      backgroundColor: colors.bg,
      height: '100%',
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
      position: 'relative',
    },
    cameraModalHeader: {
      position: 'absolute',
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 40,
      marginBottom: 30,
      zIndex: 1000,
      top: 0,
    },
    cameraWrapper: {
      position: 'absolute',
      alignSelf: 'center',
      height: '100%',
    },
    cameraContainer: {
      // height: 140,
      // width: '60%',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    cameraText: {
      textAlign: 'center',
      color: colors.text,
      marginBottom: 50,
      width: '90%',
      textAlign: 'center',
    },
    amountInput: {
      height: 54,
      // width: 200,
      alignItems: 'center',
      paddingLeft: 14,
      paddingRight: 44,
      paddingVertical: 15,
      backgroundColor: colors.bg_otp_input,
      borderColor: colors.border_gray,
      borderWidth: 1,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      fontSize: 14,
      color: colors.primary,
      borderRadius: 8,
    },
    sendActionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 10,
      // marginTop: 100
      // bottom: 10,
      // alignSelf: 'bottom',
      position: 'absolute',
      bottom: 0,
      marginBottom: 20,
      marginTop: 10,
    },

    sendActionButtonsContainerLoading: {
      backgroundColor: colors.bg_gray,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: 100,
      marginLeft: 10,
      position: 'absolute',
      bottom: 40,
      marginTop: 10,
    },
    retryButton: {
      width: 120,
      height: 40,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: colors.text_light,
      borderRadius: 20,
      marginTop: 20,
      marginLeft: 10,
    },
    retryButtonCancel: {
      width: 120,
      height: 40,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: colors.text_light,
      borderRadius: 20,
      marginTop: 20,
      marginRight: 10,
    },
    retryButtonText: {
      fontSize: 18,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    continueIcon: {
      marginLeft: 20,
      marginTop: 10,
    },
    currencyDropdownItem: {
      padding: 10,
      backgroundColor: colors.bg,
    },
    dropdownMenuStyle: {
      backgroundColor: colors.light_gray_bg,
      borderRadius: 10,
    },
    currencyDropdownText: {
      fontSize: 18,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    currencyDropdownButton: {
      width: '100%',
      height: 50,
      marginTop: 0,
      borderRadius: 10,
      backgroundColor: colors.text_light,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 10,
      paddingLeft: 8,
    },
    currencyDropdownButtonText: {
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      textAlign: 'left',
      marginLeft: 0,
      color: colors.text,
      fontSize: 18,
    },
    exchangeRateDropdown: {
      backgroundColor: colors.text_light,
      borderRadius: 10,
    },
    exchangeRateDropdownText: {
      fontSize: 18,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    exchangeRateDropdownButton: {
      width: '30%',
      height: 32,
      marginTop: 0,
      borderRadius: 10,
      backgroundColor: colors.text_light,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingLeft: 40,
    },
    exchangeRateDropdownButtonText: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      textAlign: 'left',
      marginTop: 4,
      color: colors.text,
    },
    selectedCurrency: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '600' : '100',
      color: colors.text_dark,
    },
    sendModalAvailableBalance: {
      fontSize: 12,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: '#8F92A1',
    },
    buttonCreate: {
      width: '100%',
      height: 44,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 10,
      // marginBottom: 10,
    },
    buttonCreateText: {
      fontSize: 16,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    buttonWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    continueIcon: {
      marginLeft: 10,
    },
    sendModalCloseButton: {},
    errorMessageText: {
      color: '#ff6961',
      fontFamily: 'LeagueSpartanMedium',
      fontWeight: 'bold',
      borderRadius: 20,
      padding: 10,
      marginTop: 10,
      width: '95%',
      fontSize: 12,
    },
    addressBookError: {
      color: '#ff6961',
      fontFamily: 'LeagueSpartanMedium',
      fontWeight: 'bold',
      fontSize: 12,
      marginTop: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    scanButton: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 40,
      width: '10%',
      marginLeft: 5,
    },
    addAccountModalWrapper: {
      backgroundColor: colors.bg,
      width: '96%',
      // height: 180,
      marginLeft: '2%',
      marginBottom: 100,
      marginTop: 120,
      elevation: 5,
      shadowColor: '#000000',
      shadowOffset: {width: 5, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 20,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 3000,
    },
    addAccountModalWrapperLong: {
      backgroundColor: colors.bg,
      width: '100%',
      height: 250,
      position: 'absolute',
      // bottom: 0,
      // // marginBottom: 250,
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
      paddingHorizontal: 10,
      width: '100%',
      flexDirection: 'column',
      alignItems: 'center',
    },
    addAccountActionButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
      marginTop: 20,
      marginLeft: 10,
    },
    addAccountActionButtons2: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
      marginTop: 20,
    },
    noButton: {
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
    yesButton: {
      width: 100,
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 25,
      marginBottom: 10,
      marginLeft: 10,
    },
    contButton: {
      width: 120,
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 25,
      marginBottom: 10,
    },
    addAccountOkButtonText: {
      textAlign: 'center',
      fontSize: 16,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    addAccountModalDirections: {
      textAlign: 'left',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanLight',
      marginBottom: 20,
    },
    addAccountOkButton: {
      width: 150,
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 10,
    },
    exchangeRateDropdownItemStyle: {
      padding: 10,
    },
  });

export default SendModal;
