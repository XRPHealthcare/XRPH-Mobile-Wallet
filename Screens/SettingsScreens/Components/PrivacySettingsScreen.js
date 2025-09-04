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
  Modal,
  TextInput,
  Platform,
  Switch,
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
import Pin from '../../Pin/Components/Pin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import {WebView} from 'react-native-webview';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import {trigger} from 'react-native-haptic-feedback';
import {useChangePassword} from '../../../utils/auth.api';
import {
  ArrowSqrLeftBlackIcon,
  ArrowSqrLeftWhiteIcon,
} from '../../../assets/img/new-design';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const PrivacySettingsScreen = ({navigation}) => {
  const updateUserPassword = useChangePassword();
  const rnBiometrics = new ReactNativeBiometrics();
  const {activeAccount, accounts, theme, hepticOptions, isBiometricEnabled} =
    useStore();
  const setAccounts = useStore(state => state.setAccounts);
  const setPin = useStore(state => state.setPin);
  const setIsBiometricEnabled = useStore(state => state.setIsBiometricEnabled);

  const [pwModalOpen, setPwModalOpen] = React.useState(false);
  const [password, setPassword] = React.useState('');

  const [changePwModalOpen, setChangePwModalOpen] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');

  const [pinModalOpen, setPinModalOpen] = React.useState(false);
  const [currPin, setCurrPin] = React.useState('');
  const [changePinModalOpen, setChangePinModalOpen] = React.useState(false);
  const [newPin, setNewPin] = React.useState('');

  const [errorMessage, setErrorMessage] = React.useState('');
  const [pwErrorMessage, setPwErrorMessage] = React.useState('');

  const [privacyModalOpen, setPrivacyModalOpen] = React.useState(false);

  const [enterPwVisibility, setEnterPwVisibility] = React.useState(false);
  const [setPwVisibility, setSetPwVisibility] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [isBioSupported, setIsBioSupported] = React.useState(false);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors, theme);

  const editAccountPassword = () => {
    setErrorMessage('');
    setNewPassword('');
    setPwModalOpen(false);
    setChangePwModalOpen(true);
  };

  const closePwModal = () => {
    setPwModalOpen(false);
    setPassword('');
    setEnterPwVisibility(false);
  };

  const closePinModal = () => {
    setErrorMessage('');
    setPinModalOpen(false);
    setCurrPin('');
  };

  const closeChangePwModal = () => {
    setChangePwModalOpen(false);
    setNewPassword('');
    setSetPwVisibility(false);
  };

  const closeChangePinModal = () => {
    setChangePinModalOpen(false);
    setNewPin('');
  };

  const updatePin = () => {
    console.log('pin set: ', newPin);
    setPin(newPin);
    setCurrPin('');
    setNewPin('');
    AsyncStorage.setItem('pin', newPin).then(() => {
      console.log('pin set asynchronously');
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setChangePinModalOpen(false);
      }, 2000);
    });
  };

  const openPinModal = () => {
    // setPinModalOpen(true);
    navigation.navigate('Change Pin Screen');
  };

  const checkPw = pw => {
    const pattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const bool = pattern.test(pw);
    if (bool) {
      setPwErrorMessage('');
      return true;
    } else {
      setPwErrorMessage(
        'Error: Account password must be at least 8 characters long and include at least 1 uppercase character, 1 lowercase character, 1 number, and 1 special character (from the set @, $, !, %, *, ?, &).',
      );
      return false;
    }
  };

  const saveAccountPassword = async () => {
    if (checkPw(newPassword)) {
      await updateUserPassword
        .mutateAsync({
          oldPassword: password,
          newPassword: newPassword,
        })
        .then(res => {
          let updatedAccounts = [];

          for (let account of accounts) {
            if (account.classicAddress === activeAccount.classicAddress) {
              let accountCopy = account;
              updatedAccounts.push(accountCopy);
            } else {
              updatedAccounts.push(account);
            }
          }
          setAccounts(updatedAccounts);
          AsyncStorage.setItem(
            'accounts',
            JSON.stringify(updatedAccounts),
          ).then(() => {
            console.log('accounts set asynchronously');
          });
          setChangePwModalOpen(false);
          setPassword('');
          setNewPassword('');
        })
        .catch(err => {
          setErrorMessage(err.message);
        });
    }
  };

  const onPinVerification = () => {
    setErrorMessage('');
    setCurrPin('');
    setPinModalOpen(false);
    setChangePinModalOpen(true);
  };

  const onPinFailure = () => {
    console.log('Incorrect Pin');
    setErrorMessage('Error: Incorrect Pin');
  };

  const openPasswordChange = () => {
    navigation.navigate('Change Password Screen');
  };

  const toggleBiometric = value => {
    console.log('toggle biometric', value);
    setIsBiometricEnabled(value);
    if (value) {
      rnBiometrics.createKeys().then(resultObject => {
        const {publicKey} = resultObject;
        trigger('impactHeavy', hepticOptions);
      });
    } else {
      rnBiometrics.deleteKeys().then(resultObject => {
        trigger('impactHeavy', hepticOptions);
      });
    }
  };

  const checkBiometricEnabled = () => {
    try {
      rnBiometrics.isSensorAvailable().then(res => {
        const {available, biometryType} = res;
        if (available && biometryType === BiometryTypes.FaceID) {
          setIsBioSupported(true);
        } else if (available && biometryType === BiometryTypes.TouchID) {
          setIsBioSupported(true);
        } else if (available && biometryType === BiometryTypes.Biometrics) {
          setIsBioSupported(true);
        } else {
          console.log('Biometric not found');
        }
      });
      rnBiometrics.biometricKeysExist().then(resultObject => {
        const {keysExist} = resultObject;
        if (keysExist) {
          setIsBiometricEnabled(true);
        } else {
          setIsBiometricEnabled(false);
        }
      });
    } catch (e) {
      console.log('-------error in Privacy----', e);
    }
  };

  React.useEffect(() => {
    checkBiometricEnabled();
  }, []);

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
            <Text style={styles.headerHeading}>Privacy & Security</Text>
            <Text style={{width: 20}}></Text>
          </View>
          <Image
            source={require('../../../assets/img/new-design/bg-gradient.png')}
            style={styles.greenShadow}
          />

          <ScrollView style={styles.settingsWrapper}>
            <Text style={[styles.label, {marginBottom: 16}]}>Security</Text>
            <Pressable
              onPress={openPasswordChange}
              style={[styles.settingCard]}>
              <Text style={[styles.value]}>Change Password</Text>
              <Feather name="chevron-right" size={20} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={openPinModal}
              style={[styles.settingCard, {marginTop: 8}]}>
              <Text style={[styles.value]}>Change Pin</Text>
              <Feather name="chevron-right" size={20} color={colors.text} />
            </Pressable>
            {isBioSupported && (
              <View style={[styles.settingCard, {marginTop: 8}]}>
                <Text style={[styles.value]}>Biometric</Text>
                <Pressable
                  onPress={() => toggleBiometric(!isBiometricEnabled)}
                  style={{
                    height: 20,
                    width: 40,
                    backgroundColor: isBiometricEnabled
                      ? '#45EE601A'
                      : '#CCCCCC1A',
                    marginLeft: 'auto',
                    borderRadius: 10,
                    paddingHorizontal: 2,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: isBiometricEnabled
                      ? 'flex-end'
                      : 'flex-start',
                  }}>
                  <View
                    style={{
                      height: 16,
                      width: 16,
                      borderRadius: 16,
                      backgroundColor: isBiometricEnabled
                        ? '#03F982'
                        : '#CCCCCC',
                    }}
                  />
                </Pressable>
              </View>
            )}
            <Text style={[styles.label, {marginBottom: 16, marginTop: 24}]}>
              Privacy
            </Text>
            <Pressable
              onPress={() => setPrivacyModalOpen(true)}
              style={[styles.settingCard]}>
              <Text style={[styles.value]}>Privacy Statements</Text>
              <Feather name="chevron-right" size={20} color={colors.text} />
            </Pressable>
            <View style={[styles.settingCol, {marginTop: 24}]}>
              <Text style={[styles.value, {fontWeight: '600'}]}>
                What Information We Do Store:
              </Text>
              <View
                style={[
                  styles.row,
                  {gap: 8, marginTop: 10, alignItems: 'flex-start'},
                ]}>
                <View
                  style={{
                    height: 4,
                    width: 4,
                    borderRadius: 6,
                    marginTop: 8,
                    backgroundColor: theme === 'dark' ? '#f8f8f8' : '#636363',
                  }}
                />
                <Text style={[styles.settingTextLight]}>
                  Your public wallet address, your account password, your
                  account name, and your XRPH prescription savings card
                  information.
                </Text>
              </View>
            </View>
            <View style={[styles.settingCol, {marginTop: 12}]}>
              <Text style={[styles.value, {fontWeight: '600'}]}>
                What Information We Do NOT Store:
              </Text>
              <View
                style={[
                  styles.row,
                  {gap: 8, marginTop: 10, alignItems: 'flex-start'},
                ]}>
                <View
                  style={{
                    height: 4,
                    width: 4,
                    borderRadius: 6,
                    marginTop: 8,
                    backgroundColor: theme === 'dark' ? '#f8f8f8' : '#636363',
                  }}
                />
                <Text style={[styles.settingTextLight]}>
                  Your public and private keys, your secret key, your padlock
                  combination, your pin, and any other account information that
                  isn't listed above.
                </Text>
              </View>
            </View>
          </ScrollView>

          <Modal visible={pwModalOpen} transparent={true}>
            <View style={styles.addAccountModalWrapper}>
              <View style={styles.sendModalHeader}>
                <View style={styles.sendModalHeaderSpacer}></View>
                <Text style={styles.sendModalHeaderText}>
                  Enter Current Password
                </Text>
                <TouchableOpacity
                  style={styles.sendModalCloseButton}
                  onPress={() => closePwModal()}>
                  <Text style={styles.sendModalHeaderText}>X</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.addAccountModalActionsWrapper}>
                <View style={styles.pw}>
                  <TextInput
                    style={styles.accountNameInputPw}
                    onChangeText={setPassword}
                    value={password}
                    placeholder="Account Password"
                    placeholderTextColor={colors.text_dark}
                    secureTextEntry={!enterPwVisibility}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setEnterPwVisibility(!enterPwVisibility)}>
                    <View style={styles.buttonWrapper}>
                      <Feather
                        name={enterPwVisibility ? 'eye' : 'eye-off'}
                        size={25}
                        color={colors.text}
                        style={styles.eyeIcon}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <Text style={{display: errorMessage === '' ? 'none' : 'flex'}}>
                  {errorMessage}
                </Text>

                <View style={styles.addAccountActionButtons}>
                  <TouchableOpacity
                    style={styles.addAccountOkButton}
                    onPress={editAccountPassword}>
                    <View style={styles.saveButton}>
                      <Text style={styles.addAccountOkButtonText}>Verify</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={changePwModalOpen} transparent={true}>
            <View style={styles.addAccountModalWrapper}>
              <View style={styles.sendModalHeader}>
                <View style={styles.sendModalHeaderSpacer}></View>
                <Text style={styles.sendModalHeaderText}>
                  Enter New Password
                </Text>
                <TouchableOpacity
                  style={styles.sendModalCloseButton}
                  onPress={() => closeChangePwModal()}>
                  <Text style={styles.sendModalHeaderText}>X</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.addAccountModalActionsWrapper}>
                <View style={styles.pw}>
                  <TextInput
                    style={styles.accountNameInputPw}
                    onChangeText={setNewPassword}
                    value={newPassword}
                    placeholder="Account Password"
                    placeholderTextColor={colors.text_dark}
                    secureTextEntry={!setPwVisibility}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setSetPwVisibility(!setPwVisibility)}>
                    <View style={styles.buttonWrapper}>
                      <Feather
                        name={setPwVisibility ? 'eye' : 'eye-off'}
                        size={25}
                        color={colors.text}
                        style={styles.eyeIcon}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                {pwErrorMessage.length > 0 && (
                  <Text style={styles.errorMessageText}>{pwErrorMessage}</Text>
                )}

                <View style={styles.addAccountActionButtons}>
                  <TouchableOpacity
                    style={styles.addAccountOkButton}
                    onPress={saveAccountPassword}>
                    <View style={styles.saveButton}>
                      <Text style={styles.addAccountOkButtonText}>Save</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={pinModalOpen} transparent={true}>
            <View style={styles.addAccountModalWrapperPin}>
              <View style={styles.sendModalHeader}>
                <View style={styles.sendModalHeaderSpacer}></View>
                <Text style={styles.sendModalHeaderText}>Enter Your Pin</Text>
                <TouchableOpacity
                  style={styles.sendModalCloseButton}
                  onPress={() => closePinModal()}>
                  <Text style={styles.sendModalHeaderText}>X</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.addAccountModalActionsWrapper}>
                <Pin
                  role={'verify'}
                  onSuccess={onPinVerification}
                  onFailure={onPinFailure}
                  pin={currPin}
                  setPin={setCurrPin}
                />
                <Text
                  style={{
                    display: errorMessage === '' ? 'none' : 'flex',
                    marginTop: 20,
                    fontFamily: 'LeagueSpartanMedium',
                  }}>
                  {errorMessage}
                </Text>

                <View style={styles.noButtonSpacer} />
              </View>
            </View>
          </Modal>

          <Modal visible={changePinModalOpen} transparent={true}>
            {!loading && (
              <View style={styles.addAccountModalWrapper}>
                <View style={styles.sendModalHeader}>
                  <View style={styles.sendModalHeaderSpacer}></View>
                  <Text style={styles.sendModalHeaderText}>
                    Enter A New Pin
                  </Text>
                  <TouchableOpacity
                    style={styles.sendModalCloseButton}
                    onPress={() => closeChangePinModal()}>
                    <Text style={styles.sendModalHeaderText}>X</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.addAccountModalActionsWrapper}>
                  <Pin
                    role={'set'}
                    onSuccess={() => console.log('Nice one')}
                    onFailure={() => console.log('Epic fail')}
                    pin={newPin}
                    setPin={setNewPin}
                  />
                  <Text
                    style={{display: errorMessage === '' ? 'none' : 'flex'}}>
                    {errorMessage}
                  </Text>

                  <View style={styles.addAccountActionButtons}>
                    <TouchableOpacity
                      style={styles.addAccountOkButton}
                      onPress={() => updatePin()}>
                      <View style={styles.saveButton}>
                        <Text style={styles.addAccountOkButtonText}>
                          Change
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            {loading && (
              <View style={styles.addAccountModalWrapper}>
                <View style={styles.sendModalHeader}>
                  <View style={styles.sendModalHeaderSpacer}></View>
                  <Text style={styles.sendModalHeaderText}>Pin Changed</Text>
                  <TouchableOpacity
                    style={styles.sendModalCloseButton}
                    onPress={() => closeChangePinModal()}>
                    <Text style={styles.sendModalHeaderText}>X</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.addAccountModalActionsWrapper}>
                  <View style={styles.circle}>
                    <Feather
                      name={'check'}
                      size={75}
                      color={colors.bg}
                      style={styles.checkIcon}
                    />
                  </View>
                </View>
              </View>
            )}
          </Modal>

          <Modal visible={privacyModalOpen} transparent={true}>
            <View style={styles.privacyModalWrapper}>
              <View style={styles.sendModalHeader}>
                <View style={styles.sendModalHeaderSpacer}></View>
                <Text style={styles.sendModalHeaderText}>Privacy Policy</Text>
                <TouchableOpacity
                  style={styles.sendModalCloseButton}
                  onPress={() => setPrivacyModalOpen(false)}>
                  <Text style={styles.sendModalHeaderText}>X</Text>
                </TouchableOpacity>
              </View>
            </View>

            <WebView
              source={{
                uri: 'https://app.termly.io/document/privacy-policy/009bdc0b-42be-4fa8-932e-b7e233e467f9',
              }}
              style={{flex: 1}}
            />
          </Modal>
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
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    sendModalHeaderText: {
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'center',
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 14,
      zIndex: 1000,
    },
    checkIcon: {
      marginTop: 5,
    },
    circle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.secondary,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    headerText: {
      fontSize: 18,
      color: colors.text,
      fontFamily: 'LeagueSpartanMedium',
      fontWeight: 'bold',
      alignSelf: 'center',
      marginTop: 30,
      marginBottom: 30,
      width: '100%',
      textAlign: 'center',
    },
    addAccountModalWrapperPin: {
      backgroundColor: colors.bg,
      width: '98%',
      height: '100%',
      marginLeft: '5%',
      // marginBottom: 100,
      // marginTop: 100,
      elevation: 5,
      shadowColor: '#000000',
      shadowOffset: {width: 5, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 20,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    addAccountModalWrapper: {
      backgroundColor: colors.bg,
      width: '90%',
      height: 180,
      marginLeft: '5%',
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
    privacyModalWrapper: {
      backgroundColor: colors.bg,
      width: '100%',
      height: 50,
      // marginLeft: '5%',
      // marginBottom: 100,
      marginTop: 50,
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
      // justifyContent: 'space-evenly',
      flexDirection: 'column',
      alignItems: 'center',
    },
    addAccountModalDirections: {
      textAlign: 'right',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      // marginBottom: 20
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
    noButtonSpacer: {
      height: 70,
    },
    accountNameInput: {
      height: 40,
      width: '100%',
      paddingHorizontal: 10,
      margin: 10,
      backgroundColor: colors.text_light,
      borderColor: colors.primary,
      padding: 10,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      borderRadius: 10,
      paddingTop: 14,
    },
    accountNameInputPw: {
      height: 40,
      width: '80%',
      paddingHorizontal: 10,
      margin: 10,
      backgroundColor: colors.text_light,
      borderColor: colors.primary,
      padding: 10,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      borderRadius: 10,
      paddingTop: 14,
    },
    eyeButton: {
      backgroundColor: colors.text_light,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
    },
    pw: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    eyeIcon: {
      paddingHorizontal: 5,
    },
    editButton: {
      width: 150,
      height: 30,
      borderRadius: 20,
      backgroundColor: colors.primary,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    editButtonText: {
      fontSize: 14,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.bg,
      marginTop: -4,
    },
    pinButton: {
      width: 110,
      height: 30,
      borderRadius: 20,
      backgroundColor: colors.primary,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewButton: {
      width: 60,
      height: 30,
      borderRadius: 20,
      backgroundColor: colors.primary,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    setting: {
      width: '100%',
      height: 50,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    settingCol: {
      width: '100%',
      // height: 100,
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    settingText: {
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    settingTextLight: {
      fontSize: 12,
      color: theme === 'dark' ? '#f8f8f8' : '#636363',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanLight',
    },
    backButton: {
      width: 50,
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    textAndIconWrapper: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      width: '80%',
    },
    spacer: {
      width: 50,
    },
    sendModalHeaderSpacer: {
      width: 10,
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
    greenShadow: {
      position: 'absolute',
      top: 0,
      zIndex: -1,
      marginTop: -250,
    },
    settingsButtonContainer: {
      // width: '107%',
      backgroundColor: colors.bg,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: 20,
      marginBottom: 10,
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
    backIcon: {
      marginLeft: -10,
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
  });

export default PrivacySettingsScreen;
