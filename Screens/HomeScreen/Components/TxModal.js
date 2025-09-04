import React from 'react';

import {StyleSheet, View, TouchableOpacity, Text, Platform} from 'react-native';
import {light, dark} from '../../../assets/colors/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import useStore from '../../../data/store';

AntDesign.loadFont();
FontAwesome.loadFont();
Feather.loadFont();

const TxModal = props => {
  const {theme} = useStore();
  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  return (
    <React.Fragment>
      {props.txModalOpen && (
        <View style={styles.addAccountModalWrapper}>
          <View style={styles.sendModalHeader}>
            <View style={styles.sendModalHeaderSpacer}></View>
            <Text style={styles.sendModalHeaderText}>
              Your Balances Have Been Updated
            </Text>
            <TouchableOpacity
              style={styles.sendModalCloseButton}
              onPress={() => props.closeTxModal()}>
              <Text style={styles.sendModalHeaderText}>X</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addAccountModalActionsWrapper}>
            <View style={styles.addAccountActionButtons}>
              <TouchableOpacity
                style={styles.addAccountOkButton}
                onPress={() => props.goToTxHistory()}>
                <View style={styles.buttonWrapper}>
                  <Text style={styles.addAccountOkButtonText}>
                    View Transaction
                  </Text>
                  <Feather
                    name={'arrow-right'}
                    size={20}
                    color={colors.text}
                    style={styles.continueIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </React.Fragment>
  );
};

const styling = colors =>
  StyleSheet.create({
    addAccountModalWrapper: {
      position: 'absolute',
      top: 30,
      backgroundColor: colors.secondary,
      width: '96%',
      height: 80,
      marginLeft: '2%',
      elevation: 5,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    continueIcon: {},
    buttonWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    addAccountModalActionsWrapper: {
      paddingHorizontal: 10,
    },
    addAccountModalDirections: {
      textAlign: 'left',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
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
      width: 220,
      height: 30,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.bg,
      borderRadius: 10,
      marginBottom: 10,
    },
    addAccountOkButtonText: {
      textAlign: 'center',
      fontSize: 16,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginRight: 20,
    },
    sendModalHeader: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    sendModalHeaderText: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'left',
    },
    sendModalHeaderSpacer: {
      width: 10,
    },
  });

export default TxModal;
