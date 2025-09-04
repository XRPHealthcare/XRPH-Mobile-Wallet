import React, {useEffect} from 'react';

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import _ from 'lodash';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useStore from '../../../data/store';
import GradientText from '../../../components/GradientText';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import {useWithdrawStake} from '../../../utils/wallet.api';
import Countdown from 'react-countdown';
import GradientXRPH from '../../../components/GradientXRPH';
import {useNetInfo} from '@react-native-community/netinfo';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const StakeCard = props => {
  const netInfo = useNetInfo();
  const [withdrawLoading, setWithdrawLoading] = React.useState(false);
  let {theme, activeAccount} = useStore();
  const userWithdraw = useWithdrawStake();

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const calculateRemainingDuration = (startTime, duration) => {
    let DURATION_IN = 'seconds';
    // Calculate expiration date
    const completionDate = moment(startTime).add(duration, DURATION_IN);
    // Calculate remaining time
    const now = moment();
    const remainingTime = moment.duration(completionDate.diff(now));
    // Extract days, hours, and minutes
    const remainingMonths = remainingTime.months();
    const remainingDays = remainingTime.days();
    const remainingHours = remainingTime.hours();
    const remainingMinutes = remainingTime.minutes();
    const remainingSeconds = remainingTime.seconds();
    if (
      remainingMonths <= 0 &&
      remainingDays <= 0 &&
      remainingHours <= 0 &&
      remainingMinutes <= 0 &&
      remainingSeconds <= 0
    ) {
      return `Reward has arrived`;
    } else {
      if (remainingMinutes <= 0 && remainingSeconds > 0) {
        return `Reward is arriving in less than 1 minute`;
      } else {
        return `Reward is arriving in ${
          remainingMonths < 0 ? 0 : remainingMonths
        } months ${remainingDays < 0 ? 0 : remainingDays} days ${
          remainingHours < 0 ? 0 : remainingHours
        } hours & ${remainingMinutes < 0 ? 0 : remainingMinutes} minutes`;
      }
    }
  };

  const renderer = ({days, hours, minutes, completed}) => {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (completed) {
      // Render a completed state
      return (
        <Text
          style={[
            styles.desc,
            {color: theme === 'light' ? '#686868' : '#CCCCCC'},
          ]}>
          Reward has arrived
        </Text>
      );
    } else {
      // Render a countdown
      return minutes <= 0 ? (
        <Text
          style={[
            styles.desc,
            {color: theme === 'light' ? '#686868' : '#CCCCCC'},
          ]}>
          Reward is arriving in less than 1 minute
        </Text>
      ) : (
        <Text
          style={[
            styles.desc,
            {color: theme === 'light' ? '#686868' : '#CCCCCC'},
          ]}>
          Reward is arriving in {months} months {remainingDays} days {hours}{' '}
          hours & {minutes} minutes
        </Text>
      );
    }
  };

  const checkIsCompleted = stake => {
    if (
      calculateRemainingDuration(stake?.stakeDate, stake?.duration) ==
      'Reward has arrived'
    ) {
      return true;
    } else {
      return false;
    }
  };

  const withdrawStake = async stakeId => {
    setWithdrawLoading(true);
    if (stakeId) {
      try {
        await userWithdraw
          .mutateAsync({secret: {secret: activeAccount?.seed}, id: stakeId})
          .then(() => {
            props.setIsSuccessAlert(true);
            props.setErrorMsg('Your XRPH claimed successfully');
          });
        setWithdrawLoading(false);
      } catch (e) {
        console.log('------unstake-------', e);
        setWithdrawLoading(false);
        props.setIsErrorAlert(true);
        props.setErrorMsg(
          e.message || 'Something went wrong, please try again!',
        );
      }
    } else {
      setWithdrawLoading(false);
      props.setIsErrorAlert(true);
      props.setErrorMsg('Cannot find stake id, please try again!');
    }
  };

  return (
    <View key={props.idx}>
      <View
        style={[
          styles.stakedContainer,
          {backgroundColor: theme === 'dark' ? '#1A1A1A' : '#FBFBFB'},
        ]}>
        <View style={styles.flex}>
          <Text style={styles.stakedlabel}>Amount</Text>
          <GradientText
            colors={['#37C3A6', '#AF45EE']}
            style={styles.gradientStaked}>
            {props?.stake?.amount} XRPH
          </GradientText>
        </View>
        <View style={styles.flex}>
          <Text style={styles.stakedlabel}>Accumulated Reward</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Text style={[styles.gradientStaked, {color: '#1DAC77'}]}>
              {Number(props?.stake?.accumulativeReward)?.toFixed(2) || 0}
            </Text>
            <GradientXRPH
              colors={['#37C3A6', '#AF45EE']}
              style={styles.gradientStaked}>
              {' '}
              XRPH
            </GradientXRPH>
          </View>
        </View>
        <View style={styles.flex}>
          <Text style={styles.stakedlabel}>APR: {props?.stake?.apr}%</Text>
          <Text style={styles.stakedlabel}>
            {props?.stake?.stakeType == 0 ? '6 Months' : '12 Months'}
          </Text>
        </View>
        {props?.stake?.status != 'queued' ? (
          !props?.stake?.isCompleted && props?.stake?.isWithdrawn ? (
            <Text
              style={[
                styles.desc,
                {color: theme === 'light' ? '#686868' : '#ccc'},
              ]}>
              Stake Cancelled
            </Text>
          ) : props?.stake?.isCompleted && props?.stake?.isWithdrawn ? (
            <Text
              style={[
                styles.desc,
                {color: theme === 'light' ? '#686868' : '#ccc'},
              ]}>
              Reward Claimed
            </Text>
          ) : (
            <>
              <Countdown
                date={moment(props?.stake?.stakeDate).add(
                  props?.stake?.duration,
                  'seconds',
                )}
                key={props.idx}
                renderer={renderer}
              />
            </>
          )
        ) : (
          <Text
            style={[
              styles.desc,
              {color: theme === 'light' ? '#686868' : '#ccc'},
            ]}>
            Your transaction will be completed shortly.
          </Text>
        )}
        {!props?.stake?.isWithdrawn && props?.stake?.status == 'active' && (
          <View>
            {checkIsCompleted(props?.stake) ? (
              <LinearGradient
                colors={['#37C3A6', '#AF45EE']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.stakeButton}>
                {withdrawLoading ? (
                  <ActivityIndicator size={25} color="#fff" />
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      if (netInfo.isConnected) {
                        withdrawStake(props?.stake?.id);
                      } else {
                        props.setIsErrorAlert(true);
                        props.setErrorMsg('No internet connection');
                      }
                    }}>
                    <Text style={styles.stakeButtonText}>Claim Reward</Text>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={['#37C3A6', '#AF45EE']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.stakeButton}>
                <TouchableOpacity
                  // style={styles.unstakeButton}
                  onPress={() => {
                    if (netInfo.isConnected) {
                      props.setUnStakeId(props?.stake?.id);
                      props.toggleUnstake();
                    } else {
                      props.setIsErrorAlert(true);
                      props.setErrorMsg('No internet connection');
                    }
                  }}>
                  <Text style={styles.stakeButtonText}>Unstake</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styling = colors =>
  StyleSheet.create({
    flex: {
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    stakedlabel: {
      fontSize: 16,
      fontWeight: '400',
      color: colors.dark_text,
    },
    gradientStaked: {
      fontSize: 16,
      fontWeight: '600',
    },

    stakeButton: {
      borderRadius: 10,
      paddingVertical: 18,
      paddingHorizontal: 10,
      marginTop: 16,
    },
    stakeButtonText: {
      fontSize: 18,
      fontWeight: '500',
      color: '#fff',
      textAlign: 'center',
    },
    stakedContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      marginTop: 16,
      borderRadius: 10,
    },
    desc: {
      fontSize: 12,
      fontWeight: '400',
      marginTop: 22,
      marginBottom: 6,
      textAlign: 'center',
      backgroundColor: colors.bg,
      borderRadius: Platform.OS == 'ios' ? 8 : 4,
      paddingVertical: 6,
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

export default StakeCard;
