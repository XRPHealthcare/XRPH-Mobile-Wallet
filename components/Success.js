import React from 'react';

import {Text, StyleSheet, View, TouchableOpacity, Platform} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useStore from '../data/store';
import {dark, light} from '../assets/colors/colors';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const Success = props => {
  let {theme} = useStore();

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  React.useEffect(() => {
    if (props.isOpen) {
      setTimeout(() => {
        props.setIsOpen(false);
      }, 2000);
    }
  }, [props.isOpen]);

  return (
    <React.Fragment>
      {props.isOpen && (
        <View
          style={[
            styles.addAccountModalWrapper,
            {
              backgroundColor:
                props?.type == 'error' ? '#ff0e0e' : colors.secondary,
              top: props?.top ? props.top : 50,
            },
          ]}>
          <View style={styles.copyModalHeader}>
            <View style={styles.copyModalHeaderSpacer}>
              <Text style={styles.sendModalHeaderTextName}>
                {props.message}
              </Text>
            </View>
            <TouchableOpacity onPress={() => props.setIsOpen(false)}>
              <Text style={styles.sendModalHeaderText}>
                {props.type == 'error' ? 'X' : '✓'}
              </Text>
            </TouchableOpacity>
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
      top: 50,
      width: '90%',
      paddingVertical: 10,
      elevation: 10,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginLeft: 20,
      marginRight: 20,
    },
    sendModalHeaderText: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'left',
    },
    sendModalHeaderTextName: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'left',
    },
    copyModalHeader: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    copyModalHeaderSpacer: {
      flexDirection: 'row',
    },

    checkIcon: {
      marginLeft: 10,
    },
  });

export default Success;
