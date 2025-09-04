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
import RBSheet from 'react-native-raw-bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {socket} from '../../../utils/socket';
import {useNetInfo} from '@react-native-community/netinfo';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const DisconnectWallet = props => {
  const netInfo = useNetInfo();
  const bottomSheetRef = useRef(null);
  let {activeAccount, theme, activeConnections} = useStore();
  const setActiveConnections = useStore(state => state.setActiveConnections);

  const [isLoading, setIsLoading] = useState(false);
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

  const closeSheet = () => {
    props.setIsDisconnect(false);
    bottomSheetRef?.current?.close();
  };

  const removeDevice = async () => {
    if (!netInfo.isConnected) {
      setErrorMessage('No internet connection');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    } else {
      socket?.emit(`disconnect-connection`, {
        token: props?.deviceToRemove?.token,
      });
      setIsLoading(true);
      try {
        if (activeConnections) {
          const filteredDevices = activeConnections?.filter(
            device =>
              device?.channel_data_hash !=
              props?.deviceToRemove?.channel_data_hash,
          );
          await AsyncStorage?.setItem(
            'swap_sessions',
            JSON.stringify(filteredDevices),
          );
          setActiveConnections(filteredDevices);
          props?.setDeviceToRemove(null);
          setIsLoading(false);
          closeSheet();
        } else {
          setIsLoading(false);
        }
      } catch (e) {
        console.log('-------------err disconnect', e);
        setIsLoading(false);
      }
    }
  };

  React.useEffect(() => {
    if (props.isDisconnect) {
      bottomSheetRef?.current?.open();
    } else {
      bottomSheetRef?.current?.close();
    }
  }, [props.isDisconnect]);

  return (
    <React.Fragment>
      <RBSheet
        ref={bottomSheetRef}
        height={314}
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
                Wallet Disconnect
              </Text>
              <TouchableOpacity onPress={closeSheet}>
                <MaterialCommunityIcons
                  name={'close'}
                  color={colors.text}
                  size={30}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.walletAddressWrapper,
                {
                  borderWidth: theme === 'dark' ? 0.5 : 0,
                  borderColor: theme === 'dark' ? '#36394A' : '',
                },
              ]}>
              <Image
                style={styles.walletImg}
                source={require('../../../assets/img/hero.png')}
              />
              <Text style={styles.deviceTitle}>XRPH WEB</Text>
              <Text
                style={[
                  styles.deviceAddress,
                  {
                    color:
                      theme === 'dark' ? '#CCCCCC' : 'rgba(26, 26, 26, 0.50)',
                  },
                ]}>
                swap.xrphealthcare.ai
              </Text>
            </View>

            <View style={{marginTop: 22}}>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
              <TouchableOpacity
                style={styles.unstakeButton}
                onPress={removeDevice}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#F16361" />
                ) : (
                  <Text style={styles.unstakeButtonText}>Disconnect</Text>
                )}
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
    unstakeButton: {
      marginTop: 5,
      borderRadius: 10,
      borderWidth: 0.5,
      borderStyle: 'solid',
      borderColor: '#F16361',
      height: 59,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(241, 99, 97, 0.05)',
    },
    unstakeButtonText: {
      fontSize: 18,
      fontWeight: '500',
      color: '#F16361',
      textAlign: 'center',
    },
    errorMessage: {
      color: '#F16361',
      fontSize: 14,
      textAlign: 'center',
    },
    walletAddressWrapper: {
      backgroundColor: colors.light_gray_bg,
      flexDirection: 'column',
      alignItems: 'center',
      borderRadius: 12,
      padding: 12,
      marginTop: 32,
    },
    walletImg: {
      height: 28,
      width: 28,
      marginBottom: 12,
    },

    deviceTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '400',
      textTransform: 'uppercase',
    },
    deviceAddress: {
      fontSize: 12,
      fontWeight: '400',
    },
  });

export default DisconnectWallet;
