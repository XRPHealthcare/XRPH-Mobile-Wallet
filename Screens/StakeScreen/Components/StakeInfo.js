import React from 'react';

import {StyleSheet, View, Text, Pressable} from 'react-native';
import _ from 'lodash';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useStore from '../../../data/store';
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

const StakeInfo = ({home, navigation}) => {
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
      <View style={styles.stakeInfoCard}>
        <View style={[styles.flex, {marginTop: 0}]}>
          <View>
            <Text style={styles.stakedlabel}>My Stake</Text>
            <Text style={styles.stakeValue}>
              {userTotalStaked?.stakes?.totalAmount?.toFixed(2) || 0} XRPH
            </Text>
          </View>
          <View style={{textAlign: 'right'}}>
            <Text style={[styles.stakedlabel, {textAlign: 'right'}]}>
              Total Staked
            </Text>
            <Text style={[styles.stakeValue]}>
              {totalStaked?.totalAmount?.toFixed(2) || 0} XRPH
            </Text>
          </View>
        </View>
        <View style={styles.flex}>
          <View>
            <Text style={styles.stakedlabel}>Rewards Per Day</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                marginTop: 6,
              }}>
              <Text style={[styles.gradientStaked, {color: '#03F982'}]}>
                {dailyRewards?.rewardsClaimable > 0 ? '+' : ''}
                {dailyRewards?.rewardsClaimable?.toFixed(2) || 0}
              </Text>
              <Text
                style={[styles.stakeValue, {color: colors.text, marginTop: 0}]}>
                XRPH{' '}
              </Text>
              {dailyRewards?.rewardsClaimable > 0 && (
                <ArrowUp height={14} width={14} />
              )}
            </View>
          </View>
          <View style={{textAlign: 'right'}}>
            <Text style={[styles.stakedlabel, {textAlign: 'right'}]}>
              Rewards Claimed
            </Text>
            <Text
              style={[
                styles.stakeValue,
                {textAlign: 'right', color: colors.text},
              ]}>
              {~~Number(userRewards?.rewardsClaimed)?.toFixed(2) || 0} XRPH
            </Text>
          </View>
        </View>
        {home ? (
          <Pressable
            style={[styles.actionButton]}
            onPress={() => {
              navigation.navigate('Stake Screen');
            }}>
            <Text style={[styles.actionButtonText]}>View Stake</Text>
          </Pressable>
        ) : (
          <View style={styles.stakingInfoCardDesc}>
            <Text
              style={[
                styles.stakingInfoCardDescText,
                {
                  fontWeight: '400',
                  color: theme === 'dark' ? '#ccc' : '#686868',
                },
              ]}>
              Claimable Rewards
            </Text>
            <Text
              style={[
                styles.stakingInfoCardDescText,
                {
                  fontWeight: '500',
                  color: theme === 'dark' ? '#fff' : '#686868',
                },
              ]}>
              {userRewards?.rewardsClaimable?.toFixed(2) || 0} XRPH
            </Text>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

const styling = colors =>
  StyleSheet.create({
    flex: {
      marginTop: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    stakedlabel: {
      fontSize: 16,
      fontWeight: '400',
      color: colors.text_gray,
    },
    stakeValue: {
      marginTop: 6,
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
      fontFamily: 'LeagueSpartanSemiBold',
    },
    gradientStaked: {
      fontSize: 16,
      fontWeight: '600',
    },

    totalStaked: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.dark_gray,
      textAlign: 'right',
    },

    stakeInfoCard: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: colors.bg,
      borderRadius: 8,
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
      width: 86,
      marginLeft: 'auto',
      marginRight: 'auto',
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

export default StakeInfo;
