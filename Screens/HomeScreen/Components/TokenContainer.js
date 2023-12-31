import React from 'react';

import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  Modal,
  ScrollView,
  Linking
} from 'react-native';
import useStore from '../../../data/store';
import { light, dark } from '../../../assets/colors/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TokenRow from './TokenRow';

AntDesign.loadFont();
FontAwesome.loadFont();
Feather.loadFont();
MaterialCommunityIcons.loadFont();

const TokenContainer = (props) => {
    const { activeAccount, theme } = useStore();
    const [buyXRPHModalOpen, setBuyXRPHModalOpen] = React.useState(false);

    let colors = light;
    if (theme === 'dark') {
        colors = dark
    }

    const styles = styling(colors);

    return (
        <React.Fragment>
            <View style={styles.tokenView}>
                <Text style={styles.addTokenText}>Tokens</Text>
                {
                    // refresh button
                }
                <TouchableOpacity style={styles.refreshButton} onPress={() => props.refreshBalances()}>
                    <View style={styles.buttonWrapper}>
                        <Text style={styles.refreshText}>Refresh</Text>
                        <Feather name={"refresh-ccw"} size={20} color={colors.text} style={styles.visitIcon} />    
                    </View>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.tokenSearch}>
                {activeAccount.balances.length === 0 ?
                    <View style={styles.noTokensWrapper}>
                        {/* <Text  style={styles.noTokensText}>Looks like you need some tokens.</Text>
                        <Text  style={styles.noTokensText}>Lets get you started.</Text>
                        <View style={styles.buyTokenButton}>
                            <TouchableOpacity style={styles.buyXRPHButton} onPress={() => setBuyXRPHModalOpen(true)}>
                                <View style={styles.buttonWrapper}>
                                    <Image
                                    source={require('../../../assets/img/hero.png')}
                                    style={styles.xrphLogo}
                                    />
                                    <Text style={styles.buyXRPHButtonText}>Buy XRPH</Text>
                                </View>
                            </TouchableOpacity>
                        </View> */}
                        <Text style={styles.noTokensText}>{props.loading ? "Loading.." : "Send 12 XRP to this account to activate it."}</Text>
                    </View>
                :   
                    [<ScrollView key={"token-scroll"} contentContainerStyle={styles.tokenWrapper}>
                        {activeAccount.balances.map(token => (
                        <TokenRow currency={token.currency} balance={token.value} key={token.currency} />
                        ))}
                    </ScrollView>,
                    <View key={"token-bottom"} style={styles.tokenBottomWrapper}>
                        <Text style={styles.reserveText}>Reserved: 12 XRP / 200 XRPH</Text>
                        {/* <TouchableOpacity style={styles.buyXRPHButtonTokens} onPress={() => setBuyXRPHModalOpen(true)}>
                            <View style={styles.buttonWrapper}>
                                <Image
                                source={require('../../../assets/img/hero.png')}
                                style={styles.xrphLogo}
                                />
                                <Text style={styles.buyXRPHButtonText}>Buy XRPH</Text>
                            </View>
                        </TouchableOpacity> */}
                    </View>]
                }

                <Modal visible={buyXRPHModalOpen} transparent={true}>
                    <View style={styles.addAccountModalWrapper}>
                        <View style={styles.sendModalHeader}>
                            {
                                // HEADER
                            }
                            <View style={styles.sendModalHeaderSpacer}></View>
                            <Text style={styles.sendModalHeaderTextBuy}>Buy XRPH On An Exchange</Text>
                            <TouchableOpacity style={styles.sendModalCloseButton} onPress={() => setBuyXRPHModalOpen(false)}>
                                <Text style={styles.sendModalHeaderText}>X</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buyButtonsWrapper}>
                            <TouchableOpacity style={styles.buyOnExchangeButton} onPress={() => {
                                Linking.openURL("https://www.bitrue.com/trade/xrph_usdt");
                            }}>
                                <View style={styles.buttonWrapper}>
                                    <Image
                                    source={require('../../../assets/img/bitrue-logo.png')}
                                    style={styles.xrphLogo}
                                    />
                                    <Text style={styles.buyXRPHButtonText}>Buy On Bitrue</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buyOnExchangeButton} onPress={() => {
                                Linking.openURL("https://www.bitmart.com/trade/en-US?symbol=XRPH_USDT&layout=basic");
                            }}>
                                <View style={styles.buttonWrapper}>
                                    <Image
                                    source={theme === 'light' ? require('../../../assets/img/bitmart-logo.png') : require('../../../assets/img/bitmart-logo-dark.png')}
                                    style={theme === 'light' ? styles.xrphLogo : styles.bitmartLogoDark}
                                    />
                                    <Text style={styles.buyXRPHButtonText}>Buy On BitMart</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </React.Fragment>
    );
}

