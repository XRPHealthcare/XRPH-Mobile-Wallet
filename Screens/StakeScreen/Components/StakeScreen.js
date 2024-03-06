import React, {useState} from 'react';

import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import _ from 'lodash';
import {GestureHandlerRootView, ScrollView} from 'react-native-gesture-handler';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useStore from '../../../data/store';
import LinearGradient from 'react-native-linear-gradient';
import UnstakeSheet from './UnstakeSheet';
import Alert from '../../../components/Alert';
import StakeCard from './StakeCard';
import Navbar from '../../../components/Navbar';
import ConfirmationModal from './ConfirmationModal';
import {useGetUserStakes, useStake} from '../../../utils/wallet.api';
import StakeInfo from './StakeInfo';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const StakeScreen = ({route, navigation}) => {
  const [unStakeId, setUnStakeId] = useState('');
  const [activeStake, setActiveStake] = useState(0);
  const [erorrMsg, setErrorMsg] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [availableXRPH, setAvailableXRPH] = useState(0);
  const [stakeLoading, setStakeLoading] = useState(false);
  const [unStakeOpen, setUnStakeOpen] = useState(false);
  const [isErrorAlert, setIsErrorAlert] = useState(false);
  const [isSuccessAlert, setIsSuccessAlert] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [isInputFocued, setInputFocused] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  let {theme, activeAccount, accountBalances} = useStore();

  const useStakeNow = useStake();

  const {data: staked, isLoading: stakedLoading} = useGetUserStakes({
    limit: 50,
    offset: 0,
    address: activeAccount?.classicAddress,
  });

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const toggleUnstake = () => {
    setUnStakeOpen(!unStakeOpen);
  };

  const stakeNow = async () => {
    setIsConfirmModal(false);
    setStakeLoading(true);
    let payload = {
      amount: Number(stakeAmount),
      address: activeAccount?.classicAddress,
      secret: activeAccount?.seed,
      stakeType: activeStake,
    };
    if (!payload?.address || !payload?.secret) {
      setIsErrorAlert(true);
      setErrorMsg('Please login again');
      setStakeLoading(false);
    } else if (payload?.amount > Number(availableXRPH)) {
      setIsErrorAlert(true);
      setErrorMsg('Staked amount cannot be greater than available balance!');
      setStakeLoading(false);
    } else if (payload?.amount < 50) {
      setIsErrorAlert(true);
      setErrorMsg('Minimum stake is 50 XRPH');
      setStakeLoading(false);
    } else {
      try {
        await useStakeNow.mutateAsync(payload).then(() => {
          getAvailableXRPH();
          setErrorMsg(stakeAmount + ' XRPH staked successfully');
          setStakeAmount('');
          setIsSuccessAlert(true);
        });
        setStakeLoading(false);
      } catch (e) {
        console.log('-------stake error-----', e);
        setIsErrorAlert(true);
        setErrorMsg(e.message || 'Something went wrong, please try again!');
        setStakeLoading(false);
      }
    }
  };

  const getAvailableXRPH = () => {
    let xrph = accountBalances?.find(temp => temp.currency === 'XRPH');
    if (xrph) {
      setAvailableXRPH(xrph?.value);
    } else {
      setAvailableXRPH(0);
    }
  };

  React.useEffect(() => {
    getAvailableXRPH();
  }, [accountBalances]);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />
        <View style={styles.bg}>
          <ScrollView
            automaticallyAdjustKeyboardInsets={true}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
            }}>
            <TouchableOpacity
              onPress={() => setInputFocused(false)}
              activeOpacity={1}>
              <View style={[styles.flex, {marginTop: 16}]}>
                <Image
                  source={require('../../../assets/img/hero.png')}
                  style={styles.logo}
                />
                <View>
                  <Text style={styles.title}>Staking</Text>
                  <Text
                    style={[
                      styles.user,
                      {color: theme === 'dark' ? '#1DAC77' : '#AF45EE'},
                    ]}>
                    {activeAccount?.name}
                  </Text>
                </View>
              </View>
              <Text style={styles.heading}>Stake XRPH - Earn XRPH</Text>
              <StakeInfo />
              <LinearGradient
                colors={
                  isInputFocued
                    ? ['#37C3A6', '#AF45EE']
                    : [colors.bg, colors.bg]
                }
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.linearGradient}>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor:
                        theme === 'light' && !isInputFocued
                          ? colors.light_gray_bg
                          : colors.dark_bg,
                    },
                  ]}>
                  <Text style={styles.inputLabel}>Amount to Stake</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor={colors.dark_gray}
                      value={stakeAmount}
                      onChangeText={e => setStakeAmount(e)}
                      keyboardType={
                        Platform.OS === 'ios' ? 'number-pad' : 'decimal-pad'
                      }
                      onFocus={() => {
                        setIsKeyboardVisible(true);
                        setInputFocused(true);
                      }}
                      onBlur={() => {
                        setIsKeyboardVisible(false);
                        // setInputFocused(false);
                      }}
                      returnKeyType={'done'}
                    />
                    <LinearGradient
                      colors={
                        isInputFocued
                          ? ['#37C3A6', '#AF45EE']
                          : theme === 'dark'
                          ? ['#222', '#222']
                          : ['#CFCFCF', '#CFCFCF']
                      }
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={styles.max}>
                      <TouchableOpacity
                        onPress={() => {
                          setInputFocused(true);
                          setStakeAmount(availableXRPH);
                        }}>
                        <Text style={styles.maxText}>MAX</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                </View>
              </LinearGradient>
              <TouchableOpacity onPress={() => setActiveStake(0)}>
                <LinearGradient
                  colors={
                    activeStake == 0
                      ? ['#37C3A6', '#AF45EE']
                      : [colors.light_gray_bg, colors.light_gray_bg]
                  }
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.linearGradient}>
                  <View style={styles.stakeCard}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 20,
                        width: 20,
                        padding: 10,
                        borderColor: activeStake == 0 ? '#A254E8' : '#E0E0E0',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderRadius: 50,
                      }}>
                      <View
                        style={{
                          height: 15,
                          width: 15,
                          backgroundColor:
                            activeStake == 0 ? '#A254E8' : '#E0E0E0',
                          borderRadius: 50,
                        }}></View>
                    </View>
                    <Text
                      style={
                        activeStake == 0
                          ? styles.activeDuration
                          : styles.duration
                      }>
                      6 Months
                    </Text>
                    <View style={styles.rewardFlex}>
                      <Text style={styles.rewardText}>Fixed APR 20%</Text>
                      <Text style={styles.rewardText}>Penalty Rate 10%</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveStake(1)}>
                <LinearGradient
                  colors={
                    activeStake == 1
                      ? ['#37C3A6', '#AF45EE']
                      : [colors.light_gray_bg, colors.light_gray_bg]
                  }
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.linearGradient}>
                  <View style={styles.stakeCard}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 20,
                        width: 20,
                        padding: 10,
                        borderColor: activeStake == 1 ? '#A254E8' : '#E0E0E0',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderRadius: 50,
                      }}>
                      <View
                        style={{
                          height: 15,
                          width: 15,
                          backgroundColor:
                            activeStake == 1 ? '#A254E8' : '#E0E0E0',
                          borderRadius: 50,
                        }}></View>
                    </View>
                    <Text
                      style={
                        activeStake == 1
                          ? styles.activeDuration
                          : styles.duration
                      }>
                      12 Months
                    </Text>
                    <View style={styles.rewardFlex}>
                      <Text style={styles.rewardText}>Fixed APR 25%</Text>
                      <Text style={styles.rewardText}>Penalty Rate 12.5%</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              <View style={styles.availableAmount}>
                <Text style={styles.inputLabel}>Available Amount</Text>
                <Text style={styles.totalStaked}>
                  {Number(availableXRPH)?.toFixed(2)} XRPH
                </Text>
              </View>
              <LinearGradient
                colors={['#37C3A6', '#AF45EE']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.stakeButton}>
                {stakeLoading ? (
                  <ActivityIndicator color="#fff" size={25} />
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setIsConfirmModal(true);
                    }}>
                    <Text style={styles.stakeButtonText}>Stake Now</Text>
                  </TouchableOpacity>
                )}
              </LinearGradient>
              {stakedLoading && !staked?.length ? (
                <View style={{marginTop: 20}}>
                  <ActivityIndicator size={30} />
                </View>
              ) : (
                staked?.length > 0 && (
                  <View style={{marginBottom: 16}}>
                    <Text style={styles.heading}>Staked Amount</Text>
                    {staked?.map((stake, idx) => (
                      <StakeCard
                        key={idx}
                        stake={stake}
                        toggleUnstake={toggleUnstake}
                        setUnStakeId={setUnStakeId}
                        setIsErrorAlert={setIsErrorAlert}
                        setIsSuccessAlert={setIsSuccessAlert}
                        setErrorMsg={setErrorMsg}
                      />
                    ))}
                  </View>
                )
              )}
            </TouchableOpacity>
          </ScrollView>
          <ConfirmationModal
            isConfirmModal={isConfirmModal}
            setIsConfirmModal={setIsConfirmModal}
            stakeNow={stakeNow}
          />
          <UnstakeSheet
            unStakeId={unStakeId}
            unStakeOpen={unStakeOpen}
            setUnStakeOpen={setUnStakeOpen}
            setIsErrorAlert={setIsErrorAlert}
            setIsSuccessAlert={setIsSuccessAlert}
            setErrorMsg={setErrorMsg}
          />
          {!unStakeOpen && !isKeyboardVisible && (
            <Navbar activeIcon="stake" navigation={navigation} />
          )}
        </View>
        <Alert
          isOpen={isErrorAlert ? isErrorAlert : isSuccessAlert}
          type={isErrorAlert ? 'error' : 'success'}
          message={erorrMsg}
          icon={isErrorAlert ? 'close' : 'check'}
          setIsOpen={isErrorAlert ? setIsErrorAlert : setIsSuccessAlert}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styling = colors =>
  StyleSheet.create({
    safeView: {
      backgroundColor: colors.bg,
    },
    bg: {
      backgroundColor: colors.bg,
      // alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
    },

    logo: {
      height: 48,
      width: 48,
    },
    title: {
      fontSize: 16,
      fontWeight: Platform.OS == 'ios' ? 'bold' : '600',
      color: colors.dark_text,
      textAlign: 'right',
    },
    user: {
      fontSize: 16,
      fontWeight: Platform.OS == 'ios' ? 'bold' : '400',
      textAlign: 'right',
    },
    heading: {
      fontSize: 16,
      fontWeight: Platform.OS == 'ios' ? 'bold' : '700',
      color: colors.dark_text,
      marginTop: 32,
    },
    flex: {
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    totalStaked: {
      fontSize: 16,
      fontWeight: Platform.OS == 'ios' ? 'bold' : '600',
      color: colors.dark_gray,
      textAlign: 'right',
    },
    inputWrapper: {
      backgroundColor: colors.dark_bg,
      paddingHorizontal: 19,
      paddingVertical: 15,
      borderRadius: 8,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: Platform.OS == 'ios' ? 'normal' : '500',
      color: colors.dark_text,
    },
    inputContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    input: {
      fontSize: 14,
      fontWeight: Platform.OS == 'ios' ? 'normal' : '400',
      color: colors.dark_gray,
      padding: 0,
      width: '100%',
      maxWidth: 220,
    },
    max: {
      height: 28,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 4,
    },
    maxText: {
      fontSize: 14,
      fontWeight: Platform.OS == 'ios' ? 'normal' : '500',
      color: '#fff',
    },

    stakeCard: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.dark_bg,
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: colors.light_gray_border,
    },
    duration: {
      fontSize: 16,
      fontWeight: Platform.OS == 'ios' ? 'normal' : '500',
      color: colors.dark_gray,
    },
    rewardFlex: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 6,
    },
    rewardText: {
      fontSize: 14,
      fontWeight: Platform.OS == 'ios' ? 'normal' : '400',
      color: colors.dark_gray,
    },
    linearGradient: {
      padding: 2,
      borderRadius: 10,
      marginTop: 6,
    },
    activeDuration: {
      marginTop: 6,
      fontSize: 16,
      fontWeight: Platform.OS == 'ios' ? 'normal' : '500',
      color: colors.dark_text,
    },
    availableAmount: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 16,
      paddingVertical: 16,
      borderBottomColor: colors.light_gray_bg,
      borderBottomWidth: 3,
      borderStyle: 'solid',
    },
    stakeButton: {
      borderRadius: 10,
      paddingVertical: 18,
      paddingHorizontal: 10,
      marginTop: 16,
    },
    stakeButtonText: {
      fontSize: 18,
      fontWeight: Platform.OS == 'ios' ? 'bold' : '500',
      color: '#fff',
      textAlign: 'center',
    },
  });

export default StakeScreen;
