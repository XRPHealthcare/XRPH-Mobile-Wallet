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
,Platform} from 'react-native';
import SlideButton from 'rn-slide-button';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { light, dark } from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SelectDropdown from 'react-native-select-dropdown';
import useStore from '../../../data/store';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const PaymentSuccessScreen = ({navigation}) => {
    let { sendTransactionDetails, theme } = useStore();

    let colors = light;
    if (theme === 'dark') {
        colors = dark
    }

    const styles = styling(colors);
    
    return (
        <GestureHandlerRootView>
        <SafeAreaView style={{backgroundColor: colors.bg}}>
            <StatusBar />
            <View style={styles.bg}>
                <View style={styles.header}>
                    <View style={styles.circle}>
                        <Feather name={"check"} size={75} color={colors.bg} style={styles.checkIcon} />
                    </View>
                    <Text style={styles.headerText}>Payment Success!</Text>
                </View>
                <View style={styles.transactionCard}>
                    <Text style={styles.amount}>{sendTransactionDetails.amount} {sendTransactionDetails.currency}</Text>
                    {/* <Text style={styles.conversion}><Text style={styles.inputLabelCharacter}>~</Text>{sendTransactionDetails.amountConversion}</Text> */}
                    <View style={styles.horizontalLine}></View>
                    <Text style={styles.label}>From</Text>
                    <Text style={styles.text}>{sendTransactionDetails.from}</Text>
                    <View style={styles.horizontalLine}></View>
                    <Text style={styles.label}>To</Text>
                    <Text style={styles.text}>{sendTransactionDetails.to}</Text>
                    <View style={styles.horizontalLine}></View>
                    <Text style={styles.label}>Transaction Fee</Text>
                    <Text style={styles.text}>{sendTransactionDetails.transactionFee}</Text>
                    <View style={styles.horizontalLine}></View>
                    <Text style={styles.label}>Memo</Text>
                    <Text style={styles.text}>{sendTransactionDetails.memo}</Text>
                    <View style={styles.horizontalLine}></View>
                    <Text style={styles.label}>Destination Tag</Text>
                    <Text style={styles.text}>{sendTransactionDetails.destinationTag}</Text>
                    <View style={styles.horizontalLine}></View>
                </View>
                <View style={styles.visitMarketplace}>
                    <TouchableOpacity style={styles.visitMarketplaceButton} onPress={() => navigation.navigate('Home Screen')}>
                        <View style={styles.buttonWrapper}>
                            <Text style={styles.actionButtonText}>Back to Home Screen</Text>
                            <AntDesign name={"right"} size={20} color={colors.text} style={styles.visitIcon} />
                        </View>
                    </TouchableOpacity>
                </View>
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
    visitMarketplace: {
        alignSelf: 'center',
        width: '100%',
        paddingHorizontal: 10,
        position: 'absolute',
        bottom: 10
    },
    visitMarketplaceButton: {
        width: '100%',
        marginLeft: '2.5%',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: colors.secondary,
        borderRadius: 20,
        position: 'absolute',
        bottom: 10,
    },
    visitIcon: {
        marginTop: 10,
        marginLeft: 35
    },
    buttonWrapper: {
        flexDirection: 'row'
    },
    actionButtonText: {
        paddingBottom: 10,
        color: colors.text,
        fontSize: 16,
        fontFamily: Platform.OS === "ios" ? "NexaBold" : "NexaBold", fontWeight: Platform.OS === "ios" ? "bold" : "100",
        paddingTop: 10,
        marginTop: 4
    },
    header: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        marginTop: 50,
        marginBottom: 50
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
    checkIcon: {
        marginTop: 5
    },
    inputLabelCharacter: {
        fontFamily: 'Helvetica',
    },
    headerText: {
        fontSize: 26,
        color: colors.text,
        fontFamily: Platform.OS === "ios" ? "NexaBold" : "NexaBold", fontWeight: Platform.OS === "ios" ? "bold" : "100",
        alignSelf: 'center',
        marginTop: 30
    },
    transactionCard: {
        backgroundColor: colors.bg,
        width: '95%',
        // elevation: 5,
        borderRadius: 10,
        justifyContent: 'space-between',
        flexDirection: 'column',
        marginTop: -20
    },
    amount: {
        fontSize: 30,
        color: colors.primary,
        fontFamily: Platform.OS === "ios" ? "NexaBold" : "NexaBold", fontWeight: Platform.OS === "ios" ? "bold" : "100",
        marginLeft: 10,
        marginTop: 10,
    },
    conversion: {
        fontSize: 20,
        color: colors.text_dark,
        fontFamily: Platform.OS === "ios" ? "NexaBold" : "NexaBold", fontWeight: Platform.OS === "ios" ? "bold" : "100",
        marginLeft: 10,
        marginBottom: 2
    },
    horizontalLine: {
        width: '95%',
        marginLeft: '2.5%',
        marginBottom: 5,
        height: 2,
        backgroundColor: colors.text_dark
    },
    label: {
        fontSize: 12,
        color: colors.text_dark,
        fontFamily: Platform.OS === "ios" ? "NexaBold" : "NexaBold", fontWeight: Platform.OS === "ios" ? "bold" : "100",
        marginLeft: 10,
        marginTop: 5,
    },
    text: {
        fontSize: 14,
        color: colors.text,
        fontFamily: Platform.OS === "ios" ? "NexaBold" : "NexaBold", fontWeight: Platform.OS === "ios" ? "bold" : "100",
        marginLeft: 10,
        marginTop: 5,
        marginBottom: 5
    },
});

export default PaymentSuccessScreen;