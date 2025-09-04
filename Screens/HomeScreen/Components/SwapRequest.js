import React, {useRef, useState} from 'react';

import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import useStore from '../../../data/store';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import RBSheet from 'react-native-raw-bottom-sheet';
import USDTico from '../../../assets/img/thether_ico.svg';
import SwapIco from '../../../assets/img/swap_vertical.svg';
import SwapIcoD from '../../../assets/img/swap_vertical_d.svg';
import {socket} from '../../../utils/socket';
import {trigger} from 'react-native-haptic-feedback';
import {useNetInfo} from '@react-native-community/netinfo';
import Alert from '../../../components/Alert';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const SwapRequest = props => {
  const netInfo = useNetInfo();
  const bottomSheetRef = useRef(null);
  let {activeAccount, theme, hepticOptions} = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [isErrorAlert, setIsErrorAlert] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState('');

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const rbSheetStyles = {
    container: {
      backgroundColor: theme === 'dark' ? '#202226' : '#fff',
      paddingTop: 20,
      borderTopRightRadius: 15,
      borderTopLeftRadius: 15,
      borderColor: '#36394A',
      borderWidth: 1,
    },
  };

  const confirmSwap = () => {
    if (!netInfo.isConnected) {
      setIsErrorAlert(true);
      setAlertMsg('No internet connection');
    } else {
      try {
        setIsLoading(true);
        socket?.emit('swap-response', {
          ...props?.swapRequest,
          walletKey: activeAccount?.seed,
          status: 'approved',
        });
        trigger('impactMedium', hepticOptions);

        setInfoMessage('Please check swap app for confirmation!');
        setTimeout(() => {
          setInfoMessage('');
        }, 3000);
        setIsLoading(false);
        closeSheet();
      } catch (e) {
        console.log('------error on confirm swap', e);
      }
    }
  };

  const rejectSwap = () => {
    if (!netInfo.isConnected) {
      setIsErrorAlert(true);
      setAlertMsg('No internet connection');
    } else {
      try {
        setIsLoading(true);
        socket?.emit('swap-response', {
          ...props?.swapRequest,
          walletKey: activeAccount?.seed,
          status: 'rejected',
        });
        setIsLoading(false);
        closeSheet();
      } catch (e) {
        console.log('------error on confirm swap', e);
      }
    }
  };

  const closeSheet = () => {
    props.setIsSwapRequest(false);
    bottomSheetRef?.current?.close();
  };

  React.useEffect(() => {
    if (props.isSwapRequest) {
      bottomSheetRef?.current?.open();
    } else {
      bottomSheetRef?.current?.close();
    }
  }, [props.isSwapRequest]);

  return (
    <React.Fragment>
      <RBSheet
        ref={bottomSheetRef}
        height={480}
        customStyles={rbSheetStyles}
        closeOnPressBack={false}
        closeOnPressMask={false}>
        <View style={styles.bottomWrapper}>
          <ScrollView
            automaticallyAdjustKeyboardInsets={true}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}>
            <View style={styles.bottomHeader}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: colors.text,
                }}>
                Swap Token Request{' '}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  rejectSwap();
                }}>
                <MaterialCommunityIcons
                  name={'close'}
                  color={colors.text}
                  size={30}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.swapWrapper}>
              <View
                style={[
                  styles.walletWrapper,
                  {
                    borderWidth: theme === 'dark' ? 0.5 : 0,
                    borderColor: theme === 'dark' ? '#36394A' : '',
                  },
                ]}>
                {props?.swapRequest?.transaction?.fromCoin?.symbol ===
                'USDT' ? (
                  <USDTico style={{marginLeft: 12}} />
                ) : props?.swapRequest?.transaction?.fromCoin?.symbol ===
                  'XRP' ? (
                  <Image
                    style={styles.walletImg}
                    source={require('../../../assets/img/xrp-logo.png')}
                  />
                ) : (
                  <Image
                    style={styles.walletImg}
                    source={require('../../../assets/img/hero.png')}
                  />
                )}
                <View>
                  <Text
                    style={[
                      styles.amountText,
                      {
                        color:
                          theme === 'dark'
                            ? '#727997'
                            : 'rgba(26, 26, 26, 0.50)',
                      },
                    ]}>
                    Amount
                  </Text>
                  <View style={styles.row}>
                    <Text
                      style={[
                        styles.amount,
                        {
                          color: colors.text_dark1,
                        },
                      ]}>
                      {props?.swapRequest?.transaction?.inputAmount}{' '}
                    </Text>
                    <Text
                      style={[
                        styles.amount,
                        {
                          color: theme === 'dark' ? '#727997' : '#1a1a1a',
                        },
                      ]}>
                      {props?.swapRequest?.transaction?.fromCoin?.symbol}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}>
                {theme === 'dark' ? <SwapIcoD /> : <SwapIco />}
              </View>
              <View
                style={[
                  styles.walletWrapper,
                  {
                    borderWidth: theme === 'dark' ? 0.5 : 0,
                    borderColor: theme === 'dark' ? '#36394A' : '',
                  },
                ]}>
                {props?.swapRequest?.transaction?.toCoin?.symbol === 'USDT' ? (
                  <USDTico style={{marginLeft: 12}} />
                ) : props?.swapRequest?.transaction?.toCoin?.symbol ===
                  'XRP' ? (
                  <Image
                    style={styles.walletImg}
                    source={require('../../../assets/img/xrp-logo.png')}
                  />
                ) : (
                  <Image
                    style={styles.walletImg}
                    source={require('../../../assets/img/hero.png')}
                  />
                )}
                <View>
                  <Text
                    style={[
                      styles.amountText,
                      {
                        color:
                          theme === 'dark'
                            ? '#727997'
                            : 'rgba(26, 26, 26, 0.50)',
                      },
                    ]}>
                    Amount
                  </Text>
                  <View style={styles.row}>
                    <Text
                      style={[
                        styles.amount,
                        {
                          color: colors.text_dark1,
                        },
                      ]}>
                      {props?.swapRequest?.transaction?.outputAmount}{' '}
                    </Text>
                    <Text
                      style={[
                        styles.amount,
                        {
                          color: theme === 'dark' ? '#727997' : '#1a1a1a',
                        },
                      ]}>
                      {props?.swapRequest?.transaction?.toCoin?.symbol}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={{marginTop: infoMessage?.length > 0 ? 34 : 44}}>
              {infoMessage?.length > 0 && (
                <Text
                  style={{
                    marginBottom: 10,
                    fontSize: 14,
                    color: colors.secondary,
                    textAlign: 'center',
                  }}>
                  {infoMessage}
                </Text>
              )}
              <TouchableOpacity
                onPress={() => {
                  confirmSwap();
                }}
                disabled={isLoading}>
                <LinearGradient
                  colors={['#37C3A6', '#AF45EE']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.paymentRequest}>
                  <Text style={styles.paymentRequestText}>Confirm Swap </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isLoading}
                style={styles.unstakeButton}
                onPress={rejectSwap}>
                <Text style={styles.unstakeButtonText}>Reject Swap</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </RBSheet>
      <Alert
        isOpen={isErrorAlert}
        type={'error'}
        message={alertMsg}
        icon={'close'}
        setIsOpen={setIsErrorAlert}
      />
    </React.Fragment>
  );
};

const styling = colors =>
  StyleSheet.create({
    bottomWrapper: {
      paddingLeft: 20,
      paddingRight: 20,
      paddingBottom: 20,
    },
    bottomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    paymentRequest: {
      height: 58,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
    },
    paymentRequestText: {
      textAlign: 'center',
      fontSize: 18,
      color: '#fff',
    },
    unstakeButton: {
      marginTop: 12,
      borderRadius: 10,
      height: 58,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.light_gray,
    },
    unstakeButtonText: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.text,
      textAlign: 'center',
    },
    swapWarning: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.confirmation_desc,
    },
    swapWrapper: {
      marginTop: 44,
      flexDirection: 'column',
      gap: 12,
    },
    walletWrapper: {
      backgroundColor: colors.light_gray_bg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      height: 59,
      borderRadius: 12,
    },
    walletImg: {
      height: 28,
      width: 28,
      marginLeft: 12,
    },
    amountText: {
      fontSize: 12,
      fontWeight: '500',
    },
    amount: {
      fontSize: 14,
      fontWeight: '700',
    },
    descriptionWrapper: {
      marginTop: 40,
      flexDirection: 'column',
      gap: 21,
    },
    descriptionText: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.text_dark1,
    },
    row: {
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
  });

export default SwapRequest;
