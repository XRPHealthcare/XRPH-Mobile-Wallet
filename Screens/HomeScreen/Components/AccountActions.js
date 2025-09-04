import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNetInfo} from '@react-native-community/netinfo';
import React, {useRef} from 'react';
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RBSheet from 'react-native-raw-bottom-sheet';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {dark, light} from '../../../assets/colors/colors';
import ArrowRecD from '../../../assets/img/arrow-receive-d.svg';
import ArrowRec from '../../../assets/img/arrow-receive.svg';
import ArrowSendD from '../../../assets/img/arrow-send-d.svg';
import ArrowSend from '../../../assets/img/arrow-send.svg';
import {
  EuroDarkIcon,
  EuroLightIcon,
  GbpDarkIcon,
  GbpLightIcon,
  LogoBgIcon,
  LogoIcon,
  SelectChevDarkIcon,
  SelectChevLightIcon,
  UsdDarkIcon,
  UsdLightIcon,
} from '../../../assets/img/new-design';
import Success from '../../../components/Success';
import useStore from '../../../data/store';
import MyAccounts from './MyAccounts';

// const colors = light; // eventually put this in state
AntDesign.loadFont();
FontAwesome.loadFont();
Feather.loadFont();
MaterialCommunityIcons.loadFont();

const AccountActions = props => {
  console.log('account actions called from', props?.home);

  const bottomSheetRef = useRef(null);
  const netInfo = useNetInfo();
  let {
    activeAccount,
    theme,
    totalBalanceCurrency,
    hepticOptions,
    stakingBalances,
  } = useStore();
  const setTotalBalanceCurrency = useStore(
    state => state.setTotalBalanceCurrency,
  );
  let [copiedModalOpen, setCopiedModalOpen] = React.useState(false);
  let [cantSendModalOpen, setCantSendModalOpen] = React.useState(false);
  let [myAccountsOpen, setMyAccountsOpen] = React.useState(false);
  let [isCurrencyOpen, setIsCurrencyOpen] = React.useState(false);
  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors, theme);
  const currencies = ['USD', 'EUR', 'GBP'];

  const openSendModal = () => {
    if (!netInfo.isConnected) {
      props?.setErrorAlert(true);
      props?.setErrorMsg('No internet connection');
    } else {
      if (activeAccount.balances.length > 0) {
        props.navigation.navigate('Send Screen');
      } else {
        // props.setSendModalOpen(true); // open it only for test purpose, if your account is unfunded.
        setCantSendModalOpen(true);
        setTimeout(() => {
          setCantSendModalOpen(false);
        }, 2000);
      }
    }
  };

  const getCurrency =
    totalBalanceCurrency === 'USD'
      ? 'USD'
      : totalBalanceCurrency === 'EUR'
        ? 'EUR'
        : 'GBP';

  const getCurrencySymbol =
    totalBalanceCurrency === 'USD'
      ? '$'
      : totalBalanceCurrency === 'EUR'
        ? '€'
        : '£';

  const findCurrencyIco = currency => {
    const iconMap = {
      USD: theme === 'dark' ? <UsdDarkIcon /> : <UsdLightIcon />,
      EUR: theme === 'dark' ? <EuroDarkIcon /> : <EuroLightIcon />,
      GBP: theme === 'dark' ? <GbpDarkIcon /> : <GbpLightIcon />,
    };
    return iconMap[currency];
  };

  const getStakingBalance = () => {
    let stakingBalance = 0;
    let currentStakeInfo = stakingBalances?.find(
      item => item?.classicAddress === activeAccount?.classicAddress,
    );
    let tempBnlc = currentStakeInfo?.stakingBalance?.stakeInCurrency?.find(
      item => item?.currency?.toUpperCase() === totalBalanceCurrency,
    );

    if (tempBnlc) {
      stakingBalance = Number(tempBnlc?.totalStakes);
    }
    if (props?.home) {
      return Number(stakingBalance);
    } else return 0;
  };

  const getPercentage = name => {
    const walletBalance =
      Number(activeAccount?.totalBalances?.[totalBalanceCurrency]) || 0;
    const stakingBalance = getStakingBalance();
    const totalBalance = walletBalance + stakingBalance;
    if (name === 'wallet') {
      const walletBalancePercentage = (walletBalance / totalBalance) * 100;
      return walletBalancePercentage;
    } else {
      const stakingBalancePercentage = (stakingBalance / totalBalance) * 100;
      return stakingBalancePercentage;
    }
  };
  const closeSheet = () => {
    setIsCurrencyOpen(false);
    bottomSheetRef?.current?.close();
  };

  const rbSheetStyles = {
    container: {
      backgroundColor: colors.bg,
      paddingVertical: 32,
      paddingHorizontal: 20,
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
    },
  };
  React.useEffect(() => {
    if (isCurrencyOpen) {
      bottomSheetRef?.current?.open();
    } else {
      bottomSheetRef?.current?.close();
    }
  }, [isCurrencyOpen]);

  return (
    <React.Fragment>
      <ImageBackground
        source={
          theme === 'dark'
            ? require('../../../assets/img/new-design/hero_bg_dark.png')
            : require('../../../assets/img/new-design/hero_bg_light.png')
        }
        imageStyle={{borderBottomRightRadius: 32, borderBottomLeftRadius: 32}}
        style={styles.heroCard}>
        {/* BG Image Logo */}
        <LogoBgIcon style={styles.heroBgLogo} />
        <View style={[styles.row, {justifyContent: 'space-between'}]}>
          <View
            style={[
              styles.row,
              {
                gap: 8,
                alignItems: 'center',
              },
            ]}>
            <LogoIcon height={32} width={30} />
            <Pressable
              onPress={() => {
                setMyAccountsOpen(true);
              }}
              style={[styles.column]}>
              <Text style={[styles.userName]}>{activeAccount?.name}</Text>
              <View style={[styles.row, {gap: 16, alignItems: 'center'}]}>
                <Text style={[styles.userWallet]}>
                  {activeAccount?.classicAddress?.slice(0, 5) +
                    '*****' +
                    activeAccount?.classicAddress?.slice(-4)}
                </Text>
                {/* <Pressable
                  onPress={() => {
                    setMyAccountsOpen(true);
                  }}> */}
                <Feather
                  name={'chevron-down'}
                  size={24}
                  color={theme === 'dark' ? '#f8f8f8' : '#292D32'}
                />
                {/* </Pressable> */}
              </View>
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              props.navigation.navigate('Transactions');
            }}
            style={[styles.row, {gap: 4}]}>
            <Feather name="rotate-ccw" size={14} color={colors.primary} />
            <Text style={styles.history}>History</Text>
          </Pressable>
        </View>
        <Text
          style={[
            styles.accountName,
            {
              marginTop: 34,
              textAlign: props?.home ? 'left' : 'center',
            },
          ]}>
          Total Balance
        </Text>
        <View
          style={[
            props?.home ? styles.row : styles.column,
            {
              justifyContent: 'space-between',
              alignItems: props?.home ? 'center' : 'center',
            },
          ]}>
          <Text style={styles.accountBalance}>
            {getCurrencySymbol}
            {(
              Number(activeAccount?.totalBalances?.[totalBalanceCurrency]) +
              Number(getStakingBalance())
            )?.toLocaleString(undefined, {
              maximumFractionDigits: 6,
            }) || 0}
          </Text>
          <Pressable
            style={[styles.row, {gap: 4, marginTop: 10, marginRight: 10}]}
            onPress={() => {
              setIsCurrencyOpen(true);
            }}>
            <Text style={[styles.selectedCurrency]}>
              {totalBalanceCurrency}
            </Text>
            <View style={[styles.column]}>
              {theme === 'dark' ? (
                <SelectChevDarkIcon height={14} />
              ) : (
                <SelectChevLightIcon height={14} />
              )}
            </View>
          </Pressable>
        </View>
        {props?.home && (
          <>
            <Text style={[styles.heading, {marginTop: 34}]}>Portfolio</Text>
            <View
              style={[
                styles.row,
                {justifyContent: 'space-between', marginTop: 14},
              ]}>
              <Text style={[styles.label, {color: '#8E42D1'}]}>
                Wallet Balance
              </Text>
              {props?.isStaking && (
                <Text style={[styles.label, {color: '#4FAE97'}]}>
                  Staking Balance
                </Text>
              )}
            </View>
            <View
              style={[
                styles.row,
                {justifyContent: 'space-between', marginTop: 4},
              ]}>
              <Text style={[styles.value]}>
                {Number(activeAccount?.totalBalances?.[totalBalanceCurrency]) <
                0
                  ? 0
                  : activeAccount?.totalBalances?.[totalBalanceCurrency] ||
                    0}{' '}
                {getCurrency}
              </Text>
              {props?.isStaking && (
                <Text style={[styles.value]}>
                  {getStakingBalance()?.toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}{' '}
                  {getCurrency}
                </Text>
              )}
            </View>
            <View style={[styles.row, {gap: 2, marginTop: 14}]}>
              <View
                style={[
                  styles.progress,
                  {
                    backgroundColor: '#8E42D1',
                    width: getPercentage('wallet') + '%',
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                  },
                ]}
              />
              <View
                style={[
                  styles.progress,
                  {
                    backgroundColor: '#4FAE97',
                    width: getPercentage('staking') + '%',
                    borderTopRightRadius: 8,
                    borderBottomRightRadius: 8,
                  },
                ]}
              />
            </View>
          </>
        )}
        <View style={[styles.actionButtons, {marginTop: 24}]}>
          <TouchableOpacity style={styles.actionButton} onPress={openSendModal}>
            <View style={styles.buttonWrapper}>
              {theme === 'dark' ? <ArrowSendD /> : <ArrowSend />}
              <Text style={styles.actionButtonText}>Send</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (!netInfo.isConnected) {
                props?.setErrorAlert(true);
                props?.setErrorMsg('No internet connection');
              } else {
                props.setReceiveModalOpen(true);
              }
            }}>
            <View style={styles.buttonWrapper}>
              {theme === 'dark' ? <ArrowRecD /> : <ArrowRec />}

              <Text style={styles.actionButtonText}>Receive</Text>
            </View>
          </TouchableOpacity>
          {/* <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (!netInfo.isConnected) {
              props?.setErrorAlert(true);
              props?.setErrorMsg('No internet connection');
            } else {
              Linking?.openURL(
                `https://swap.xrphealthcare.com/?wallet=${activeAccount?.classicAddress}`,
              );
            }
          }}>
          <View style={styles.buttonWrapper}>
            {theme === 'dark' ? <ArrowSwapD /> : <ArrowSwap />}

            <Text style={styles.actionButtonText}>Swap</Text>
          </View>
        </TouchableOpacity> */}
        </View>
      </ImageBackground>
      <Image
        source={require('../../../assets/img/new-design/bg-gradient.png')}
        style={styles.greenShadow}
      />
      <RBSheet
        ref={bottomSheetRef}
        height={325}
        customStyles={rbSheetStyles}
        closeOnPressBack={false}
        closeOnPressMask={false}>
        <View style={styles.bottomHeader}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: colors.text,
              fontFamily: 'LeagueSpartanBold',
            }}>
            Currency
          </Text>
          <TouchableOpacity onPress={closeSheet}>
            <AntDesign name={'close'} color={colors.text} size={24} />
          </TouchableOpacity>
        </View>
        <View style={[styles.column, {gap: 12, marginTop: 32}]}>
          {currencies?.map((currency, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                setTotalBalanceCurrency(currency);
                AsyncStorage.setItem('totalBalanceCurrency', currency).then(
                  () => {
                    console.log('Currency set asynchronously');
                  },
                );
                closeSheet();
              }}>
              {currency === totalBalanceCurrency ? (
                <LinearGradient
                  colors={['#8E42D1', '#4FAE97']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.currencyBorder}>
                  <View
                    style={[
                      styles.currencyCard,
                      {
                        backgroundColor: colors.bg,
                      },
                    ]}>
                    <View style={[styles.row, {gap: 8}]}>
                      {findCurrencyIco(currency)}
                      <Text style={styles.currencyText}>{currency}</Text>
                    </View>
                    <View style={styles.checkBox}>
                      <View
                        style={{
                          height: 12,
                          width: 12,
                          backgroundColor: colors.primary,
                          borderRadius: 50,
                        }}></View>
                    </View>
                  </View>
                </LinearGradient>
              ) : (
                <View
                  style={[
                    styles.currencyCard,
                    {
                      backgroundColor: theme === 'dark' ? '#202020' : '#f8f8f8',
                    },
                  ]}>
                  <View style={[styles.row, {gap: 8}]}>
                    {findCurrencyIco(currency)}
                    <Text style={styles.currencyText}>{currency}</Text>
                  </View>
                  <View
                    style={[
                      styles.checkBox,
                      {
                        borderColor: '#e0e0e0',
                      },
                    ]}></View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </RBSheet>

      {/* My Accounts Bottom Sheet */}
      <MyAccounts
        myAccountsOpen={myAccountsOpen}
        setMyAccountsOpen={setMyAccountsOpen}
        navigation={props.navigation}
      />

      {copiedModalOpen && (
        <Success
          isOpen={copiedModalOpen}
          setIsOpen={setCopiedModalOpen}
          message={'Copied to Clipboard'}
          type={'success'}
        />
      )}

      {cantSendModalOpen && (
        <View style={styles.addAccountModalWrapperThick}>
          <View style={styles.sendModalHeader}>
            <View style={styles.sendModalHeaderSpacer2}>
              <Text style={styles.sendModalHeaderTextName2}>
                Unable to send from unfunded account.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.sendModalCloseButton}
              onPress={() => setCantSendModalOpen(false)}>
              <Text style={styles.sendModalHeaderText}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </React.Fragment>
  );
};

const styling = (colors, theme) =>
  StyleSheet.create({
    userName: {
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '500',
      fontSize: 14,
    },
    userWallet: {
      color: colors.dark_med,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '400' : '400',
      fontSize: 14,
    },
    history: {
      fontSize: 12,
      color: colors.primary,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '500',
      marginTop: -2,
    },
    accountName: {
      fontSize: 14,
      color: colors.text_gray,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '500',
    },
    selectedCurrency: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
      fontFamily: 'LeagueSpartanMedium',
    },
    walletAddressAndClipboardWrapper: {
      borderWidth: 0.5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginTop: 12,
      marginBottom: 5,
    },
    heading: {
      fontSize: 14,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: '500',
      color: colors.dark_text,
    },
    label: {
      fontSize: 14,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? 'normal' : '400',
      color: colors.dark_text,
    },
    value: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '500',
      color: colors.dark_text,
    },
    progress: {
      height: 5,
    },
    walletAddress: {
      fontSize: 14,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.dark_text,
    },
    accountBalance: {
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: '700',
      color: colors.dark_text,
      fontSize: 36,
      marginTop: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
    },
    heroCard: {
      width: null,
      height: null,
      paddingHorizontal: 16,
      paddingVertical: 24,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      backgroundColor: colors.bg,
      position: 'relative',
      zIndex: 1000,
    },
    heroBgLogo: {
      position: 'absolute',
      right: 0,
      marginRight: -10,
      top: 60,
    },
    heroBg: {
      position: 'absolute',
      zIndex: -1,
      height: 397,
    },
    actionButtons: {
      marginTop: 16,
      gap: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    actionButton: {
      borderColor: colors.action_btn,
      borderWidth: 0.5,
      borderRadius: 12,
      height: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '48%',
      backgroundColor: colors.action_btn_grad,
    },
    buttonWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    actionButtonText: {
      color: colors.action_btn,
      fontSize: 12,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },

    addAccountModalWrapper: {
      position: 'absolute',
      zIndex: 1000,
      top: 0,
      marginTop: 20,
      backgroundColor: colors.secondary,
      width: '100%',
      height: 30,
      elevation: 10,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    addAccountModalWrapperThick: {
      position: 'absolute',
      zIndex: 1000,
      top: 50,
      backgroundColor: colors.secondary,
      width: '90%',
      paddingVertical: 10, // Changed from height to paddingVertical
      marginLeft: 20,
      marginRight: 20,
      elevation: 10,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    addAccountModalActionsWrapper: {
      paddingHorizontal: 10,
    },

    sendModalHeaderText: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'left',
    },
    sendModalHeaderTextName: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'left',
      marginTop: 4,
    },
    sendModalHeaderTextName2: {
      fontSize: 14,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'left',
      // marginTop: 4,
      flexWrap: 'wrap',
    },
    sendModalHeader: {
      width: '100%',
      height: 30,
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sendModalHeaderSpacer: {
      flexDirection: 'row',
    },
    sendModalHeaderSpacer2: {
      flexDirection: 'row',
      // width: '60%'
    },
    checkIcon: {
      marginLeft: 10,
    },

    bottomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    currencyBorder: {
      padding: 1,
      borderRadius: 8,
      backgroundColor: colors.bg,
    },
    currencyCard: {
      borderRadius: 9,
      paddingVertical: 14,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    currencySymbol: {
      backgroundColor: colors.primary,
      height: 24,
      width: 24,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 50,
    },
    currencyText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
      fontFamily: 'LeagueSpartanMedium',
    },
    checkBox: {
      height: 20,
      width: 20,
      padding: 5,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 50,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    greenShadow: {
      position: 'absolute',
      top: 0,
      marginTop: -200,
    },
  });

export default AccountActions;
