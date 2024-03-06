import React from 'react';

import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Text
,Platform} from 'react-native';
import { light, dark } from '../../../assets/colors/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import useStore from '../../../data/store';

AntDesign.loadFont();
FontAwesome.loadFont();

const AddAccountModal = (props) => {
    const { theme } = useStore();

    let colors = light;
    if (theme === 'dark') {
        colors = dark
    }

    const styles = styling(colors);

    return (
        <Modal
            visible={props.addAccountModalOpen}
            transparent={true}
        >
            <View style={styles.addAccountModalWrapper}>
                <View style={styles.sendModalHeader}>
                    <View style={styles.sendModalHeaderSpacer}></View>
                    <Text style={styles.sendModalHeaderText}>Add a New Account</Text>
                    <TouchableOpacity style={styles.sendModalCloseButton} onPress={() => props.setAddAccountModalOpen(false)}>
                        <Text style={styles.sendModalHeaderText}>X</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.addAccountModalActionsWrapper}>
                    <Text style={styles.addAccountModalDirections}>Hey there<Text style={styles.inputLabelCharacter}>!</Text> Just a heads up that you will be taken to the padlock combination page where you will be asked to write down a series of numbers that correspond to the letters A through H. Please remember that this is extremely important information and should be kept private.</Text>
                    <View style={styles.addAccountActionButtons}>
                        <TouchableOpacity style={styles.addAccountOkButton} onPress={props.prepareNewAccountCreation}>
                            <Text style={styles.addAccountOkButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styling = colors => StyleSheet.create({
    addAccountModalWrapper: {
        position: 'absolute',
        top: 120,
        backgroundColor: colors.bg,
        width: '90%',
        // height: 300,
        marginLeft: '5%',
        // marginBottom: '60%',
        elevation: 5,
        borderRadius: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: {width: 5, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 20,
        borderRadius: 10,
    },
    addAccountModalActionsWrapper: {
        paddingHorizontal: 10,
        marginTop: 20
    },
    addAccountModalDirections: {
        textAlign: 'left',
        fontSize: 16,
        color: colors.text_dark,
        fontFamily: Platform.OS === "ios" ? "NexaLight" : "NexaLight",
        marginBottom: 20
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
        borderRadius: 10,
    },
    addAccountOkButtonText: {
        textAlign: 'center',
        fontSize: 16,
        color: colors.bg,
        fontFamily: Platform.OS === "ios" ? "NexaLight" : "NexaBold", fontWeight: Platform.OS === "ios" ? "bold" : "100",
    },
    sendModalHeader: {
        width: '100%',
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    sendModalHeaderSpacer: {
        width: 10
    },
    sendModalHeaderText: {
        fontSize: 20,
        fontFamily: Platform.OS === "ios" ? "NexaLight" : "NexaBold", fontWeight: Platform.OS === "ios" ? "bold" : "100",
        color: colors.text,
        textAlign: 'center'
    },
});

export default AddAccountModal;