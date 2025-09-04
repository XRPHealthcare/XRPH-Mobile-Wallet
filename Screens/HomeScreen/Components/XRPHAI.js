import React from 'react';

import {
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
  LogoIcon,
  LogoTextIcon,
  LogoUnderlineIcon,
  XRPHAiHeroIcon,
} from '../../../assets/img/new-design';
import { openInAppBrowser } from '../../../utils/functions/InAppBrowserService';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const XRPHAI = props => {
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
        <View style={[styles.row, {alignItems: 'flex-end'}]}>
          <View style={{flexDirection: 'column', gap: 8}}>
            <View style={[styles.row, {gap: 8}]}>
              <LogoIcon width={35} height={37} />
              <View
                style={{
                  flexDirection: 'column',
                  gap: 0,
                  marginTop: 8,
                }}>
                <LogoTextIcon width={113} />
                <LogoUnderlineIcon width={113} />
              </View>
            </View>
            <Text style={styles.xrphai_description}>
              Chat with XRPH AI: Localized health advice with holistic and
              traditional insights, backed by trusted sources.
            </Text>
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                // Linking.openURL('https://xrph.ai/');
                openInAppBrowser('https://xrph.ai/',colors)
              }}>
              <Text style={styles.actionButtonText}>Chat Now</Text>
            </Pressable>
          </View>
          <View style={{marginLeft: 'auto'}}>
            <XRPHAiHeroIcon />
          </View>
        </View>
      </ImageBackground>
    </React.Fragment>
  );
};

const styling = colors =>
  StyleSheet.create({
    xrphai_bg: {
      paddingTop: 12,
      paddingBottom: 8,
      paddingLeft: 15,
    },
    xrphai_description: {
      color: '#636363',
      fontSize: 14,
      fontWeight: '400',
      fontFamily: 'LeagueSpartanRegular',
      maxWidth: 181,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
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
      marginTop: 14,
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

export default XRPHAI;
