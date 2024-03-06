import React, {useMemo} from 'react';
import Animated, {
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';
import useStore from '../../../data/store';
import {dark, light} from '../../../assets/colors/colors';

const CustomBackground = ({style, animatedIndex}) => {
  let {theme} = useStore();
  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }
  //#region styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    // @ts-ignore
    backgroundColor: interpolateColor(
      animatedIndex.value,
      [0, 1],
      [colors.dark_bg, colors.dark_bg],
    ),
  }));
  const containerStyle = useMemo(
    () => [style, containerAnimatedStyle],
    [style, containerAnimatedStyle],
  );
  //#endregion

  // render
  return <Animated.View pointerEvents="none" style={containerStyle} />;
};

export default CustomBackground;
