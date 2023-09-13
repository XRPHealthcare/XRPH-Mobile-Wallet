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
import AsyncStorage from '@react-native-async-storage/async-storage';

AntDesign.loadFont();
Feather.loadFont();
MaterialCommunityIcons.loadFont();

const PreloadScreen = ({navigation}) => {
    const { theme } = useStore();
    const setAccounts = useStore((state) => state.setAccounts);
    const setActiveAccount = useStore((state) => state.setActiveAccount);
    const setPin = useStore((state) => state.setPin);
    const setTotalBalanceCurrency = useStore((state) => state.setTotalBalanceCurrency);
    const toggleTheme = useStore((state) => state.toggleTheme);

    let colors = light;
    if (theme === 'dark') {
        colors = dark
    }

    const styles = styling(colors);

    React.useEffect(() => {
        let userIsLoggedIn = true;
        const getData = async () => {
            // AsyncStorage.clear();
            const pin = await AsyncStorage.getItem('pin')
            if (pin !== null) {
            // value previously stored
                setPin(pin);
                // navigation.navigate('Start Screen');
            } else {
                userIsLoggedIn = false;
            }
            console.log(pin);

            const accounts = await AsyncStorage.getItem('accounts')
            if (accounts !== null) {
                // value previously stored
                setAccounts(JSON.parse(accounts));
            } else {
                userIsLoggedIn = false;
            }
            console.log(accounts);

            const activeAccount = await AsyncStorage.getItem('activeAccount')
            if (activeAccount !== null) {
                // value previously stored
                setActiveAccount(JSON.parse(activeAccount));
                
            } else {
                userIsLoggedIn = false;
            }
            console.log(activeAccount);

            const theme = await AsyncStorage.getItem('theme')
            if (theme !== null) {
                // value previously stored
                toggleTheme(theme);
            } 

            const totalBalanceCurrency = await AsyncStorage.getItem('totalBalanceCurrency')
            if (totalBalanceCurrency !== null) {
                // value previously stored
                setTotalBalanceCurrency(totalBalanceCurrency);
            } 

            if (userIsLoggedIn) {
              navigation.navigate('Enter Pin Screen');
              console.log('logged in')
            } else {
              navigation.navigate('Privacy Policy Screen');
            }
        }

        getData()
        .catch(e => console.log(e.messsage))
    }, []);
    
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
    // fontFamily: "Nexa", fontWeight: "bold",
  },
  introImage: {
    width: 366,
    height: 200,
    marginTop: 200,
  },
  
});

export default PreloadScreen;