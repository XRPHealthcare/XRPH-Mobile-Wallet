import React from 'react';

import {
  StyleSheet,
  View,
  Text,
  Platform} from 'react-native';
import { light, dark } from '../../../assets/colors/padlockColors';
import useStore from '../../../data/store';

const PadlockRow = (props) => {
  const { theme, padlock } = useStore();
  let colors = light;
  if (theme === 'dark') {
    colors = dark
  }

  const styles = styling(colors);

    return (
        <View style={styles.padlockRow}>
            <Text style={styles.letter}>{props.letter}</Text>
            <View style={styles.numberRow}>
            {padlock[props.letter].map((num, index) => (
                <Text style={styles.padlockNumber} key={index}>
                {num}
                </Text>
            ))}
            </View>
        </View>
    );
};

  
const styling = colors => StyleSheet.create({
    padlockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%'
    },
    numberRow: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        marginLeft: 5,
        marginRight: 5,
        paddingLeft: 10,
        paddingRight: 10,
        marginTop: 5,
        borderRadius: 10,
        width: '86.5%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
      },
      letter: {
        fontFamily: Platform.OS === "ios" ? "NexaBold" : "NexaBold", fontWeight: Platform.OS === "ios" ? "bold" : "normal",
        fontSize: 29,
        color: colors.primary,
        paddingLeft: 10,
        paddingTop: 10,
        width: '10%',
        height: '100%'
      },
      padlockNumber: {
        color: colors.bg,
        paddingTop: 8,
        paddingBottom: 3,
        fontSize: 18,
        width: '15%',
        textAlign: 'center',
        alignItems: 'center',
        fontFamily: Platform.OS === "ios" ? "NexaBold" : "NexaBold", fontWeight: Platform.OS === "ios" ? "bold" : "normal",
      },
});

export default PadlockRow;