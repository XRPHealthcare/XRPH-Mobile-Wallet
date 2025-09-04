import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Image,
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Linking,
  Platform,
  Pressable,
} from 'react-native';
import {
  check,
  openSettings,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import useStore from '../../../data/store';
import ScanSetting from './ScanSetting';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import Alert from '../../../components/Alert';
import {getPaymentInfo} from '../../../utils/magazine';
import {
  AboutDarkIcon,
  AboutLightIcon,
  AccountDarkIcon,
  AccountLightIcon,
  BuyDarkIcon,
  BuyLightIcon,
  NodesDarkIcon,
  NodesLightIcon,
  NotificationDarkIcon,
  NotificationLightIcon,
  OurWebsiteDarkIcon,
  OurWebsiteLightIcon,
  ScanDarkIcon,
  ScanLightIcon,
  SecurityDarkIcon,
  SecurityLightIcon,
  SocialDarkIcon,
  SocialLightIcon,
  ThemeDarkIcon,
  ThemeLightIcon,
} from '../../../assets/img/new-design';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { openInAppBrowser } from '../../../utils/functions/InAppBrowserService';
FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();
Entypo.loadFont();

const SettingsScreen = ({navigation}) => {
  const {activeAccount, theme} = useStore();

  const toggleTheme = useStore(state => state.toggleTheme);

  const [isScanQR, setIsScanQR] = React.useState(false);
  const [scanSettingOpen, setScanSettingOpen] = React.useState(false);
  const [isPermission, setIsPemission] = React.useState(false);
  const [isErrorAlert, setIsErrorAlert] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState('');
  const [scannedData, setScannedData] = React.useState(null);
  const [isDataLoading, setIsDataLoading] = React.useState(false);
  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }
  const styles = styling(colors, theme);

  const changeTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    toggleTheme(newTheme);
    AsyncStorage.setItem('theme', newTheme).then(() => {
      console.log('theme set asynchronously',newTheme);
    });
  };

  const onSuccess = async e => {
    const parsedData = JSON.parse(e?.data);
    try {
      setIsScanQR(false);
      setScanSettingOpen(true);
      setIsDataLoading(true);
      const responseResult = await getPaymentInfo(parsedData);
      console.log('responseResult-------', responseResult);
      setIsDataLoading(false);
      console.log('parsed data-------', parsedData, responseResult);
      setScannedData({qr_id: parsedData?.qr_id, ...responseResult});
    } catch (e) {
      setScanSettingOpen(false);
      setIsDataLoading(false);
      setIsErrorAlert(true);
      setAlertMsg('Invalid Payment Details!');
    }
  };

  React.useEffect(() => {}, [isScanQR]);
  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />
        <View style={styles.bg}>
          <View style={styles.header}>
            <Text style={styles.headerHeading}>Settings</Text>
          </View>
          <Image
            source={require('../../../assets/img/new-design/bg-gradient.png')}
            style={styles.greenShadow}
          />
          <ScrollView style={styles.settingsWrapper}>
            <View style={[styles.generalSetting]}>
              <Text style={styles.headingText}>General</Text>
              <View style={[styles.settingCard]}>
                <Pressable
                  onPress={() => navigation.navigate('Account Settings Screen')}
                  style={[styles.settingCardItem]}>
                  <View
                    style={[
                      styles.row,
                      {
                        gap: 12,
                      },
                    ]}>
                    {theme === 'dark' ? (
                      <AccountDarkIcon />
                    ) : (
                      <AccountLightIcon />
                    )}
                    <View style={[styles.column, {}]}>
                      <Text style={styles.settingCardText}>Account Name</Text>
                      <Text style={styles.settingCardDesc}>
                        {activeAccount?.classicAddress?.substr(0, 6) +
                          '****' +
                          activeAccount?.classicAddress?.slice(-6)}
                      </Text>
                    </View>
                  </View>
                  <AntDesign
                    name={'right'}
                    size={16}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </Pressable>
                <View style={styles.settingCardDivider} />
                <View style={[styles.settingCardItem]}>
                  <View
                    style={[
                      styles.row,
                      {
                        gap: 12,
                      },
                    ]}>
                    {theme === 'dark' ? <ThemeDarkIcon /> : <ThemeLightIcon />}
                    <Text style={styles.settingCardText}>Dark Mode</Text>
                  </View>
                  <Pressable
                    onPress={() => changeTheme()}
                    style={{
                      height: 20,
                      width: 40,
                      backgroundColor:
                        theme === 'dark' ? '#45EE601A' : '#CCCCCC1A',
                      marginLeft: 'auto',
                      borderRadius: 10,
                      paddingHorizontal: 2,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent:
                        theme === 'dark' ? 'flex-end' : 'flex-start',
                    }}>
                    <View
                      style={{
                        height: 16,
                        width: 16,
                        borderRadius: 16,
                        backgroundColor:
                          theme === 'dark' ? '#03F982' : '#CCCCCC',
                      }}
                    />
                  </Pressable>
                </View>
                {/* <View style={styles.settingCardDivider} />
                <View style={[styles.settingCardItem]}>
                  <View
                    style={[
                      styles.row,
                      {
                        gap: 12,
                      },
                    ]}>
                    {theme === 'dark' ? (
                      <NotificationDarkIcon />
                    ) : (
                      <NotificationLightIcon />
                    )}
                    <Text style={styles.settingCardText}>
                      Push Notification
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 20,
                      width: 40,
                      backgroundColor: '#45EE601A',
                      marginLeft: 'auto',
                      borderRadius: 10,
                      paddingHorizontal: 2,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}>
                    <View
                      style={{
                        height: 16,
                        width: 16,
                        borderRadius: 16,
                        backgroundColor: '#03F982',
                      }}
                    />
                  </View>
                </View> */}
              </View>
            </View>
            <View style={[styles.generalSetting]}>
              <Text style={styles.headingText}>Wallet</Text>
              <View style={[styles.settingCard]}>
                <Pressable
                  onPress={() => navigation.navigate('Node Settings Screen')}
                  style={[styles.settingCardItem]}>
                  <View
                    style={[
                      styles.row,
                      {
                        gap: 12,
                      },
                    ]}>
                    {theme === 'dark' ? <NodesDarkIcon /> : <NodesLightIcon />}
                    <Text style={styles.settingCardText}>Nodes</Text>
                  </View>
                  <AntDesign
                    name={'right'}
                    size={16}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </Pressable>
                <View style={styles.settingCardDivider} />
                <Pressable
                  onPress={() => setIsScanQR(true)}
                  style={[styles.settingCardItem]}>
                  <View
                    style={[
                      styles.row,
                      {
                        gap: 12,
                      },
                    ]}>
                    {theme === 'dark' ? <ScanDarkIcon /> : <ScanLightIcon />}
                    <Text style={styles.settingCardText}>Scan QR</Text>
                  </View>
                  <AntDesign
                    name={'right'}
                    size={16}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </Pressable>
              </View>
            </View>
            <View style={[styles.generalSetting]}>
              <Text style={styles.headingText}>Help & Security</Text>
              <View style={[styles.settingCard]}>
                <Pressable
                  onPress={() => navigation.navigate('Privacy Settings Screen')}
                  style={[styles.settingCardItem]}>
                  <View
                    style={[
                      styles.row,
                      {
                        gap: 12,
                      },
                    ]}>
                    {theme === 'dark' ? (
                      <SecurityDarkIcon />
                    ) : (
                      <SecurityLightIcon />
                    )}
                    <Text style={styles.settingCardText}>
                      Privacy & Security
                    </Text>
                  </View>
                  <AntDesign
                    name={'right'}
                    size={16}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </Pressable>
                <View style={styles.settingCardDivider} />
                <Pressable
                  onPress={() => navigation.navigate('Help Settings Screen')}
                  style={[styles.settingCardItem]}>
                  <View
                    style={[
                      styles.row,
                      {
                        gap: 12,
                      },
                    ]}>
                    {theme === 'dark' ? <NodesDarkIcon /> : <NodesLightIcon />}
                    <Text style={styles.settingCardText}>Help & Support</Text>
                  </View>
                  <AntDesign
                    name={'right'}
                    size={16}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </Pressable>
              </View>
            </View>
            <View style={[styles.generalSetting]}>
              <Text style={styles.headingText}>About</Text>
              <View style={[styles.settingCard]}>
                <Pressable
                  onPress={() => navigation.navigate('About Settings Screen')}
                  style={[styles.settingCardItem]}>
                  <View
                    style={[
                      styles.row,
                      {
                        gap: 12,
                      },
                    ]}>
                    {theme === 'dark' ? (
                      <Image
                        source={require('../../../assets/img/new-design/settings/settings-dark.png')}
                        style={styles.aboutIcon}
                      />
                    ) : (
                      <Image
                        source={require('../../../assets/img/new-design/settings/settings-light.png')}
                        style={styles.aboutIcon}
                      />
                    )}
                    <Text style={styles.settingCardText}>About XRPH</Text>
                  </View>
                  <AntDesign
                    name={'right'}
                    size={16}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </Pressable>
                <View style={styles.settingCardDivider} />
                <Pressable
                  onPress={() => {
                    // Linking?.openURL('https://xrphealthcare.ai/buy-xrph');
                    openInAppBrowser('https://xrphealthcare.ai/buy-xrph',colors)
                  }}
                  style={[styles.settingCardItem]}>
                  <View
                    style={[
                      styles.row,
                      {
                        gap: 12,
                      },
                    ]}>
                    {theme === 'dark' ? <BuyDarkIcon /> : <BuyLightIcon />}
                    <Text style={styles.settingCardText}>Buy XRPH</Text>
                  </View>
                  <AntDesign
                    name={'right'}
                    size={16}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </Pressable>
                <View style={styles.settingCardDivider} />
                <Pressable
                  onPress={() => {
                    // Linking?.openURL('http://www.xrphealthcare.ai/');
                    openInAppBrowser('http://www.xrphealthcare.ai/',colors)
                  }}
                  style={[styles.settingCardItem]}>
                  <View
                    style={[
                      styles.row,
                      {
                        gap: 12,
                      },
                    ]}>
                    {theme === 'dark' ? (
                      <OurWebsiteDarkIcon />
                    ) : (
                      <OurWebsiteLightIcon />
                    )}
                    <Text style={styles.settingCardText}>Our Website</Text>
                  </View>
                  <AntDesign
                    name={'right'}
                    size={16}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </Pressable>
                <View style={styles.settingCardDivider} />
                <Pressable
                  onPress={() => {
                    // Linking?.openURL('https://linktr.ee/xrphealthcare');
                    openInAppBrowser('https://linktr.ee/xrphealthcare',colors)
                  }}
                  style={[styles.settingCardItem]}>
                  <View
                    style={[
                      styles.row,
                      {
                        gap: 12,
                      },
                    ]}>
                    {theme === 'dark' ? (
                      <SocialDarkIcon />
                    ) : (
                      <SocialLightIcon />
                    )}
                    <Text style={styles.settingCardText}>Social Media</Text>
                  </View>
                  <AntDesign
                    name={'right'}
                    size={16}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </Pressable>
              </View>
            </View>
            <View style={{height: 10}} />
          </ScrollView>
          <ScanSetting
            scanSettingOpen={scanSettingOpen}
            setScanSettingOpen={setScanSettingOpen}
            navigation={navigation}
            scannedData={scannedData}
            dataLoading={isDataLoading}
          />
          <Modal visible={isPermission} transparent={true}>
            <View style={styles.addAccountModalWrapper}>
              <View style={styles.sendModalHeader}>
                <View style={styles.sendModalHeaderSpacer}></View>
                <Text style={styles.sendModalHeaderText}>
                  Camera Permission
                </Text>
                <TouchableOpacity
                  style={styles.sendModalCloseButton}
                  onPress={() => setIsPemission(false)}>
                  <Text style={styles.sendModalHeaderText}>X</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.addAccountModalActionsWrapper}>
                <Text style={styles.addAccountModalDirections}>
                  Access to the camera has been denied. You can enable
                  permissions in the Settings.
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
                      style={styles.backIcon}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.sendModalHeaderTextLarge}>
                  {' '}
                  Scan Wallet Address
                </Text>
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
          <Alert
            isOpen={isErrorAlert}
            type={'error'}
            message={alertMsg}
            icon={'close'}
            setIsOpen={setIsErrorAlert}
            top={50}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styling = (colors, theme) =>
  StyleSheet.create({
    bg: {
      backgroundColor: colors.bg_gray,
      alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
    },
    hl: {
      width: '100%',
      height: 3,
      backgroundColor: colors.text_light,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
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
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 30,
      zIndex: 1000,
      backgroundColor:
        theme === 'dark'
          ? 'rgba(26, 26, 26, 0.77)'
          : 'rgba(255, 255, 255, 0.77)',
      borderBottomRightRadius: 32,
      borderBottomLeftRadius: 32,
    },
    headerHeading: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
    },
    greenShadow: {
      position: 'absolute',
      top: 0,
      zIndex: -1,
      marginTop: -80,
    },

    generalSetting: {
      marginTop: 24,
    },

    headingText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text_gray,
    },

    settingCard: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#414141' : '#ededed',
      backgroundColor: theme === 'dark' ? '#202020' : '#fff',
      marginTop: 16,
      flexDirection: 'column',
      paddingVertical: 4,
      paddingHorizontal: 14,
      zIndex: 100,
    },

    settingCardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
    },

    settingCardText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    settingCardDesc: {
      fontSize: 12,
      fontWeight: '400',
      color: colors.text,
    },

    settingCardDivider: {
      height: 1,
      backgroundColor: theme === 'dark' ? '#414141' : '#F8F8F8',
    },

    headerText: {
      fontSize: 18,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      textAlign: 'right',
      marginTop: 5,
    },
    accountNameText: {
      fontSize: 16,
      color: colors.primary,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginTop: 10,
      textAlign: 'right',
    },
    settingsWrapper: {
      width: '100%',
      paddingHorizontal: 20,
      paddingVertical: 1,
      // backgroundColor: colors.bg_gray,
      borderRadius: 10,
    },
    settingsButtonContainer: {
      width: '100%',
      backgroundColor: colors.bg,
      height: 50,
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    settingsButton: {
      width: '100%',
      backgroundColor: colors.bg,
      height: 50,
      flexDirection: 'row',
    },
    buttonWrapper: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
    },
    actionButtonText: {
      color: colors.text,
      fontSize: 18,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '400' : '100',
    },
    visitIcon: {
      position: 'absolute',
      right: 0,
    },
    accountIcon: {
      marginRight: 20,
    },
    securityIcon: {
      marginLeft: 5,
      marginRight: 25,
    },
    supportIcon: {
      marginLeft: 1,
      marginRight: 22,
    },
    aboutIcon: {
      height: 24,
      width: 24,
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
    sendModalHeaderSpacer: {
      width: 60,
    },
    addAccountModalWrapper: {
      backgroundColor: colors.bg,
      width: '96%',
      // height: 180,
      marginLeft: 'auto',
      marginRight: 'auto',
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
    sendModalHeaderSpacer: {
      width: 60,
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
    sendModalHeader: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 40,
      marginBottom: 30,
    },
    addAccountModalActionsWrapper: {
      paddingHorizontal: 10,
      width: '100%',
      flexDirection: 'column',
      alignItems: 'center',
    },
    addAccountModalDirections: {
      textAlign: 'left',
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanLight' : 'LeagueSpartanLight',
      marginBottom: 20,
    },
    addAccountOkButton: {
      width: 150,
      height: 50,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 10,
      marginBottom: 20,
    },
    addAccountOkButtonText: {
      textAlign: 'center',
      fontSize: 16,
      color: colors.bg,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
  });

export default SettingsScreen;
