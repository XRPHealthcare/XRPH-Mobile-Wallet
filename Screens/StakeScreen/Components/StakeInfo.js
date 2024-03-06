import React from 'react';

import {StyleSheet, View, Text, Platform} from 'react-native';
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
import {
  useGetDailyRewards,
  useGetTotalStake,
  useGetUserRewards,
  useGetUserTotalStakes,
} from '../../../utils/wallet.api';
import ArrowUp from '../../../assets/img/arrow-up.svg';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const StakeInfo = () => {
  let {theme, activeAccount} = useStore();

  const {
    data: userTotalStaked,
    isLoading: userTotalStakedLoading,
    refetch: userStakeRefetch,
  } = useGetUserTotalStakes(activeAccount?.classicAddress);

  const {
    data: userRewards,
    isLoading: userRewardsLoading,
    refetch: userRewardsRefetch,
  } = useGetUserRewards(activeAccount?.classicAddress);

  const {
    data: dailyRewards,
    isLoading: userDailyLoading,
    refetch: userDailyRewardsRefetch,
  } = useGetDailyRewards(activeAccount?.classicAddress);

  const {
    data: totalStaked,
    isLoading: totalStakeLoading,
    refetch: totalStakeRefetch,
  } = useGetTotalStake();

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  React.useEffect(() => {
    userStakeRefetch();
    userRewardsRefetch();
    userDailyRewardsRefetch();
    totalStakeRefetch();
  }, [activeAccount]);

  return (
    <React.Fragment>
      <LinearGradient
        colors={['#37C3A6', '#AF45EE']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.linearGradient}>
        <View style={styles.stakeInfoCard}>
          <Text style={styles.stakingInfoCardHeading}>Staking Info</Text>
          <View style={styles.flex}>
            <View>
              <Text style={styles.stakedlabel}>My Stake</Text>
              <GradientText
                colors={['#37C3A6', '#AF45EE']}
                style={styles.gradientStaked}>
                {userTotalStaked?.stakes?.totalAmount?.toFixed(2) || 0} XRPH
              </GradientText>
            </View>
            <View style={{textAlign: 'right'}}>
              <Text style={styles.totalStakedLabel}>Total Staked</Text>
              <GradientText
                colors={['#37C3A6', '#AF45EE']}
                style={styles.gradientStakedLeft}>
                {totalStaked?.totalAmount?.toFixed(2) || 0} XRPH
              </GradientText>
            </View>
          </View>
          <View style={styles.flex}>
            <View>
              <Text style={styles.stakedlabel}>Rewards Per Day</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text style={[styles.gradientStaked, {color: '#1DAC77'}]}>
                  {dailyRewards?.rewardsClaimable > 0 ? '+' : ''}
                  {dailyRewards?.rewardsClaimable?.toFixed(2) || 0}
                </Text>
                <GradientText
                  colors={['#37C3A6', '#AF45EE']}
                  style={styles.gradientStaked}>
                  {' '}
                  XRPH{' '}
                </GradientText>
                {dailyRewards?.rewardsClaimable > 0 && (
                  <ArrowUp height={14} width={14} />
                )}
              </View>
            </View>
            <View style={{textAlign: 'right'}}>
              <Text style={styles.totalStakedLabel}>Rewards Claimed</Text>
              <GradientText
                colors={['#37C3A6', '#AF45EE']}
                style={styles.gradientStakedLeft}>
                {Number(userRewards?.rewardsClaimed)?.toFixed(2) || 0} XRPH
              </GradientText>
            </View>
          </View>
          <View style={styles.stakingInfoCardDesc}>
            <Text
              style={[
                styles.stakingInfoCardDescText,
                {
                  fontWeight: 400,
                  color: theme === 'dark' ? '#ccc' : '#686868',
                },
              ]}>
              Claimable Rewards
            </Text>
            <Text
              style={[
                styles.stakingInfoCardDescText,
                {
                  fontWeight: 500,
                  color: theme === 'dark' ? '#fff' : '#686868',
                },
              ]}>
              {userRewards?.rewardsClaimable?.toFixed(2) || 0} XRPH
            </Text>
          </View>
        </View>
      </LinearGradient>
    </React.Fragment>
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
      fontWeight: Platform.OS == 'ios' ? 'normal' : '400',
      color: colors.dark_gray,
    },
    gradientStaked: {
      fontSize: 16,
      fontWeight: Platform.OS == 'ios' ? 'bold' : '600',
    },
    gradientStakedLeft: {
      fontSize: 16,
      fontWeight: Platform.OS == 'ios' ? 'bold' : '600',
      textAlign: 'right',
    },
    totalStakedLabel: {
      fontSize: 16,
      fontWeight: Platform.OS == 'ios' ? 'normal' : '400',
      color: colors.dark_gray,
      textAlign: 'right',
    },
    totalStaked: {
      fontSize: 16,
      fontWeight: Platform.OS == 'ios' ? 'bold' : '600',
      color: colors.dark_gray,
      textAlign: 'right',
    },

    stakeInfoCard: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.dark_bg,
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: colors.light_gray_bg,
    },
    stakingInfoCardHeading: {
      fontSize: 16,
      fontWeight: Platform.OS == 'ios' ? 'bold' : '500',
      color: colors.dark_text,
    },
    stakingInfoCardDesc: {
      marginTop: 16,
      borderRadius: 4,
      backgroundColor: colors.light_gray_bg,
      paddingVertical: 6,
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },
    stakingInfoCardDescText: {
      fontSize: 12,
    },
    linearGradient: {
      width: '100%',
      padding: 2,
      borderRadius: 10,
      marginTop: 6,
    },
  });

export default StakeInfo;
