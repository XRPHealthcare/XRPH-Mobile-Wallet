import React from 'react';

import {StyleSheet, Platform, Text, View} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import _ from 'lodash';
import {light, dark} from '../../../assets/colors/padlockColors';
import useStore from '../../../data/store';

const PadlockSelectDropdown = props => {
  const {theme} = useStore();
  // incudes a letter A-H as well as an index 0-5
  // includes a setter to set state object
  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);
  return (
    <SelectDropdown
      data={['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']}
      onSelect={selectedItem => {
        console.log(selectedItem);
        props.onUpdate(props.padlockKey, props.padlockIndex, selectedItem);
      }}
      renderButton={(selectedItem, isOpened) => {
        return (
          <View style={styles.dropdownStyle}>
            <Text style={styles.rowTextStyle}>
              {(selectedItem && selectedItem) || '_'}
            </Text>
          </View>
        );
      }}
      renderItem={(item, index, isSelected) => {
        return (
          <View
            style={[styles.buttonStyle, index === 9 && {borderBottomWidth: 0}]}>
            <Text style={styles.buttonTextStyle}>{item}</Text>
          </View>
        );
      }}
      dropdownStyle={{
        height: 300,
        borderRadius: 12,
        width: 40,
      }}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styling = colors =>
  StyleSheet.create({
    dropdownStyle: {
      backgroundColor: colors.primary,
      width: 35,
      borderRadius: 10,
      marginLeft: 5,
      height: 40,
    },
    buttonStyle: {
      backgroundColor: colors.primary,
      width: 40,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: 'white',
      paddingBottom: 10,
    },
    buttonTextStyle: {
      fontSize: 20,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginTop: 10,
    },
    rowTextStyle: {
      fontSize: 20,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      paddingTop: 12,
      paddingLeft: 10,
    },
  });

export default PadlockSelectDropdown;
