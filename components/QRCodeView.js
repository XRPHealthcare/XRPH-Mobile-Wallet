import { ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import QRCodeStyled from 'react-native-qrcode-styled';

const QRCodeView = ({data,color,theme}) => {
  return (
    <ImageBackground style={[styles.backGroundImageStyle,]} source={theme === 'dark'?require('../assets/img/frame_dark.png') :require('../assets/img/frame_light.png')}>
<QRCodeStyled
      data={data}
      style={styles.svg}
      padding={10}
      pieceSize={6}
      pieceBorderRadius={4}
      gradient={{
        type: 'radial',
        options: {
          center: [0.5, 0.5],
          radius: [1, 1],
          colors: [color, color],
          locations: [0, 1],
        },
      }}
      outerEyesOptions={{
        topLeft: {
          borderRadius: [10, 10, 10, 10],
        },
        topRight: {
          borderRadius: [10, 10, 10,10],
        },
        bottomLeft: {
          borderRadius:  [10, 10, 10,10],
        },
      }}
      innerEyesOptions={{
        borderRadius: 5,
        scale: 0.95,
      }}
    />
     </ImageBackground>
 
  )
}

export default QRCodeView

const styles = StyleSheet.create({
    svg: {
        backgroundColor: 'transparent',
        borderRadius: 2,
        overflow: 'hidden',
      },
      backGroundImageStyle:{
        padding:5,
        tintColor:'red'
      }
})