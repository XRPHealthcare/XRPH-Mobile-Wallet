import React from 'react';

import {
  Image,
  ImageBackground,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import useStore from '../../../data/store';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  AfricaCornerIcon,
  AfricaMapIcon,
  LogoIcon,
  LogoTextAfricaIcon,
  LogoTextIcon,
} from '../../../assets/img/new-design';
import { openInAppBrowser } from '../../../utils/functions/InAppBrowserService';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const HealthCare = props => {
  let {theme} = useStore();

  // variables

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  return (
    <React.Fragment>
      <ImageBackground
        source={require('../../../assets/img/new-design/xrph-ai-bg.png')}
        resizeMode="cover"
        imageStyle={{borderRadius: 8}}
        style={styles.xrphai_bg}>
        <View
          style={[styles.row, {alignItems: 'flex-end', position: 'relative'}]}>
          <View style={{flexDirection: 'column', gap: 8}}>
            <View style={[styles.row, {gap: 8}]}>
              <LogoIcon width={35} height={37} />
              <View style={{flexDirection: 'column', gap: 0, marginTop: 8}}>
                <LogoTextAfricaIcon />
              </View>
            </View>
            <Text style={styles.xrphai_description}>
              XRP Healthcare is making significant advancements in Africa,
              concentrating efforts in Uganda to transform ...
            </Text>
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                // Linking.openURL('https://xrphealthcare.ai/africa');
                openInAppBrowser('https://xrphealthcare.ai/africa',colors)
              }}>
              <Text style={styles.actionButtonText}>Read More</Text>
            </Pressable>
          </View>
          <Image
            source={require('../../../assets/img/new-design/map.png')}
            style={styles.mapImg}
          />
          {/* <AfricaMapIcon style={styles.mapImg} height={151} /> */}
          <AfricaCornerIcon style={styles.cornerImg} height={41} />
        </View>
      </ImageBackground>
    </React.Fragment>
  );
};

const styling = colors =>
  StyleSheet.create({
    xrphai_bg: {
      paddingTop: 12,
      paddingBottom: 16,
      paddingLeft: 15,
    },
    xrphai_description: {
      color: '#636363',
      fontSize: 14,
      fontWeight: '400',
      fontFamily: 'LeagueSpartanRegular',
      maxWidth: 181,
      marginTop: 27,
    },
    mapImg: {
      position: 'absolute',
      top: 0,
      right: 0,
      marginRight: 20,
      marginTop: 15,
      height: 151,
      width: 151,
    },
    cornerImg: {
      position: 'absolute',
      top: 0,
      right: 0,
      marginTop: -12,
      marginRight: -2,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
    },
    actionButton: {
      borderRadius: 37,
      borderWidth: 1,
      borderColor: '#8E42D1',
      backgroundColor: 'rgba(175, 69, 238, 0.10)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 8,
      width: 91,
      paddingBottom: 4,
      paddingTop: 2,
      paddingHorizontal: 8,
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '400',
      fontFamily: 'LeagueSpartanMedium',
      color: '#8E42D1',
    },
  });

export default HealthCare;
