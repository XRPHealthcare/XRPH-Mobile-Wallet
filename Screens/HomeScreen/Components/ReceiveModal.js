import React from 'react';

import {
  Text,
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Share
} from 'react-native';
import useStore from '../../../data/store';
import { light, dark } from '../../../assets/colors/colors';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import RNQRGenerator from 'rn-qr-generator';
import getXAddress from '../Handlers/get_x_address';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const ReceiveModal = (props) => {
    let { activeAccount, theme } = useStore();
    let [copiedModalOpen, setCopiedModalOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [imgSrcClassic, setImgSrcClassic] = React.useState("");
    const [imgSrcX, setImgSrcX] = React.useState("");
    const [toggleAddress, setToggleAddress] = React.useState(false);

    let colors = light;
    if (theme === 'dark') {
        colors = dark
    }

    const styles = styling(colors);

    React.useEffect(() => {
        RNQRGenerator.generate({
            value: activeAccount.classicAddress,
            height: 200,
            width: 200,
        }).then(response => {
            const { uri, width, height, base64 } = response;
            setImgSrcClassic(uri);
        }).catch(error => console.log('Cannot create QR code', error));

        RNQRGenerator.generate({
            value: getXAddress(activeAccount.classicAddress),
            height: 200,
            width: 200,
        }).then(response => {
            const { uri, width, height, base64 } = response;
            setImgSrcX(uri);
            setLoading(false);
        }).catch(error => console.log('Cannot create QR code', error));
    }, []);

    const copyToClipboard = () => {
        if (toggleAddress) {
            Clipboard.setString(getXAddress(activeAccount.classicAddress));
        } else {
            Clipboard.setString(activeAccount.classicAddress);
        }
        setCopiedModalOpen(true);
        setTimeout(() => {
            setCopiedModalOpen(false);
        }, 2000);
    };

    const shareAddress = async () => {
        await Share.share({
            message: toggleAddress ? getXAddress(activeAccount.classicAddress) : activeAccount.classicAddress
        });
    }

    return (
        <React.Fragment>
            <Modal
                visible={props.receiveModalOpen}
                transparent={true}
            >
                <View style={styles.sendModalWrapper}>
                    <View style={styles.sendModalHeader}>
                        {
                            // HEADER
                        }
                        <View style={styles.sendModalHeaderSpacer}></View>
                        <Text style={styles.sendModalHeaderTextLarge}>Receive</Text>
                        <TouchableOpacity style={styles.sendModalCloseButton} onPress={() => props.setReceiveModalOpen(false)}>
                            <Text style={styles.sendModalHeaderTextBig}>X</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.qrCodeWrapper}>
                        <Text style={styles.qrCodeAccountLabel}>{activeAccount.name}</Text>
                        <View style={styles.qrCodeContainer}>
                        <Image
                            style={styles.introImage}
                            source={require('../../../assets/img/hero.png')}
                            />
                        </View>
                    </View>
                    <View style={styles.receiveModalActionsWrapper}>
                        <Text style={styles.qrCodeAccountLabel}>Wallet Address:</Text>
                        <Text style={styles.qrCodeAccountLabelLight}>{activeAccount.classicAddress}</Text>
                        <View style={styles.receiveModalActionButtons}>
                            <TouchableOpacity style={styles.shareButton} onPress={shareAddress}>
                                <View style={styles.buttonWrapper}>
                                    <Ionicons name={"share-social"} size={20} color={colors.bg} style={styles.sendIcon} />
                                    <Text style={styles.actionButtonText}>Share</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                                <View style={styles.buttonWrapper}>
                                    <Feather name={"copy"} size={20} color={colors.bg} style={styles.receiveIcon} />
                                    <Text style={styles.actionButtonText}>Copy</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.backButton} onPress={() => props.setReceiveModalOpen(false)}>
                            <View style={styles.buttonWrapper}>
                                <Feather name={"arrow-left"} size={25} color={colors.text} style={styles.backIcon} />
                                <Text style={styles.backButtonText}>Back</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* {!toggleAddress ? 
                        <View style={styles.toggleRow}>
                            <TouchableOpacity style={styles.toggleButtonActive}>
                                <Text style={styles.toggleButtonText}>Classic Address</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toggleButtonInactive} onPress={() => setToggleAddress(!toggleAddress)}>
                                <Text style={styles.toggleButtonText}>X Address</Text>
                            </TouchableOpacity>
                        </View> :
                        <View style={styles.toggleRow}>
                            <TouchableOpacity style={styles.toggleButtonInactive} onPress={() => setToggleAddress(!toggleAddress)}>
                                <Text style={styles.toggleButtonText}>Classic Address</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toggleButtonActive}>
                                <Text style={styles.toggleButtonText}>X Address</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    {!toggleAddress ? 
                    [<View key="qr1" style={styles.qrCodeWrapper}>
                        <Text style={styles.qrCodeAccountLabel}>{activeAccount.name}</Text>
                        <View style={styles.qrCodeContainer}>
                            {!loading && <Image
                            style={styles.qrCode}
                            source={{ uri: imgSrcClassic }}
                            />}
                        </View>
                    </View>,
                    <View key="v1" style={styles.receiveModalActionsWrapper}>
                        <Text style={styles.qrCodeAccountLabel}>Wallet Address:</Text>
                        <Text style={styles.qrCodeAccountLabelLight}>{activeAccount.classicAddress}</Text>
                        <View style={styles.receiveModalActionButtons}>
                            <TouchableOpacity style={styles.shareButton} onPress={shareAddress}>
                                <View style={styles.buttonWrapper}>
                                    <Ionicons name={"share-social"} size={20} color={colors.bg} style={styles.sendIcon} />
                                    <Text style={styles.actionButtonText}>Share</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                                <View style={styles.buttonWrapper}>
                                    <Feather name={"copy"} size={20} color={colors.bg} style={styles.receiveIcon} />
                                    <Text style={styles.actionButtonText}>Copy</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.backButton} onPress={() => props.setReceiveModalOpen(false)}>
                            <View style={styles.buttonWrapper}>
                                <Feather name={"arrow-left"} size={25} color={colors.text} style={styles.backIcon} />
                                <Text style={styles.backButtonText}>Back</Text>
                            </View>
                        </TouchableOpacity>
                    </View>] : 
                    [<View key="qr2" style={styles.qrCodeWrapper}>
                        <Text style={styles.qrCodeAccountLabel}>{activeAccount.name}</Text>
                        <View style={styles.qrCodeContainer}>
                            {!loading && <Image
                            style={styles.qrCode}
                            source={{ uri: imgSrcX }}
                            />}
                        </View>
                    </View>,
                    <View key="v2" style={styles.receiveModalActionsWrapper}>
                        <Text style={styles.qrCodeAccountLabel}>X Address:</Text>
                        <Text style={styles.qrCodeAccountLabelLight}>{getXAddress(activeAccount.classicAddress)}</Text>
                        <View style={styles.receiveModalActionButtons}>
                            <TouchableOpacity style={styles.shareButton} onPress={shareAddress}>
                                <View style={styles.buttonWrapper}>
                                    <Ionicons name={"share-social"} size={20} color={colors.bg} style={styles.sendIcon} />
                                    <Text style={styles.actionButtonText}>Share</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                                <View style={styles.buttonWrapper}>
                                    <Feather name={"copy"} size={20} color={colors.bg} style={styles.receiveIcon} />
                                    <Text style={styles.actionButtonText}>Copy</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.backButton} onPress={() => props.setReceiveModalOpen(false)}>
                            <View style={styles.buttonWrapper}>
                                <Feather name={"arrow-left"} size={25} color={colors.text} style={styles.backIcon} />
                                <Text style={styles.backButtonText}>Back</Text>
                            </View>
                        </TouchableOpacity>
                    </View>]} */}
                </View>

                {copiedModalOpen &&
                        <View style={styles.addAccountModalWrapper}>
                            <View style={styles.copyModalHeader}>
                                <View style={styles.copyModalHeaderSpacer}>
                                    <Text style={styles.sendModalHeaderTextName}>Copied to Clipboard</Text>
                                    <AntDesign name={"check"} size={20} color={colors.text} style={styles.checkIcon} />
                                </View>
                                <TouchableOpacity onPress={() => setCopiedModalOpen(false)}>
                                    <Text style={styles.sendModalHeaderText}>X</Text>
                                </TouchableOpacity>
                            </View>
                        </View>}
            </Modal>

            
        </React.Fragment>
    );
}

