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
  Platform,
} from 'react-native';
import SlideButton from 'rn-slide-button';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {light, dark} from '../../../assets/colors/padlockColors';
import useStore from '../../../data/store';
import PadlockRow from './PadlockRow';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

AntDesign.loadFont();
MaterialCommunityIcons.loadFont();
Feather.loadFont();

const PadlockInitialScreen = ({navigation}) => {
  const {padlock, theme} = useStore();
  const setEntropy = useStore(state => state.setEntropy);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  React.useEffect(() => {
    const entropyString =
      padlock['A'].join('') +
      ' ' +
      padlock['B'].join('') +
      ' ' +
      padlock['C'].join('') +
      ' ' +
      padlock['D'].join('') +
      ' ' +
      padlock['E'].join('') +
      ' ' +
      padlock['F'].join('') +
      ' ' +
      padlock['G'].join('') +
      ' ' +
      padlock['H'].join('');
    console.log('Entropy String: ', entropyString);
    setEntropy(entropyString);
  }, []);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />
        <View style={styles.bg}>
          <View style={[styles.column, {gap: 10}]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Start Screen')}>
              <Feather
                name={'chevron-left'}
                size={35}
                color={colors.text}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Image
              style={styles.headerImage}
              source={
                theme === 'light'
                  ? require('../../../assets/img/header_logo.png')
                  : require('../../../assets/img/header_logo_dark.png')
              }
            />
            <View style={styles.directionsContainer}>
              <Text style={styles.directionText}>
                Please write down the following code combinations on a piece of
                paper.
              </Text>
              <Text style={styles.directionText}>
                <Text style={styles.note}>Note</Text>: This information is
                extremely valuable and should be kept private.
              </Text>
            </View>
          </View>

          <View style={[styles.column, {gap: 10, alignItems: 'center'}]}>
            <ScrollView
              automaticallyAdjustKeyboardInsets={true}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}>
              <View style={styles.padlock}>
                <PadlockRow padlock={padlock} letter={'A'} />
                <PadlockRow padlock={padlock} letter={'B'} />
                <PadlockRow padlock={padlock} letter={'C'} />
                <PadlockRow padlock={padlock} letter={'D'} />
                <PadlockRow padlock={padlock} letter={'E'} />
                <PadlockRow padlock={padlock} letter={'F'} />
                <PadlockRow padlock={padlock} letter={'G'} />
                <PadlockRow padlock={padlock} letter={'H'} />
                <View style={styles.padlockBottom} />
              </View>
            </ScrollView>
          </View>
          <View style={styles.slideButtonContainer}>
            <TouchableOpacity
              style={styles.buttonCreate}
              onPress={() => navigation.navigate('Padlock Final Screen')}>
              <View style={styles.buttonWrapper}>
                <Text style={styles.buttonCreateText}>Continue</Text>
                <AntDesign
                  name={'arrowright'}
                  size={30}
                  color={colors.text}
                  style={styles.continueIcon}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styling = colors =>
  StyleSheet.create({
    bg: {
      backgroundColor: colors.bg,
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 10,
      height: '100%',
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
    },
    headerImage: {
      width: 350,
      height: 65,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    directionsContainer: {
      width: '100%',
      paddingHorizontal: 10,
    },
    welcomeText: {
      fontSize: 20,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanLight',
      marginBottom: -30,
    },
    directionText: {
      fontSize: 16,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanLight',
      marginTop: 10,
    },
    note: {
      fontWeight: 'bold',
    },
    padlockBottom: {
      height: 6,
    },
    padlock: {
      backgroundColor: colors.text_light,
      borderRadius: 10,
      width: '97%',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    slideButtonContainer: {
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 13,
      flexDirection: 'row',
    },
    buttonCreate: {
      width: '100%',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.secondary,
      borderRadius: 10,
      paddingVertical: 18,
      paddingHorizontal: 10,
    },
    buttonConnectText: {
      fontSize: 20,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    gradientContinue: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: 60,
      borderRadius: 10,
    },
    buttonCreateText: {
      fontSize: 20,
      color: colors.text,
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      fontWeight: Platform.OS === 'ios' ? '500' : '100',
    },
    buttonWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    continueIcon: {
      marginLeft: 10,
    },
  });

export default PadlockInitialScreen;
