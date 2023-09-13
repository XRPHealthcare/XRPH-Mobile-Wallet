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
  ScrollView
} from 'react-native';
import isValidAddress from '../Handlers/validate_address';
import useStore from '../../../data/store';
import { light, dark } from '../../../assets/colors/colors';
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

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();


const SendModal = (props) => {
    let { activeAccount, destinationAddress, token, tokenRate, 
          amount, memo, destinationTag, rateLoading, exchangeRate, theme, exchangeTo } = useStore();
    const setDestinationAddress = useStore((state) => state.setDestinationAddress);
    const setToken = useStore((state) => state.setToken);
    const setMemo = useStore((state) => state.setMemo);
    const setDestinationTag = useStore((state) => state.setDestinationTag);
    const setExchangeRate = useStore((state) => state.setExchangeRate);
    const setExchangeTo = useStore((state) => state.setExchangeTo);

    const [walletAddressErrorMessage, setWalletAddressErrorMessage] = React.useState("");
    const [amountErrorMessage, setAmountErrorMessage] = React.useState("");

    const [cameraOpen, setCameraOpen] = React.useState(false);
    const [destTagModalOpen, setDestTagModalOpen] = React.useState(false);
    const [requireDestTagModalOpen, setRequireDestTagModalOpen] = React.useState(false);
    const [exchangeObject, setExchangeObject] = React.useState({});
    const [DTagError, setDTagError] = React.useState("");
    const [bottomMargin, setBottomMargin] = React.useState(0);
    const [undfundedModalOpen, setUnfundedModalOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [exchanges, setExchanges] = React.useState(new Map());

    let colors = light;
    if (theme === 'dark') {
        colors = dark
    }

    const styles = styling(colors);

    const checkWalletAddress = (walletAddress) => {
        console.log(walletAddress)
        const isValid = isValidAddress(walletAddress);
        if (isValid) {
            if (walletAddress === activeAccount.classicAddress) {
                setWalletAddressErrorMessage("Error: Cannot send to yourself.");
                return false;
            } else {
                setWalletAddressErrorMessage("");
                return true;
            }
        } else {
            setWalletAddressErrorMessage("Error: Invalid wallet address.");
            return false;
        }
    }

    const checkAmount = (amount) => {
        if (amount === 0 || amount === "0" || amount === "") {
            setAmountErrorMessage("Error: Cannot have nonzero amount.");
            return false;
        }
        if (parseInt(token.value) >= parseInt(amount)) {
            console.log(token);
            setAmountErrorMessage("");
            return true;
        } else {
            setAmountErrorMessage("Error: Amount must not exceed available balance.");
            return false;
        }
    }

    const checkIfSendingToExchange = async (destinationAddress) => {
        try {
            const res = await firestore().collection('exchanges').where('wallet_address', '==', destinationAddress).get();
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
    }

    const getExchanges = async () => {
        const res = await firestore().collection('exchanges').get();
        let map = new Map();

        for (let i = 0; i < res['_docs'].length; i++) {
            map.set(res['_docs'][i]['_data'].wallet_address, res['_docs'][i]['_data'].name);
        }
        console.log(map);
        setExchanges(map);
        // get a map of exchanges
        // get all docs in exchanges DB
        // key: value --> wallet address : name
        // check if dest address is in map (key) then get value 

    }

    const reviewSendTx1 = () => {
        if (checkWalletAddress(destinationAddress) && checkAmount(amount)) {
            // check firestore to see if sending to an exchange
            // check if unfunded account
            if (exchanges.has(destinationAddress)) {
                setLoading(false);
                setRequireDestTagModalOpen(true);
                console.log(exchanges.get(destinationAddress));
            } else {
                setLoading(true);
                getAccountStatus(destinationAddress)
                .then(res => {
                    
                    // checkIfSendingToExchange(destinationAddress).then(res => {
                    //     setExchangeObject(res);
                    //     if (res === undefined) {
                            
                    //     } else {
                            
                    //     }
                    // });
                    props.setStep(2);
                    setLoading(false); // rNFugeoj3ZN8Wv6xhuLegUBBPXKCyWLRkB
                })
                .catch(err => {
                    setLoading(false);
                    console.log('E:', err.message); // account unfunded
                    setUnfundedModalOpen(true);
                })
                
            }
            
        }
    }

    const reviewSendTx2 = () => {
        setDestTagModalOpen(false);
        props.setStep(1);
        props.reviewSendTransaction();
    }

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
    }

    const onShow = () => {
        if (activeAccount.balances.length > 0) {
            props.fetchExchangeRates(token.currency, 'USD');
            // props.setAmountAndExRate(0);
            // setToken(activeAccount.balances[0]);
        }
        getExchanges();
    }

    const onClose = () => {
        setWalletAddressErrorMessage("");
        setAmountErrorMessage("");
        setToken(activeAccount.balances[0]);
        props.closeSendModal(); // !!!!
    }

    const onCameraOpen = async () => {
        try {
            const result = await launchImageLibrary();
            console.log(result.assets[0].uri);
            const { values } = await RNQRGenerator.detect({
                uri: result.assets[0].uri
            });
            setDestinationAddress(values[0])
        } catch (e) {}
    }

    const enterTag = () => {
        if (destinationTag.length > 0) {
            setRequireDestTagModalOpen(false);
            setDTagError("");
            setBottomMargin(0);
            props.reviewSendTransaction();
        } else {
            setDTagError('Error: Destination tag cannot be left empty.');
        }
    }

    // const handleStepper = () => {
    //     if (step === 1) {
    //         setStep(2);
    //     } else if (step === 2) {
    //         setStep(1);
    //     }
    // }

    const continueUnfundedAccount = () => {
        setUnfundedModalOpen(false);
        props.setStep(2);
    }

    let dismissKeyboard = () => { 
        return new Promise((resolve, reject) => { 
            Keyboard.dismiss(); 
            setTimeout(() => { 
                resolve(); 
            }, 5); 
        }); 
    };

    const clickOutOfDTag = () => {
        setDTagError("");
        setBottomMargin(0);
        setRequireDestTagModalOpen(false);
    }

    return (
            <Modal
                visible={props.sendModalOpen}
                transparent={true}
                useNativeDriver={true}
                onShow={onShow}
                // onDismiss={onClose}
            >
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.sendModalWrapper} onPress={Keyboard.dismiss}>
                        <View style={styles.sendModalHeader}>
                            {
                                // HEADER
                            }
                            <View style={styles.sendModalHeaderSpacer}></View>
                            <Text style={styles.sendModalHeaderTextLarge}>Send</Text>
                            <View style={styles.sendModalHeaderSpacer}></View>
                            {/* <TouchableOpacity style={styles.sendModalCloseButton} onPress={onClose}>
                                <Text style={styles.sendModalHeaderText}>X</Text>
                            </TouchableOpacity> */}
                        </View>
                        {props.step === 1 &&
                            [<View key="1" style={styles.sendModalFromWrapper}>
                                {
                                    // FROM
                                }
                                <Text style={styles.sendModalInputLabel}>From</Text>
                                <View style={styles.sendModalAccount}>
                                    <Text style={styles.sendModalInputLabelAcc}>{activeAccount.name}</Text>
                                    <Text style={styles.sendModalInputLabelLight}>{activeAccount.classicAddress}</Text>
                                </View>
                            </View>,
                            <View key="2" style={styles.sendModalToWrapper}>
                                {
                                    // TO
                                }
                                <Text style={styles.sendModalInputLabel}>To</Text>
                                <View style={styles.row}>
                                    <TextInput
                                        style={styles.toAddressInput}
                                        onChangeText={setDestinationAddress}
                                        value={destinationAddress}
                                        placeholder="Wallet Address"
                                        placeholderTextColor={colors.text_dark}
                                    />
                                    {/* <TouchableOpacity style={styles.scanButton} onPress={onCameraOpen}>
                                        <Ionicons name={"scan"} size={20} color={colors.text} />
                                    </TouchableOpacity> */}
                                </View>
                            </View>,
                            <View key="3" style={styles.sendModalTokenWrapper}>
                                {
                                    // TOKEN
                                }
                                <Text style={styles.sendModalInputLabel}>Token</Text>
                                {activeAccount.balances.length > 0 &&
                                <View style={styles.sendModalToken}>
                                    <SelectDropdown
                                        data={activeAccount.balances}
                                        onSelect={(selectedItem, index) => {
                                            console.log(selectedItem);
                                            setToken(selectedItem);
                                            console.log(selectedItem);
                                            props.fetchExchangeRates(selectedItem.currency, exchangeTo);
                                            const completeRate = parseFloat(tokenRate * amount);
                                            setExchangeRate(String(completeRate));
                                        }}
                                        buttonTextAfterSelection={(selectedItem, index) => {
                                            // text represented after item is selected
                                            // if data array is an array of objects then return selectedItem.property to render after item is selected
                                            return selectedItem.currency
                                        }}
                                        rowTextForSelection={(item, index) => {
                                            // text represented for each item in dropdown
                                            // if data array is an array of objects then return item.property to represent item in dropdown
                                            return item.currency
                                        }}
                                        defaultButtonText={token.currency}
                                        dropdownStyle={styles.currencyDropdown}
                                        buttonStyle={styles.currencyDropdownButton}
                                        buttonTextStyle={styles.currencyDropdownButtonText}
                                        rowTextStyle={styles.currencyDropdownText}
                                        renderDropdownIcon={isOpened => {
                                            return <FontAwesome name={isOpened ? "angle-up" : "angle-down"} size={30} color={colors.text} />
                                        }}
                                    />
                                    <Text style={styles.sendModalAvailableBalance}>Available: {token.value}</Text>
                                </View>}
                            </View>,
                            <View key="4" style={styles.sendModalAmountWrapper}>
                                {
                                    // AMOUNT
                                }
                                <Text style={styles.sendModalInputLabel}>Amount</Text>

                                <TextInput
                                    style={styles.amountInput}
                                    onChangeText={(amount) => props.setAmountAndExRate(amount)}
                                    value={amount}
                                    placeholder="0"
                                    placeholderTextColor={colors.text_dark}
                                    keyboardType={'number-pad'}
                                    returnKeyType={'done'}
                                    onPressIn={() => Keyboard.dismiss()}
                                />
                                <View style={styles.sendModalExchangeRate}>
                                    {exchangeTo === 'USD' && <Text style={styles.sendModalConversionLabel}><Text style={styles.inputLabelCharacter}>~</Text> $ {rateLoading ? "Loading..." : exchangeRate}</Text>}
                                    {exchangeTo === 'EUR' && <Text style={styles.sendModalConversionLabel}><Text style={styles.inputLabelCharacter}>~</Text> € {rateLoading ? "Loading..." : exchangeRate}</Text>}
                                    {exchangeTo === 'GBP' && <Text style={styles.sendModalConversionLabel}><Text style={styles.inputLabelCharacter}>~</Text> £ {rateLoading ? "Loading..." : exchangeRate}</Text>}
                                    <SelectDropdown
                                        data={["USD", "EUR", "GBP"]}
                                        onSelect={(selectedItem, index) => {
                                            console.log(selectedItem);
                                            setExchangeTo(selectedItem);
                                            props.fetchExchangeRates(token.currency, selectedItem);
                                            props.setAmountAndExRate(amount);
                                        }}
                                        buttonTextAfterSelection={(selectedItem, index) => {
                                            // text represented after item is selected
                                            // if data array is an array of objects then return selectedItem.property to render after item is selected
                                            return selectedItem
                                        }}
                                        rowTextForSelection={(item, index) => {
                                            // text represented for each item in dropdown
                                            // if data array is an array of objects then return item.property to represent item in dropdown
                                            return item
                                        }}
                                        defaultButtonText={exchangeTo}
                                        dropdownStyle={styles.exchangeRateDropdown}
                                        buttonStyle={styles.exchangeRateDropdownButton}
                                        buttonTextStyle={styles.exchangeRateDropdownButtonText}
                                        rowTextStyle={styles.exchangeRateDropdownText}
                                        renderDropdownIcon={isOpened => {
                                            return <FontAwesome name={isOpened ? "angle-up" : "angle-down"} size={30} color={colors.text} />
                                        }}
                                    />
                                </View>
                                <View style={styles.sendModalTxFee}>
                                    <Text style={styles.sendModalTransactionFeeLabel}>Transaction Fee: 0.00008 XRPH</Text>
                                </View>
                            </View>,
                            <View key="err">
                                {walletAddressErrorMessage.length > 0 && <Text style={styles.errorMessageText}>{walletAddressErrorMessage}</Text>}
                                {amountErrorMessage.length > 0 && <Text style={styles.errorMessageText}>{amountErrorMessage}</Text>}         
                            </View>,
                            <View key="5" style={styles.sendActionButtonsContainer}>
                                {!loading &&
                                <React.Fragment>
                                    <TouchableOpacity style={styles.buttonConnect} onPress={onClose}>
                                        <View style={styles.buttonWrapper}>
                                            <Text style={styles.buttonConnectText}>Cancel</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.buttonCreate} onPress={reviewSendTx1}>
                                        <View style={styles.buttonWrapper}>
                                            <Text style={styles.buttonCreateText}>Continue</Text>
                                            <AntDesign name={"arrowright"} size={30} color={colors.text} style={styles.continueIcon} />
                                        </View>
                                    </TouchableOpacity>
                                </React.Fragment>
                                }
                                {loading &&
                                <React.Fragment>
                                    <View style={styles.sendActionButtonsContainerLoading}>
                                        <Text style={styles.sendModalInputLabel}>Loading...</Text>
                                    </View>
                                </React.Fragment>
                                }
                            </View>
                            ]
                        }
                        {props.step === 2 &&
                            [<View key="1" style={styles.sendModalTransactionFeeWrapper2}>
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
                                />
                            </View>,
                            <View key="2" style={styles.sendModalTransactionFeeWrapper}>
                                {
                                    // DESTINATION TAG
                                }
                                <Text style={styles.sendModalInputLabel}>Destination Tag</Text>
                                <TextInput
                                    style={styles.accountNameInput}
                                    onChangeText={setDestinationTag}
                                    value={destinationTag}
                                    placeholder="Enter a destination tag  (only for exchanges)"
                                    placeholderTextColor={colors.text_dark}
                                    editable={exchangeObject === undefined}
                                />
                                <Text></Text>
                                <Text style={styles.sendModalInputLabelLightD}>* Destination Tags are NOT required if you are sending to an XRPH Wallet or a XUMM Wallet.</Text>
                                <Text style={styles.sendModalInputLabelLightD}>* This helps identify you as the receiver of the deposit. Don’t forget to add it or your deposit could be lost.</Text>
                            </View>,
                            <View key="3" style={styles.sendActionButtonsContainer}>
                                <TouchableOpacity style={styles.buttonConnect} onPress={() => props.setStep(1)}>
                                    <View style={styles.buttonWrapper}>
                                        <Text style={styles.buttonConnectText}>Back</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonCreate} onPress={checkDestTag}>
                                    <View style={styles.buttonWrapper}>
                                        <Text style={styles.buttonCreateText}>Continue</Text>
                                        <AntDesign name={"arrowright"} size={30} color={colors.text} style={styles.continueIcon} />
                                    </View>
                                </TouchableOpacity>
                            </View>]
                        }
                        
                    </View>
                </TouchableWithoutFeedback>

                <Modal
                    visible={destTagModalOpen}
                    transparent={true}
                >
                    <View style={styles.addAccountModalWrapper}>
                        <View style={styles.sendModalHeaderSmall}>          
                            <Text style={styles.sendModalHeaderSmallText}>Send To This Destination?</Text>
                        </View>
                        <View style={styles.addAccountModalActionsWrapper}>
                            <Text style={styles.sendModalInputLabelLeft}>Destination Address</Text>
                            <View style={styles.sendModalAccountFull}>
                                <Text style={styles.sendModalInputLabelLight}>{destinationAddress}</Text>
                            </View>
                            <Text style={styles.sendModalInputLabelLeft}>Destination Tag</Text>
                            <View style={styles.sendModalAccountFull}>
                                <Text style={styles.sendModalInputLabelLight}>{destinationTag}</Text>
                            </View>
                            
                            <View style={styles.addAccountActionButtons}>
                                <TouchableOpacity style={styles.noButton} onPress={() => setDestTagModalOpen(false)}>
                                    <View style={styles.saveButton}>
                                        <Text style={styles.addAccountOkButtonText}>No</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.yesButton} onPress={reviewSendTx2}>
                                    <View style={styles.saveButton}>
                                        <Text style={styles.addAccountOkButtonText}>Yes</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal> 
                
                <Modal visible={undfundedModalOpen} transparent={true}>
                    <View style={[styles.addAccountModalWrapperLong, {bottom: 0}]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                        {token !== undefined && 
                        <View style={styles.addAccountModalActionsWrapper}>
                            <Text style={styles.sendModalInputLabelLeft1}>Looks like you're sending to an unfunded account.</Text>
                            {(token.currency === 'XRP' && amount >= 12) && <Text style={styles.sendModalInputLabelLeft2}>Please note that 12 XRP of your {amount} XRP will be used as a reserve.</Text>}
                            {(token.currency === 'XRP' && amount < 12) && <Text style={styles.sendModalInputLabelLeft2}>You must send at least 12 XRP in order to fund this account.</Text>}
                            {token.currency !== 'XRP' && <Text style={styles.sendModalInputLabelLeft2}>You cannot send non-XRP tokens to an account until it is first funded.</Text>}
                            
                            {(token.currency === 'XRP' && amount >= 12) && 
                                <View style={styles.addAccountActionButtons2}>
                                    <TouchableOpacity style={styles.contButton} onPress={continueUnfundedAccount}>
                                        <View style={styles.saveButton}>
                                            <Text style={styles.addAccountOkButtonText}>Continue</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            }
                            {(token.currency === 'XRP' && amount < 12) && 
                                <View style={styles.addAccountActionButtons2}>
                                    <TouchableOpacity style={styles.contButton} onPress={() => setUnfundedModalOpen(false)}>
                                        <View style={styles.saveButton}>
                                            <Text style={styles.addAccountOkButtonText}>Okay</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            }
                            {token.currency !== 'XRP' && 
                                <View style={styles.addAccountActionButtons2}>
                                    <TouchableOpacity style={styles.contButton} onPress={() => setUnfundedModalOpen(false)}>
                                        <View style={styles.saveButton}>
                                            <Text style={styles.addAccountOkButtonText}>Okay</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            }
                            
                        </View>}
                    </View>
                </Modal>

                <Modal visible={requireDestTagModalOpen} transparent={true} onRequestClose={clickOutOfDTag}>
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
                            <KeyboardAvoidingView style={[styles.addAccountModalWrapperLong, { bottom: bottomMargin }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                                <TouchableWithoutFeedback>
                                <View style={styles.addAccountModalActionsWrapper}>
                                    <Text style={styles.sendModalInputLabelLeft1}>It appears you are sending tokens to {exchanges.get(destinationAddress)}.</Text>
                                    <Text style={styles.sendModalInputLabelLeft2}>This address requires a destination tag.</Text>
                                    
                                    <TextInput
                                        style={styles.dtagInput}
                                        onChangeText={setDestinationTag}
                                        value={destinationTag}
                                        placeholder="Enter a destination tag..."
                                        placeholderTextColor={colors.text_dark}
                                        onFocus={() => setBottomMargin(250)}
                                        onBlur={() => setBottomMargin(0)}
                                    />
                                    {DTagError.length > 0 && <Text style={styles.errorMessageText}>{DTagError}</Text>}  
                                    <View style={styles.addAccountActionButtons2}>
                                        <TouchableOpacity style={styles.contButton} onPress={enterTag}>
                                            <View style={styles.saveButton}>
                                                <Text style={styles.addAccountOkButtonText}>Continue</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                </TouchableWithoutFeedback>
                            </KeyboardAvoidingView>
                        {/* </ScrollView> */}
                    {/* </TouchableOpacity> */}
                </Modal>

                <Modal
                    visible={cameraOpen}
                    transparent={true}
                >
                    <View style={styles.sendModalWrapper}>
                        <View style={styles.sendModalHeader}>
                            {
                                // HEADER
                            }
                            <View style={styles.sendModalHeaderSpacer}></View>
                            <Text style={styles.sendModalHeaderText}>Scan Wallet Address</Text>
                            <TouchableOpacity style={styles.sendModalCloseButton} onPress={() => setCameraOpen(false)}>
                                <Text style={styles.sendModalHeaderText}>X</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </Modal>
    );
}

const styling = colors => StyleSheet.create({
    sendModalWrapper: {
        backgroundColor: colors.bg,
        height: '100%',
        width: '100%',
        // marginLeft: '5%',
        // marginTop: 15,
        // position: 'absolute',
        // bottom: 10,
        elevation: 5,
        shadowColor: '#000000',
        shadowOffset: {width: 5, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 20,
        borderRadius: 10,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    sendModalHeader: {
        width: '100%',
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 50
    },
    sendModalHeaderSmall: {
        width: '100%',
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 10
    },
    sendModalHeaderSpacer: {
        width: 60
    },
    sendModalHeaderText: {
        fontSize: 20,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        textAlign: 'right',
        paddingRight: 10
    },
    sendModalHeaderSmallText: {
        fontSize: 20,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        textAlign: 'center',
        paddingRight: 10,
        width: '100%'
    },
    sendModalHeaderTextLarge: {
        fontSize: 22,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        textAlign: 'right',
        paddingRight: 10,
        marginTop: 20,
        paddingTop: 10
    },
    sendModalFromWrapper: {
        width: '100%',
        paddingHorizontal: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    sendModalAccount: {
        backgroundColor: colors.text_light,
        borderRadius: 5,
        // marginTop: 5,
    },
    sendModalAccountFull: {
        backgroundColor: colors.text_light,
        borderRadius: 5,
        width: '100%'
    },
    sendModalInputLabel: {
        fontSize: 16,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        // paddingLeft: 5,
        paddingTop: 5,
        paddingBottom: 3
    },
    sendModalInputLabelAcc: {
        fontSize: 16,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        paddingLeft: 5,
        paddingTop: 5,
        paddingBottom: 3
    },
    sendModalInputLabelLeft: {
        fontSize: 16,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        // paddingLeft: 5,
        paddingTop: 5,
        paddingBottom: 3,
        alignSelf: 'flex-start'
    },
    sendModalInputLabelLeft1: {
        fontSize: 16,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        // paddingLeft: 5,
        paddingTop: 5,
        paddingBottom: 3,
        alignSelf: 'flex-start',
        marginTop: 10
    },
    sendModalInputLabelLeft2: {
        fontSize: 16,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        // paddingLeft: 5,
        paddingTop: 5,
        paddingBottom: 3,
        alignSelf: 'flex-start',
        marginBottom: 30,
        marginTop: 5
    },
    sendModalInputLabelLight: {
        fontSize: 12,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text_dark,
        paddingLeft: 5,
        paddingTop: 5,
        paddingBottom: 5
    },
    sendModalInputLabelLightD: {
        fontSize: 14,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text_dark,
        paddingLeft: 5,
        paddingTop: 5,
        paddingBottom: 5,
        lineHeight: 16
    },
    sendModalToWrapper: {
        width: '100%',
        paddingHorizontal: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    sendModalSearch: {
        backgroundColor: colors.text_light,
        borderRadius: 5,
        marginTop: 5
    },
    sendModalSearchLabel: {
        fontSize: 14,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text_dark,
        paddingLeft: 5,
        paddingTop: 8,
        paddingBottom: 6
    },
    sendModalTokenWrapper: {
        width: '100%',
        paddingHorizontal: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    sendModalToken: {
        backgroundColor: colors.text_light,
        borderRadius: 5,
        // marginTop: 5
    },
    sendModalTxFee: {
        backgroundColor: colors.text_light,
        borderRadius: 5,
        marginTop: 5
    },
    sendModalExchangeRate: {
        backgroundColor: colors.text_light,
        borderRadius: 5,
        marginTop: 5,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    sendModalAmountWrapper: {
        width: '100%',
        paddingHorizontal: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    sendModalAmountLabel: {
        fontSize: 16,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.primary,
        paddingLeft: 5,
        paddingTop: 10,
        paddingBottom: 5
    },
    inputLabelCharacter: {
        fontFamily: 'Helvetica',
    },
    sendModalConversionLabel: {
        fontSize: 16,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        paddingLeft: 5,
        paddingTop: 8,
        paddingBottom: 5
    },
    sendModalTransactionFeeWrapper: {
        width: '100%',
        paddingHorizontal: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    sendModalTransactionFeeWrapper2: {
        width: '100%',
        paddingHorizontal: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginTop: 20
    },
    sendModalTransactionFeeLabel: {
        fontSize: 16,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text_dark,
        paddingLeft: 5,
        paddingTop: 10,
        paddingBottom: 5
    },
    sendModalMemoLabel: {
        fontSize: 16,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text_dark,
        paddingLeft: 5,
        paddingTop: 5,
        paddingBottom: 5
    },
    buttonWrapper: {
        flexDirection: 'row'
    },
    accountNameInput: {
        height: 40,
        marginTop: 0,
        paddingHorizontal: 10,
        backgroundColor: colors.text_light,
        borderColor: colors.primary,
        padding: 10,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        borderRadius: 5,
        paddingTop: 14
    },
    dtagInput: {
        height: 40,
        width: '100%',
        paddingHorizontal: 10,
        backgroundColor: colors.text_light,
        borderColor: colors.primary,
        padding: 10,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        borderRadius: 5,
        paddingTop: 14
    },
    toAddressInput: {
        height: 40,
        paddingHorizontal: 10,
        backgroundColor: colors.text_light,
        borderColor: colors.primary,
        padding: 10,
        fontFamily: "Nexa", fontWeight: "bold",
        fontSize: 12,
        color: colors.text,
        borderRadius: 5,
        width: '100%',
        paddingTop: 14
    },
    amountInput: {
        height: 50,
        // width: 200,
        alignItems: 'center',
        paddingHorizontal: 10,
        backgroundColor: colors.text_light,
        borderColor: colors.primary,
        // padding: 10,
        fontFamily: "Nexa", fontWeight: "bold",
        fontSize: 20,
        color: colors.primary,
        borderRadius: 5,
        paddingTop: 8
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
        bottom: 40,
        marginTop: 10,
    },
    sendActionButtonsContainerLoading: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginLeft: 10,
        position: 'absolute',
        bottom: 40,
        marginTop: 10,
    },
    continueButton: {
        width: '48%',
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: 20,
        marginLeft: '2%'
    },
    cancelButton: {
        width: '48%',
        alignItems: 'center',
        backgroundColor: colors.text_light,
        borderRadius: 20,
        marginRight: '2%'
    },
    continueIcon: {
        marginLeft: 20,
        marginTop: 10
    },
    currencyDropdown: {
        backgroundColor: colors.text_light,
        borderRadius: 10,
    },
    currencyDropdownRow: {
        flexDirection: 'row',
        alignSelf: 'center'
    },
    currencyDropdownText: {
        fontSize: 18,
        color: colors.text,
        fontFamily: "Nexa", fontWeight: "bold",
    },
    currencyDropdownButton: {
        width: '100%',
        height: 30,
        marginTop: 0,
        borderRadius: 10,
        backgroundColor: colors.text_light
    },
    currencyDropdownButtonText: {
        fontFamily: "Nexa", fontWeight: "bold",
        textAlign: 'left',
        marginLeft: 0,
        color: colors.text
    },
    exchangeRateDropdown: {
        backgroundColor: colors.text_light,
        borderRadius: 10,
    },
    exchangeRateDropdownRow: {
        flexDirection: 'row',
        alignSelf: 'center'
    },
    exchangeRateDropdownText: {
        fontSize: 18,
        color: colors.text,
        fontFamily: "Nexa", fontWeight: "bold",
    },
    exchangeRateDropdownButton: {
        width: '30%',
        height: 32,
        marginTop: 0,
        borderRadius: 10,
        backgroundColor: colors.text_light
    },
    exchangeRateDropdownButtonText: {
        fontSize: 16,
        fontFamily: "Nexa", fontWeight: "bold",
        textAlign: 'left',
        marginTop: 4,
        color: colors.text
    },
    sendModalAvailableBalance: {
        fontSize: 12,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text_dark,
        paddingLeft: 8,
        paddingBottom: 5
    },
    actionButtonText: {
        paddingBottom: 10,
        color: colors.text,
        fontSize: 16,
        fontFamily: "Nexa", fontWeight: "bold",
        paddingTop: 10
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
        width: '48%',
        height: 80,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: colors.secondary,
        borderRadius: 20,
        marginBottom: 10
      },
      buttonConnectText: {
        fontSize: 20,
        color: colors.text,
        fontFamily: "Nexa", fontWeight: "bold",
        marginTop: 4
      },
      buttonCreateText: {
        fontSize: 20,
        color: colors.text,
        fontFamily: "Nexa", fontWeight: "bold",
        marginTop: 4
      },
      buttonWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
      },
      continueIcon: {
        marginLeft: 10
      },
      sendModalCloseButton: {
        width: 50,
        height: 50
      },
      errorMessageText: {
      color: '#ff6961',
      fontFamily: 'Nexa', 
      fontWeight: 'bold',
      borderRadius: 20,
      padding: 10,
      marginTop: 10,
      width: '95%',
      fontSize: 12,
    },
    row: {
        flexDirection: 'row',
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
        alignItems: 'center'
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
        alignItems: 'center'
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
        marginLeft: 10
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
        marginRight: 10
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
        marginLeft: 10
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
        fontFamily: "Nexa", fontWeight: "bold",
    },

});

export default SendModal;