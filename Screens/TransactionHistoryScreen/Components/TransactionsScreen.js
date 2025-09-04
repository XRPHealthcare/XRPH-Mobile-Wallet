import React, {useEffect} from 'react';

import {
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import {dark, light} from '../../../assets/colors/colors';
import Success from '../../../components/Success';
import useStore from '../../../data/store';
import getTransactionHistory from '../Handlers/get_transaction_history';
import TransactionsCard from './TransactionsCard';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const TransactionsScreen = ({navigation}) => {
  const {activeAccount, theme, node, txHistory, txHistoryLoading} = useStore();
  let [copiedModalOpen, setCopiedModalOpen] = React.useState(false);
  const setTxHistory = useStore(state => state.setTxHistory);
  const setTxHistoryLoading = useStore(state => state.setTxHistoryLoading);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  useEffect(() => {
    if (!txHistory?.length) {
      fetchTrxHistory(activeAccount);
    }
  }, [activeAccount]);

  const fetchTrxHistory = async activeAccount => {
    setTxHistoryLoading(true);
    setTxHistory([]);
    const history = await getTransactionHistory(activeAccount, node);
    setTxHistory(history);
    setTxHistoryLoading(false);
  };

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
              <Text style={styles.headerText}>Transaction History</Text>
              <Text style={styles.accountNameText}>{activeAccount.name}</Text>
            </View>
          </View>

          <View style={styles.transactionsWrapper}>
            <TransactionsCard setCopiedModalOpen={setCopiedModalOpen} />
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
    bg: {
      backgroundColor: colors.bg_gray,
      alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
    },
    addAccountModalWrapper: {
      position: 'absolute',
      top: 50,
      backgroundColor: colors.secondary,
      width: '96%',
      marginLeft: '3%',
      height: 30,
      elevation: 10,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
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
    checkIcon: {
      marginLeft: 10,
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
      paddingHorizontal: 10,
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
    transactionsWrapper: {
      flex: 1,
      width: '96%',
      paddingHorizontal: 5,
      paddingVertical: 1,
      // backgroundColor: colors.text_light,
      borderRadius: 10,
    },
    transactionWrapper: {
      backgroundColor: colors.bg,
      borderRadius: 10,
      marginBottom: 5,
      marginTop: 5,
      elevation: 5,
      flexDirection: 'column',
      width: '100%',
    },
    transactionTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    accountInvolved: {
      fontSize: 10,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginTop: 5,
      marginLeft: 10,
    },
    transactionBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    transactionType: {
      fontSize: 16,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginTop: 5,
      marginBottom: 5,
      marginLeft: 10,
    },

    // bg: '#ffffff',
    // primary: '#B33EFB',
    // secondary: '#08F685',
    // text: '#222222',
    // button_text: '#222222',
    // text_light: '#d9d9d9',
    // text_dark: "#333333",

    transactionAmount: {
      fontSize: 16,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginRight: 10,
    },
    transactionAmountPaymentSent: {
      fontSize: 16,
      color: '#B33EFB',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginRight: 10,
    },
    transactionAmountPaymentReceived: {
      fontSize: 16,
      color: '#08F685',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginRight: 10,
    },
    transactionAmountPaymentFailed: {
      fontSize: 16,
      color: '#ff6961',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginRight: 10,
    },
    date: {
      fontSize: 12,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      marginTop: 5,
      marginRight: 10,
    },
    unsupportedCharacter: {
      fontFamily: 'Helvetica',
    },
    loadingText: {
      fontSize: 16,
      color: colors.text_dark,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      textAlign: 'center',
      marginTop: 50,
    },
    copyButton: {
      backgroundColor: colors.primary,
      width: '45%',
      marginLeft: 10,
      height: 40,
      borderRadius: 10,
      marginTop: 5,
    },
    viewButton: {
      backgroundColor: colors.secondary,
      width: '45%',
      marginRight: 10,
      height: 40,
      borderRadius: 10,
      marginTop: 5,
    },
    buttonWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: 40,
      paddingHorizontal: 10,
    },
    buttonText: {
      fontSize: 14,
      color: '#222222',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      textAlign: 'center',
      marginRight: 10,
    },
  });

export default TransactionsScreen;
