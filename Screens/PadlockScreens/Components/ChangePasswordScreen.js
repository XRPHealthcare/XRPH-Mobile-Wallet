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
} from 'react-native';
import _ from 'lodash';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import {light, dark} from '../../../assets/colors/padlockColors';
import useStore from '../../../data/store';
import AddAccountAnimation from '../../LoadingScreens/Components/AddAccountAnimation';
import PadlockInputRow from './PadlockInputRow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import getWalletFromEntropy from '../Handlers/get_wallet_from_entropy';
import {trigger} from 'react-native-haptic-feedback';
import {useChangePassword} from '../../../utils/auth.api';

AntDesign.loadFont();
Feather.loadFont();

const ChangePasswordScreen = ({navigation}) => {
  const changeUserPassword = useChangePassword();
  const {accounts, theme, activeAccount, hepticOptions} = useStore();
  // const onPadlockSuccess = useStore((state) => state.onPadlockSuccess);
  // const onPadlockError = useStore((state) => state.onPadlockError);
  // const setPadlockErrorMessage = useStore((state) => state.setPadlockErrorMessage);
  const setAccounts = useStore(state => state.setAccounts);
  const setActiveAccount = useStore(state => state.setActiveAccount);
  const setEntropy = useStore(state => state.setEntropy);
  const [changePwModalOpen, setChangePwModalOpen] = React.useState(false);
  // const [accountName, onChangeAccountName] = React.useState("");
  const [accountPassword, setAccountPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const [pwErrorMessage, setPwErrorMessage] = React.useState('');
  const [padlockErrorMessage, setPadlockErrorMessage] = React.useState('');
  const [enterPwVisibility, setEnterPwVisibility] = React.useState(false);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const [bg, setBg] = React.useState(colors.text_light);

  const [padlockInput, setPadlockInput] = React.useState({
    A: ['_', '_', '_', '_', '_', '_'],
    B: ['_', '_', '_', '_', '_', '_'],
    C: ['_', '_', '_', '_', '_', '_'],
    D: ['_', '_', '_', '_', '_', '_'],
    E: ['_', '_', '_', '_', '_', '_'],
    F: ['_', '_', '_', '_', '_', '_'],
    G: ['_', '_', '_', '_', '_', '_'],
    H: ['_', '_', '_', '_', '_', '_'],
  });

  const updatePadlock = (padlockKey, padlockIndex, padlockValue) => {
    console.log(padlockInput);
    const prevState = padlockInput;
    let newValueArray = padlockInput[padlockKey];
    newValueArray[padlockIndex] = padlockValue;
    setPadlockInput({...prevState, [padlockKey]: newValueArray});
    console.log(padlockKey, padlockIndex, padlockValue);
    console.log(padlockInput);
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

  const checkPadlock = async () => {
    // turn padlock into entropy
    // use entropy to get a wallet
    // if wallet address = classicAddress
    // then user continues
    const entropyString =
      padlockInput['A'].join('') +
      ' ' +
      padlockInput['B'].join('') +
      ' ' +
      padlockInput['C'].join('') +
      ' ' +
      padlockInput['D'].join('') +
      ' ' +
      padlockInput['E'].join('') +
      ' ' +
      padlockInput['F'].join('') +
      ' ' +
      padlockInput['G'].join('') +
      ' ' +
      padlockInput['H'].join('');
    console.log(entropyString);
    if (entropyString?.includes('_')) {
      setPadlockErrorMessage('Please complete Padlock Combination.');
      setTimeout(() => {
        setPadlockErrorMessage('');
      }, 5000);
      return;
    }
    const wallet = getWalletFromEntropy(entropyString);
    console.log(wallet);

    if (wallet.classicAddress === activeAccount.classicAddress) {
      // combination is proper
      console.log('Proper padlock combo');
      setPadlockErrorMessage('');
      setChangePwModalOpen(true);
      // open change pw modal
    } else {
      trigger('impactHeavy', hepticOptions);
      // wrong combo
      // setChangePwModalOpen(true); // set off in prod
      setPadlockErrorMessage('Incorrect Padlock Combination.');
      setTimeout(() => {
        setPadlockErrorMessage('');
      }, 5000);
    }
  };

  const saveAccountPassword = async () => {
    if (checkPw(accountPassword)) {
      await changeUserPassword
        .mutateAsync({
          oldPassword: activeAccount?.password,
          newPassword: accountPassword,
        })
        .then(response => {
          console.log('--------password update response', response);
          let updatedAccounts = [];

          for (let account of accounts) {
            if (account.classicAddress === activeAccount.classicAddress) {
              let accountCopy = account;
              accountCopy.password = accountPassword;
              updatedAccounts.push(accountCopy);
              setActiveAccount(accountCopy);
              AsyncStorage.setItem(
                'activeAccount',
                JSON.stringify(accountCopy),
              ).then(() => {
                console.log('active account set asynchronously');
              });
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

          setAccountPassword('');
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            setChangePwModalOpen(false);
            navigation.navigate('Privacy Settings Screen'); // --> add a delay to show success message
          }, 2000);
        })
        .catch(err => {
          console.log('-----------password update error', err);
          setPwErrorMessage(err?.message);
        });
    }
  };

  const goBack = () => {
    setPadlockErrorMessage('');
    navigation.navigate('Privacy Settings Screen');
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />

        <ScrollView
          automaticallyAdjustKeyboardInsets={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            minHeight: '100%',
          }}>
          <View style={styles.bg}>
            <View>
              <TouchableOpacity
                onPress={() => {
                  goBack();
                }}
                style={{
                  marginTop: 10,
                  marginLeft: -10,
                }}>
                <Feather
                  name={'chevron-left'}
                  size={35}
                  color={colors.text}
                  style={styles.backIcon}
                />
              </TouchableOpacity>
              <Image
                style={styles.headerImage}
                source={
                  theme === 'light'
                    ? require('../../../assets/img/header_logo.png')
                    : require('../../../assets/img/header_logo_dark.png')
                }
              />
            </View>
            <View style={styles.directionsContainer}>
              <Text style={styles.directionText}>
                Enter your padlock combination in order to reset your password.
              </Text>
              {padlockErrorMessage.length > 0 && (
                <Text style={styles.errorMessage}>{padlockErrorMessage}</Text>
              )}
            </View>

            <View style={styles.padlock}>
              <PadlockInputRow letter={'A'} updatePadlock={updatePadlock} />
              <PadlockInputRow letter={'B'} updatePadlock={updatePadlock} />
              <PadlockInputRow letter={'C'} updatePadlock={updatePadlock} />
              <PadlockInputRow letter={'D'} updatePadlock={updatePadlock} />
              <PadlockInputRow letter={'E'} updatePadlock={updatePadlock} />
              <PadlockInputRow letter={'F'} updatePadlock={updatePadlock} />
              <PadlockInputRow letter={'G'} updatePadlock={updatePadlock} />
              <PadlockInputRow letter={'H'} updatePadlock={updatePadlock} />
              <View style={styles.padlockBottom} />
            </View>
            <View style={styles.slideButtonContainer}>
              {
                // disabled={bg === colors.secondary ? false : true}
              }
              <TouchableOpacity
                disabled={padlockErrorMessage.length > 0 ? true : false}
                onPress={checkPadlock}
                style={{
                  backgroundColor: bg,
                  width: '100%',
                  alignItems: 'center',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  borderRadius: 10,
                  paddingVertical: 18,
                  paddingHorizontal: 10,
                  marginBottom: 10,
                }}>
                <View style={styles.buttonWrapper}>
                  <Text style={styles.buttonCreateText}>Continue</Text>
                  <AntDesign
                    name={'arrowright'}
                    size={30}
                    color={colors.text}
                    style={styles.continueIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        {changePwModalOpen && (
          <View style={styles.bg}>
            <Modal visible={changePwModalOpen} transparent={true}>
              {!loading ? (
                <View style={styles.addAccountModalWrapper}>
                  <View style={styles.sendModalHeader}>
                    <View style={styles.sendModalHeaderSpacer}>
                      <TouchableOpacity
                        onPress={() => {
                          setChangePwModalOpen(false);
                        }}
                        style={{marginLeft: -5}}>
                        <Feather
                          name={'chevron-left'}
                          size={35}
                          color={colors.text}
                          style={styles.backIcon}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.sendModalHeaderTextCreate}>
                      Change Your Password
                    </Text>
                    <View style={styles.sendModalHeaderSpacer}></View>
                  </View>
                  <View style={styles.addAccountModalActionsWrapper}>
                    <Text style={styles.addAccountModalDirections}>
                      Set a new password for your account.
                    </Text>
                    <View style={styles.pw}>
                      <TextInput
                        style={styles.accountNameInputPw}
                        onChangeText={setAccountPassword}
                        value={accountPassword}
                        placeholder="Password"
                        placeholderTextColor={colors.text_dark}
                        secureTextEntry={!enterPwVisibility}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() =>
                          setEnterPwVisibility(!enterPwVisibility)
                        }>
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

                    {pwErrorMessage.length > 0 && (
                      <Text style={styles.errorMessageText}>
                        {pwErrorMessage}
                      </Text>
                    )}
                    <View style={styles.addAccountActionButtons}>
                      <TouchableOpacity
                        style={styles.addAccountOkButton}
                        onPress={saveAccountPassword}>
                        <View style={styles.buttonWrapper}>
                          <Text style={styles.addAccountOkButtonText}>
                            {error.length > 0 ? 'Retry' : 'Continue'}
                          </Text>
                          <Feather
                            name={'arrow-right'}
                            size={25}
                            color={colors.bg}
                            style={styles.continueIcon}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.addAccountModalWrapper}>
                  {/* <View style={styles.addAccountModalActionsWrapper}>
                            <Text style={styles.addAccountModalDirectionsCenter}>Password Successfully Changed</Text>
                            <Text style={styles.addAccountModalDirectionsCenter}>Taking you back...</Text>
                        </View> */}
                  <View style={styles.header}>
                    <Text style={styles.headerText}>
                      Password Successfully Changed
                    </Text>
                    <View style={styles.circle}>
                      <Feather
                        name={'check'}
                        size={75}
                        color={colors.bg}
                        style={styles.checkIcon}
                      />
                    </View>
                    <Text style={styles.headerText}>Taking you back...</Text>
                  </View>
                </View>
              )}
            </Modal>
            {error.length > 0 && (
              <Text key={'Text'} style={styles.errorMessage}>
                {error}
              </Text>
            )}
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styling = colors =>
  StyleSheet.create({
    bg: {
      backgroundColor: colors.bg,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      paddingHorizontal: 10,
    },
    headerImage: {
      width: 350,
      height: 65,
      marginTop: 10,
    },
    directionsContainer: {
      marginTop: 20,
      width: '100%',
      flex: 1,
      paddingHorizontal: 10,
    },
    backButton: {
      width: 120,
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.text_light,
      borderRadius: 20,
    },
    header: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '95%',
      marginTop: 50,
      marginBottom: 50,
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
    },
    headerText: {
      fontSize: 18,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      alignSelf: 'center',
      marginTop: 30,
      marginBottom: 30,
      width: '100%',
      textAlign: 'center',
    },
    buttontextDark: {
      fontSize: 20,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginLeft: 5,
      marginTop: 5,
    },
    welcomeText: {
      fontSize: 42,
      color: colors.text,
      marginBottom: -10,
    },
    directionText: {
      fontSize: 18,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaLight',
      marginTop: 5,
    },
    note: {
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
    },
    padlockBottom: {
      height: 6,
    },
    padlock: {
      backgroundColor: colors.text_light,
      borderRadius: 10,
      width: '95%',
      alignItems: 'center',
      justifyContent: 'space-evenly',
    },
    slideButtonContainer: {
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 10,
      paddingBottom: 10,
      flexDirection: 'row',
      marginTop: 22,
    },
    slideButtonThumbStyle: {
      borderRadius: 10,
      backgroundColor: colors.bg,
      width: 80,
      elevation: 0,
    },
    slideButtonContainerStyle: {
      backgroundColor: colors.text_light,
      borderRadius: 20,
      elevation: 0,
    },
    slideButtonUnderlayStyle: {
      backgroundColor: colors.secondary,
      borderRadius: 10,
    },
    slideButtonTitleStyle: {
      marginLeft: 20,
      fontSize: 20,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.bg,
    },
    inputLabelCharacter: {
      fontFamily: 'Helvetica',
    },
    addAccountModalWrapper: {
      backgroundColor: colors.bg,
      width: '90%',
      height: 330,
      marginLeft: '5%',
      marginBottom: 100,
      marginTop: 40,
      elevation: 5,
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
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      // marginBottom: 20
    },
    addAccountModalDirectionsCenter: {
      textAlign: 'center',
      width: '100%',
      fontSize: 16,
      color: colors.text_dark,
      marginTop: 10,
      marginBottom: 10,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      // marginBottom: 20
    },
    addAccountActionButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
      marginTop: 10,
      // marginLeft: 10,
      width: '100%',
    },
    addAccountOkButton: {
      width: 200,
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 20,
      marginBottom: 10,
    },
    addAccountOkButtonText: {
      textAlign: 'center',
      fontSize: 20,
      color: colors.bg,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginRight: 20,
      marginTop: 4,
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
    sendModalHeaderSpacer: {
      width: 60,
    },
    sendModalHeaderText: {
      fontSize: 20,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.text,
      textAlign: 'center',
    },
    sendModalHeaderTextCreate: {
      fontSize: 22,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.text,
      textAlign: 'right',
      paddingRight: 10,
    },
    accountNameInput: {
      height: 40,
      width: '100%',
      paddingHorizontal: 10,
      margin: 10,
      backgroundColor: colors.text_light,
      borderColor: colors.primary,
      padding: 10,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.text,
      borderRadius: 10,
      paddingTop: 14,
    },
    addAccountModalDirections: {
      width: '100%',
      textAlign: 'left',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginBottom: 5,
      marginTop: 20,
    },
    buttonWrapper: {
      flexDirection: 'row',
    },
    buttonConnect: {
      width: '48%',
      marginRight: '4%',
      height: 80,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.text_light,
      borderRadius: 20,
      marginBottom: 10,
    },
    buttonCreate: {},
    buttonConnectText: {
      fontSize: 20,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
    },
    buttonCreateText: {
      fontSize: 20,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
    },
    buttonWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    continueIcon: {
      marginLeft: 10,
    },
    continueIconLeft: {
      marginRight: 10,
    },
    errorMessage: {
      // backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      borderRadius: 20,
      paddingTop: 10,
      paddingBottom: 10,
    },
    errorMessageText: {
      backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      borderRadius: 20,
      padding: 10,
      marginBottom: 10,
      width: '100%',
    },
    accountNameInputPw: {
      height: 40,
      width: '85%',
      marginTop: 10,
      marginBottom: 10,
      paddingHorizontal: 10,
      backgroundColor: colors.text_light,
      borderColor: colors.primary,
      padding: 10,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
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
      justifyContent: 'space-between',
    },
    eyeIcon: {
      paddingHorizontal: 5,
    },
  });

export default ChangePasswordScreen;
