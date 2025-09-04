import React from 'react';

import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import useStore from '../../../data/store';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {LogoBgIcon, PrescriptionCardIcon} from '../../../assets/img/new-design';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const PrescriptionCard = ({navigation}) => {
  let {theme} = useStore();

  // variables

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  return (
    <React.Fragment>
      <View style={styles.card}>
        <LogoBgIcon style={styles.bgIcon} height={122} />
        <View style={[styles.column, {gap: 17, alignItems: 'flex-start'}]}>
          <View style={[styles.column, {gap: 12, width: '100%'}]}>
            <Text style={[styles.heading]}>Prescription Savings Card</Text>
            <Image
              source={require('../../../assets/img/new-design/card.png')}
              style={{
                height: 121,
                width: 211,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            />
          </View>
          <View
            style={[
              styles.column,
              {gap: 20, width: '100%', marginTop: 12, alignItems: 'center'},
            ]}>
            <View style={[styles.column, {gap: 4}]}>
              <View style={[styles.row, {gap: 10, alignItems: 'flex-start'}]}>
                <View style={styles.dot} />
                <Text style={[styles.description]}>
                  Up to 80% savings in the USA
                </Text>
              </View>
              <View style={[styles.row, {gap: 10, alignItems: 'flex-start'}]}>
                <View style={styles.dot} />
                <Text style={[styles.description]}>
                  Use at over 68,000 pharmacies
                </Text>
              </View>
              <View style={[styles.row, {gap: 10, alignItems: 'flex-start'}]}>
                <View style={styles.dot} />
                <Text style={[styles.description]}>
                  incl. Walmart, CVS & Walgreens{' '}
                </Text>
              </View>
            </View>
            <Pressable
              style={[
                styles.actionButton,
                {marginLeft: 'auto', marginRight: 'auto'},
              ]}
              onPress={() => {
                navigation.navigate('Card');
              }}>
              <Text style={styles.actionButtonText}>Get Card</Text>
            </Pressable>
          </View>
        </View>
      </View>
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
    card: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.bg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border_color,
      position: 'relative',
    },
    bgIcon: {
      position: 'absolute',
      top: 0,
      right: 0,
      marginTop: 90,
      marginRight: -25,
    },
    heading: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      fontFamily: 'LeagueSpartanSemiBold',
    },
    dot: {
      height: 4,
      width: 4,
      backgroundColor: colors.text_gray,
      borderRadius: 50,
      marginTop: 10,
    },
    description: {
      fontSize: 14,
      fontFamily: 'LeagueSpartanRegular',
      fontWeight: '400',
      color: colors.text_gray,
      lineHeight: 20,
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
      color: colors.primary,
    },
  });

export default PrescriptionCard;
