import React, {useCallback, useMemo, useRef} from 'react';

import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
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
import AlertIco from '../../../assets/img/alert.svg';
import AlertIcoW from '../../../assets/img/alert-w.svg';
import LinearGradient from 'react-native-linear-gradient';
import {useWithdrawStake} from '../../../utils/wallet.api';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const UnstakeSheet = props => {
  const bottomSheetRef = useRef(null);
  let {theme, activeAccount} = useStore();
  const [unstakeLoading, setUnstakeLoading] = React.useState(false);

  // variables
  const snapPoints = useMemo(() => [400, 520], []);
  const userWithdraw = useWithdrawStake();

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const renderBackdrop = useCallback(
    props => <BottomSheetBackdrop {...props} onPress={closeSheet} />,
    [],
  );

  const unstake = async () => {
    setUnstakeLoading(true);
    if (props?.unStakeId) {
      try {
        await userWithdraw
          .mutateAsync({
            secret: {secret: activeAccount?.seed},
            id: props?.unStakeId,
          })
          .then(() => {
            closeSheet();
            props.setIsSuccessAlert(true);
            props.setErrorMsg('Your XRPH unstaked successfully');
          });

        setUnstakeLoading(false);
      } catch (e) {
        console.log('------unstake-------', e);
        setUnstakeLoading(false);
        props.setIsErrorAlert(true);
        props.setErrorMsg(
          e.message || 'Something went wrong, please try again!',
        );
      }
    } else {
      setUnstakeLoading(false);
      props.setIsErrorAlert(true);
      props.setErrorMsg('Cannot find stake id, please try again!');
    }
  };

  React.useEffect(() => {
    if (props.unStakeOpen) {
      bottomSheetRef?.current?.expand();
    }
  }, [props.unStakeOpen]);

  const closeSheet = () => {
    props.setUnStakeOpen(false);
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
              Alert
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
            <AlertIcoW height={160} width={160} style={styles.alertIco} />
          ) : (
            <AlertIco height={160} width={160} style={styles.alertIco} />
          )}
          <View>
            <Text style={styles.heading}>Unstaking Alert</Text>
            <Text style={styles.desc}>
              Keep in mind that there will be a penalty on unstaking.
            </Text>
          </View>
          <LinearGradient
            colors={['#37C3A6', '#AF45EE']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.stakeButton}>
            {unstakeLoading ? (
              <ActivityIndicator size={25} color="#fff" />
            ) : (
              <TouchableOpacity onPress={unstake}>
                <Text style={styles.stakeButtonText}>Confirm Unstaking</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
          <TouchableOpacity style={styles.unstakeButton} onPress={closeSheet}>
            <Text style={styles.unstakeButtonText}>Cancel</Text>
          </TouchableOpacity>
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

export default UnstakeSheet;
