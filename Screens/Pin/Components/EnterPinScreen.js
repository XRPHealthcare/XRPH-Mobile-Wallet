import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import { light, dark } from '../../../assets/colors/colors';
import Pin from './Pin';
import useStore from '../../../data/store';
import Feather from 'react-native-vector-icons/Feather';
// import getTotalBalances from '../Handlers/get_total_balances';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

Feather.loadFont();

const MAX_ATTEMPTS = 8;

const EnterPinScreen = ({navigation}) => {
    const { theme, accounts, activeAccount } = useStore();
    const setAccounts = useStore((state) => state.setAccounts);
    const setActiveAccount = useStore((state) => state.setActiveAccount);
    const [newPin, setNewPin] = React.useState("");
    const [numAttempts, setNumAttempts] = React.useState(0);

    let colors = light;
    if (theme === 'dark') {
        colors = dark
    }

    const styles = styling(colors);

    const onVerificationSuccess = () => {
        navigation.navigate("Home Screen");
        setNewPin("");
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
    
    const getExchangeRates = async (exchangeFrom, exchangeIn) => {
        let XRPrate = 0;
        let XRPHrate = 0;

        const res = await firestore().collection('exchange_rates').doc(exchangeIn).get();
        console.log(res);
        if (res['_data'].XRPHrate === undefined || res['_data'].XRPrate === undefined) {
            setError("Unfortunately we could not connect your account.");
        } else {
            const exchangeRates = res['_data'];
            XRPrate = exchangeRates.XRPrate;
            XRPHrate = exchangeRates.XRPHrate;
        }

        if (exchangeFrom === 'XRP') {
            return XRPrate;
        } else if (exchangeFrom === 'XRPH') {
            return XRPHrate;
        } else {
            return 0;
        }
    }

    React.useEffect(() => {
        console.log('accounts', accounts);
        const getBalances = async () => {
            // let updatedAccounts = [];


            // await Promise.all(accounts.map(async (account) => {
            //     const contents = await getTotalBalances(account.balances);
            //     console.log(contents);
            // }));

            
            

            getTotalBalances(accounts)
            .then((updatedAccounts) => {
                console.log(updatedAccounts)
                for (let i = 0; i < updatedAccounts.length; i++) {
                    if (updatedAccounts[i].classicAddress === activeAccount.classicAddress) {
                        setActiveAccount(updatedAccounts[i]);
                        AsyncStorage.setItem('activeAccount', JSON.stringify(updatedAccounts[i])).then(() => {
                            console.log('active account set asynchronously');
                        });
                    } 
                }
                setAccounts(updatedAccounts);
                AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts)).then(() => {
                    console.log('active account set asynchronously');
                });
            })
            .catch((err) => {
                console.log('1: ', err.message)
            })
        }

        getBalances().catch((err) => console.log(err.message));
    }, []);

    return (
        <View style={styles.bg}>
            <View style={styles.header}>
                <Image
                    style={styles.headerImage}
                    source={theme === 'light' ? 
                    require('../../../assets/img/header_logo.png') :
                    require('../../../assets/img/header_logo_dark.png') }
                />
                {numAttempts < MAX_ATTEMPTS ?
                    <Text key="2" style={styles.directionText}>Please enter your pin.</Text>
                : <></>}
            </View>
            <ScrollView contentContainerStyle={styles.loadingAnimationWrapper}>
                {numAttempts < MAX_ATTEMPTS ?
                <Pin 
                    role={"verify"} 
                    onSuccess={onVerificationSuccess} 
                    onFailure={() => setNumAttempts((prev) => prev+1)} 
                    pin={newPin}
                    setPin={setNewPin}
                /> : <Text style={styles.sendModalHeaderText}>You have been locked out of your account.</Text> }
                <Text style={styles.attemptsLeft}>{MAX_ATTEMPTS - numAttempts} attempts remaining.</Text>
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const styling = colors => StyleSheet.create({
    bg: {
        backgroundColor: colors.bg,
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%',
        paddingHorizontal: 20,
    },
    header: {
        marginTop: 40
    },
    loadingAnimationWrapper: {
        backgroundColor: colors.bg,
        width: '100%',
        height: 100,
        // marginLeft: '5%',
        marginBottom: 100,
        marginTop: 30,
        // elevation: 5,
        borderRadius: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerImage: {
        width: 350,
        height: 65,
        marginTop: 10,
        marginLeft: 0,
      },
    addAccountAnimation: {
        marginLeft: 0
    },
    sendModalHeader: {
        width: '100%',
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 100
    },
    sendModalHeaderText: {
        fontSize: 20,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        textAlign: 'center',
        flex: 1,
        flexWrap: 'wrap',
        marginTop: 0
    },
    addAccountOkButton: {
        width: 200,
        height: 50,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: 20,
    },
    addAccountOkButtonText: {
        textAlign: 'center',
        fontSize: 20,
        color: colors.bg,
        fontFamily: "Nexa", fontWeight: "bold",
        marginRight: 20
    },
    directionText: {
        fontSize: 18,
        color: colors.text,
        fontFamily: "Nexa",
        marginTop: 200,
        textAlign: 'center'
    },
    attemptsLeft: {
        fontSize: 18,
        color: colors.text,
        fontFamily: "Nexa",
        marginTop: 20,
        textAlign: 'center'
    },
    buttonWrapper: {
        flexDirection: 'row'
    }
});

export default EnterPinScreen;