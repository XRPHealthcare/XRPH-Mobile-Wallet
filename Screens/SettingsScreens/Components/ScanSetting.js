import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useRef, useMemo} from 'react';
import CustomBackground from '../../HomeScreen/Components/CustomBackground';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import {light, dark} from '../../../assets/colors/colors';
import useStore from '../../../data/store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SuccessScanPayment from './SuccessScanPayment';
import Alert from '../../../components/Alert';
import send_token from '../../HomeScreen/Handlers/send_token';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useGetPrices} from '../../../utils/wallet.api';
import {confirmMagazinePayment} from '../../../utils/magazine';
import {HOT_WALLET} from '../../config';
import {getTotalBalances} from '../../../utils/functions/balance';

const ScanSetting = props => {
  const getExchangePrices = useGetPrices();

  const {activeAccount, theme, node, accounts} = useStore();
  const bottomSheetRef = useRef(null);
  const successSheetRef = useRef(null);
  const [SuccessScanPaymentOpen, setSuccessScanPaymentOpen] =
    React.useState(false);
  const [SuccessScanPaymentData, setSuccessScanPaymentData] =
    React.useState(null);
  const [isErrorAlert, setIsErrorAlert] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRejectLoading, setIsRejectLoading] = React.useState(false);

  const setAccounts = useStore(state => state.setAccounts);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }
  const styles = styling(colors);
  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior={'none'}
        opacity={0.5}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  const snapPoints = useMemo(() => [450], []);
  React.useEffect(() => {
    if (props.scanSettingOpen) {
      bottomSheetRef?.current?.expand();
    } else {
      bottomSheetRef?.current?.close();
    }
  }, [props]);

  const closeSheet = () => {
    props.setScanSettingOpen(false);
    setSuccessScanPaymentOpen(false);
    successSheetRef?.current?.close();
    bottomSheetRef?.current?.close();
    console.log('ERROR------------');
  };

  const confirmPayment = async () => {
    if (props?.dataLoading) {
      return;
    }
    let userBalance = activeAccount.balances.find(
      bnlc => bnlc?.currency?.toLowerCase() === 'xrph',
    );
    if (
      Number(Number(userBalance?.value)?.toFixed(2)) <
      Number(Number(props?.scannedData?.data?.amount?.xrph)?.toFixed(2))
    ) {
      setIsErrorAlert(true);
      setAlertMsg('Insufficient Balance');
      return;
    }
    try {
      setIsLoading(true);
      const preparedPayment = {
        to: props?.scannedData?.data?.destination_address,
        currency: 'XRPH',
        amount: Number(props?.scannedData?.data?.amount?.xrph)?.toLocaleString(
          undefined,
          {
            maximumFractionDigits: 2,
          },
        ),
        seed: activeAccount.seed,
        memo: '',
        balances: activeAccount.balances,
      };
      const response = await send_token(preparedPayment, node);
      console.log('response----------- of success', response);
      if (response?.error === undefined) {
        const paymentResponse = await confirmMagazinePayment({
          callback_url: props?.scannedData?.data?.callback_url,
          qr_id: props?.scannedData?.qr_id,
          status: 'success',
          message: 'Payment Successful',
          transactionUrl: '',
        });
        if (paymentResponse?.data?.status === 200) {
          const {from, fromBalances} = response;
          let updatedAccounts = [];

          for (let account of accounts) {
            if (account.classicAddress === from) {
              let accountCopy = account;
              accountCopy.balances = fromBalances;
              updatedAccounts.push(accountCopy);
            } else {
              updatedAccounts.push(account);
            }
          }

          const exchangeRates = await getExchangePrices.mutateAsync();
          const adjustedAccounts = await getTotalBalances(
            updatedAccounts,
            exchangeRates,
          );

          setAccounts(adjustedAccounts);
          AsyncStorage.setItem(
            'accounts',
            JSON.stringify(adjustedAccounts),
          ).then(() => {
            console.log('accounts set asynchronously');
          });

          for (let i = 0; i < adjustedAccounts.length; i++) {
            if (
              adjustedAccounts[i].classicAddress ===
              activeAccount.classicAddress
            ) {
              setActiveAccount(adjustedAccounts[i]);
              AsyncStorage.setItem(
                'activeAccount',
                JSON.stringify(adjustedAccounts[i]),
              ).then(() => {
                console.log('active account set asynchronously');
              });
            }
          }

          setAccounts(updatedAccounts);
          AsyncStorage.setItem(
            'accounts',
            JSON.stringify(updatedAccounts),
          ).then(() => {
            console.log('accounts set asynchronously');
          });
          setIsLoading(false);
          closeSheet();
          successSheetRef?.current?.expand();
          setSuccessScanPaymentData({
            amount: props?.scannedData?.data?.amount?.xrph,
            currency: 'XRPH',
            description: props?.scannedData?.data?.description,
          });
        } else {
          setIsLoading(false);
          setIsErrorAlert(true);
          setAlertMsg('Payment Confirmation Failed');
        }
      } else {
        setIsLoading(false);
        setIsErrorAlert(true);
        setAlertMsg('Payment Failed!');
      }
    } catch (e) {
      console.log('ERROR------------ of success', e);
      setIsLoading(false);
      setIsErrorAlert(true);
      setAlertMsg(e.message);
    }
  };

  const rejectPayment = async () => {
    if (props?.dataLoading) {
      return;
    }
    setIsRejectLoading(true);
    try {
      await confirmMagazinePayment({
        callback_url: props?.scannedData?.data?.callback_url,
        qr_id: props?.scannedData?.qr_id,
        status: 'rejected',
        message: 'Payment Rejected',
        transactionUrl: '',
      });
      setIsRejectLoading(false);
      setIsErrorAlert(true);
      setAlertMsg('Payment Rejected!');
      closeSheet();
    } catch (e) {
      setIsRejectLoading(true);
      closeSheet();
      console.log('ERROR------------ of rejection', e);
      setIsRejectLoading(false);
      setIsErrorAlert(true);
      setAlertMsg(e.message || 'Payment Rejected!');
    }
  };

  return (
    <React.Fragment>
      <BottomSheet
        style={{
          borderRadius: 35,
          overflow: 'hidden',
        }}
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundComponent={CustomBackground}>
        <View style={styles.bottomHeader}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: colors.text,
            }}>
            Confirm Payment
          </Text>
          <TouchableOpacity
            onPress={() => {
              rejectPayment();
            }}>
            <MaterialCommunityIcons
              name={'close'}
              color={colors.text}
              size={27}
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            paddingHorizontal: 24,
          }}>
          <Text
            style={{
              fontSize: 14,
              color: theme === 'dark' ? '#F8F8F8' : '#636363',
              width: '60%',
              marginTop: 8,
            }}>
            Confirm Your Payment For Your Order
          </Text>
        </View>

        <View style={styles.fieldsContainer}>
          <View style={styles.txtField}>
            <Text style={styles.labelTxt}>Order ID</Text>
            <Text style={styles.ValueTxt}>
              {props?.dataLoading ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                props?.scannedData?.qr_id?.slice(0, 4) +
                '...' +
                props?.scannedData?.qr_id?.slice(-5)
              )}
            </Text>
          </View>

          <View style={styles.txtField}>
            <Text style={styles.labelTxt}>Amount</Text>
            <Text style={[styles.ValueTxt, {textTransform: 'uppercase'}]}>
              {props?.dataLoading ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                Number(
                  props?.scannedData?.data?.amount?.xrph || 0,
                )?.toLocaleString(undefined, {maximumFractionDigits: 2})
              )}{' '}
              {/* {props?.scannedData?.currency} */}
              XRPH
            </Text>
          </View>

          <View style={styles.txtField}>
            <Text style={styles.labelTxt}>Description</Text>
            <Text style={[styles.ValueTxt, {fontSize: 12, fontWeight: '500'}]}>
              {props?.scannedData?.data?.description}
            </Text>
          </View>

          <TouchableOpacity
            onPress={confirmPayment}
            disabled={isLoading || isRejectLoading}>
            <View
              style={[
                styles.txtField,
                {
                  gap: 10,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  marginTop: 19,
                },
              ]}>
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.bg} />
              ) : (
                <>
                  <AntDesign
                    name={'check'}
                    size={20}
                    color={colors.bg}
                    style={styles.checkIcon}
                  />
                  <Text
                    style={[styles.labelTxt, {color: colors.bg, fontSize: 16}]}>
                    Confirm Payment
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isLoading || isRejectLoading}
            onPress={rejectPayment}>
            <View
              style={[
                styles.txtField,
                {
                  backgroundColor: '#FFEFF2',
                  justifyContent: 'center',
                },
              ]}>
              {isRejectLoading ? (
                <ActivityIndicator size="small" color={'#EE4563'} />
              ) : (
                <Text
                  style={[styles.labelTxt, {color: '#EE4563', fontSize: 16}]}>
                  Reject
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <BottomSheet
        style={{borderRadius: 35, overflow: 'hidden'}}
        ref={successSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundComponent={CustomBackground}>
        <SuccessScanPayment
          SuccessScanPaymentOpen={SuccessScanPaymentOpen}
          setSuccessScanPaymentOpen={setSuccessScanPaymentOpen}
          SuccessScanPaymentData={SuccessScanPaymentData}
          closeSheet={closeSheet}
        />
      </BottomSheet>

      <Alert
        isOpen={isErrorAlert}
        type={'error'}
        message={alertMsg}
        icon={'close'}
        setIsOpen={setIsErrorAlert}
        top={50}
      />
    </React.Fragment>
  );
};

const styling = colors =>
  StyleSheet.create({
    bottomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    txtField: {
      paddingHorizontal: 16,
      marginTop: 8,
      backgroundColor: colors.light_gray_bg,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 46,
      borderRadius: 8,
    },
    fieldsContainer: {
      marginTop: 24,
      paddingHorizontal: 24,
    },
    labelTxt: {
      fontSize: 12,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text_dark1,
    },
    ValueTxt: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
  });
export default ScanSetting;
