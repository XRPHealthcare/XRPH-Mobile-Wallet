import React from 'react';

import {StyleSheet, View, Text, Platform} from 'react-native';
import _ from 'lodash';
import {light, dark} from '../../../assets/colors/padlockColors';
import LottieView from 'lottie-react-native';
import useStore from '../../../data/store';

const AddAccountAnimation = () => {
  // const [count, setCount] = React.useState(0);
  // const [message, setMessage] = React.useState("Creating Account...");
  const {theme} = useStore();

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  // React.useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (count < 5) {
  //       setMessage("Creating Account...");
  //     } else if (count < 10) {
  //       setMessage("Connecting to the XRP Ledger...");
  //     } else if (count < 15) {
  //       setMessage("Establishing a Secure Connection...");
  //     } else if (count < 20) {
  //       setMessage("Generating a New Wallet Address...");
  //     } else if (count < 25) {
  //       setMessage("Collecting Account Information...");
  //     } else if (count < 30) {
  //       setMessage("Funding Wallet With XRP...");
  //     } else if (count < 35) {
  //       setMessage("Funding Wallet With XRPH...");
  //     } else if (count < 40) {
  //       setMessage("Securing Account...");
  //     } else {
  //       setMessage("Finishing...");
  //     }
  //     setCount((c) => c + 1);
  //   }, 1000)

  //   return () => clearInterval(timer);
  // }, [count]);

  return (
    <View style={styles.loadingAnimationWrapper}>
      {/* <View style={styles.sendModalHeader}>
              <Text style={styles.sendModalHeaderText}>{message}</Text>
        </View> */}
      <LottieView
        style={styles.addAccountAnimation}
        source={require('../../../assets/animations/addAccountAnimation.json')}
        autoPlay
        loop
      />
    </View>
  );
};

const styling = colors =>
  StyleSheet.create({
    loadingAnimationWrapper: {
      backgroundColor: colors.bg,
      width: '90%',
      height: 350,
      marginLeft: '5%',
      marginBottom: 100,
      marginTop: 100,
      // elevation: 5,
      borderRadius: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    addAccountAnimation: {
      width: '100%',
      height: '100%',
    },
    sendModalHeader: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 10,
      marginBottom: 20,
    },
    sendModalHeaderText: {
      fontSize: 20,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
      color: colors.text,
      textAlign: 'center',
    },
  });

export default AddAccountAnimation;
