import React from 'react';

import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Modal
} from 'react-native';
import useStore from '../../../data/store';
import { light, dark } from '../../../assets/colors/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import SelectDropdown from 'react-native-select-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const colors = light; // eventually put this in state
AntDesign.loadFont();
FontAwesome.loadFont();
Feather.loadFont();
MaterialCommunityIcons.loadFont();

const AccountActions = (props) => {
    let { activeAccount, theme, totalBalanceCurrency } = useStore();
    const setTotalBalanceCurrency = useStore((state) => state.setTotalBalanceCurrency);
    let [copiedModalOpen, setCopiedModalOpen] = React.useState(false);
    let [cantSendModalOpen, setCantSendModalOpen] = React.useState(false);

    let colors = light;
    if (theme === 'dark') {
        colors = dark
    }

    const styles = styling(colors);

    const openSendModal = () => {
        if (activeAccount.balances.length > 0) {
            props.setSendModalOpen(true)
        } else {
            setCantSendModalOpen(true);
            setTimeout(() => {
                setCantSendModalOpen(false);
            }, 2000); 
        }
    }

    const copyToClipboard = () => {
        Clipboard.setString(activeAccount.classicAddress);
        setCopiedModalOpen(true);
        setTimeout(() => {
            setCopiedModalOpen(false);
        }, 2000); 
      };

    return (
        <React.Fragment>
            <View style={styles.accountInformation}>
                <Text style={styles.accountName}>{activeAccount.name}</Text>
                <View style={styles.balanceWrapper}>
                    { totalBalanceCurrency === 'USD' &&
                        <Text style={styles.accountBalance}>$ {activeAccount.totalBalances[totalBalanceCurrency]}</Text>
                    }

                    { totalBalanceCurrency === 'EUR' &&
                        <Text style={styles.accountBalance}>€ {activeAccount.totalBalances[totalBalanceCurrency]}</Text>
                    }

                    { totalBalanceCurrency === 'GBP' &&
                        <Text style={styles.accountBalance}>£ {activeAccount.totalBalances[totalBalanceCurrency]}</Text>
                    }
                    
                    <SelectDropdown
                        data={["USD", "EUR", "GBP"]}
                        onSelect={(selectedItem, index) => {
                            console.log(selectedItem);
                            setTotalBalanceCurrency(selectedItem);
                            AsyncStorage.setItem('totalBalanceCurrency', selectedItem).then(() => {
                                console.log('currency set asynchronously');
                            })
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
                        defaultButtonText={totalBalanceCurrency}
                        dropdownStyle={styles.accountsDropdown}
                        buttonStyle={styles.accountsDropdownButton}
                        buttonTextStyle={styles.accountsDropdownButtonText}
                        rowTextStyle={styles.accountsDropdownText}
                        renderDropdownIcon={isOpened => {
                            return <FontAwesome name={isOpened ? "angle-up" : "angle-down"} size={30} color={colors.text} />
                        }}
                    />
                </View>
                <View style={styles.walletAddressAndClipboardWrapper}>
                    <Text style={styles.walletAddress}>{activeAccount.classicAddress}</Text>
                    <TouchableOpacity onPress={copyToClipboard}>
                        <Feather name={"copy"} size={25} color={colors.text_dark} style={styles.addAccountIcon} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.sendButton} onPress={openSendModal} >
                    <View style={styles.buttonWrapper}>
                        <MaterialCommunityIcons name={"upload"} size={20} color={colors.bg} style={styles.sendIcon} />
                        <Text style={styles.actionButtonText}>Send</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.receiveButton} onPress={() => props.setReceiveModalOpen(true)}>
                    <View style={styles.buttonWrapper}>
                        <MaterialCommunityIcons name={"download"} size={20} color={colors.primary} style={styles.receiveIcon} />
                        <Text style={styles.actionButtonTextOutline}>Receive</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* <Modal
                visible={copiedModalOpen}
                transparent={true}
            > */}
            {copiedModalOpen && <View style={styles.addAccountModalWrapper}>
                <View style={styles.sendModalHeader}>
                    <View style={styles.sendModalHeaderSpacer}>
                        <Text style={styles.sendModalHeaderTextName}>Copied to Clipboard</Text>
                        <AntDesign name={"check"} size={20} color={colors.text} style={styles.checkIcon} />
                    </View>
                    <TouchableOpacity style={styles.sendModalCloseButton} onPress={() => setCopiedModalOpen(false)}>
                        <Text style={styles.sendModalHeaderText}>X</Text>
                    </TouchableOpacity>
                </View>
            </View>}

            {cantSendModalOpen && <View style={styles.addAccountModalWrapperThick}>
                <View style={styles.sendModalHeader}>
                    <View style={styles.sendModalHeaderSpacer2}>
                        <Text style={styles.sendModalHeaderTextName2}>Unable to send from unfunded account.</Text>
                    </View>
                    <TouchableOpacity style={styles.sendModalCloseButton} onPress={() => setCantSendModalOpen(false)}>
                        <Text style={styles.sendModalHeaderText}>X</Text>
                    </TouchableOpacity>
                </View>
            </View>}
        </React.Fragment>
    );
}

