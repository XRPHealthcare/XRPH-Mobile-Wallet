import React from 'react';
import { View, StyleSheet } from 'react-native';

const HorizontalLine = ({ color = '#000', thickness = 1.5, margin = 1,widthStyle }) => {
  return (
    <View
      style={[
        widthStyle?styles.lineWidth:styles.line,
        {
          backgroundColor: color,
          height: thickness,
          marginVertical: margin,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  line: {
    // width: '100%',
    flex:1
  },
  lineWidth: {
     width: '100%',
    // flex:1
  },
});

export default HorizontalLine;
