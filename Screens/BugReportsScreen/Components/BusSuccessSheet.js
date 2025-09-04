import React, {useCallback, useMemo, useRef} from 'react';

import {Text, StyleSheet, View, TouchableOpacity, Platform} from 'react-native';
import useStore from '../../../data/store';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import CustomBackground from '../../HomeScreen/Components/CustomBackground';
import CheckIco from '../../../assets/img/check.svg';
import CheckIcoW from '../../../assets/img/check-w.svg';
import LinearGradient from 'react-native-linear-gradient';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const BugSuccessSheet = props => {
  const bottomSheetRef = useRef(null);
  let {theme} = useStore();

  // variables
  const snapPoints = useMemo(() => [309, 510], []);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const renderBackdrop = useCallback(
    props => <BottomSheetBackdrop {...props} onPress={closeSheet} />,
    [],
  );

  React.useEffect(() => {
    if (props.isSuccessSheet) {
      bottomSheetRef?.current?.expand();
    }
  }, [props.isSuccessSheet]);

  const closeSheet = () => {
    props.setIsSuccessSheet(false);
    bottomSheetRef?.current?.close();
  };

  return (
    <React.Fragment>
      <BottomSheet
        style={{
          borderRadius: 15,
          overflow: 'hidden',
        }}
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundComponent={CustomBackground}>
        <View style={styles.bottomWrapper}>
          <View style={styles.bottomHeader}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.text,
              }}>
              Bug Reported
            </Text>
            <TouchableOpacity onPress={closeSheet}>
              <MaterialCommunityIcons
                name={'close'}
                color={colors.text}
                size={30}
              />
            </TouchableOpacity>
          </View>
          {theme === 'dark' ? (
            <CheckIcoW height={160} width={160} style={styles.alertIco} />
          ) : (
            <CheckIco height={160} width={160} style={styles.alertIco} />
          )}
          <View>
            <Text style={styles.heading}>Thanks for reporting issue</Text>
            <Text style={styles.desc}>
              Thanks for reporting this issue, we will aim to resolve the issue
              within 24 hours.{' '}
            </Text>
          </View>
          <LinearGradient
            colors={['#37C3A6', '#AF45EE']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.stakeButton}>
            <TouchableOpacity onPress={closeSheet}>
              <Text style={styles.stakeButtonText}>Done</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </BottomSheet>
    </React.Fragment>
  );
};

const styling = colors =>
  StyleSheet.create({
    bottomWrapper: {
      paddingLeft: 20,
      paddingRight: 20,
    },
    bottomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    alertIco: {
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: 32,
    },
    heading: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.dark_text,
      marginTop: 32,
      textAlign: 'center',
    },
    desc: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.dark_gray,
      marginTop: 12,
      textAlign: 'center',
      maxWidth: 320,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    stakeButton: {
      borderRadius: 10,
      paddingVertical: 18,
      paddingHorizontal: 10,
      marginTop: 32,
    },
    stakeButtonText: {
      fontSize: 18,
      fontWeight: '500',
      color: '#fff',
      textAlign: 'center',
    },
    unstakeButton: {
      marginTop: 16,
      borderRadius: 10,
      paddingVertical: 18,
      paddingHorizontal: 10,
      backgroundColor: colors.light_gray,
    },
    unstakeButtonText: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.text,
      textAlign: 'center',
    },
  });

export default BugSuccessSheet;
