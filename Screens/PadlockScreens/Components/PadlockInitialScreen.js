import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity
  } from 'react-native';
import SlideButton from 'rn-slide-button';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { light, dark } from '../../../assets/colors/padlockColors';
import useStore from '../../../data/store';
import PadlockRow from './PadlockRow';

AntDesign.loadFont();
MaterialCommunityIcons.loadFont();

const PadlockInitialScreen = ({ navigation }) => {
    const { padlock, theme } = useStore();
    const setEntropy = useStore((state) => state.setEntropy);

    let colors = light;
    if (theme === 'dark') {
      colors = dark
    }

    const styles = styling(colors);

    React.useEffect(() => {
      const entropyString = 
        padlock['A'].join("") + " "
        + padlock['B'].join("") + " "
        + padlock['C'].join("") + " "
        + padlock['D'].join("") + " "
        + padlock['E'].join("") + " "
        + padlock['F'].join("") + " "
        + padlock['G'].join("") + " "
        + padlock['H'].join("")
      console.log("Entropy String: ", entropyString);
      setEntropy(entropyString);
    }, []);

    return (
      <GestureHandlerRootView>
        <SafeAreaView style={{ backgroundColor: colors.bg }}>
          <StatusBar />
          <ScrollView contentContainerStyle={styles.bg}>
              <Image
                style={styles.headerImage}
                source={theme === 'light' ? 
                require('../../../assets/img/header_logo.png') :
                require('../../../assets/img/header_logo_dark.png') }
              />
              <View style={styles.directionsContainer}>
                <Text style={styles.directionText}>
                  Please write down the following code combinations on a piece of
                  paper.
                </Text>
                <Text style={styles.directionText}>
                  <Text style={styles.note}>Note</Text>:
                  This information is extremely valuable and should be kept
                  private.
                </Text>
              </View>

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

              <View style={styles.slideButtonContainer}>
                <TouchableOpacity style={styles.buttonConnect} onPress={() => navigation.navigate('Start Screen')}>
                    <View style={styles.buttonWrapper}>
                        <Text style={styles.buttonConnectText}>Back</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonCreate} onPress={() => navigation.navigate('Padlock Final Screen')}>
                    <View style={styles.buttonWrapper}>
                        <Text style={styles.buttonCreateText}>Continue</Text>
                        <AntDesign name={"arrowright"} size={30} color={colors.text} style={styles.continueIcon} />
                    </View>
                </TouchableOpacity>
              </View>
          </ScrollView>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  };

  
const styling = colors => StyleSheet.create({
    bg: {
        backgroundColor: colors.bg,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        paddingHorizontal: 10,
    },
    headerImage: {
      width: 350,
      height: 65,
      marginTop: 10,
      marginLeft: -20,
    },
    directionsContainer: {
      marginTop: -10,
      width: '100%',
      paddingHorizontal: 10,
    },
    welcomeText: {
      fontSize: 20,
      color: colors.text,
      fontFamily: "Nexa",
      marginBottom: -30,
    },
    directionText: {
      fontSize: 16,
      color: colors.text,
      fontFamily: "Nexa",
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
      width: '95%',
      alignItems: 'center',
      justifyContent: 'space-evenly',
    },
    slideButtonContainer: {
        alignSelf: 'center',
        width: '100%',
        paddingHorizontal: 10,
        paddingBottom: 10,
        flexDirection: 'row'
    },
    buttonConnect: {
      width: '48%',
      marginRight: '4%',
      height: 80,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.text_light,
      borderRadius: 20,
      marginBottom: 10
    },
    buttonCreate: {
      width: '48%',
      height: 80,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.secondary,
      borderRadius: 20,
      marginBottom: 10
    },
    buttonConnectText: {
      fontSize: 20,
      color: colors.text,
      fontFamily: "Nexa", fontWeight: "bold",
    },
    buttonCreateText: {
      fontSize: 20,
      color: colors.text,
      fontFamily: "Nexa", fontWeight: "bold",
    },
    buttonWrapper: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    continueIcon: {
      marginLeft: 10
    },
    
  });

  export default PadlockInitialScreen;