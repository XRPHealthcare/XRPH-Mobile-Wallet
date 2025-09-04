import { StyleSheet, Text, View,TouchableOpacity } from 'react-native'
import React from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { light,dark } from '../assets/colors/colors';
import useStore from '../data/store';


MaterialCommunityIcons.loadFont();
const BackHeader = ({title,backOnPress,rightOnPress}) => {
    let {theme} =useStore();
    let colors = light;
    if (theme === 'dark') {
      colors = dark;
    }

    const styles = styling(colors);
  return (
       <View style={styles.header}>
               <TouchableOpacity style={styles.leftIconStyle} onPress={backOnPress}>
                 <MaterialCommunityIcons
                   name={'chevron-left'}
                   color={colors.text}
                   size={30}
                 />
               </TouchableOpacity>
               <Text style={styles.headerTitle}>{title}</Text>
               {rightOnPress?<TouchableOpacity onPress={shareRequestPayment}>
                 <MaterialCommunityIcons
                   name={'share-variant-outline'}
                   color={colors.text}
                   size={20}
                 />
               </TouchableOpacity>:<Text></Text>}
             </View>
  )
}

export default BackHeader

const styling=colors=>StyleSheet.create({
    header: {
        width: '100%',
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: colors.text,
      },
      headerTitle: {
        fontSize: 18,
        color: colors.text,
        fontWeight: '600',
        marginRight:20,
      },
      leftIconStyle:{
      marginLeft:10,
      width:30,
      }
})