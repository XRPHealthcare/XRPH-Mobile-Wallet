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
  Modal,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import useStore from '../../../data/store';
import Navbar from '../../../components/Navbar';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();
Entypo.loadFont();

const SettingsScreen = ({navigation}) => {
  const {activeAccount, theme} = useStore();

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />
        <View style={styles.bg}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image
                style={styles.headerImage}
                source={require('../../../assets/img/hero.png')}
              />
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.headerText}>Settings</Text>
              <Text style={styles.accountNameText}>{activeAccount.name}</Text>
            </View>
          </View>
          <ScrollView style={styles.settingsWrapper}>
            <View style={styles.settingsButtonContainer}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Account Settings Screen')}>
                <View style={styles.buttonWrapper}>
                  <MaterialCommunityIcons
                    name={'account'}
                    size={30}
                    color={colors.text}
                    style={styles.accountIcon}
                  />
                  <Text style={styles.actionButtonText}>Account</Text>
                  <AntDesign
                    name={'right'}
                    size={30}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.hl}></View>
            <View style={styles.settingsButtonContainer}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Alerts Settings Screen')}>
                <View style={styles.buttonWrapper}>
                  <Ionicons
                    name={'notifications'}
                    size={30}
                    color={colors.text}
                    style={styles.accountIcon}
                  />
                  <Text style={styles.actionButtonText}>Alerts</Text>
                  <AntDesign
                    name={'right'}
                    size={30}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.hl}></View>
            <View style={styles.settingsButtonContainer}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() =>
                  navigation.navigate('Appearance Settings Screen')
                }>
                <View style={styles.buttonWrapper}>
                  <AntDesign
                    name={'eye'}
                    size={30}
                    color={colors.text}
                    style={styles.accountIcon}
                  />
                  <Text style={styles.actionButtonText}>Appearance</Text>
                  <AntDesign
                    name={'right'}
                    size={30}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.hl}></View>
            <View style={styles.settingsButtonContainer}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Node Settings Screen')}>
                <View style={styles.buttonWrapper}>
                  <Entypo
                    name={'network'}
                    size={25}
                    color={colors.text}
                    style={styles.aboutIcon}
                  />
                  <Text style={styles.actionButtonText}>Nodes</Text>
                  <AntDesign
                    name={'right'}
                    size={30}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.hl}></View>
            <View style={styles.settingsButtonContainer}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Privacy Settings Screen')}>
                <View style={styles.buttonWrapper}>
                  <FontAwesome
                    name={'lock'}
                    size={30}
                    color={colors.text}
                    style={styles.securityIcon}
                  />
                  <Text style={styles.actionButtonText}>
                    Privacy & Security
                  </Text>
                  <AntDesign
                    name={'right'}
                    size={30}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.hl}></View>
            <View style={styles.settingsButtonContainer}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Help Settings Screen')}>
                <View style={styles.buttonWrapper}>
                  <FontAwesome
                    name={'headphones'}
                    size={30}
                    color={colors.text}
                    style={styles.supportIcon}
                  />
                  <Text style={styles.actionButtonText}>Help & Support</Text>
                  <AntDesign
                    name={'right'}
                    size={30}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.hl}></View>
            <View style={styles.settingsButtonContainer}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('About Settings Screen')}>
                <View style={styles.buttonWrapper}>
                  <AntDesign
                    name={'questioncircle'}
                    size={25}
                    color={colors.text}
                    style={styles.aboutIcon}
                  />
                  <Text style={styles.actionButtonText}>About</Text>
                  <AntDesign
                    name={'right'}
                    size={30}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.hl}></View>
            <View style={styles.settingsButtonContainer}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => {
                  Linking?.openURL('https://twitter.com/xrphealthcare');
                }}>
                <View style={styles.buttonWrapper}>
                  <AntDesign
                    name={'twitter'}
                    size={25}
                    color={colors.text}
                    style={styles.aboutIcon}
                  />
                  <Text style={styles.actionButtonText}>Twitter</Text>
                  <AntDesign
                    name={'right'}
                    size={30}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.hl}></View>
            <View style={styles.settingsButtonContainer}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => {
                  Linking?.openURL('https://t.me/XRPHealthcare');
                }}>
                <View style={styles.buttonWrapper}>
                  <FontAwesome
                    name={'telegram'}
                    size={25}
                    color={colors.text}
                    style={styles.aboutIcon}
                  />
                  <Text style={styles.actionButtonText}>Telegram</Text>
                  <AntDesign
                    name={'right'}
                    size={30}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.hl}></View>
            <View style={styles.settingsButtonContainer}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => {
                  Linking?.openURL('https://xrphealthcare.com/news');
                }}>
                <View style={styles.buttonWrapper}>
                  <Image
                    source={
                      theme === 'dark'
                        ? require('../../../assets/img/newspaper-w.png')
                        : require('../../../assets/img/newspaper-b.png')
                    }
                    alt="news"
                    style={{
                      height: 25,
                      width: 25,
                      marginLeft: 3,
                      marginRight: 24,
                    }}
                  />
                  <Text style={styles.actionButtonText}>Our News</Text>
                  <AntDesign
                    name={'right'}
                    size={30}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.hl}></View>
            <View style={styles.settingsButtonContainer}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => {
                  Linking?.openURL('http://www.xrphealthcare.com/');
                }}>
                <View style={styles.buttonWrapper}>
                  <Image
                    source={
                      theme === 'dark'
                        ? require('../../../assets/img/global-w.png')
                        : require('../../../assets/img/global-b.png')
                    }
                    alt="news"
                    style={{
                      height: 25,
                      width: 25,
                      marginLeft: 3,
                      marginRight: 24,
                    }}
                  />
                  <Text style={styles.actionButtonText}>Our Website</Text>
                  <AntDesign
                    name={'right'}
                    size={30}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.hl}></View>
            <View style={styles.settingsButtonContainer}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => {
                  Linking?.openURL(
                    'https://issuu.com/xrphealthcare/docs/xrp_healthcare_magazine_issue_1',
                  );
                }}>
                <View style={styles.buttonWrapper}>
                  <Image
                    source={
                      theme === 'dark'
                        ? require('../../../assets/img/magazine-w.png')
                        : require('../../../assets/img/magazine-b.png')
                    }
                    alt="news"
                    style={{
                      height: 25,
                      width: 25,
                      marginLeft: 3,
                      marginRight: 24,
                    }}
                  />
                  <Text style={styles.actionButtonText}>
                    XRP Healthcare Magazine
                  </Text>
                  <AntDesign
                    name={'right'}
                    size={30}
                    color={colors.text}
                    style={styles.visitIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.hl}></View>
          </ScrollView>
          <Navbar activeIcon="settings" navigation={navigation} />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styling = colors =>
  StyleSheet.create({
    bg: {
      backgroundColor: colors.bg,
      alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
      paddingHorizontal: 10,
    },
    hl: {
      width: '100%',
      height: 3,
      backgroundColor: colors.text_light,
    },
    headerImage: {
      width: 50,
      height: 50,
      marginLeft: 0,
      marginTop: 0,
    },
    header: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      marginBottom: 10,
    },
    headerText: {
      fontSize: 18,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'NexaLight' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      textAlign: 'right',
      marginTop: 5,
    },
    accountNameText: {
      fontSize: 16,
      color: colors.primary,
      fontFamily: Platform.OS === 'ios' ? 'NexaLight' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
      marginTop: 10,
      textAlign: 'right',
    },
    settingsWrapper: {
      width: '100%',
      paddingHorizontal: 5,
      paddingVertical: 1,
      backgroundColor: colors.bg,
      borderRadius: 10,
    },
    settingsButtonContainer: {
      width: '100%',
      backgroundColor: colors.bg,
      height: 50,
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    settingsButton: {
      width: '100%',
      backgroundColor: colors.bg,
      height: 50,
      flexDirection: 'row',
    },
    buttonWrapper: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
    },
    actionButtonText: {
      color: colors.text,
      fontSize: 18,
      fontFamily: Platform.OS === 'ios' ? 'NexaLight' : 'NexaBold',
      fontWeight: Platform.OS === 'ios' ? 'bold' : '100',
    },
    visitIcon: {
      position: 'absolute',
      right: 0,
    },
    accountIcon: {
      marginRight: 20,
    },
    securityIcon: {
      marginLeft: 5,
      marginRight: 25,
    },
    supportIcon: {
      marginLeft: 1,
      marginRight: 22,
    },
    aboutIcon: {
      marginLeft: 3,
      marginRight: 22,
    },
  });

export default SettingsScreen;
