import React, {useRef, useState} from 'react';

import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  Image,
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
import {ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import RBSheet from 'react-native-raw-bottom-sheet';
import WalletIco from '../../../assets/img/wallet_ico.svg';
import ShieldIco from '../../../assets/img/shield_ico.svg';
import {useAuthenticateQR} from '../../../utils/swap.api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {prop} from 'cheerio/lib/api/attributes';
import {trigger} from 'react-native-haptic-feedback';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const ConnectionConfirmation = props => {
  const authenticateDevice = useAuthenticateQR();

  const bottomSheetRef = useRef(null);
  let {activeAccount, theme, hepticOptions} = useStore();
  const setActiveConnections = useStore(state => state.setActiveConnections);
  const [errorMessage, setErrorMessage] = useState('');

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

  const generateSessionToken = () => {
    //initialize a variable having alpha-numeric characters
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

    //specify the length for the new string to be generated
    var string_length = 20;
    var randomString = '';

    //put a loop to select a character randomly in each iteration
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomString += chars.substring(rnum, rnum + 1);
    }
    //display the generated string
    return randomString;
  };

  const onConnect = () => {
    const session_token = generateSessionToken();
    authenticateDevice
      .mutateAsync({
        channel_data_hash: props?.channelHash,
        session_token: session_token,
      })
      .then(async res => {
        if (res?.message === 'Success') {
          trigger('impactMedium', hepticOptions);
          const swapSessionTokens =
            await AsyncStorage?.getItem('swap_sessions');
          const parsedSwapSessionTokens = JSON.parse(swapSessionTokens);
          if (parsedSwapSessionTokens?.length) {
            let isExist = parsedSwapSessionTokens?.find(
              token => token?.channelHash === props?.channelHash,
            );
            console.log('isExist', isExist);
            if (!isExist) {
              await AsyncStorage.setItem(
                'swap_sessions',
                JSON?.stringify([
                  ...parsedSwapSessionTokens,
                  {
                    channel_data_hash: props?.channelHash,
                    session_token: session_token,
                    token: res?.token,
                  },
                ]),
              );
              setActiveConnections([
                ...parsedSwapSessionTokens,
                {
                  channel_data_hash: props?.channelHash,
                  session_token: session_token,
                  token: res?.token,
                },
              ]);
            }
          } else {
            await AsyncStorage.setItem(
              'swap_sessions',
              JSON?.stringify([
                {
                  channel_data_hash: props?.channelHash,
                  session_token: session_token,
                  token: res?.token,
                },
              ]),
            );
            setActiveConnections([
              {
                channel_data_hash: props?.channelHash,
                session_token: session_token,
                token: res?.token,
              },
            ]);
          }
          closeSheet();
        }
        console.log('------------device authenticate response', res);
      })
      .catch(err => {
        setErrorMessage(err?.message);
        console.log('-----------device authenticate error', err);
      });
  };

  const closeSheet = () => {
    setErrorMessage('');
    props.setConnectionConfirmation(false);
    props?.setChannelHash('');
    bottomSheetRef?.current?.close();
  };

  React.useEffect(() => {
    if (props.connectionConfirmation) {
      bottomSheetRef?.current?.open();
    } else {
      bottomSheetRef?.current?.close();
    }
  }, [props.connectionConfirmation]);

  return (
    <React.Fragment>
      <RBSheet
        ref={bottomSheetRef}
        height={700}
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
                Confirmation Required{' '}
              </Text>
              <TouchableOpacity onPress={closeSheet}>
                <MaterialCommunityIcons
                  name={'close'}
                  color={colors.text}
                  size={30}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
              <Image
                style={styles.heroImg}
                source={require('../../../assets/img/hero.png')}
              />
              <Text style={styles.infoHeading}>
                XRPH Web dApp wants to connect to your wallet
              </Text>
              <Text style={styles.infoLink}>swap.xrphealthcare.ai</Text>
            </View>

            <View
              style={[
                styles.walletWrapper,
                {
                  borderWidth: theme === 'dark' ? 0.5 : 0,
                  borderColor: theme === 'dark' ? '#36394A' : '',
                },
              ]}>
              <Image
                style={styles.walletImg}
                source={require('../../../assets/img/hero.png')}
              />
              <View>
                <Text style={[styles.walletTitle]}>Wallet Address</Text>
                <Text
                  style={[
                    styles.walletAddress,
                    {
                      color:
                        theme === 'dark' ? '#727997' : 'rgba(26, 26, 26, 0.50)',
                    },
                  ]}>
                  {activeAccount?.classicAddress?.slice(0, 6) +
                    '****' +
                    activeAccount?.classicAddress?.slice(-6)}
                </Text>
              </View>
            </View>

            <View style={styles.descriptionWrapper}>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 12,
                  alignItems: 'center',
                }}>
                <WalletIco />
                <Text style={styles.descriptionText}>
                  View your wallet balance & activity
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 12,
                  alignItems: 'center',
                }}>
                <ShieldIco />
                <Text style={styles.descriptionText}>
                  Request approval for transactions
                </Text>
              </View>
            </View>
            <View style={{marginTop: errorMessage?.length > 0 ? 34 : 54}}>
              {errorMessage?.length > 0 && (
                <Text
                  style={{
                    textAlign: 'center',
                    marginBottom: 10,
                    fontSize: 14,
                    color: '#ff3333',
                  }}>
                  {errorMessage}
                </Text>
              )}
              <TouchableOpacity
                onPress={() => {
                  onConnect();
                }}
                disabled={authenticateDevice?.isPending}>
                <LinearGradient
                  colors={['#37C3A6', '#AF45EE']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.paymentRequest}>
                  {authenticateDevice?.isPending ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.paymentRequestText}>Connect Now </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.unstakeButton}
                onPress={closeSheet}
                disabled={authenticateDevice?.isPending}>
                <Text style={styles.unstakeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </RBSheet>
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
    infoContainer: {
      marginTop: 64,
    },
    heroImg: {
      height: 48,
      width: 48,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    infoHeading: {
      fontSize: 24,
      fontWeight: '400',
      color: colors.text,
      textAlign: 'center',
      marginTop: 24,
    },
    infoLink: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.confirmation_desc,
      textAlign: 'center',
      marginTop: 16,
    },
    walletWrapper: {
      marginTop: 40,
      backgroundColor: colors.light_gray_bg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      height: 56,
      borderRadius: 12,
    },
    walletImg: {
      height: 32,
      width: 32,
      marginLeft: 12,
    },
    walletTitle: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.text_dark1,
    },
    walletAddress: {
      fontSize: 12,
      fontWeight: '400',
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
  });

export default ConnectionConfirmation;
