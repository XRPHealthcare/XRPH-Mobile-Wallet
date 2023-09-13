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
import AsyncStorage from '@react-native-async-storage/async-storage';

Feather.loadFont();

const SetPinScreen = ({navigation}) => {
    const { theme } = useStore();
    const setPin = useStore((state) => state.setPin);

    const [isPinSet, toggleIsPinSet] = React.useState(false);
    const [newPin, setNewPin] = React.useState("");
    const [doesPinMatch, setDoesPinMatch] = React.useState(false);

    let colors = light;
    if (theme === 'dark') {
        colors = dark
    }

    const styles = styling(colors);

    const confirmPin = () => {
        console.log("pin set: ", newPin);
        toggleIsPinSet(true);
        setPin(newPin);
        setNewPin("");

        AsyncStorage.setItem('pin', newPin).then(() => {
            console.log('set');
        })
    }

    const onVerificationSuccess = () => {
        setDoesPinMatch(true);
    }

    const onContinue = () => {
        navigation.navigate("Home Screen");
        setNewPin("");
        toggleIsPinSet(false);
    }

    const onChangePin = (newPin) => {
        setNewPin(newPin);
        if (newPin.length !== 6) {
            setDoesPinMatch(false);
        }
    }

    return (
        <View style={styles.bg}>
            <View style={styles.header}>
                <Image
                    style={styles.headerImage}
                    source={theme === 'light' ? 
                    require('../../../assets/img/header_logo.png') :
                    require('../../../assets/img/header_logo_dark.png') }
                />
                <View style={styles.sendModalHeader}>
                    <Text style={styles.sendModalHeaderText}>{ isPinSet ? "Verify Your Pin" : "Set A 6-Digit Pin"}</Text>
                </View>
                <Text style={styles.directionText}>
                    { !isPinSet ? "Please input a new pin for your account. This will be used to unlock the app."
                    : "Please verify your new pin."
                    }</Text>
            </View>
            <View style={styles.loadingAnimationWrapper}>
                

                { isPinSet ?
                    <Pin 
                        role={"verify"} 
                        onSuccess={onVerificationSuccess} 
                        onFailure={() => console.log('Epic fail')} 
                        pin={newPin}
                        setPin={onChangePin}
                    />
                :
                    <Pin 
                        role={"set"} 
                        onSuccess={() => navigation.navigate("Home Screen")} 
                        onFailure={() => console.log('Epic fail')} 
                        pin={newPin}
                        setPin={setNewPin}
                    />
                }

                { isPinSet ?
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.backButton} onPress={() => toggleIsPinSet(false)}>
                            <View style={styles.buttonWrapper}>
                                <Feather name={"arrow-left"} size={25} color={colors.text} style={styles.continueIcon} />
                                <Text style={styles.buttontextDark}>Back</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.addAccountOkButton, { backgroundColor: doesPinMatch ? colors.primary : colors.text_light }]} onPress={onContinue}>
                            <View style={styles.buttonWrapper}>
                                <Text style={[styles.addAccountOkButtonText, { color: doesPinMatch ? colors.bg : colors.text }]}>Continue</Text>
                                <Feather name={"arrow-right"} size={25} color={doesPinMatch ? colors.bg : colors.text} style={styles.continueIcon} />
                            </View>
                        </TouchableOpacity>
                    </View>
                :
                    <TouchableOpacity style={styles.addAccountOkButton} onPress={confirmPin}>
                        <View style={styles.buttonWrapper}>
                            <Text style={styles.addAccountOkButtonText}>Continue</Text>
                            <Feather name={"arrow-right"} size={25} color={colors.bg} style={styles.continueIcon} />
                        </View>
                    </TouchableOpacity>
                }
            </View>
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
        height: 130,
        // marginLeft: '5%',
        marginBottom: 100,
        marginTop: 30,
        // elevation: 5,
        borderRadius: 10,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%'
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
        marginTop: 10
    },
    sendModalHeaderText: {
        fontSize: 20,
        fontFamily: "Nexa", fontWeight: "bold",
        color: colors.text,
        textAlign: 'center',
        marginTop: 50
    },
    addAccountOkButton: {
        width: 160,
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
        marginRight: 20,
        marginTop: 5
    },
    backButton: {
        width: 100,
        height: 50,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: colors.text_light,
        borderRadius: 20,
    },
    buttontextDark: {
        fontSize: 20,
        color: colors.text,
        fontFamily: "Nexa", fontWeight: "bold",
        marginLeft: 5,
        marginTop: 5
    },
    directionText: {
        fontSize: 18,
        color: colors.text,
        fontFamily: "Nexa",
        marginTop: 30,
        textAlign: 'center'
    },
    buttonWrapper: {
        flexDirection: 'row'
    },
    bottomSpacer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        // marginLeft: '10%'
    },
});

export default SetPinScreen;