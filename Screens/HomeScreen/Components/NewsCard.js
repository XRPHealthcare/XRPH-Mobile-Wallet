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
import {NewsBgIcon, NewsLogoIcon} from '../../../assets/img/new-design';
import { openInAppBrowser } from '../../../utils/functions/InAppBrowserService';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const NewsCard = ({newses}) => {
  let {theme} = useStore();

  // variables

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  return (
    <React.Fragment>
      <Pressable
        style={[
          styles.column,
          {
            backgroundColor: colors.bg,
            borderBottomEndRadius: 8,
            borderBottomStartRadius: 8,
            minHeight: 205,
          },
        ]}
        onPress={() => {
          if (newses?.[0]) {
            // Linking.openURL(newses?.[0]?.link);
            openInAppBrowser(newses?.[0]?.link,colors)
          }
        }}>
        <ImageBackground
          source={require('../../../assets/img/new-design/news-gradient-bg.png')}
          style={styles.newsCover}
          imageStyle={{borderRadius: 8}}>
          <NewsLogoIcon style={{width: 50, height: 50}} />
        </ImageBackground>

        {/* <NewsBgIcon style={{width: 420}} /> */}
        <View style={styles.card}>
          <Text style={styles.heading}>
            {newses?.[0]?.title?.slice(0, 17) + '...' || 'XRP Healthcare'}
          </Text>
          <Text style={[styles.description]}>
            {newses?.[0]?.description?.slice(0, 75) + '...' ||
              `Helping to Transform HIV and AIDS Care with Innovative Prescription
            Savings Solutions`}
          </Text>
        </View>
      </Pressable>
      <Pressable
        style={[styles.actionButton, {marginLeft: 'auto', marginRight: 'auto'}]}
        onPress={() => {
          // Linking.openURL(
          //   newses?.[0]?.viewAll || 'https://xrphealthcare.ai/news',
          // );
          openInAppBrowser(newses?.[0]?.viewAll || 'https://xrphealthcare.ai/news',colors)
        }}>
        <Text style={styles.actionButtonText}>View All</Text>
      </Pressable>
    </React.Fragment>
  );
};

const styling = colors =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
    },
    newsCover: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      height: 90,
    },
    card: {
      paddingHorizontal: 8,
      paddingTop: 9,
      paddingBottom: 13,
      backgroundColor: colors.bg,
      borderBottomEndRadius: 8,
      borderBottomStartRadius: 8,
      height: 110,
    },
    heading: {
      fontSize: 14,
      fontWeight: '600',
      fontFamily: 'LeagueSpartanSemiBold',
      color: colors.text,
    },
    description: {
      marginTop: 4,
      color: colors.text_gray,
      fontSize: 12,
      fontWeight: '400',
      fontFamily: 'LeagueSpartanRegular',
      lineHeight: 16,
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

export default NewsCard;
