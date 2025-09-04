import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useStore from '../../../data/store';
import LinearGradient from 'react-native-linear-gradient';
import DisconnectWallet from './DisconnectWalletSheet';
import {
  PERMISSIONS,
  RESULTS,
  check,
  openSettings,
  request,
} from 'react-native-permissions';
import {RNCamera} from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';
import ConnectionConfirmation from '../../HomeScreen/Components/ConnectionCofirmation';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const WalletConnectionScreen = ({navigation}) => {
  const {activeAccount, theme, activeConnections} = useStore();

  const [isDisconnect, setIsDisconnect] = React.useState(false);
  const [isScanQR, setIsScanQR] = React.useState(false);
  const [isPermission, setIsPemission] = React.useState(false);
  const [channelHash, setChannelHash] = React.useState('');
  const [connectionConfirmation, setConnectionConfirmation] =
    React.useState(false);
  const [deviceToRemove, setDeviceToRemove] = React.useState(null);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const onSuccess = e => {
    setChannelHash(e?.data);
    setIsScanQR(false);
    setConnectionConfirmation(true);
  };

  React.useEffect(() => {
    check(PERMISSIONS.IOS.CAMERA)
      .then(result => {
        switch (result) {
          case RESULTS.DENIED:
            console.log(
              'The permission has not been requested / is denied but requestable',
            );
            request(PERMISSIONS.IOS.CAMERA).then(response => {
              if (response === RESULTS.GRANTED) {
                setIsPemission(false);
              } else {
                if (isScanQR) {
                  setIsScanQR(false);
                  setIsPemission(true);
                }
              }
            });
            break;
          case RESULTS.GRANTED:
            console.log('The permission is granted');
            setIsPemission(false);
            break;
          case RESULTS.BLOCKED:
            console.log('The permission is denied and not requestable anymore');
            if (isScanQR) {
              setIsScanQR(false);
              setIsPemission(true);
            }

            break;
        }
      })
      .catch(error => {
        // …
      });
  }, [isScanQR]);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />
        <View style={styles.bg}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image
                style={styles.headerImage}
                source={require('../../../assets/img/hero.png')}
              />
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.headerText}>Settings</Text>
              <Text style={styles.accountNameText}>{activeAccount.name}</Text>
            </View>
          </View>
          <ScrollView style={styles.settingsWrapper}>
            <View style={styles.settingsButtonContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings Screen')}>
                <Feather
                  name={'chevron-left'}
                  size={35}
                  color={colors.text}
                  style={styles.backIcon}
                />
              </TouchableOpacity>
              <Text style={styles.actionButtonText}>Wallet Connect</Text>
            </View>

            <View style={styles.hl}></View>
            <View
              style={[
                styles.newConnection,
                {
                  borderWidth: theme === 'dark' ? 0.5 : 0,
                  borderColor: theme === 'dark' ? '#36394A' : '',
                  backgroundColor:
                    theme === 'dark' ? colors.bg : colors.light_gray_bg,
                },
              ]}>
              <Text style={styles.newConnectionText}>
                Connect your wallet with XRPH to make transactions.
              </Text>
              <TouchableOpacity onPress={() => setIsScanQR(true)}>
                <LinearGradient
                  colors={['#37C3A6', '#AF45EE']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.paymentRequest}>
                  <Text style={styles.paymentRequestText}>New Connection </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <Text style={styles.heading}> Devices Connected</Text>
            <View style={styles.devicesWrapper}>
              {activeConnections?.length > 0 ? (
                activeConnections?.map((device, idx) => (
                  <TouchableOpacity
                    onPress={() => {
                      setDeviceToRemove(device);
                      setIsDisconnect(true);
                    }}
                    key={idx}
                    style={[
                      styles.device,
                      {
                        borderWidth: theme === 'dark' ? 0.5 : 0,
                        borderColor: theme === 'dark' ? '#36394A' : '',
                      },
                    ]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                      }}>
                      <Image
                        style={styles.webImg}
                        source={require('../../../assets/img/hero.png')}
                      />
                      <View
                        style={{
                          flexDirection: 'column',
                        }}>
                        <Text style={styles.deviceTitle}>XRPH WEB</Text>
                        <Text
                          style={[
                            styles.deviceAddress,
                            {
                              color:
                                theme === 'dark'
                                  ? '#CCCCCC'
                                  : 'rgba(26, 26, 26, 0.50)',
                            },
                          ]}>
                          swap.xrphealthcare.ai
                        </Text>
                      </View>
                    </View>
                    <Feather
                      name={'chevron-right'}
                      size={24}
                      color={colors.text}
                      style={{marginRight: 12}}
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <Text
                  style={{
                    color: colors.text,
                    textAlign: 'center',
                    marginTop: 10,
                  }}>
                  No Device Connected
                </Text>
              )}
            </View>
          </ScrollView>
          <DisconnectWallet
            isDisconnect={isDisconnect}
            setIsDisconnect={setIsDisconnect}
            deviceToRemove={deviceToRemove}
            setDeviceToRemove={setDeviceToRemove}
          />
          <ConnectionConfirmation
            connectionConfirmation={connectionConfirmation}
            setConnectionConfirmation={setConnectionConfirmation}
            channelHash={channelHash}
            setChannelHash={setChannelHash}
          />
        </View>
        <Modal visible={isScanQR} transparent={true}>
          <View style={styles.cameraParentWrapper}>
            <View style={styles.cameraModalHeader}>
              <View style={styles.sendModalHeaderSpacer}>
                <TouchableOpacity
                  onPress={() => {
                    setIsScanQR(false);
                  }}
                  style={{
                    marginTop: 8,
                    marginLeft: -10,
                  }}>
                  <Feather
                    name={'chevron-left'}
                    size={35}
                    color={colors.text}
                    style={{marginLeft: 6}}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.sendModalHeaderTextLarge}> Scan QR Code</Text>
              <View style={styles.sendModalHeaderSpacer}></View>
            </View>
            <View style={styles.cameraWrapper}>
              <QRCodeScanner
                onRead={onSuccess}
                flashMode={RNCamera.Constants.FlashMode.auto}
                cameraStyle={styles.cameraContainer}
                showMarker={true}
              />
            </View>
            <View>
              <Text style={styles.cameraText}>
                Keep your phone steady on QR Code to scan successfully
              </Text>
            </View>
          </View>
        </Modal>
        <Modal visible={isPermission} transparent={true}>
          <View style={styles.addAccountModalWrapper}>
            <View style={styles.sendModalHeader}>
              <View style={styles.sendModalHeaderSpacer}></View>
              <Text style={styles.sendModalHeaderText}>Camera Permission</Text>
              <TouchableOpacity
                style={styles.sendModalCloseButton}
                onPress={() => setIsPemission(false)}>
                <Text style={styles.sendModalHeaderText}>X</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.addAccountModalActionsWrapper}>
              <Text style={styles.addAccountModalDirections}>
                Access to the camera has been denied. You can enable permissions
                in the Settings.
              </Text>
              <View style={styles.addAccountActionButtons}>
                <TouchableOpacity
                  style={styles.addAccountOkButton}
                  onPress={() =>
                    openSettings().then(() => {
                      setIsPemission(false);
                    })
                  }>
                  <Text style={styles.addAccountOkButtonText}>
                    Open Settings
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styling = colors =>
  StyleSheet.create({
    bg: {
      backgroundColor: colors.bg,
      alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
      paddingHorizontal: 10,
    },
    hl: {
      width: '100%',
      height: 3,
      backgroundColor: colors.text_light,
    },
    headerImage: {
      width: 50,
      height: 50,
      marginLeft: 0,
      marginTop: 0,
    },
    header: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      marginBottom: 10,
    },
    headerText: {
      fontSize: 18,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      textAlign: 'right',
      marginTop: 5,
    },
    accountNameText: {
      fontSize: 16,
      color: colors.primary,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginTop: 10,
      textAlign: 'right',
    },
    settingsWrapper: {
      width: '100%',
      paddingHorizontal: 5,
      paddingVertical: 1,
      backgroundColor: colors.bg,
      borderRadius: 10,
    },
    settingsButtonContainer: {
      backgroundColor: colors.bg,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginBottom: 10,
      gap: 20,
    },
    backIcon: {
      marginLeft: -10,
    },
    actionButtonText: {
      color: colors.text,
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      textAlign: 'center',
    },
    newConnection: {
      backgroundColor: colors.light_gray_bg,
      flexDirection: 'column',
      gap: 16,
      paddingVertical: 15,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginTop: 26,
    },
    newConnectionText: {
      color: colors.text,
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: '500',
    },
    paymentRequest: {
      height: 48,
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
    heading: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
      marginTop: 32,
    },
    devicesWrapper: {
      marginTop: 16,
      flexDirection: 'column',
      gap: 12,
    },
    device: {
      backgroundColor: colors.light_gray_bg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      height: 56,
      borderRadius: 12,
    },
    webImg: {
      height: 28,
      width: 28,
      marginLeft: 12,
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
    cameraParentWrapper: {
      backgroundColor: colors.bg,
      height: '100%',
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
      position: 'relative',
    },
    cameraModalHeader: {
      position: 'absolute',
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 40,
      marginBottom: 30,
      zIndex: 1000,
      top: 0,
    },
    cameraWrapper: {
      position: 'absolute',
      alignSelf: 'center',
      height: '100%',
    },
    cameraContainer: {
      // height: 140,
      // width: '60%',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    cameraText: {
      textAlign: 'center',
      color: colors.text,
      marginBottom: 50,
      width: '90%',
      textAlign: 'center',
    },
    addAccountModalWrapper: {
      backgroundColor: colors.bg,
      width: '96%',
      // height: 180,
      marginLeft: '2%',
      marginBottom: 100,
      marginTop: 120,
      elevation: 5,
      shadowColor: '#000000',
      shadowOffset: {width: 5, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 20,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 3000,
    },
    sendModalHeader: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 40,
      marginBottom: 30,
    },
    sendModalHeaderSpacer: {
      width: 60,
    },
    sendModalHeaderTextLarge: {
      fontSize: 22,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'right',
      paddingRight: 10,
      paddingTop: 10,
    },
    sendModalHeaderText: {
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'right',
      paddingRight: 10,
    },
    addAccountModalActionsWrapper: {
      paddingHorizontal: 10,
      width: '100%',
      flexDirection: 'column',
      alignItems: 'center',
    },
    addAccountActionButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
      marginTop: 20,
      marginLeft: 10,
    },
    addAccountOkButton: {
      width: 150,
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 10,
    },
    addAccountOkButtonText: {
      textAlign: 'center',
      fontSize: 16,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    addAccountModalDirections: {
      textAlign: 'left',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanLight',
      marginBottom: 20,
    },
  });

export default WalletConnectionScreen;
