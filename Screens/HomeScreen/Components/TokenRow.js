import React from 'react';

import {
  Image,
  StyleSheet,
  View,
  Text,
 Platform} from 'react-native';
import { light, dark } from '../../../assets/colors/colors';
import useStore from '../../../data/store';

const TokenRow = (props) => {
    const { theme } = useStore();

    let imgSrc = "";
    if (props.currency === "XRPH") {
        imgSrc = require('../../../assets/img/hero.png');
    } else if (props.currency === "XRP") {
        imgSrc = require('../../../assets/img/xrp-logo.png');
    } else {
        if (theme === 'dark') {
            imgSrc = require('../../../assets/img/unknown_token_dark.png');
        } else {
            imgSrc = require('../../../assets/img/unknown_token_light.png');
        }
    }

    let colors = light;
    if (theme === 'dark') {
        colors = dark
    }

    const styles = styling(colors);

    return (
        <View style={styles.tokenRowWrapper}>
            <Image
                style={styles.tokenRowImage}
                source={imgSrc}
            />
            <Text style={styles.tokenRowCurrency}>{props.currency}</Text>
            <Text style={styles.tokenRowBalance}>{props.balance}</Text>
            
        </View>
    );
}

const styling = colors => StyleSheet.create({
    tokenRowWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        // backgroundColor: 'red',
    },
    tokenRowImage: {
        width: 32,
        height: 32,
        marginLeft: 10,
        marginRight: 10
    },
    tokenRowCurrency: {
        fontFamily: Platform.OS === "ios" ? 'NexaBold' : "NexaBold", fontWeight: Platform.OS === "ios" ? 'bold' : '100',
        fontSize: 16,
        color: colors.text,
        marginTop: 5
    },
    tokenRowBalance: {
        fontFamily: Platform.OS === "ios" ? 'NexaBold' : "NexaBold", fontWeight: Platform.OS === "ios" ? 'bold' : '100',
        fontSize: 20,
        color: colors.text,
        position: 'absolute',
        right: 10,
        paddingTop: 8
    },
});

export default TokenRow;