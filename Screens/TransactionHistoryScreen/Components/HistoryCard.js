import React, {useState} from 'react';

import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import useStore from '../../../data/store';
import {light, dark} from '../../../assets/colors/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import {
  CopyDarkIcon,
  CopyLightIcon,
  LedgerDarkIcon,
  LedgerLightIcon,
  PaymentFailDarkIcon,
  PaymentFailLightIcon,
  RecieveTrxDarkIcon,
  RecieveTrxIcon,
  SendTrxDarkIcon,
  SendTrxIcon,
} from '../../../assets/img/new-design';
import Clipboard from '@react-native-clipboard/clipboard';

AntDesign.loadFont();
FontAwesome.loadFont();
Feather.loadFont();

const HistoryCard = ({tx, setCopiedModalOpen}) => {
  let {theme} = useStore();

  const [isOpen, setIsOpen] = useState(false);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors, theme);

  const findPaymentType = type => {
    if (type?.includes('Sent')) {
      return theme === 'dark' ? <SendTrxDarkIcon /> : <SendTrxIcon />;
    } else if (type?.includes('Received')) {
      return theme === 'dark' ? <RecieveTrxDarkIcon /> : <RecieveTrxIcon />;
    } else if (type === 'Payment Failed') {
      return theme === 'dark' ? (
        <PaymentFailDarkIcon />
      ) : (
        <PaymentFailLightIcon />
      );
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(tx?.accountInvolved);
    setCopiedModalOpen(true);
    setTimeout(() => {
      setCopiedModalOpen(false);
    }, 2000);
  };

  return (
    <View style={styles.historyCard}>
      <Pressable
        onPress={() => {
          setIsOpen(!isOpen);
        }}
        style={[styles.row, {justifyContent: 'space-between'}]}>
        <View
          style={[
            styles.row,
            {
              gap: 12,
            },
          ]}>
          {findPaymentType(tx?.transactionType)}
          <View style={[styles.column]}>
            <Text style={styles.dateText}>
              {tx?.day}/{tx?.month}/{tx?.year}
            </Text>
            <Text style={styles.paymentType}>{tx?.transactionType}</Text>
          </View>
        </View>
        <View style={[styles.row, {gap: 12}]}>
          <Text style={styles.amount}>
            {tx?.amount || ''} {tx?.currency || ''}
          </Text>
          <View>
            {isOpen ? (
              <Feather name="chevron-up" size={20} color={colors.text} />
            ) : (
              <Feather name="chevron-down" size={20} color={colors.text} />
            )}
          </View>
        </View>
      </Pressable>
      {isOpen && (
        <>
          <View style={styles.divider} />
          <View style={[styles.row, {justifyContent: 'space-between'}]}>
            <View style={[styles.column, {gap: 6}]}>
              <View style={[styles.row, {gap: 8}]}>
                <Text style={styles.label}>Wallet Address</Text>
                <Pressable onPress={copyToClipboard}>
                  {theme === 'dark' ? <CopyDarkIcon /> : <CopyLightIcon />}
                </Pressable>
              </View>
              <Text style={styles.walletAddress}>
                {tx?.accountInvolved?.slice(0, 5) +
                  '***' +
                  tx?.accountInvolved?.slice(-5)}
              </Text>
            </View>
            <Pressable
              style={[styles.actionButton]}
              onPress={() => {
                Linking.openURL(
                  `https://livenet.xrpl.org/transactions/${tx?.hash}`,
                );
              }}>
              {theme === 'dark' ? <LedgerDarkIcon /> : <LedgerLightIcon />}
              <Text style={styles.actionButtonText}>View on Ledger</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
};

const styling = (colors, theme) =>
  StyleSheet.create({
    historyCard: {
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: '#ededed',
      paddingHorizontal: 14,
      paddingVertical: 18,
      borderRadius: 8,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
    },
    divider: {
      marginVertical: 9,
      height: 1,
      backgroundColor: '#E0E3E8',
    },
    dateText: {
      fontSize: 10,
      color: theme === 'dark' ? '#f8f8f8' : '#8f92a1',
      fontFamily: 'LeagueSpartanRegular',
      fontWeight: '400',
    },
    paymentType: {
      fontSize: 12,
      color: colors.text,
      fontFamily: 'LeagueSpartanMedium',
      fontWeight: '500',
    },
    amount: {
      fontSize: 16,
      color: colors.text,
      fontFamily: 'LeagueSpartanSemiBold',
      fontWeight: '600',
    },
    label: {
      fontSize: 12,
      color: theme === 'dark' ? '#f8f8f8' : '#8f92a1',
      fontFamily: 'LeagueSpartanMedium',
      fontWeight: '500',
    },
    walletAddress: {
      fontSize: 12,
      color: theme === 'dark' ? '#f8f8f8' : '#8f92a1',
      fontFamily: 'LeagueSpartanRegular',
      fontWeight: '400',
    },
    actionButton: {
      backgroundColor: colors.primary,
      padding: 8,
      borderRadius: 8,
      flexDirection: 'row',
      gap: 4,
      alignItems: 'center',
    },
    actionButtonText: {
      fontSize: 10,
      fontFamily: 'LeagueSpartanRegular',
      fontWeight: '400',
      color: theme === 'dark' ? '#1a1a1a' : '#fff',
    },
  });

export default HistoryCard;
