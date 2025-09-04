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
import {MagazineBgIcon} from '../../../assets/img/new-design';
import {BlurView} from '@react-native-community/blur';
import { openInAppBrowser } from '../../../utils/functions/InAppBrowserService';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const MagazineCard = ({magazine}) => {
  let {theme} = useStore();

  // variables

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors, theme);

  return (
    <React.Fragment>
      <ImageBackground
        src={magazine?.image}
        style={[styles.card]}
        imageStyle={{borderRadius: 8, width: null, height: null}}>
        <View
          style={{
            height: 164,
          }}
        />
        {/* <MagazineBgIcon style={styles.bgIcon} height={164} width={160} /> */}
        <View style={[styles.descriptionCard]}>
          {/* <BlurView
            style={styles.absolute}
            blurType="light"
            blurAmount={6}
            reducedTransparencyFallbackColor="white"
          /> */}
          <Text style={styles.heading}>
            {magazine?.title?.slice(0, 35) + '...' ||
              'Explore the future of healthcare'}
          </Text>
          <Text style={styles.description}>
            {magazine?.description?.slice(0, 45) + '...' ||
              'with our quarterly XRP Healthcare magazine.'}{' '}
          </Text>
        </View>
      </ImageBackground>
      <Pressable
        style={[styles.actionButton, {marginLeft: 'auto', marginRight: 'auto'}]}
        onPress={() => {
          // Linking.openURL(magazine?.url);
          openInAppBrowser(magazine?.url,colors)
        }}>
        <Text style={styles.actionButtonText}>Read Now</Text>
      </Pressable>
    </React.Fragment>
  );
};

const styling = (colors, theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
    },
    card: {
      padding: 0,
      borderRadius: 8,
      backgroundColor: colors.bg,
      minHeight: 205,
    },
    descriptionCard: {
      borderRadius: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      borderWidth: 1,
      borderColor: '#ededed',
      padding: 8,
      position: 'absolute',
      width: '100%',
      bottom: 0,
      overflow: 'hidden',
    },
    absolute: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
    heading: {
      fontSize: 14,
      fontWeight: '600',
      fontFamily: 'LeagueSpartanSemiBold',
      color: '#1a1a1a',
      marginTop: -4,
    },
    description: {
      color: '#636363',
      fontSize: 12,
      fontWeight: '400',
      fontFamily: 'LeagueSpartanRegular',
      lineHeight: 16,
    },
    bgIcon: {
      marginRight: 'auto',
      marginLeft: 'auto',
      // marginTop: 9,
    },
    actionButton: {
      borderRadius: 37,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.action_btn_grad,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 16,
      width: 91,
      paddingBottom: 4,
      paddingTop: 2,
      paddingHorizontal: 8,
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '400',
      fontFamily: 'LeagueSpartanMedium',
      color: colors.primary,
    },
  });

export default MagazineCard;
