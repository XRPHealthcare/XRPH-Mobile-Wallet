import React from 'react';

import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Text,
  Platform,
  Dimensions,
} from 'react-native';
import {light, dark} from '../../../assets/colors/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import useStore from '../../../data/store';
import LinearGradient from 'react-native-linear-gradient';

AntDesign.loadFont();
FontAwesome.loadFont();

const AddAccountModal = props => {
  const {theme} = useStore();

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  return (
    <Modal visible={props.addAccountModalOpen}  transparent={true}>
      <View style={{flex:1, backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
      <View style={styles.addAccountModalWrapper}>
        <View style={styles.sendModalHeader}>
          {/* <View style={styles.sendModalHeaderSpacer}></View> */}
          <Text style={styles.sendModalHeaderText}>Add New Account</Text>
          <TouchableOpacity
            style={styles.sendModalCloseButton}
            onPress={() => props.setAddAccountModalOpen(false)}>
            <Text style={styles.sendModalHeaderCross}>X</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.addAccountModalActionsWrapper}>
          <Text style={styles.addAccountModalDirections}>
            Hey there<Text style={styles.inputLabelCharacter}>!</Text> Just a
            heads up that you will be taken to the padlock combination page
            where you will be asked to write down a series of numbers that
            correspond to the letters A through H. Please remember that this is
            extremely important information and should be kept private.
          </Text>
          <View style={styles.addAccountActionButtons}>
            {/* <TouchableOpacity
              style={styles.addAccountOkButton}
              onPress={props.prepareNewAccountCreation}>
              <Text style={styles.addAccountOkButtonText}>Continue</Text>
            </TouchableOpacity> */}

  <TouchableOpacity
                onPress={props.prepareNewAccountCreation}>
                <LinearGradient
                  colors={['#37C3A6', '#AF45EE']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.gradientBtnContainer}>
                  <Text style={styles.gradientBtnText}>
                  Continue
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

          </View>
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
      top: '50%',
      left: '50%',
      transform: [{ translateX: -0.5 * (Dimensions.get('window').width * 0.9) }, { translateY: -0.5 * 300 }],
      backgroundColor: colors.bg,
      width: '90%',
      height: 330, // uncomment if needed
      padding: 10,
      elevation: 5,
      borderRadius: 20,
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 5, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
    },
    
    addAccountModalActionsWrapper: {
      paddingHorizontal: 10,
       marginTop: 3,
    },
    addAccountModalDirections: {
      textAlign:'center',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanLight',
        lineHeight:22
      // marginBottom: 20,
    },
    addAccountActionButtons: {
      // flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
      marginTop: 10,
      // marginLeft: 10,
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
      paddingHorizontal: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    sendModalHeaderSpacer: {
      width: 10,
    },
    sendModalHeaderCross: {
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
       paddingBottom:15,
    },
    sendModalHeaderText: {
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight:'700',
      color: colors.text,
      textAlign: 'center',
    },
    gradientBtnContainer: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      marginTop: 20,
      marginBottom:10,
      
    },
    gradientBtnText: {
      textAlign: 'center',
      fontSize: 18,
      color: '#fff',
    },
  });

export default AddAccountModal;
