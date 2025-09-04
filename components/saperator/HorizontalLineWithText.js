import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import HorizontalLine from './HorizontalLine'

const HorizontalLineWithText = ({text, color = '#000',textColor}) => {
  return (
    <View style={styles.container}>
        <HorizontalLine color={color}/>
     <Text
                  style={[
                    styles.destinationTag,
                    {
                     color:textColor
                    },
                  ]}>
                 {text}
                </Text>
      <HorizontalLine color={color}/>
    </View>
  )
}

export default HorizontalLineWithText

const styles = StyleSheet.create({
    container:{
        //  flex:1,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        marginTop:35
    },
    destinationTag: {
        fontSize: 14,
        fontWeight: '400',
        // textAlign: 'center',
         marginHorizontal:5,
      },
})