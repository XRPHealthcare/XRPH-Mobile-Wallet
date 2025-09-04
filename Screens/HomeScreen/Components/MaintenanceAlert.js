import React from 'react';

import {Text, StyleSheet, View, Platform} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useStore from '../../../data/store';
import {dark, light} from '../../../assets/colors/colors';
import InfoIco from '../../../assets/img/info-alert.svg';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const MaintenanceAlert = props => {
  let {theme} = useStore();

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  return (
    <React.Fragment>
      <View
        style={[
          styles.wrapper,
          {
            backgroundColor:
              theme === 'dark' ? 'rgba(234, 179, 8, 0.11)' : '#FFFBF0',
          },
        ]}>
        <InfoIco width={24} height={24} />
        <View style={[styles.column]}>
          <Text
            style={[
              styles.title,
              {
                color: theme === 'dark' ? '#fff' : '#1A1A1A',
              },
            ]}>
            {props?.title || 'Service Disruption'}
          </Text>
          <Text
            style={[
              styles.description,
              {
                color: theme === 'dark' ? '#fff' : '#2F3F53',
              },
            ]}>
            {props?.msg || 'We’re working to resolve this. Check back soon.'}
          </Text>
        </View>
      </View>
    </React.Fragment>
  );
};

const styling = colors =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      marginTop: 16,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 0.5,
      borderColor: '#EAB308',
      gap: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
      width: '90%',
    },
    title: {
      fontSize: 14,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: '700',
    },
    description: {
      fontSize: 12,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? 'regular' : '400',
    },
  });

export default MaintenanceAlert;
