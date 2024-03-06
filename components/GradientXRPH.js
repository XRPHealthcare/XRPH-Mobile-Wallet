import MaskedView from '@react-native-masked-view/masked-view';
import React from 'react';
import {Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

function GradientXRPH({colors, ...rest}) {
  return (
    <MaskedView maskElement={<Text {...rest} />}>
      <LinearGradient
        colors={colors}
        start={{x: -0.9, y: 0}}
        end={{x: 1, y: 0}}>
        <Text {...rest} style={[rest.style, {opacity: 0}]} key={rest?.children}>
          {rest?.children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

export default GradientXRPH;
