import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useRef} from 'react';
import {light, dark} from '../../../assets/colors/colors';
import useStore from '../../../data/store';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon_Success from '../../../assets/img/Icon_Success.svg';
import Divider from '../../../assets/img/Divider.svg';
import Dark_Icon_Success from '../../../assets/img/Dark_Icon_Success.svg';
const SuccessScanPayment = props => {
  const bottomSheetRef = useRef(null);
  let {theme} = useStore();
  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }
  const styles = styling(colors);
  const date = new Date();
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

  React.useEffect(() => {
    if (props.SuccessScanPaymentOpen) {
      bottomSheetRef?.current?.expand();
    } else {
      bottomSheetRef?.current?.close();
    }
    // console.log("Data--------",props?.SuccessScanPaymentData)
  }, [props.SuccessScanPaymentOpen]);

  return (
    <React.Fragment>
      <View>
        <View style={styles.headerContainer}>
          {theme !== 'dark' ? <Icon_Success /> : <Dark_Icon_Success />}
          <View style={styles.bottomHeader}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.text,
                marginTop: 8,
              }}>
              Payment Success
            </Text>
          </View>

          <View>
            <Text
              style={{
                fontSize: 12,
                color: theme === 'dark' ? '#F8F8F8' : '#636363',
                marginTop: 4,
                width: '60%',
              }}>
              Your payment has been successfully done{' '}
            </Text>
          </View>
        </View>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 22,
            paddingHorizontal: 24,
          }}>
          <Text style={{color: theme === 'dark' ? '#F8F8F8' : '#636363'}}>
            Total Payment
          </Text>
          <Text
            style={[
              styles.ValueTxt,
              {paddingBottom: 16, textTransform: 'uppercase'},
            ]}>
            {props?.SuccessScanPaymentData?.currency} {''}
            {Number(props?.SuccessScanPaymentData?.amount || 0)?.toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2,
              },
            )}
          </Text>
          <View
            style={{
              borderTopWidth: 2,
              borderStyle: 'dashed',
              width: '100%',
              borderColor: '#E0E0E0',
            }}
          />
        </View>

        <View style={{paddingHorizontal: 24, marginTop: 16}}>
          <Text
            style={{
              color: theme === 'dark' ? '#F8F8F8' : '#636363',
              fontSize: 14,
              fontWeight: 500,
            }}>
            Payment For
          </Text>
        </View>
        <View style={styles.fieldsContainer}>
          <View style={[styles.txtField, {height: 61}]}>
            <Text style={[styles.ValueTxt, {fontSize: 16}]}>
              {props?.SuccessScanPaymentData?.description || 'N/A'}
            </Text>
            <Text
              style={[
                styles.labelTxt,
                {
                  color: theme === 'dark' ? '#F8F8F8' : '#636363',
                },
              ]}>
              {formattedDate}
            </Text>
          </View>

          <TouchableOpacity onPress={props.closeSheet}>
            <View
              style={[
                styles.doneButton,
                {
                  gap: 8,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  marginTop: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}>
              <AntDesign
                name={'check'}
                size={20}
                color={colors.bg}
                style={styles.checkIcon}
              />
              <Text
                style={[
                  styles.labelTxt,
                  {color: colors.bg, fontSize: 16, fontWeight: 500},
                ]}>
                Done
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </React.Fragment>
  );
};

const styling = colors =>
  StyleSheet.create({
    bottomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 24,
    },
    txtField: {
      backgroundColor: colors.light_gray_bg,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: 'column',
      gap: 6,
    },
    doneButton: {
      paddingLeft: 10,
      marginTop: 10,
      backgroundColor: colors.light_gray_bg,
      height: 44,
      borderRadius: 10,
    },
    fieldsContainer: {
      marginTop: 8,
      paddingHorizontal: 24,
    },
    labelTxt: {
      fontSize: 14,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text_dark1,
    },
    ValueTxt: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
  });
export default SuccessScanPayment;
