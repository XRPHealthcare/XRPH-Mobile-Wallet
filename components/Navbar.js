import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet
  } from 'react-native';

import { light, dark } from '../assets/colors/colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import useStore from '../data/store';

const Navbar = (props) => {
    const { theme } = useStore();
    let colors = light;
    if (theme === 'dark') {
        colors = dark
    }

    const styles = styling(colors);

    return (
        <View style={styles.navigationButtons}>
            <View style={styles.navigationButton}>
                <TouchableOpacity style={styles.navigationButton} onPress={() => props.navigation.navigate("Transactions Screen")}>
                    <View style={styles.buttonWrapper}>
                        <Feather name={"menu"} size={32} color={props.activeIcon === "transactions" ? colors.primary : colors.text_light} style={styles.transactionIcon} />
                    </View>
                </TouchableOpacity>
            </View>
            {props.txUpdate && <View style={styles.txUpdate}></View>}
            {/* <View style={styles.navigationButton}>
                <TouchableOpacity style={styles.navigationButton} onPress={() => props.navigation.navigate("Exchange Screen")}>
                    <View style={styles.buttonWrapper}>
                        <Octicons name={"arrow-switch"} size={32} color={props.activeIcon === "exchange" ? colors.primary : colors.text_light} style={styles.exchangeIcon} />
                    </View>
                </TouchableOpacity>
            </View> */}
            <View style={styles.navigationButton}>
                <TouchableOpacity style={styles.navigationButton} onPress={() => props.navigation.navigate("Home Screen")}>
                    <View style={styles.buttonWrapper}>
                        <MaterialCommunityIcons name={"home"} size={38} color={props.activeIcon === "home" ? colors.primary : colors.text_light} style={styles.homeIcon} />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.navigationButton}>
                <TouchableOpacity style={styles.navigationButton} onPress={() => props.navigation.navigate("Coupon Screen")}>
                    <View style={styles.buttonWrapper}>
                        <AntDesign name={"creditcard"} size={34} color={props.activeIcon === "coupon" ? colors.primary : colors.text_light} style={styles.couponIcon} />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.navigationButton}>
                <TouchableOpacity style={styles.navigationButton} onPress={() => props.navigation.navigate("Settings Screen")}>
                    <View style={styles.buttonWrapper}>
                        <Octicons name={"gear"} size={32} color={props.activeIcon === "settings" ? colors.primary : colors.text_light} style={styles.settingsIcon} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styling = colors => StyleSheet.create({
    navigationButtons: {
        width: '100%',
        paddingHorizontal: 10,
        marginTop: 30,
        marginBottom: 30,
        alignContent: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    navigationButton: {
        width: 50,
        height: 35,
        marginBottom: 5,
        backgroundColor: 'transparent',
    },
    transactionIcon: {
        marginTop: 4,
        marginLeft: 10
    },
    exchangeIcon: {
        marginTop: 4,
        marginLeft: 10
    },
    homeIcon: {
        marginTop: 0,
        marginLeft: 5
    },
    couponIcon: {
        marginTop: 3,
        marginLeft: 10
    },
    settingsIcon: {
        marginTop: 3,
        marginLeft: 10
    },
    buttonWrapper: {
        flexDirection: 'row'
    },
    txUpdate: {
        width: 15,
        height: 15,
        backgroundColor: colors.primary,
        position: 'absolute',
        borderRadius: 15,
        left: 60,
        bottom: 20
    }
});

export default Navbar;