import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NoTransactionPlaceholderIcon } from '../../assets/img/new-design'
import { dark, light } from '../../assets/colors/colors';
import useStore from '../../data/store';

const EmptyPlaceholder = ({color}) => {
  const {theme} = useStore();
  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles=styling(colors)
  return (
    <View style={styles.container}>
        <NoTransactionPlaceholderIcon/>
      <Text style={styles.titleStyle}>No Transaction Activity!</Text>
      <Text style={styles.descriptionStyle}>Your transaction history will appear here once you start making transactions.</Text>
    </View>
  )
}

export default EmptyPlaceholder

const styling =colors=> StyleSheet.create({
    container:{
        justifyContent:'center',
        alignItems:'center',
        marginTop:15,
        margin:20
    },
    titleStyle: {
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 20,
        color:colors.text
      },
      descriptionStyle: {
        fontSize: 15,
        fontWeight: '400',
        textAlign: 'center',
        marginTop: 7,
        color:colors.text_placeholder_gray,
      },
})