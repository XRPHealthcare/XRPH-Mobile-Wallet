import React from 'react';

import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Text,
  Platform,
} from 'react-native';
import {light, dark} from '../../../assets/colors/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import useStore from '../../../data/store';

AntDesign.loadFont();
FontAwesome.loadFont();

const ConfirmationModal = props => {
  const {theme} = useStore();

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  return (
    <Modal visible={props.isConfirmModal} transparent={true}>
      <View style={styles.addAccountModalWrapper}>
        <View style={styles.sendModalHeader}>
          <View style={styles.sendModalHeaderSpacer}></View>
          <Text style={styles.sendModalHeaderText}>Confirm Stake</Text>
          <TouchableOpacity
            style={styles.sendModalCloseButton}
            onPress={() => props.setIsConfirmModal(false)}>
            <Text style={styles.sendModalHeaderText}>X</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.addAccountModalActionsWrapper}>
          <Text style={styles.addAccountModalDirections}>
            Hey there<Text style={styles.inputLabelCharacter}>! </Text>
            Are you sure you want to stake?
          </Text>
          <View style={styles.addAccountActionButtons}>
            <TouchableOpacity
              style={styles.addAccountOkButton}
              onPress={props.stakeNow}>
              <Text style={styles.addAccountOkButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styling = colors =>
  StyleSheet.create({
    addAccountModalWrapper: {
      position: 'absolute',
      top: '40%',
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
      marginTop: 20,
    },
    addAccountModalDirections: {
      textAlign: 'left',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanLight',
      marginBottom: 20,
    },
    addAccountActionButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
      marginTop: 10,
      marginLeft: 10,
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
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    sendModalHeader: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    sendModalHeaderSpacer: {
      width: 10,
    },
    sendModalHeaderText: {
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'center',
    },
  });

export default ConfirmationModal;
