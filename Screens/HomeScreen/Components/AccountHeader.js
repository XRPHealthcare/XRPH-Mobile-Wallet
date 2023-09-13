import React from 'react';

import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity
} from 'react-native';
import useStore from '../../../data/store';
import { light, dark } from '../../../assets/colors/colors';
import SelectDropdown from 'react-native-select-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

AntDesign.loadFont();
FontAwesome.loadFont();

const AccountHeader = (props) => {
    let { accounts, theme, activeAccount } = useStore();
    const setActiveAccount = useStore((state) => state.setActiveAccount);
    const setToken = useStore((state) => state.setToken);

    let colors = light;
    if (theme === 'dark') {
        colors = dark
    }

    const styles = styling(colors);

    return (
        <View style={styles.header}>
            <Image
            style={styles.headerImage}
            source={require('../../../assets/img/hero.png')}
            />
            
            <SelectDropdown
                data={accounts}
                onSelect={(selectedItem, index) => {
                    console.log(selectedItem);
                    setActiveAccount(selectedItem);
                    AsyncStorage.setItem('activeAccount', JSON.stringify(selectedItem)).then(() => {
                        console.log('active account set asynchronously');
                    })
                    setToken(selectedItem.balances[0]);
                }}
                buttonTextAfterSelection={(selectedItem, index) => {
                    // text represented after item is selected
                    // if data array is an array of objects then return selectedItem.property to render after item is selected
                    return selectedItem.name
                }}
                rowTextForSelection={(item, index) => {
                    // text represented for each item in dropdown
                    // if data array is an array of objects then return item.property to represent item in dropdown
                    return item.name
                }}
                defaultButtonText={activeAccount.name}
                dropdownStyle={styles.accountsDropdown}
                buttonStyle={styles.accountsDropdownButton}
                buttonTextStyle={styles.accountsDropdownButtonText}
                rowTextStyle={styles.accountsDropdownText}
                renderDropdownIcon={isOpened => {
                    return <FontAwesome name={isOpened ? "angle-up" : "angle-down"} size={30} color={colors.text} />
                }}
            />
            <TouchableOpacity style={styles.addAccountButton} onPress={() => props.setAddAccountModalOpen(true)}>
                <AntDesign name={"plus"} size={25} color={colors.text} style={styles.addAccountIcon} />
            </TouchableOpacity>
        </View>
    );
}

const styling = colors => StyleSheet.create({
    headerImage: {
        width: 50,
        height: 50,
        marginLeft: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        WIDTH: '90%'
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
        width: 250,
        marginLeft: 8,
        marginRight: 4,
        borderRadius: 10,
        backgroundColor: colors.text_light
    },
    accountsDropdownButtonText: {
        fontSize: 18,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        marginTop: 4
    },
    accountsDropdownText: {
        fontSize: 18,
        color: colors.text,
        fontFamily: "Nexa", fontWeight: "bold",
        marginTop: 4
    },
    addAccountButton: {
        width: 50,
        height: 50,
        marginRight: 12,
        borderRadius: 10,
        backgroundColor: colors.text_light,
        justifyContent: 'center',
        alignItems: 'center'
    },
    addAccountIcon: {
        marginTop: 0,
    },
});

export default AccountHeader;