const styling = colors => StyleSheet.create({
    tokenView: {
        width: '100%',
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    buyButtonsWrapper: {
        width: '100%',
    },
    refreshButton: {
        backgroundColor: colors.text_light,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20
    },
    addTokenText: {
        fontSize: 18,
        color: colors.text,
        marginTop: 5,
        fontFamily: "Nexa", fontWeight: "bold",
    },
    tokenSearch: {
        width: '100%',
        marginTop: 10,
        borderRadius: 10,
        backgroundColor: colors.text_light,
        height: 180,
        flexDirection: 'row'
    },
    tokenSearchText: {
        color: colors.text_dark,
        marginLeft: 0,
        marginTop: 9,
        fontFamily: "Nexa", fontWeight: "bold",
    },
    noTokensWrapper: {
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    noTokensText: {
        textAlign: 'center',
        fontSize: 16,
        color: colors.text,
        fontFamily: "Nexa", fontWeight: "bold",
    },
    refreshText: {
        color: colors.text,
        fontFamily: "Nexa", fontWeight: "bold",
        fontSize: 14,
        marginRight: 8,
        marginTop: 4
    },
    buyTokenButton: {
        flexDirection: 'column',
        marginTop: 30
    },
    buyXRPHButton: {
        width: 160,
        height: 40,
        backgroundColor: colors.bg,
        borderRadius: 20,
        marginBottom: 10,
    },
    sendModalCloseButton: {
        width: 60,
        height: 60
    },
    buyXRPButton: {
        width: 160,
        height: 40,
        backgroundColor: colors.bg,
        borderRadius: 20,
    },
    buyXRPHButtonText: {
        color: colors.text,
        textAlign: 'center',
        marginTop: 8,
        fontFamily: 'Nexa', fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 15
    },
    buyXRPButtonText: {
        color: colors.text,
        textAlign: 'center',
        marginTop: 10,
        fontFamily: 'Nexa', fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 15
    },
    xrphLogo: {
        width: 32,
        height: 32,
        marginTop: 4,
        marginLeft: 4
    },
    bitmartLogoDark: {
        width: 26,
        height: 26,
        marginTop: 8,
        marginLeft: 8
    },
    tokenWrapper: {
        flexDirection: 'column',
        width: '100%'
    },
    reserveText: {
        color: colors.text,
        fontFamily: 'Nexa', fontWeight: 'bold',
        // alignSelf: 'flex-end',
        marginLeft: 10,
        marginTop: 4
    },
    tokenBottomWrapper: {
        position: 'absolute',
        bottom: 0,
        paddingBottom: 10,
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        backgroundColor: colors.text_light,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    buyXRPHButtonTokens: {
        width: 160,
        height: 40,
        backgroundColor: colors.bg,
        borderRadius: 20,
        marginRight: 10
    },
    buyOnExchangeButton: {
        width: '60%',
        marginLeft: '20%',
        height: 40,
        backgroundColor: colors.text_light,
        borderRadius: 20,
        marginBottom: 10
    },
    buttonWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    addAccountModalWrapper: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: colors.bg,
        width: '96%',
        height: 180,
        marginLeft: '2%',
        marginBottom: '68%',
        elevation: 5,
        shadowColor: '#000000',
        shadowOffset: {width: 5, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 20,
        borderRadius: 10,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    addAccountModalActionsWrapper: {
        paddingHorizontal: 10,
    },
    sendModalHeader: {
        width: '100%',
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
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
    sendModalHeaderTextBuy: {
        fontSize: 16,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        textAlign: 'center',
        marginTop: 2
    }
});

export default TokenContainer;