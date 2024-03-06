import React from 'react';

import {
  StyleSheet,
  View,
  Text,
  Platform} from 'react-native';
import PadlockSelectDropdown from './PadlockSelectDropdown';
import _ from'lodash';
import { light, dark } from '../../../assets/colors/padlockColors';
import useStore from '../../../data/store';

const PadlockInputRow = (props) => {
    const { theme } = useStore();

    let colors = light;
    if (theme === 'dark') {
        colors = dark
    }

    const styles = styling(colors);
    // incudes a letter A-H as well as an index 0-5
    // includes a setter to set state object
    return (
        <View style={styles.padlockRow}>
            <Text style={styles.letter}>{props.letter}</Text>
            <View style={styles.numberRow}>
            <PadlockSelectDropdown padlockKey={props.letter} padlockIndex={0} onUpdate={props.updatePadlock} />
            <PadlockSelectDropdown padlockKey={props.letter} padlockIndex={1} onUpdate={props.updatePadlock} />
            <PadlockSelectDropdown padlockKey={props.letter} padlockIndex={2} onUpdate={props.updatePadlock} />
            <PadlockSelectDropdown padlockKey={props.letter} padlockIndex={3} onUpdate={props.updatePadlock} />
            <PadlockSelectDropdown padlockKey={props.letter} padlockIndex={4} onUpdate={props.updatePadlock} />
            <PadlockSelectDropdown padlockKey={props.letter} padlockIndex={5} onUpdate={props.updatePadlock} />
            </View>
        </View>
    );
}

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
        fontFamily: Platform.OS === "ios" ? "NexaBold" : "NexaBold", fontWeight: Platform.OS === "ios" ? "bold" : "100",
        fontSize: 29,
        color: colors.primary,
        paddingLeft: 10,
        paddingTop: 10,
        width: '10%',
        height: '100%'
    },
})

export default PadlockInputRow;