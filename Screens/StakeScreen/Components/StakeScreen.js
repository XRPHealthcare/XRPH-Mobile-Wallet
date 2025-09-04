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
  Pressable,
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
import ConfirmationModal from './ConfirmationModal';
import {useGetUserStakes, useStake} from '../../../utils/wallet.api';
import StakeInfo from './StakeInfo';
import {useNetInfo} from '@react-native-community/netinfo';
import MaintenanceAlert from '../../HomeScreen/Components/MaintenanceAlert';
import {
  ArrowBackDarkIcon,
  ArrowBackLightIcon,
} from '../../../assets/img/new-design';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const StakeScreen = ({route, navigation}) => {
  const netInfo = useNetInfo();
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
    limit: 1000,
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
    if (netInfo.isConnected) {
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
    } else {
      setIsErrorAlert(true);
      setErrorMsg('No internet connection');
      setStakeLoading(false);
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
              <View
                style={[
                  styles.flex,
                  {marginTop: 16, justifyContent: 'flex-start', gap: 26},
                ]}>
                <Pressable
                  onPress={() => {
                    navigation?.goBack();
                  }}>
                  {theme === 'dark' ? (
                    <ArrowBackDarkIcon />
                  ) : (
                    <ArrowBackLightIcon />
                  )}
                </Pressable>
                <Text style={styles.title}>Staking Info</Text>
              </View>
              <View style={styles.alert}>
                <Text style={styles.alertText}>
                  Due to the scarcity of XRPH tokens, staking is no longer
                  available. Existing stakers may continue until their current
                  period ends.
                </Text>
              </View>
              <Text style={[styles.heading]}>Stake XRPH - Earn XRPH</Text>
              <StakeInfo />

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
      fontSize: 18,
      fontWeight: '700',
      color: colors.dark_text,
    },
    user: {
      fontSize: 16,
      fontWeight: '400',
      textAlign: 'right',
    },
    heading: {
      fontSize: 16,
      fontWeight: '700',
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
      fontWeight: '600',
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
      fontWeight: '500',
      color: colors.dark_text,
    },
    inputContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    input: {
      fontSize: 14,
      fontWeight: '400',
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
      fontWeight: '500',
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
      fontWeight: '500',
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
      fontWeight: '400',
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
      fontWeight: '500',
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
      fontWeight: '500',
      color: '#fff',
      textAlign: 'center',
    },
    alert: {
      backgroundColor: '#ff0e0e',
      padding: 10,
      elevation: 10,
      borderRadius: 10,
      marginTop: 20,
    },
    alertText: {
      fontSize: 14,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: '#fff',
    },
  });

export default StakeScreen;
