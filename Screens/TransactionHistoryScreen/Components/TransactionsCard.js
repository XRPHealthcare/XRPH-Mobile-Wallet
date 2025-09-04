import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useStore from '../../../data/store';
import HistoryCard from './HistoryCard';
import getTransactionHistory from '../Handlers/get_transaction_history';
import EmptyPlaceholder from '../../../components/EmptyPlaceholders/EmptyPlaceholder';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const TransactionsCard = ({setCopiedModalOpen, isWallet}) => {
  const {activeAccount, theme, node, txHistory, txHistoryLoading} = useStore();
  const setTxHistory = useStore(state => state.setTxHistory);
  const setTxHistoryLoading = useStore(state => state.setTxHistoryLoading);
  const [refreshing, setRefreshing] = React.useState(false);
  

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }


  const styles = styling(colors);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      setTxHistoryLoading(true);
      const history = await getTransactionHistory(activeAccount, node);
      setTxHistory(history);
      setTxHistoryLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.log(err);
      setRefreshing(false);
    }
  };

  function filterAndGroupTransactions(transactions) {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      console.error('Invalid input: transactions should be a non-empty array.');
      return [];
    }
    // Step 1: Filter out "Payment Failed" transactions with "RLUSD" currency
    const filteredTransactions = transactions.filter(txn => 
      !(txn.transactionType === "Payment Failed" && txn.currency === "RLUSD")
    );

    // Step 2: Filter out the transactions that have 
    // amount = "10,000,000,000", currency = "RLUSD", and transactionType = "Payment Failed"
    const amountKey = '10,000,000,000';  // The amount to be removed
    const targetCurrency = 'RLUSD';
    const targetTransactionType = 'Payment Failed';
  
    // Step 3: Filter out the specific object matching all conditions
    const finalTransactions = filteredTransactions.filter(txn => 
      txn.amount != amountKey && txn.currency != targetCurrency && txn.transactionType != targetTransactionType
    );
    return finalTransactions;
  }
  
  
  useEffect(()=>{
console.log('txHistory', txHistory);
  },[txHistory])
  

  const renderItem = ({item}) => (
    <HistoryCard tx={item} setCopiedModalOpen={setCopiedModalOpen} />
  );

  return (
    <React.Fragment>
      <View style={txHistory?.length>0?styles.container:styles.containerCenter}>
        {txHistoryLoading && !txHistory?.length && (
          <Text style={styles.loadingText}>Loading...</Text>
        )}


        {/* {(!txHistoryLoading && txHistory.length<0) ? ( */}
            <View style={{marginBottom: isWallet ? 0 : 0,height:'100%'}}>
             <FlatList
               data={
                 filterAndGroupTransactions(isWallet
                   ? txHistory && Array.isArray(txHistory)
                     ? txHistory?.slice(0, 5)
                     : []
                   : txHistory)
               }
               ListEmptyComponent={() => (
             
                 <View style={{flexDirection: 'column', gap: 4,justifyContent:'center',alignItems:'center',marginTop:isWallet?10:'55%',}}>
                       {!txHistoryLoading&& <EmptyPlaceholder/>}
                 {/* <Pressable
                   onPress={() => {
                     onRefresh();
                   }}>
                   <Text
                     style={[
                       styles.loadingText,
                       {marginTop: 0, color: colors.primary},
                     ]}>
                     Refresh
                   </Text>
                 </Pressable> */}
              </View>
               )}
               renderItem={renderItem}
               keyExtractor={(item, index) => index.toString()}
               refreshControl={
                 <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
               }
             />
           </View>
        {/* ):
        <View style={{flexDirection: 'column', gap: 4,justifyContent:'center',alignItems:'center'}}>
        <EmptyPlaceholder colors={colors}/> */}
  {/* <Pressable
    onPress={() => {
      onRefresh();
    }}>
    <Text
      style={[
        styles.loadingText,
        {marginTop: 0, color: colors.primary},
      ]}>
      Refresh
    </Text>
  </Pressable> */}
{/* </View>
        } */}
       
      </View>
    </React.Fragment>
  );
};

const styling = colors =>
  StyleSheet.create({
    container:{
      flexDirection: 'column', gap: 8, marginBottom: 12,
    },
    containerCenter:{
      flexDirection: 'column', gap: 8, marginBottom: 12,flex:1,justifyContent:'center'
    },
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
      marginTop: 30,
    },
  });

export default TransactionsCard;
