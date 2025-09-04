import React, {useCallback, useMemo, useRef} from 'react';

import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import useStore from '../../../data/store';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import RNQRGenerator from 'rn-qr-generator';
import RBSheet from 'react-native-raw-bottom-sheet';
import getXAddress from '../Handlers/get_x_address';
import QRCode from 'react-native-qrcode-svg';
import {trigger} from 'react-native-haptic-feedback';
import CustomBackground from './CustomBackground';
import {ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Success from '../../../components/Success';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const ReceiveModal = props => {
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
    props.setReceiveModalOpen(false);
    bottomSheetRef?.current?.close();
  };

  const goToPaymentRequest = () => {
    closeSheet();
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
    <React.Fragment>
      <RBSheet
        ref={bottomSheetRef}
        height={580}
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
                Receive
              </Text>
              <TouchableOpacity onPress={closeSheet}>
                <MaterialCommunityIcons
                  name={'close'}
                  color={colors.text}
                  size={30}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.qrSection}>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={activeAccount?.classicAddress}
                  backgroundColor="transparent"
                  color={colors.text}
                />
              </View>
            </View>
            <View>
              <Text style={styles.wallet}>Wallet Address</Text>
              <View style={styles.addressWrapper}>
                <Text style={styles.address}>
                  {activeAccount.classicAddress}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.destinationTag,
                {
                  color:
                    theme === 'light'
                      ? 'rgba(26, 26, 26, 0.60)'
                      : 'rgba(255, 255, 255, 0.60)',
                },
              ]}>
              No destination tag required
            </Text>
            <View style={styles.actionBtnWrapper}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={shareAddress}>
                <View style={styles.actionButton}>
                  <Feather
                    name={'share-2'}
                    size={20}
                    color={colors.text}
                    style={styles.receiveIcon}
                  />
                  <Text style={styles.actionButtonText}>Share</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={copyToClipboard}>
                <View style={styles.actionButton}>
                  <Feather
                    name={'copy'}
                    size={20}
                    color={colors.text}
                    style={styles.receiveIcon}
                  />
                  <Text style={styles.actionButtonText}>Copy</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View>
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
          </ScrollView>
        </View>
      </RBSheet>
      {copiedModalOpen && (
        <Success
          isOpen={copiedModalOpen}
          setIsOpen={setCopiedModalOpen}
          message={'Copied to Clipboard'}
          type={'success'}
        />
      )}
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
    qrSection: {
      marginTop: 20,
      borderRadius: 8,
      padding: 20,
      backgroundColor: colors.light_gray_bg,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    qrWrapper: {
      padding: 15,
      borderWidth: 3,
      borderColor: colors.dark_gray_border,
      borderRadius: 6,
    },
    wallet: {
      marginTop: 32,
      textAlign: 'center',
      fontSize: 16,
      color: colors.text,
    },
    addressWrapper: {
      marginTop: 15,
      padding: 15,
      borderRadius: 8,
      backgroundColor: colors.light_gray_bg,
    },
    address: {
      fontSize: 16,
      textAlign: 'center',
      color: colors.text,
    },
    actionBtnWrapper: {
      marginTop: 32,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    actionButton: {
      borderRadius: 10,
      backgroundColor: colors.light_gray_bg,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '48%',
      paddingVertical: 8,
      gap: 8,
    },
    actionButtonText: {
      color: colors.text,
      fontSize: 18,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    // receiveIcon: {
    //   marginRight: 16,
    //   marginLeft: -32,
    // },
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
      // alignItems: 'center',
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
      marginTop: 10,
    },
  });

export default ReceiveModal;
