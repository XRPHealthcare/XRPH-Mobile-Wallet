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
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { light, dark } from '../../../assets/colors/colors';
import useStore from '../../../data/store';
import checkConnectionStatus from '../Handlers/xrpl_connection_status';


AntDesign.loadFont();
Feather.loadFont();
MaterialCommunityIcons.loadFont();

const StartScreen = ({navigation}) => {
  const { theme, accounts } = useStore();
  const [isConnected, setIsConnected] = React.useState(true);

  let colors = light;
  if (theme === 'dark') {
    colors = dark
  }

  const styles = styling(colors);

  React.useEffect(() => {
    checkConnectionStatus().then(res => {
      if (res) {
        setIsConnected(true);
        console.log('connected')
      } else {
        setIsConnected(false);
        console.log('not connected')
      }
    })
  }, []);

  const checkConnection = () => {
    checkConnectionStatus().then(res => {
      if (res) {
        setIsConnected(true);
        console.log('connected')
      } else {
        setIsConnected(false);
        console.log('not connected')
      }
    });
  }
  
  return (
    <GestureHandlerRootView>
        <StatusBar />
        <ScrollView contentContainerStyle={styles.bg}>
            <Image
              style={styles.introImage}
              source={theme === 'light' ? 
              require('../../../assets/img/intro_logo.png') : 
              require('../../../assets/img/intro_logo_dark.png') }
            />
            {isConnected && <View style={styles.slideButtonContainer}>
                <TouchableOpacity style={styles.buttonConnect} onPress={() => navigation.navigate('Input Padlock Screen')}>
                    <View style={styles.buttonWrapper}>
                        <Text style={styles.buttonConnectText}>Connect Existing Account</Text>
                        <MaterialCommunityIcons name={"cube-send"} size={30} color={colors.bg} style={styles.continueIcon} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonCreate} onPress={() => navigation.navigate('Padlock Initial Screen')}>
                    <View style={styles.buttonWrapper}>
                        <Text style={styles.buttonCreateText}>Create New Account</Text>
                        <MaterialCommunityIcons name={"cube-scan"} size={30} color={colors.bg} style={styles.continueIcon} />
                    </View>
                </TouchableOpacity>
                { accounts.length > 0 && 
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home Screen')}>
                    <View style={styles.buttonWrapper}>
                        <Feather name={"arrow-left"} size={25} color={colors.text} style={styles.backIcon} />
                        <Text style={styles.backButtonText}>Back</Text>
                    </View>
                </TouchableOpacity>
                }
            </View>}
            {!isConnected && 
              <View style={styles.slideButtonContainer}>
                <Text style={styles.errorMessageText}>Error: Cannot connect to the Rippled server. Please make sure you are connected to wifi.</Text>
                <TouchableOpacity style={styles.buttonConnect} onPress={checkConnection}>
                    <View style={styles.buttonWrapper}>
                        <Text style={styles.buttonConnectText}>Retry</Text>
                    </View>
                </TouchableOpacity>
              </View> 
            }
        </ScrollView>
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
    paddingHorizontal: 0,
    fontFamily: "Nexa", fontWeight: "bold",
  },
  introImage: {
    width: 366,
    height: 200,
    marginTop: 150,
  },
  slideButtonContainer: {
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 10,
    paddingBottom: 10
  },
  slideButtonThumbStyle: {
    borderRadius: 10,
    backgroundColor: colors.bg,
    width: 80,
    elevation: 0,
  },
  slideButtonContainerStyle: {
    backgroundColor: colors.text_light,
    borderRadius: 10,
    elevation: 0,
    fontFamily: "Nexa", fontWeight: "bold",
  }, 
  slideButtonUnderlayStyle: {
    backgroundColor: colors.text_light,
  },
  slideButtonTitleStyle: {
    fontSize: 20,
    color: colors.bg,
    fontFamily: "Nexa", fontWeight: "bold",
  },
  buttonConnect: {
    width: '100%',
    height: 80,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: colors.text,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonCreate: {
    width: '100%',
    height: 80,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginBottom: 12
  },
  buttonConnectText: {
    fontSize: 20,
    color: colors.bg,
    fontFamily: "Nexa", fontWeight: "bold",
  },
  buttonCreateText: {
    fontSize: 20,
    color: colors.bg,
    fontFamily: "Nexa", fontWeight: "bold",
  },
  backButton: {
    width: '40%',
    marginLeft: '30%',
    height: 50,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: colors.text_light,
    borderRadius: 10,
    marginBottom: 10
  },
  backButtonText: {
    fontSize: 20,
    color: colors.text,
    fontFamily: "Nexa", fontWeight: "bold",
    marginTop: 6
  },
  buttonWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  continueIcon: {
    marginLeft: 20
  },
  backIcon: {
    marginRight: 10
  },
  errorMessageText: {
    backgroundColor: colors.text,
    color: '#ff6961',
    fontFamily: 'Nexa', fontWeight: 'bold',
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
    width: '100%'
  }
});

export default StartScreen;