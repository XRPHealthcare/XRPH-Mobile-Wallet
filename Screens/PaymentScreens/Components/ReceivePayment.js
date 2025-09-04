import Clipboard from '@react-native-clipboard/clipboard';
import React, {useCallback, useMemo, useRef} from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import RNQRGenerator from 'rn-qr-generator';
import {dark, light} from '../../../assets/colors/colors';
import useStore from '../../../data/store';
import getXAddress from '../../../Screens/HomeScreen/Handlers/get_x_address';
// import CustomBackground from './CustomBackground';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import BackHeader from '../../../components/BackHeader';
import QRCodeView from '../../../components/QRCodeView';
import HorizontalLine from '../../../components/saperator/HorizontalLine';
import HorizontalLineWithText from '../../../components/saperator/HorizontalLineWithText';
import Success from '../../../components/Success';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();
MaterialIcons.loadFont();

// ios-share

const ReceivePayment = props => {
  const bottomSheetRef = useRef(null);
  let {activeAccount, theme, hepticOptions} = useStore();
  let [copiedModalOpen, setCopiedModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [imgSrcClassic, setImgSrcClassic] = React.useState('');
  const [imgSrcX, setImgSrcX] = React.useState('');
  const [toggleAddress, setToggleAddress] = React.useState(false);

  // variables
  const snapPoints = useMemo(() => [440, 590], []);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const renderBackdrop = useCallback(
    props => <BottomSheetBackdrop {...props} onPress={closeSheet} />,
    [],
  );

  React.useEffect(() => {
    if (props.receiveModalOpen) {
      bottomSheetRef?.current?.open();
    } else {
      bottomSheetRef?.current?.close();
    }
  }, [props.receiveModalOpen]);
  React.useEffect(() => {
    RNQRGenerator.generate({
      value: activeAccount?.classicAddress,
      height: 200,
      width: 200,
    })
      .then(response => {
        const {uri, width, height, base64} = response;
        setImgSrcClassic(uri);
      })
      .catch(error => console.log('Cannot create QR code', error));

    RNQRGenerator.generate({
      value: getXAddress(activeAccount?.classicAddress),
      height: 200,
      width: 200,
    })
      .then(response => {
        const {uri, width, height, base64} = response;
        setImgSrcX(uri);
        setLoading(false);
      })
      .catch(error => console.log('Cannot create QR code', error));
  }, []);

  const copyToClipboard = () => {
    if (toggleAddress) {
      Clipboard.setString(getXAddress(activeAccount.classicAddress));
    } else {
      Clipboard.setString(activeAccount.classicAddress);
    }
    setCopiedModalOpen(true);
    trigger('notificationSuccess', hepticOptions);
    setTimeout(() => {
      setCopiedModalOpen(false);
    }, 2000);
  };

  const shareAddress = async () => {
    console.log('i am called', activeAccount.classicAddress);

    await Share.share({
      message: toggleAddress
        ? getXAddress(activeAccount.classicAddress)
        : activeAccount.classicAddress,
    });
  };

  const closeSheet = () => {
    // props.setReceiveModalOpen(false);
    // bottomSheetRef?.current?.close();
  };

  const goToPaymentRequest = () => {
    // closeSheet();
    props.navigation.navigate('Payment Request');
  };

  const rbSheetStyles = {
    container: {
      backgroundColor: theme === 'dark' ? '#1A1A1A' : '#fff',
      paddingTop: 20,
      borderTopRightRadius: 15,
      borderTopLeftRadius: 15,
      // borderColor: '#36394A',
      // borderWidth: 1,
    },
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{flex: 1, backgroundColor: colors.bg}}>
        <StatusBar />
        <View style={styles.bottomWrapper}>
          <ScrollView
            automaticallyAdjustKeyboardInsets={true}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}>
            {/* <View style={styles.bottomHeader}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: colors.text,
                }}>
                Receive
              </Text>
              <TouchableOpacity onPress={closeSheet}>
                <MaterialCommunityIcons
                  name={'close'}
                  color={colors.text}
                  size={30}
                />
              </TouchableOpacity>
            </View> */}
            <BackHeader
              title={'Receive Payment'}
              backOnPress={() => props.navigation.goBack()}
            />

            <HorizontalLineWithText
              text={'Scan For Secure XRP Transfer'}
              color={colors.bg_gray_2}
              textColor={colors.text_color_gray_1}
            />

            {/* <View style={styles.qrSection}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={activeAccount?.classicAddress}
                backgroundColor="transparent"
                color={colors.text}
              />
            </View>
            </View> */}

            <View style={styles.qrSection}>
              <QRCodeView
                data={activeAccount?.classicAddress}
                color={colors.text}
                theme={theme}
              />

              <Text
                style={[
                  styles.destinationTag,
                  {
                    color: colors.text_color_gray_1,
                  },
                ]}>
                No destination tag required
              </Text>
            </View>
            <HorizontalLine color={colors.bg_gray_2} />
            {/* </View> */}

            <View style={styles.receivePaymentBodyStyle}>
              <View>
                <Text style={styles.wallet}>Wallet Address</Text>
                <View style={styles.actionBtnWrapper}>
                  <View style={[styles.addressWrapper, {width: '80%'}]}>
                    <Text numberOfLines={1} style={styles.address}>
                      {activeAccount.classicAddress}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.actionButton, {marginLeft: 5}]}
                    onPress={copyToClipboard}>
                    <Feather
                      name={'copy'}
                      size={20}
                      color={colors.text}
                      style={styles.receiveIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.actionBtnWrapper}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {backgroundColor: colors.backGround_color_2, marginTop: 6},
                  ]}
                  onPress={shareAddress}>
                  <MaterialIcons
                    name={'ios-share'}
                    size={20}
                    color={colors.text}
                    style={styles.receiveIcon}
                  />
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          <View style={styles.receivePaymentBodyStyle}>
            <TouchableOpacity
              onPress={() => {
                goToPaymentRequest();
              }}>
              <LinearGradient
                colors={['#37C3A6', '#AF45EE']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.paymentRequest}>
                <Text style={styles.paymentRequestText}>
                  Create Payment Request Link
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        {copiedModalOpen && (
          <Success
            isOpen={copiedModalOpen}
            setIsOpen={setCopiedModalOpen}
            message={'Copied to Clipboard'}
            type={'success'}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styling = colors =>
  StyleSheet.create({
    bottomWrapper: {
      flex: 1,
      paddingBottom: 10,
      backgroundColor: colors.BackGround_color_1,
    },
    bottomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    qrSection: {
      marginTop: 2,
      borderRadius: 8,
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    qrWrapper: {
      padding: 15,
      borderWidth: 3,
      borderColor: colors.dark_gray_border,
      borderRadius: 6,
    },
    wallet: {
      marginTop: 20,
      marginLeft: 3,
      fontSize: 16,
      color: colors.text_color_gray_1,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
    },
    addressWrapper: {
      padding: 15,
      borderRadius: 10,
      borderColor: colors.border_gray_light,
      backgroundColor: colors.backGround_color_2,
      borderWidth: 1,
    },
    address: {
      fontSize: 14,
      textAlign: 'center',
      color: colors.text,
      fontWeight: '600',
    },
    actionBtnWrapper: {
      marginTop: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    actionButton: {
      borderRadius: 10,
      backgroundColor: colors.backGround_color_2,
      borderColor: colors.border_gray_light,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      paddingVertical: 13,
      gap: 8,
    },
    actionButtonText: {
      color: colors.text,
      fontSize: 18,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    paymentRequest: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      marginTop: 20,
    },
    paymentRequestText: {
      textAlign: 'center',
      fontSize: 18,
      color: '#fff',
    },
    addAccountModalWrapper: {
      position: 'absolute',
      top: 50,
      backgroundColor: colors.secondary,
      width: '100%',
      height: 30,
      elevation: 10,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
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
    sendModalHeader: {
      width: '100%',
      height: 100,
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 50,
    },
    copyModalHeader: {
      width: '100%',
      height: 30,
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    copyModalHeaderSpacer: {
      flexDirection: 'row',
    },

    checkIcon: {
      marginLeft: 10,
    },
    destinationTag: {
      fontSize: 14,
      fontWeight: '400',
      textAlign: 'center',
      marginTop: 20,
    },
    receivePaymentBodyStyle: {
      paddingLeft: 20,
      paddingRight: 20,
    },
    receiveIcon: {
      fontSize: 20,
      fontWeight: '600',
    },
  });

export default ReceivePayment;
