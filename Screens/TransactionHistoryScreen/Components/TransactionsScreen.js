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
  Linking,
  Platform,
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
import Navbar from '../../../components/Navbar';
import getTransactionHistory from '../Handlers/get_transaction_history';
import Clipboard from '@react-native-clipboard/clipboard';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const Transaction = props => {
  const {theme} = useStore();

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  const [height, setHeight] = React.useState('auto');

  const toggleHeight = () => {
    if (height === 'auto') {
      setHeight(100);
    } else {
      setHeight('auto');
    }
  };

  const copyToClipboard = () => {
    console.log('copied: ', props.accountInvolved);
    Clipboard.setString(props.accountInvolved);
    props.setCopiedModalOpen(true);
    setTimeout(() => {
      props.setCopiedModalOpen(false);
    }, 2000);
  };

  return (
    <TouchableOpacity onPress={toggleHeight}>
      <View style={[styles.transactionWrapper, {height: height}]}>
        <View style={styles.transactionTop}>
          <Text style={styles.accountInvolved}>{props.accountInvolved}</Text>
          <Text style={styles.date}>
            {props.month}
            <Text style={styles.unsupportedCharacter}>/</Text>
            {props.day}
            <Text style={styles.unsupportedCharacter}>/</Text>
            {props.year}
          </Text>
        </View>
        <View style={styles.transactionBottom}>
          <Text style={styles.transactionType}>{props.transactionType}</Text>
          {(props.transactionType === 'Payment Sent' && (
            <Text style={styles.transactionAmountPaymentSent}>
              -{props.transactionAmount} {props.currency}
            </Text>
          )) ||
            (props.transactionType === 'Payment Received' && (
              <Text style={styles.transactionAmountPaymentReceived}>
                +{props.transactionAmount} {props.currency}
              </Text>
            )) ||
            (props.transactionType === 'Payment Failed' && (
              <Text style={styles.transactionAmountPaymentFailed}>
                {props.transactionAmount} {props.currency}
              </Text>
            )) || (
              <Text style={styles.transactionAmount}>
                {props.transactionAmount} {props.currency}
              </Text>
            )}
        </View>

        {height === 100 && (
          <View style={styles.transactionBottom}>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copyToClipboard}>
              <View style={styles.buttonWrapper}>
                <Text style={styles.buttonText}>Copy Address</Text>
                <Feather name={'copy'} size={20} color={'#222222'} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => {
                Linking.openURL(
                  `https://livenet.xrpl.org/transactions/${props.hash}`,
                );
              }}>
              <View style={styles.buttonWrapper}>
                <Text style={styles.buttonText}>View on Ledger</Text>
                <MaterialCommunityIcons
                  name={'cube-scan'}
                  size={20}
                  color={'#222222'}
                />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const TransactionsScreen = ({navigation}) => {
  const {activeAccount, theme, node} = useStore();
  const [txHistory, setTxHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  let [copiedModalOpen, setCopiedModalOpen] = React.useState(false);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  React.useEffect(() => {
    const getHistory = async () => {
      console.log('getHistory started');
      const history = await getTransactionHistory(activeAccount, node);
      console.log('history', history);
      return history;
    };
    setLoading(true);
    getHistory()
      .then(response => {
        if (response.error === undefined) {
          setTxHistory(response);
          setLoading(false);
          setErrorMessage('');
        } else {
          setLoading(false);
          setErrorMessage('Error: Trouble Connecting To The Rippled Server.');
        }
      })
      .catch(error => {
        setLoading(false);
        console.log('error', error);
        setErrorMessage(
          'Error: Cannot Fetch Account History for Inactive Account.',
        );
      });
  }, []);

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
          <ScrollView style={styles.transactionsWrapper}>
            {!loading &&
              errorMessage.length === 0 &&
              txHistory.map((tx, index) => (
                <Transaction
                  key={index}
                  setCopiedModalOpen={setCopiedModalOpen}
                  accountInvolved={tx.accountInvolved}
                  transactionType={tx.transactionType}
                  transactionAmount={tx.amount}
                  currency={tx.currency}
                  month={tx.month}
                  day={tx.day}
                  year={tx.year}
                  hash={tx.hash}
                />
              ))}
            {loading && <Text style={styles.loadingText}>Loading...</Text>}
            {errorMessage.length > 0 && (
              <Text style={styles.loadingText}>{errorMessage}</Text>
            )}
          </ScrollView>
          <Navbar activeIcon="transactions" navigation={navigation} />
        </View>
        {copiedModalOpen && (
          <View style={styles.addAccountModalWrapper}>
            <View style={styles.copyModalHeader}>
              <View style={styles.copyModalHeaderSpacer}>
                <Text style={styles.sendModalHeaderTextName}>
                  Copied to Clipboard
                </Text>
                <AntDesign
                  name={'check'}
                  size={20}
                  color={colors.text}
                  style={styles.checkIcon}
                />
              </View>
              <TouchableOpacity onPress={() => setCopiedModalOpen(false)}>
                <Text style={styles.sendModalHeaderText}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      color: colors.text,
      textAlign: 'left',
    },
    sendModalHeaderTextName: {
      fontSize: 16,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
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
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      textAlign: 'right',
      marginTop: 5,
    },
    accountNameText: {
      fontSize: 16,
      color: colors.primary,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginTop: 10,
      textAlign: 'right',
    },
    transactionsWrapper: {
      width: '96%',
      paddingHorizontal: 5,
      paddingVertical: 1,
      backgroundColor: colors.text_light,
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
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
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
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
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
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginRight: 10,
    },
    transactionAmountPaymentSent: {
      fontSize: 16,
      color: '#B33EFB',
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginRight: 10,
    },
    transactionAmountPaymentReceived: {
      fontSize: 16,
      color: '#08F685',
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginRight: 10,
    },
    transactionAmountPaymentFailed: {
      fontSize: 16,
      color: '#ff6961',
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginRight: 10,
    },
    date: {
      fontSize: 12,
      color: colors.text_dark,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginTop: 5,
      marginRight: 10,
    },
    unsupportedCharacter: {
      fontFamily: 'Helvetica',
    },
    loadingText: {
      fontSize: 16,
      color: colors.text_dark,
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
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
      fontFamily: Platform.OS === 'ios' ? 'NexaBold' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      textAlign: 'center',
      marginRight: 10,
    },
  });

export default TransactionsScreen;
