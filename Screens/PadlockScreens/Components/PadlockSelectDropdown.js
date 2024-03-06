import React from 'react';

import {
  StyleSheet, Platform} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import _ from'lodash';
import { light, dark } from '../../../assets/colors/padlockColors';
import useStore from '../../../data/store';

const PadlockSelectDropdown = (props) => {
  const {theme } = useStore();
    // incudes a letter A-H as well as an index 0-5
    // includes a setter to set state object
  let colors = light;
  if (theme === 'dark') {
    colors = dark
  }

  const styles = styling(colors);
    return (
        <SelectDropdown
            data={['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']}
            onSelect={(selectedItem) => {
                console.log(selectedItem)
                props.onUpdate(props.padlockKey, props.padlockIndex, selectedItem)
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
                // text represented after item is selected
                // if data array is an array of objects then return selectedItem.property to render after item is selected
                return selectedItem
            }}
            rowTextForSelection={(item, index) => {
                // text represented for each item in dropdown
                // if data array is an array of objects then return item.property to represent item in dropdown
                return item
            }}
            defaultButtonText={'_'}
            dropdownStyle={styles.dropdownStyle}
            buttonStyle={styles.buttonStyle}
            buttonTextStyle={styles.buttonTextStyle}
            rowTextStyle={styles.rowTextStyle}
        />
    );
}

const styling = colors => StyleSheet.create({
    dropdownStyle: {
      backgroundColor: colors.primary,
      width: 35,
      borderRadius: 10,
      marginLeft: 5
    },
    buttonStyle: {
      backgroundColor: colors.primary,
      width: 47,
      height: 35,
      borderRadius: 10
    },
    buttonTextStyle: {
      fontSize: 20,
      color: colors.bg,
      fontFamily: Platform.OS === "ios" ? "NexaBold" : "NexaBold", fontWeight: Platform.OS === "ios" ? "bold" : "100",
      paddingHorizontal: 0,
      marginLeft: 0,
      marginTop: 6,
      marginRight: 0,
    },
    rowTextStyle: {
      fontSize: 20,
      color: colors.bg,
      fontFamily: Platform.OS === "ios" ? "NexaBold" : "NexaBold", fontWeight: Platform.OS === "ios" ? "bold" : "100",
    },
})

export default PadlockSelectDropdown;