const styling = colors => StyleSheet.create({
    accountInformation: {
        flexDirection: 'column',
        marginTop: 20,
        width: '100%',
    },
    accountName: {
        fontSize: 18,
        color: colors.text,
        fontFamily: "Nexa", fontWeight: "bold",
        marginBottom: 5
    },
    walletAddressAndClipboardWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
        marginBottom: 5
    },
    balanceWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    walletAddress: {
        marginTop: 5,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text_dark
    },
    accountBalance: {
        marginTop: 10,
        paddingTop: 5,
        paddingBottom: 5,
        height: 40,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.primary,
        fontSize: 30
    },
    actionButtons: {
        width: '100%',
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sendButton: {
        width: '48%',
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: 20
    },
    buttonWrapper: {
        flexDirection: 'row'
    },
    receiveButton: {
        width: '48%',
        alignItems: 'center',
        backgroundColor: colors.bg,
        borderWidth: 2,
        borderColor: colors.primary,
        borderRadius: 20,
    },
    actionButtonText: {
        paddingBottom: 10,
        color: colors.bg,
        fontSize: 16,
        fontFamily: "Nexa", fontWeight: "bold",
        paddingTop: 10,
        marginTop: 6
    },
    actionButtonTextOutline: {
        paddingBottom: 10,
        color: colors.primary,
        fontSize: 16,
        fontFamily: "Nexa", fontWeight: "bold",
        paddingTop: 10,
        marginTop: 5
    },
    sendIcon: {
        marginRight: 20,
        marginLeft: -35,
        marginTop: 12
    },
    receiveIcon: {
        marginRight: 16,
        marginLeft: -32,
        marginTop: 12
    },
    
    addAccountModalWrapper: {
        position: 'absolute',
        top: -30,
        backgroundColor: colors.secondary,
        width: '100%',
        height: 30,
        elevation: 10,
        borderRadius: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addAccountModalWrapperThick: {
        position: 'absolute',
        top: -30,
        backgroundColor: colors.secondary,
        width: '100%',
        height: 30,
        elevation: 10,
        borderRadius: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addAccountModalActionsWrapper: {
        paddingHorizontal: 10,
    },
    
    sendModalHeaderText: {
        fontSize: 16,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        textAlign: 'left',
    },
    sendModalHeaderTextName: {
        fontSize: 16,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        textAlign: 'left',
        marginTop: 4
    },
    sendModalHeaderTextName2: {
        fontSize: 14,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        textAlign: 'left',
        marginTop: 4,
        flexWrap: 'wrap'
    },
    sendModalHeader: {
        width: '100%',
        height: 30,
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    sendModalHeaderSpacer: {
        flexDirection: 'row'
    },
    sendModalHeaderSpacer2: {
        flexDirection: 'row',
        // width: '60%'
    },
    checkIcon: {
        marginLeft: 10
    },

    accountsDropdown: {
        backgroundColor: colors.text_light,
        borderRadius: 10,
    },
    accountsDropdownRow: {
          flexDirection: 'row',
          alignSelf: 'center'
    },
    accountsDropdownButton: {
        width: 90,
        height: 30,
        borderRadius: 10,
        backgroundColor: colors.text_light,
        marginTop: 10
    },
    accountsDropdownButtonText: {
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        fontSize: 14,
        marginTop: 4
    },
    accountsDropdownText: {
        fontSize: 14,
        color: colors.text,
        fontFamily: "Nexa", fontWeight: "bold",
        marginTop: 4
    },
});

export default AccountActions;