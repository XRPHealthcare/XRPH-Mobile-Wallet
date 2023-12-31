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
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { light, dark } from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useStore from '../../../data/store';
import Navbar from '../../../components/Navbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const AccountSettingsScreen = ({navigation}) => {
    const { activeAccount, accounts, theme } = useStore();
    const setAccounts = useStore(state => state.setAccounts);
    const setActiveAccount = useStore(state => state.setActiveAccount);

    const [editModalOpen, setEditModalOpen] = React.useState(false);
    const [askModalOpen, setAskModalOpen] = React.useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [accountName, setAccountName] = React.useState(activeAccount.name);
    const [accountPassword, setAccountPassword] = React.useState("");
    const [nameErrorMessage, setNameErrorMessage] = React.useState("");
    const [nonzeroErrorMessage, setNonzeroErrorMessage] = React.useState("");
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");

    let colors = light;
    if (theme === 'dark') {
        colors = dark
    }

    const styles = styling(colors);

    const checkName = (name) => {
        if (name.length >= 2) {
          setNameErrorMessage("");
          return true;
        }
        setNameErrorMessage("Error: Account name must be at least 2 characters long.");
        return false;
    }

    const editAccountName = () => {
        if (checkName(accountName)) {
            let updatedAccounts = [];

            for (let account of accounts) {
                if (account.classicAddress === activeAccount.classicAddress) {
                    let accountCopy = account;
                    accountCopy.name = accountName;
                    updatedAccounts.push(accountCopy);

                    firestore().collection('accounts')
                        .doc(account.id).update({
                            'name': accountName
                        })
                        .then(() => console.log('updated'))
                } 
                else {
                    updatedAccounts.push(account);
                }
            }

            setAccounts(updatedAccounts);
            setEditModalOpen(false);
            AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts)).then(() => {
                console.log('accounts set asynchronously');
            })
        }
    }

    const confirmBalancesAreEmpty = () => {
        let isZero = true;
        for (let i = 0; i < activeAccount.balances.length; i++) {
            if (activeAccount.balances[i].currency === "XRP") {
                if (parseInt(activeAccount.balances[i].value) > 15) {
                    isZero = false;
                }
            } else {
                if (parseInt(activeAccount.balances[i].value) > 0) {
                    isZero = false;
                }
            }
        }
        return isZero;
    }

    const askToDelete = () => {
        
        // check the balances...if all balances are 0 then account CAN be delete else show error
        if (confirmBalancesAreEmpty()) {
            setAskModalOpen(false);
            setDeleteModalOpen(true);
        } else {
            // error
            setNonzeroErrorMessage("Error: Your account must have no more than 15 XRP and exactly 0 of any other currency in order to delete.")
        }
    }

    const deleteAccount = () => {
        if (accountPassword === activeAccount.password) {
            
            setPasswordErrorMessage("");

            // delete from firebase
            firestore().collection('accounts')
                        .doc(activeAccount.id).delete()
                        .then(() => console.log('deleted'))

            let updatedAccounts = [];

            for (let account of accounts) {
                if (account.classicAddress !== activeAccount.classicAddress) {
                    updatedAccounts.push(account);
                } 
            }

            
            if (updatedAccounts.length === 0) {
                AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts)).then(() => {
                    console.log('accounts set asynchronously');
                })
                AsyncStorage.setItem('activeAccount', JSON.stringify({})).then(() => {
                    console.log('active account set asynchronously');
                })
                setTimeout(() => navigation.navigate('Start Screen'), 500);
            } else {
                setActiveAccount(updatedAccounts[0]);
                AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts)).then(() => {
                    console.log('accounts set asynchronously');
                })
                AsyncStorage.setItem('activeAccount', JSON.stringify(updatedAccounts[0])).then(() => {
                    console.log('active account set asynchronously');
                })
                setTimeout(() => navigation.navigate('Home Screen'), 500);
            }
            setAccounts(updatedAccounts);
            
            // update async storage and store
                // if accounts > 1 --> delete this account and set active account to top of list
                //                 --> go to home screen
                // else            --> start screen
        } else {
            // error
            setPasswordErrorMessage("Error: Incorrect Password.");
        }
    }

    const closeAskModal = () => {
        setAskModalOpen(false);
        setNonzeroErrorMessage("");
    }

    return (
        <GestureHandlerRootView>
        <SafeAreaView style={{ backgroundColor: colors.bg }}>
            <StatusBar />
            <View style={styles.bg}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Image
                        style={styles.headerImage}
                        source={require('../../../assets/img/hero.png')}
                        />
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.headerText}>Settings</Text>
                        <Text style={styles.accountNameText}>{activeAccount.name}</Text>
                    </View>
                </View>
                <ScrollView style={styles.settingsWrapper}>
                    <View style={styles.settingsButtonContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Settings Screen')}>
                            <Feather name={"chevron-left"} size={35} color={colors.text} style={styles.backIcon} />
                        </TouchableOpacity>
                        <View style={styles.textAndIconWrapper}>
                            <Text style={styles.actionButtonText}>Account</Text>
                        </View>   
                    </View>
                    <View style={styles.hl}></View>
                    <View style={styles.setting}>
                        <Text style={styles.address}>{activeAccount.classicAddress}</Text>
                    </View>
                    <View style={styles.hl}></View>
                    <View style={styles.setting}>
                        <Text style={styles.settingText}>Name: {activeAccount.name}</Text>
                        <TouchableOpacity style={styles.editButton} onPress={() => setEditModalOpen(true)}>
                            <Text style={styles.editButtonText}>Edit Name</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.hl}></View>
                    <View style={styles.deleteSetting}>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => setAskModalOpen(true)}>
                            <Text style={styles.deleteButtonText}>Delete Account</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.hl}></View>
                </ScrollView>
                <Navbar activeIcon="settings" navigation={navigation}  />

                <Modal
                    visible={editModalOpen}
                    transparent={true}
                >
                    <View style={styles.addAccountModalWrapper}>
                        <View style={styles.sendModalHeader}>
                            <View style={styles.sendModalHeaderSpacer}></View>
                            <Text style={styles.sendModalHeaderText}>Edit Account Name</Text>
                            <TouchableOpacity style={styles.sendModalCloseButton} onPress={() => setEditModalOpen(false)}>
                                <Text style={styles.sendModalHeaderText}>X</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.addAccountModalActionsWrapper}>
                            <TextInput
                            style={styles.accountNameInput}
                            onChangeText={setAccountName}
                            value={accountName}
                            placeholder="Account Name"
                            placeholderTextColor={colors.text_dark}
                            />
                            {nameErrorMessage.length > 0 && <Text style={styles.errorMessageText}>{nameErrorMessage}</Text>}
                            <View style={styles.addAccountActionButtons}>
                                <TouchableOpacity style={styles.addAccountOkButton} onPress={editAccountName}>
                                    <View style={styles.saveButton}>
                                        <Text style={styles.addAccountOkButtonText}>Save</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal
                    visible={askModalOpen}
                    transparent={true}
                >
                    <View style={styles.addAccountModalWrapper}>
                        <View style={styles.sendModalHeader}>
                            <View style={styles.sendModalHeaderSpacer}></View>
                            <Text style={styles.sendModalHeaderText}>Delete Your Account?</Text>
                            <TouchableOpacity style={styles.sendModalCloseButton} onPress={closeAskModal}>
                                <Text style={styles.sendModalHeaderText}>X</Text>
                            </TouchableOpacity>
                        </View>
                        {nonzeroErrorMessage.length === 0 ? 
                        <View style={styles.addAccountModalActionsWrapper}>
                            <View style={styles.addAccountActionButtons}>
                                <TouchableOpacity style={styles.yesButton} onPress={askToDelete}>
                                    <View style={styles.saveButton}>
                                        <Text style={styles.addAccountOkButtonText}>Yes</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.noButton} onPress={closeAskModal}>
                                    <View style={styles.saveButton}>
                                        <Text style={styles.addAccountOkButtonText}>No</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View> : 
                            <Text style={styles.errorMessageText}>{nonzeroErrorMessage}</Text>
                        }
                    </View>
                </Modal>

                <Modal
                    visible={deleteModalOpen}
                    transparent={true}
                >
                    <View style={styles.addAccountModalWrapperLong}>
                        <View style={styles.sendModalHeader}>
                            <Text style={styles.sendModalHeaderTextLeft}>Enter Your Password To Delete This Account</Text>
                            <TouchableOpacity style={styles.sendModalCloseButton} onPress={() => setDeleteModalOpen(false)}>
                                <Text style={styles.sendModalHeaderText}>X</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.addAccountModalActionsWrapper}>
                            <TextInput
                            style={styles.accountNameInput}
                            onChangeText={setAccountPassword}
                            value={accountPassword}
                            placeholder="Password"
                            placeholderTextColor={colors.text_dark}
                            />
                            {passwordErrorMessage.length > 0 && <Text style={styles.errorMessageText}>{passwordErrorMessage}</Text>}
                            <View style={styles.addAccountActionButtons}>
                                <TouchableOpacity style={styles.deleteAccountButton} onPress={deleteAccount}>
                                    <View style={styles.saveButton}>
                                        <Text style={styles.deleteAccountButtonText}>Delete My Account</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
        </GestureHandlerRootView>
    );
};

  
const styling = colors => StyleSheet.create({
    bg: {
        backgroundColor: colors.bg,
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%',
        paddingHorizontal: 10,
    },
    saveButton: {
        flexDirection: 'row',justifyContent: 'center'
    },
    sendModalHeader: {
        width: '100%',
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    sendModalHeaderText: {
        fontSize: 20,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        textAlign: 'center'
    },
    sendModalHeaderTextLeft: {
        fontSize: 18,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        textAlign: 'left',
        marginRight: 10,
        width: '90%'
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
        alignItems: 'center'
    },
    addAccountModalWrapperLong: {
        backgroundColor: colors.bg,
        width: '90%',
        height: 240,
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
        width: 100,
        height: 50,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: 25,
        marginBottom: 10
    },
    noButton: {
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
    yesButton: {
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
    addAccountOkButtonText: {
        textAlign: 'center',
        fontSize: 16,
        color: colors.bg,
        fontFamily: "Nexa", fontWeight: "bold",
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
        paddingTop: 14
    },
    editButton: {
        width: 100,
        height: 30,
        borderRadius: 20,
        backgroundColor: colors.primary,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    editButtonText: {
        fontSize: 14,
        fontFamily: 'Nexa', fontWeight: 'bold',
        color: colors.bg,
        marginTop: 4
    },
    setting: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingText: {
        fontSize: 16,
        color: colors.text_dark,
        fontFamily: "Nexa", fontWeight: "bold",
    },
    address: {
        fontSize: 14,
        color: colors.text_dark,
        fontFamily: "Nexa", fontWeight: "bold",
    },
    backButton: {
        width: 50,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    textAndIconWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: '50%',
    },
    spacer: {
        width: 50,
    },
    sendModalHeaderSpacer: {
        width: 10
    },
    hl: {
        width: '100%',
        height: 3,
        backgroundColor: colors.text_light
    },
    headerImage: {
        width: 50,
        height: 50,
        marginLeft: 0,
        marginTop: 0,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 10,
    },
    headerText: {
        fontSize: 18,
        color: colors.text,
        fontFamily: "Nexa", fontWeight: "bold",
        textAlign: 'right',
        marginTop: 5
    },
    accountNameText: {
        fontSize: 16,
        color: colors.primary,
        fontFamily: "Nexa", fontWeight: "bold",
        marginTop: 10,
        textAlign: 'right'
    },
    settingsWrapper: {
        width: '100%',
        paddingHorizontal: 5,
        paddingVertical: 1,
        backgroundColor: colors.bg,
        borderRadius: 10,
    },
    settingsButtonContainer: {
        // width: '107%',
        backgroundColor: colors.bg,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'flex-start',
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
        marginTop: 10,
        fontFamily: "Nexa", fontWeight: "bold",
        textAlign: 'center'
    },
    visitIcon: {
        position: 'absolute',
        right: 0
    },
    securityIcon: {
        marginLeft: 5,
        marginRight: 25
    },
    supportIcon: {
        marginLeft: 1,
        marginRight: 22
    },
    aboutIcon: {
        marginLeft: 3,
        marginRight: 22
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
    deleteSetting: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        width: 140,
        height: 30,
        borderRadius: 20,
        backgroundColor: '#ff6961',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    deleteButtonText: {
        fontSize: 14,
        fontFamily: 'Nexa', fontWeight: 'bold',
        color: colors.text,
        marginTop: 4
    },
    deleteAccountButton: {
        width: 180,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ff6961',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
    deleteAccountButtonText: {
        textAlign: 'center',
        fontSize: 16,
        color: colors.text,
        fontFamily: "Nexa", fontWeight: "bold",
    },
});

export default AccountSettingsScreen;


