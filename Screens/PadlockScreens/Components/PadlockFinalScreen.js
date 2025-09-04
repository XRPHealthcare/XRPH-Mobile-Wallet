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
} from 'react-native';
import _ from 'lodash';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import {light, dark} from '../../../assets/colors/padlockColors';
import useStore from '../../../data/store';
import generateNewWallet from '../Handlers/generate_new_wallet';
import AddAccountAnimation from '../../LoadingScreens/Components/AddAccountAnimation';
import PadlockInputRow from './PadlockInputRow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import {trigger} from 'react-native-haptic-feedback';
import {useSingup} from '../../../utils/auth.api';
import {useGetPrices} from '../../../utils/wallet.api';
// import getTotalBalances from '../../Pin/Handlers/get_total_balances';

AntDesign.loadFont();
Feather.loadFont();

const PadlockFinalScreen = ({navigation}) => {
  const createUser = useSingup();
  const getExchangePrices = useGetPrices();
  const {
    padlock,
    padlockErrorMessage,
    accounts,
    theme,
    entropy,
    activeAccount,
    hepticOptions,
  } = useStore();
  const onPadlockSuccess = useStore(state => state.onPadlockSuccess);
  const onPadlockError = useStore(state => state.onPadlockError);
  const setPadlockErrorMessage = useStore(
    state => state.setPadlockErrorMessage,
  );
  const setTxHistory = useStore(state => state.setTxHistory);
  const setAccounts = useStore(state => state.setAccounts);
  const setActiveAccount = useStore(state => state.setActiveAccount);
  const setEntropy = useStore(state => state.setEntropy);
  const setAccountBalances = useStore(state => state.setAccountBalances);
  const [addAccountModalOpen, setAddAccountModalOpen] = React.useState(false);
  const [accountName, onChangeAccountName] = React.useState('');
  const [accountPassword, onChangeAccountPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [pwErrorMessage, setPwErrorMessage] = React.useState('');
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
    if (_.isEqual(padlockInput, padlock)) {
      setPadlockErrorMessage('');
      setBg(colors.secondary);
    }
  };

  const checkName = name => {
    if (name.length >= 2) {
      setNameErrorMessage('');
      return true;
    }
    setNameErrorMessage(
      'Error: Account name must be at least 2 characters long.',
    );
    trigger('impactHeavy', hepticOptions);
    return false;
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
      trigger('impactHeavy', hepticOptions);
      return false;
    }
  };

  const createNewAccount = async () => {
    if (checkName(accountName) && checkPw(accountPassword)) {
      setLoading(true);
      setError('');
      let new_account = await generateNewWallet(true, entropy); // false creates account with funds, true doesnt
      if (new_account.error !== undefined) {
        // error
        setError(new_account.error);
        setLoading(false);
        navigation.navigate('Padlock Final Screen');
      } else {
        setError('');  
        await createUser
          .mutateAsync({
            wallet_address: new_account.classicAddress,
            name: accountName,
            password: accountPassword,
              card_id: 1,
            // card_id: new_account.prescription_card.id,
          })
          .then(async response => {
            const priceResponse = await getExchangePrices?.mutateAsync();
            console.log('------------------create user response ', response);
            setTxHistory([]);
            setEntropy('');
            const account = {
              ...new_account,
              ...response?.user,
              password: accountPassword,
              totalBalances: {
                USD: '0',
                EUR: '0',
                GBP: '0',
              },
            };

            let allAccounts = accounts;
            allAccounts.push(account);

            let updatedAccounts = [];
            for (
              let accountIndex = 0;
              accountIndex < allAccounts.length;
              accountIndex++
            ) {
              let allBalances = {
                USD: '0',
                EUR: '0',
                GBP: '0',
              };
              const currencies = ['USD', 'EUR', 'GBP'];
              const balances = allAccounts[accountIndex].balances;

              if (balances.length === 0) {
                updatedAccounts.push({
                  ...allAccounts[accountIndex],
                  totalBalances: allBalances,
                });
              } else {
                for (let i = 0; i < currencies.length; i++) {
                  const lowerCurrency = currencies[i]?.toLowerCase();
                  let sum = 0;
                  for (let j = 0; j < balances.length; j++) {
                    // balances[i].currency
                    // balances[i].value
                    const {currency, value} = balances[j];
                    // const value = Number(valueStr);
                    // const response = await fetch("https://api.livecoinwatch.com/coins/single", {
                    //     method: 'POST',
                    //     headers: {
                    //         Accept: 'application/json',
                    //         'Content-Type': 'application/json',
                    //         'X-Api-Key': '25e019d0-afde-4331-9ec0-56bf9323cdb5'
                    //     },
                    //     body: JSON.stringify({
                    //         currency: currencies[i],
                    //         code: currency,
                    //         meta: true
                    //     })
                    // });
                    // const tokenJson = await response.json();
                    // const tokenRate = tokenJson.rate;

                    let XRPrate = 0;
                    let XRPHrate = 0;
                    let USDTRate = 0;
                    let RLUSDrate = 0;

                    if (
                      priceResponse[lowerCurrency]?.XRPH === undefined ||
                      priceResponse[lowerCurrency]?.XRP === undefined ||
                      priceResponse[lowerCurrency]?.USDT === undefined ||
                      priceResponse[lowerCurrency]?.RLUSD === undefined
                    ) {
                      setError(
                        'Unfortunately we could not connect your account.',
                      );
                    } else {
                      XRPrate = priceResponse[lowerCurrency]?.XRP;
                      XRPHrate = priceResponse[lowerCurrency]?.XRPH;
                      USDTRate = priceResponse[lowerCurrency]?.USDT;
                      RLUSDrate = priceResponse[lowerCurrency]?.RLUSD;
                    }

                    let amount = 0;
                    if (currency === 'XRP') {
                      amount = Number(value * XRPrate);
                    } else if (currency === 'XRPH') {
                      amount = Number(value * XRPHrate);
                    } else if (currency === 'RLUSD') {
                      amount = Number(value * RLUSDrate);
                    } else {
                      amount = 0;
                    }

                    sum += amount;
                  }
                  sum = sum.toFixed(2);
                  if (sum < 0) {
                    sum = 0;
                  }
                  allBalances[currencies[i]] = String(
                    sum.toLocaleString('en-US'),
                  );
                }

                updatedAccounts.push({
                  ...allAccounts[accountIndex],
                  totalBalances: allBalances,
                });
              }
            }
            console.log(updatedAccounts.length);

            for (let i = 0; i < updatedAccounts.length; i++) {
              if (
                updatedAccounts[i].classicAddress === account.classicAddress
              ) {
                setActiveAccount(updatedAccounts[i]);
                AsyncStorage.setItem(
                  'activeAccount',
                  JSON.stringify(updatedAccounts[i]),
                ).then(() => {
                  console.log('active account set asynchronously');
                });
              }
            }
            setAccountBalances([]);
            setAccounts(updatedAccounts);
            AsyncStorage.setItem(
              'accounts',
              JSON.stringify(updatedAccounts),
            ).then(() => {
              console.log('accounts set asynchronously');
            });

            // add to fb

            setAddAccountModalOpen(false);
            onChangeAccountName('');
            setLoading(false);
            const pin = await AsyncStorage.getItem('pin');

            if (!pin) {
              navigation.navigate('Set Pin Screen');
            } else {
              navigation.navigate('Home Screen');
            }
          })
          .catch(err => {
            console.log('---------account creattion error', err);
            setError(err.message);
            setLoading(false);
            setAddAccountModalOpen(false);
          });
      }
    }
  };

  const checkPadlock = () => {
    if (_.isEqual(padlockInput, padlock)) {
      onPadlockSuccess(); // generate new wallet address
      setAddAccountModalOpen(true);
      setPadlockErrorMessage('');
    } else {
      // onPadlockSuccess(); // generate new wallet address
      // setAddAccountModalOpen(true);
      // setPadlockErrorMessage("");
      trigger('impactHeavy', hepticOptions);
      onPadlockError();
    }
  };

  const goBack = () => {
    setPadlockErrorMessage('');
    navigation.navigate('Padlock Initial Screen');
  };

  React.useEffect(() => {
    setTimeout(() => {
      setPadlockErrorMessage('');
    }, 3000);
  }, [padlockErrorMessage]);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />
        {!addAccountModalOpen && (
          <View style={[styles.bg]}>
            <View style={[styles.column, {gap: 10}]}>
              <TouchableOpacity
                onPress={() => {
                  goBack();
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
              <View style={styles.directionsContainer}>
                <Text style={styles.directionText}>
                  Now enter the code you just wrote down. This is only for
                  security reasons in case you get locked out and need to
                  recover your account.
                </Text>
                {padlockErrorMessage.length > 0 && (
                  <Text style={styles.errorMessage}>{padlockErrorMessage}</Text>
                )}
              </View>
            </View>
            <View style={[styles.column, {gap: 10, alignItems: 'center'}]}>
              <ScrollView
                automaticallyAdjustKeyboardInsets={true}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}>
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
              </ScrollView>
            </View>
            <View style={styles.slideButtonContainer}>
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
        )}
        {addAccountModalOpen && (
          <View style={styles.modalBg}>
            <Modal visible={addAccountModalOpen} transparent={true}>
              {!loading ? (
                <View style={styles.addAccountModalWrapper}>
                  <View style={styles.sendModalHeader}>
                    <View style={styles.sendModalHeaderSpacer}>
                      <TouchableOpacity
                        onPress={() => {
                          setAddAccountModalOpen(false);
                        }}
                        style={{
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
                    <Text style={styles.sendModalHeaderTextCreate}>
                      Create Your Account
                    </Text>
                    <View style={styles.sendModalHeaderSpacer}></View>
                  </View>

                  <View style={styles.addAccountModalActionsWrapper}>
                    <Text style={styles.addAccountModalDirections}>
                      Give your new account a name.
                    </Text>
                    <TextInput
                      style={styles.accountNameInput}
                      onChangeText={onChangeAccountName}
                      value={accountName}
                      placeholder="Account Name"
                      placeholderTextColor={colors.text_dark}
                    />
                    <Text style={styles.addAccountModalDirections}>
                      Set a password for your account.
                    </Text>
                    <View style={styles.pw}>
                      <TextInput
                        style={styles.accountNameInputPw}
                        onChangeText={onChangeAccountPassword}
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

                    {nameErrorMessage.length > 0 && (
                      <Text style={styles.errorMessageText}>
                        {nameErrorMessage}
                      </Text>
                    )}
                    {pwErrorMessage.length > 0 && (
                      <Text style={styles.errorMessageText}>
                        {pwErrorMessage}
                      </Text>
                    )}
                    <View style={styles.addAccountActionButtons}>
                      <TouchableOpacity
                        style={styles.addAccountOkButton}
                        onPress={createNewAccount}>
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
                <View
                  style={[
                    styles.column,
                    {
                      backgroundColor: colors.bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '100%',
                    },
                  ]}>
                  <AddAccountAnimation />
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
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      gap: 10,
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    modalBg: {
      backgroundColor: colors.bg,
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
    },
    headerImage: {
      width: 350,
      height: 65,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    directionsContainer: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'column',
      gap: 10,
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
    buttontextDark: {
      fontSize: 20,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginLeft: 5,
      marginTop: 0,
    },
    welcomeText: {
      fontSize: 42,
      color: colors.text,
      marginBottom: -10,
    },
    directionText: {
      fontSize: 18,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanLight',
      marginTop: 5,
    },
    note: {
      fontWeight: 'bold',
    },
    padlockBottom: {
      height: 6,
    },
    padlock: {
      backgroundColor: colors.text_light,
      borderRadius: 10,
      width: '97%',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    slideButtonContainer: {
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 13,
      flexDirection: 'row',
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
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
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
      // elevation: 5,
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
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginRight: 20,
      marginTop: 0,
    },
    sendModalHeader: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 60,
      marginBottom: 30,
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
      textAlign: 'center',
    },
    sendModalHeaderTextCreate: {
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'center',
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
    addAccountModalDirections: {
      width: '100%',
      textAlign: 'left',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
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
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    buttonCreateText: {
      fontSize: 20,
      color: colors.text,
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
    continueIconLeft: {
      marginRight: 10,
    },
    errorMessage: {
      // backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily: 'LeagueSpartanMedium',
      fontWeight: 'bold',
      borderRadius: 20,
      paddingTop: 10,
      paddingBottom: 10,
    },
    errorMessageText: {
      backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily: 'LeagueSpartanMedium',
      fontWeight: 'bold',
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
      justifyContent: 'space-between',
    },
    eyeIcon: {
      paddingHorizontal: 5,
    },
  });

export default PadlockFinalScreen;