const styling = colors => StyleSheet.create({
    sendModalWrapper: {
        backgroundColor: colors.bg,
        width: '100%',
        height: '100%',
        // marginTop: 15,
        // position: 'absolute',
        // bottom: 10,
        elevation: 5,
        shadowColor: '#000000',
        shadowOffset: {width: 5, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 20,

        borderRadius: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggleButtonActive: {
        width: 150,
        marginBottom: 30,
        borderBottomWidth: 3,
        borderBottomColor: colors.primary
    },
    toggleButtonInactive: {
        width: 150,
        marginBottom: 30,
        borderBottomWidth: 3,
        borderBottomColor: colors.bg
    },
    toggleButtonText: {
        textAlign: 'center',
        color: colors.text,
        fontFamily: "Nexa", fontWeight: "bold",
    },
    // sendModalHeader: {
    //     width: '100%',
    //     paddingHorizontal: 10,
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     marginTop: 10
    // },
    toggleRow: {
        flexDirection: 'row',
        width: '90%',
        justifyContent: 'space-between'
    },
    backButton: {
        width: 100,
        height: 50,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: colors.text_light,
        borderRadius: 10,
        marginBottom: 15
      },
      backButtonText: {
        fontSize: 16,
        marginTop: 6,
        marginLeft: 5,
        color: colors.text,
        fontFamily: "Nexa", fontWeight: "bold",
      },
    sendModalHeaderSpacer: {
        width: 50
    },
    sendModalHeaderTextBig: {
        fontSize: 20,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        textAlign: 'center'
    },
    sendModalHeaderTextLarge: {
        fontSize: 22,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        textAlign: 'center',
        marginTop: 20,
        paddingTop: 10
    },
    qrCode: {
        width: 200,
        height: 200
    },
    qrCodeContainer: {
        backgroundColor: colors.bg
    },
    qrCodeAccountLabel: {
        textAlign: 'center',
        fontSize: 16,
        color: colors.text,
        fontFamily: "Nexa", fontWeight: "bold",
        marginBottom: 5
    },
    qrCodeAccountLabelLight: {
        textAlign: 'center',
        fontSize: 14,
        color: colors.text_dark,
        paddingTop: 10,
        paddingBottom: 5,
        paddingHorizontal: 10,
        fontFamily: "Nexa", fontWeight: "bold",
    },
    receiveModalActionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 10,
        // marginLeft: 10
    },
    receiveModalActionsWrapper: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    shareButton: {
        width: '45%',
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: 20,
        marginRight: 10,
        height: 80,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    copyButton: {
        width: '45%',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        borderRadius: 20,
        height: 80,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    sendModalCloseButton: {
        width: 50,
        height: 50
      },
    actionButtonText: {
        paddingBottom: 10,
        color: colors.bg,
        fontSize: 20,
        fontFamily: "Nexa", fontWeight: "bold",
        paddingTop: 10,
        marginTop: 6
    },
    buttonWrapper: {
        flexDirection: 'row'
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
    introImage: {
        width: 150,
        height: 150,
        marginTop: 10,
      },
    addAccountModalWrapper: {
        position: 'absolute',
        top: 50,
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
    sendModalHeader: {
        width: '100%',
        height: 100,
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        // alignItems: 'center',
        marginTop: 50
    },
    copyModalHeader: {
        width: '100%',
        height: 30,
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    copyModalHeaderSpacer: {
        flexDirection: 'row'
    },

    checkIcon: {
        marginLeft: 10
    }
});

export default ReceiveModal;