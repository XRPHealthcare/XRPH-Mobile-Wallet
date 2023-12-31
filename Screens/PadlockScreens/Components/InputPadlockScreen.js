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
  TextInput
} from 'react-native';
import _ from'lodash';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import { light, dark } from '../../../assets/colors/padlockColors';
import useStore from '../../../data/store';
import PadlockInputRow from './PadlockInputRow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import getWalletFromEntropy from '../Handlers/get_wallet_from_entropy';
import getAccountBalances from '../../HomeScreen/Handlers/get_account_balances';
// import getTotalBalances from '../../Pin/Handlers/get_total_balances';

AntDesign.loadFont();
Feather.loadFont();

const InputPadlockScreen = ({ navigation }) => {
    const { theme, accounts } = useStore();
    const setAccounts = useStore((state) => state.setAccounts);
    const setActiveAccount = useStore((state) => state.setActiveAccount);
    const setLoginWalletAddress = useStore((state) => state.setLoginWalletAddress);

    let colors = light;
    if (theme === 'dark') {
      colors = dark
    }

    const styles = styling(colors);

    const [padlockInput, setPadlockInput] = React.useState({
        'A': ["_", "_", "_", "_", "_", "_"],
        'B': ["_", "_", "_", "_", "_", "_"],
        'C': ["_", "_", "_", "_", "_", "_"],
        'D': ["_", "_", "_", "_", "_", "_"],
        'E': ["_", "_", "_", "_", "_", "_"],
        'F': ["_", "_", "_", "_", "_", "_"],
        'G': ["_", "_", "_", "_", "_", "_"],
        'H': ["_", "_", "_", "_", "_", "_"]
    });

    const [connectedAccount, setConnectedAccount] = React.useState({});
    const [connectAccountModalOpen, setConnectAccountModalOpen] = React.useState(false);
    const [accountPassword, setAccountPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [enterPwVisibility, setEnterPwVisibility] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const updatePadlock = (padlockKey, padlockIndex, padlockValue) => {
        console.log(padlockInput);
        const prevState = padlockInput;
        let newValueArray = padlockInput[padlockKey];
        newValueArray[padlockIndex] = padlockValue;
        setPadlockInput({ ...prevState, [padlockKey]: newValueArray });
        console.log(padlockKey, padlockIndex, padlockValue);
        console.log(padlockInput);
    }

    const checkPadlock = async () => {
        // turn padlock into entropy
        // use entropy to get a wallet
        // if wallet address = classicAddress
        // then user continues
        const entropyString = padlockInput['A'].join("") + " "
                            + padlockInput['B'].join("") + " "
                            + padlockInput['C'].join("") + " "
                            + padlockInput['D'].join("") + " "
                            + padlockInput['E'].join("") + " "
                            + padlockInput['F'].join("") + " "
                            + padlockInput['G'].join("") + " "
                            + padlockInput['H'].join("")
        console.log(entropyString);
        const wallet = getWalletFromEntropy(entropyString);
        console.log(wallet);
        
            // continue to passcode enter
        const res = await firestore().collection('accounts')
                    .where('wallet_address', '==', wallet.classicAddress).get()
        console.log(res);
        if (res['_docs'].length === 0) {
            console.log('no user');
            setError("");
            setConnectAccountModalOpen(true);
        } else {
            setError("");
            const fbAccount = res['_docs'][0]['_data'];
            console.log('user');
            setConnectedAccount({...fbAccount, ...wallet});
            setConnectAccountModalOpen(true);
        }
    }

    const getTotalBalances = async () => {
      let updatedAccounts = [];

      for (let accountIndex = 0; accountIndex < accounts.length; accountIndex++) {

          let allRates = {
              USD: {
                  XRPrate: 0,
                  XRPHrate: 0
              },
              EUR: {
                  XRPrate: 0,
                  XRPHrate: 0
              },
              GBP: {
                  XRPrate: 0,
                  XRPHrate: 0
              }
          };

          let allBalances = {
              USD: "0",
              EUR: "0",
              GBP: "0"
          };

          const currencies = ["USD", "EUR", "GBP"];
          const balances = accounts[accountIndex].balances;

          if (balances.length == 0) {
              updatedAccounts.push({
                  ...accounts[accountIndex],
                  totalBalances: allBalances
              })
          } else {

              for (let i = 0; i < currencies.length; i++) {
                  const res = await firestore().collection('exchange_rates').doc(currencies[i]).get();
                  if (res['_data'].XRPHrate === undefined || res['_data'].XRPrate === undefined) {
                      setError("Unfortunately we could not connect your account.");
                  } else {
                      const exchangeRates = res['_data'];
                      allRates[currencies[i]].XRPrate = exchangeRates.XRPrate;
                      allRates[currencies[i]].XRPHrate = exchangeRates.XRPHrate;
                      // XRPrate = exchangeRates.XRPrate;
                      // XRPHrate = exchangeRates.XRPHrate;
                  }
                  let sum = 0;

                  for (let j = 0; j < balances.length; j++) {

                      const { currency, value } = balances[j];

                      let amount = 0;
                      if (currency === 'XRP') {
                          amount = Number(value * allRates[currencies[i]].XRPrate);
                      } else if (currency === 'XRPH') {
                          amount = Number(value * allRates[currencies[i]].XRPHrate);
                      } else {
                          amount = 0;
                      }
                      sum += amount;
                  }

                  sum = sum.toFixed(2);
                  allBalances[currencies[i]] = String(sum.toLocaleString("en-US"));

              }
              // get data for XRP and XRPH
              
              updatedAccounts.push({
                  ...accounts[accountIndex],
                  totalBalances: allBalances
              });
          }
      }
      return updatedAccounts;
  }

    // const getAccountBalance = async () => {
    //     const adjustedAccounts = await getTotalBalances(accounts);
    //     return adjustedAccounts;
    // }

    const loginUser = async () => {
        if (accountPassword === connectedAccount.password) {
          console.log('user logged in');
          setLoading(true);
          let updatedNewAccount = connectedAccount;
          const balances = await getAccountBalances(updatedNewAccount);
          updatedNewAccount = {
              ...updatedNewAccount,
              balances,
              prescription_card: {
                  id: connectedAccount.card_id,
                  bin: "610280",
                  group: "XRPH"
              }
          }

          let updatedAccounts = accounts;
          updatedAccounts.push(updatedNewAccount);
          
          // new
          const adjustedAccounts = await getTotalBalances(accounts);

          setAccounts(adjustedAccounts);
          AsyncStorage.setItem('accounts', JSON.stringify(adjustedAccounts)).then(() => {
              console.log('accounts set asynchronously');
          });
          
          for (let i = 0; i < adjustedAccounts.length; i++) {
              if (adjustedAccounts[i].classicAddress === updatedNewAccount.classicAddress) {
                  setActiveAccount(adjustedAccounts[i]);
                  AsyncStorage.setItem('activeAccount', JSON.stringify(adjustedAccounts[i])).then(() => {
                      console.log('active account set asynchronously');
                  })
              }
          }

          // setAccounts(updatedAccounts);
          // AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts)).then(() => {
          //     console.log('accounts set asynchronously');
          // })

          // setActiveAccount(updatedNewAccount);
          // AsyncStorage.setItem('activeAccount', JSON.stringify(updatedNewAccount)).then(() => {
          //     console.log('active account set asynchronously');
          // })

          // reset state
          setLoginWalletAddress("");
          console.log('logged in')
          setLoading(false);

          if (updatedAccounts.length <= 1) {
              navigation.navigate('Set Pin Screen');
          } else {
              navigation.navigate('Home Screen');
          }
          setConnectAccountModalOpen(false);
        } else {
          setError("Incorrect password.");
        }
    }

    const backFromPw = () => {
      setConnectAccountModalOpen(false);
      setError("");
    }

    return (
        <GestureHandlerRootView>
        <SafeAreaView style={{ backgroundColor: colors.bg }}>
            <StatusBar />
            <ScrollView contentContainerStyle={styles.bg}>
                <Image
                style={styles.headerImage}
                source={theme === 'light' ? 
                require('../../../assets/img/header_logo.png') :
                require('../../../assets/img/header_logo_dark.png') }
                />
                <View style={styles.directionsContainer}>
                  <Text style={styles.directionText}>
                      Enter your passcode combination that you wrote down when your account was created. 
                  </Text>
                </View>

                {error.length > 0 && <Text style={styles.errorMessageText}>Error: {error}</Text>}
                
                <View style={styles.padlock}>
                    <PadlockInputRow letter={"A"} updatePadlock={updatePadlock} />
                    <PadlockInputRow letter={"B"} updatePadlock={updatePadlock} />
                    <PadlockInputRow letter={"C"} updatePadlock={updatePadlock} />
                    <PadlockInputRow letter={"D"} updatePadlock={updatePadlock} />
                    <PadlockInputRow letter={"E"} updatePadlock={updatePadlock} />
                    <PadlockInputRow letter={"F"} updatePadlock={updatePadlock} />
                    <PadlockInputRow letter={"G"} updatePadlock={updatePadlock} />
                    <PadlockInputRow letter={"H"} updatePadlock={updatePadlock} />
                    <View style={styles.padlockBottom} />
                </View>
                
                <View style={styles.slideButtonContainer}>
                  <TouchableOpacity style={styles.buttonConnect} onPress={() => navigation.navigate('Start Screen')}>
                      <View style={styles.buttonWrapper}>
                          <Text style={styles.buttonConnectText}>Back</Text>
                      </View>
                  </TouchableOpacity> 
                  <TouchableOpacity style={{
                      backgroundColor: colors.secondary,
                      width: '48%',
                      height: 80,
                      alignItems: 'center',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      borderRadius: 20,
                      marginBottom: 10,
                    }} onPress={checkPadlock}>
                      <View style={styles.buttonWrapper}>
                          <Text style={styles.buttonCreateText}>Continue</Text>
                          <AntDesign name={"arrowright"} size={30} color={colors.text} style={styles.continueIcon} />
                      </View>
                  </TouchableOpacity>
                </View>
            </ScrollView>

            { (connectAccountModalOpen && !loading) &&
                <View style={styles.bg}>
                    <Modal
                    visible={connectAccountModalOpen}
                    transparent={true}
                    >
                      <View style={styles.addAccountModalWrapper}>
                        
                          <View style={styles.sendModalHeader}>
                          <Text style={styles.sendModalHeaderText}>Login To Your Account</Text>
                                              
                          </View>
                          <View style={styles.addAccountModalActionsWrapper}>
                              
                              <Text key={"Text"} style={styles.addAccountModalDirections}>Please enter your password.</Text>
                              <View style={styles.pw} key="view">
                                <TextInput
                                  style={styles.accountNameInputPw}
                                  onChangeText={setAccountPassword}
                                  value={accountPassword}
                                  placeholder="Password"
                                  placeholderTextColor={colors.text_dark}
                                  key={"Input"}
                                  secureTextEntry={!enterPwVisibility}
                                />
                                <TouchableOpacity style={styles.eyeButton} onPress={() => setEnterPwVisibility(!enterPwVisibility)}>
                                      <View style={styles.buttonWrapper}>
                                          <Feather name={enterPwVisibility ? "eye" : "eye-off"} size={25} color={colors.text} style={styles.eyeIcon} />
                                      </View>
                                </TouchableOpacity>
                              </View>
                              
                              {error.length > 0 && <Text style={styles.errorMessagePw}>Error: {error}</Text>}
                              <View style={styles.addAccountActionButtons}>
                                  <TouchableOpacity style={styles.addAccountBackButton} onPress={backFromPw}>
                                      <View style={styles.buttonWrapper}>
                                        <Feather name={"arrow-left"} size={25} color={colors.bg} style={styles.continueIcon} />
                                          <Text style={styles.addAccountOkButtonTextNorm}>Back</Text>
                                      </View>
                                  </TouchableOpacity>
                                  
                                  <TouchableOpacity style={styles.addAccountOkButton} onPress={loginUser}>
                                      <View style={styles.buttonWrapper}>
                                          <Text style={styles.addAccountOkButtonText}>Continue</Text>
                                          <Feather name={"arrow-right"} size={25} color={colors.bg} style={styles.continueIcon} />
                                      </View>
                                  </TouchableOpacity>
                              </View>
                          </View>

                        </View>
                </Modal>
              </View> }

              { loading &&
                <View style={styles.bgMiddle}>
                        <Text style={styles.loadingText}>Loading...</Text>
              </View> }
            
        </SafeAreaView>
      </GestureHandlerRootView>
    );
};

  
const styling = colors => StyleSheet.create({
    bg: {
        backgroundColor: colors.bg,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        paddingHorizontal: 10,
    },
    bgMiddle: {
      backgroundColor: colors.bg,
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%',
        paddingHorizontal: 10,
    },
    loadingText: {
      fontSize: 18,
      color: colors.text_dark,
      fontFamily: "Nexa",
      fontWeight: 'bold',
      marginTop: 100
    },
    headerImage: {
      width: 350,
      height: 65,
      marginTop: 10,
      marginLeft: -20,
    },
    directionsContainer: {
      marginTop: 20,
      width: '100%',
      flex: 1,
      paddingHorizontal: 10,
    },
    welcomeText: {
      fontSize: 42,
      color: colors.text,
      marginBottom: -10,
    },
    directionText: {
      fontSize: 18,
      color: colors.text,
      fontFamily: "Nexa",
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
      marginTop: 22
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
      borderRadius: 10
    },
    slideButtonTitleStyle: {
      marginLeft: 20,
      fontSize: 20,
      fontFamily: "Nexa", fontWeight: "bold",
      color: colors.bg
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
      alignItems: 'center'
    },
    addAccountModalActionsWrapper: {
        paddingHorizontal: 10,
        width: '100%',
        // justifyContent: 'space-evenly',
        flexDirection: 'column',
        alignItems: 'center'
    },
    addAccountModalDirections: {
        textAlign: 'right',
        fontSize: 16,
        color: colors.text_dark,
        fontFamily: "Nexa", fontWeight: "bold",
        // marginBottom: 20
    },
    addAccountActionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
        marginTop: 10,
        marginLeft: 10
    },
    addAccountOkButton: {
        width: 200,
        height: 50,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: 20,
        marginBottom: 10
    },
    addAccountBackButton: {
        width: 110,
        height: 50,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: colors.text_dark,
        borderRadius: 20,
        marginBottom: 10,
        marginRight: 10
    },
    addAccountOkButtonText: {
        textAlign: 'center',
        fontSize: 20,
        color: colors.bg,
        fontFamily: "Nexa", fontWeight: "bold",
        marginRight: 20,
        marginTop: 5
    },
    addAccountOkButtonTextNorm: {
      textAlign: 'center',
        fontSize: 20,
        color: colors.bg,
        fontFamily: "Nexa", fontWeight: "bold",
        marginLeft: 10,
        marginRight: 20,
        marginTop: 5
    },
    sendModalHeader: {
        width: '100%',
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10
    },
    sendModalHeaderSpacer: {
        width: 10
    },
    sendModalHeaderText: {
        fontSize: 20,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        textAlign: 'center'
    },
    accountNameInput: {
        height: 40,
        width: '100%',
        paddingHorizontal: 10,
        margin: 10,
        backgroundColor: colors.text_light,
        borderColor: colors.primary,
        padding: 10,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        borderRadius: 10,
    },
    addAccountModalDirections: {
        width: '100%',
        textAlign: 'left',
        fontSize: 16,
        color: colors.text_dark,
        fontFamily: "Nexa", fontWeight: "bold",
        marginBottom: 5,
        marginTop: 20
    },
    buttonWrapper: {
      flexDirection: 'row'
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
      marginBottom: 10
    },
    buttonCreate: {
      
    },
    buttonConnectText: {
      fontSize: 20,
      color: colors.text,
      fontFamily: "Nexa", fontWeight: "bold",
    },
    buttonCreateText: {
      fontSize: 20,
      color: colors.text,
      fontFamily: "Nexa", fontWeight: "bold",
    },
    buttonWrapper: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    continueIcon: {
      marginLeft: 10
    },
    errorMessage: {
      marginBottom: 80,
      padding: 10,
      backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily: 'Nexa', fontWeight: 'bold',
      borderRadius: 20
    },
    errorMessagePw: {
      marginBottom: 10,
      padding: 10,
      backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily: 'Nexa', fontWeight: 'bold',
      borderRadius: 20
    },
    errorMessageText: {
      backgroundColor: colors.text,
      color: '#ff6961',
      fontFamily: 'Nexa', fontWeight: 'bold',
      borderRadius: 20,
      padding: 10,
      marginBottom: 10,
      width: '100%'
    },
    accountNameInputPw: {
      height: 40,
      width: '90%',
      paddingHorizontal: 10,
      marginRight: 10,
      marginTop: 10,
      marginBottom: 10,
      backgroundColor: colors.text_light,
      borderColor: colors.primary,
      padding: 10,
      fontFamily: "Nexa", fontWeight: "bold",
      color: colors.text,
      borderRadius: 10,
      paddingTop: 14
    },
    eyeButton: {
        backgroundColor: colors.text_light,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    pw: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    eyeIcon: {
        paddingHorizontal: 5
    },
  });

  export default InputPadlockScreen;