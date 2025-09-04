import React, {useRef} from 'react';
import {StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import useStore from '../../../data/store';
import {light, dark} from '../../../assets/colors/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  EuroDarkIcon,
  EuroLightIcon,
  GbpDarkIcon,
  GbpLightIcon,
  UsdDarkIcon,
  UsdLightIcon,
} from '../../../assets/img/new-design';
import RBSheet from 'react-native-raw-bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';

// const colors = light; // eventually put this in state
AntDesign.loadFont();
FontAwesome.loadFont();
Feather.loadFont();
MaterialCommunityIcons.loadFont();

const SelectCurrency = props => {
  const bottomSheetRef = useRef(null);

  let {theme, exchangeTo} = useStore();

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors, theme);
  const currencies = ['USD', 'EUR', 'GBP'];

  const findCurrencyIco = currency => {
    const iconMap = {
      USD: theme === 'dark' ? <UsdDarkIcon /> : <UsdLightIcon />,
      EUR: theme === 'dark' ? <EuroDarkIcon /> : <EuroLightIcon />,
      GBP: theme === 'dark' ? <GbpDarkIcon /> : <GbpLightIcon />,
    };
    return iconMap[currency];
  };

  const closeSheet = () => {
    props?.onClose();
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
    if (props?.isOpen) {
      bottomSheetRef?.current?.open();
    } else {
      bottomSheetRef?.current?.close();
    }
  }, [props?.isOpen]);
  return (
    <React.Fragment>
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
                props.onSelect(currency);
                closeSheet();
              }}>
              {currency === exchangeTo ? (
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
    </React.Fragment>
  );
};

const styling = (colors, theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
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
  });

export default SelectCurrency;
