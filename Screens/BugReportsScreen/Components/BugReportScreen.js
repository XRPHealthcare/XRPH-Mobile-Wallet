import React from 'react';

import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import _ from 'lodash';
import {GestureHandlerRootView, ScrollView} from 'react-native-gesture-handler';
import {light, dark} from '../../../assets/colors/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useStore from '../../../data/store';
import FolderIcon from '../../../assets/img/folder.svg';
import FolderIconW from '../../../assets/img/folder-w.svg';
import LinearGradient from 'react-native-linear-gradient';
import BugSuccessSheet from './BusSuccessSheet';
import {launchImageLibrary} from 'react-native-image-picker';
import Alert from '../../../components/Alert';
import {getDeviceName, getModel, getVersion} from 'react-native-device-info';
import storage from '@react-native-firebase/storage';
import {useAddTrelloCard} from '../../../utils/wallet.api';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Pressable} from 'react-native';
import {
  ArrowSqrLeftBlackIcon,
  ArrowSqrLeftWhiteIcon,
} from '../../../assets/img/new-design';

FontAwesome.loadFont();
MaterialCommunityIcons.loadFont();
AntDesign.loadFont();
Octicons.loadFont();
Feather.loadFont();
Ionicons.loadFont();

const BugReportScreen = ({route, navigation}) => {
  let {theme, activeAccount} = useStore();
  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }
  const styles = styling(colors, theme);

  const rnBiometrics = new ReactNativeBiometrics();
  const [bugFiles, setBugFiles] = React.useState([]);
  const [deviceModel, setDeviceModel] = React.useState('');
  const [bugDetail, setBugDetail] = React.useState('');
  const [alertMsg, setAlertMsg] = React.useState('');
  const [isSuccessSheet, setIsSuccessSheet] = React.useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = React.useState(false);
  const [isErrorAlert, setIsErrorAlert] = React.useState(false);
  const [isSuccessAlert, setIsSuccessAlert] = React.useState(false);
  const [isBioSupported, setIsBioSupported] = React.useState(false);

  const reportBug = useAddTrelloCard();

  const goToSettings = () => {
    navigation.navigate('Help Settings Screen');
  };

  const toggleSuccessSheet = () => {
    setIsSuccessSheet(!isSuccessSheet);
  };

  const browseFiles = async () => {
    const result = await launchImageLibrary({
      selectionLimit: 10,
    });
    if (result?.assets?.length > 10) {
      setIsErrorAlert(true);
      setAlertMsg('Maximum 10 files are allowed');
    } else {
      let isMaxFile = false;
      for (let i = 0; i < result?.assets?.length; i++) {
        if (Number(result?.assets[i]?.fileSize) > 1000000) {
          isMaxFile = true;
          setIsErrorAlert(true);
          setAlertMsg('Maximum 10MB per file is allowed!');
        }
      }
      if (!isMaxFile) {
        setBugFiles(result?.assets);
      }
    }
  };

  const removeImage = id => {
    let tempFiles = bugFiles;
    tempFiles?.splice(id, 1);
    setBugFiles([...tempFiles]);
  };

  const submitBug = async () => {
    setIsSubmitLoading(true);
    try {
      let tempURLs = [];
      if (bugFiles?.length > 0) {
        for (let i = 0; i < bugFiles?.length; i++) {
          let fileExt = bugFiles[i]?.type?.split('/')?.[1];

          const storageRef = storage().ref(`bugs/${Date.now()}.${fileExt}`);

          try {
            const task = await storageRef.putFile(bugFiles[i]?.uri);

            const url = await storageRef.getDownloadURL();
            tempURLs?.push(url);
            console.log('File uploaded successfully');
          } catch (error) {
            setIsSubmitLoading(false);
            setIsErrorAlert(true);
            setAlertMsg(
              'Something went wrong while uploading files, please try again!',
            );
            console.error('Error uploading file:', error);
          }
        }
      }
      const appVersion = getVersion();
      const workerKey = await AsyncStorage.getItem('worker_key');
      let payload = {
        name: `[${
          Platform.OS == 'ios' ? 'IOS' : 'Android'
        }] [${deviceModel}] [${appVersion}] [${
          isBioSupported ? 'Biometric Supported' : 'Biometric Not Supported'
        }] [${workerKey || 'ApiKey Not Found'}] ${bugDetail}`,
        desc: {
          userAddress: activeAccount?.classicAddress,
          problem: bugDetail,
          supportingFiles: tempURLs,
        },
        urlSource: tempURLs?.[0] || '',
        OS: Platform.OS == 'ios' ? 'IOS' : 'Android',
        deviceName: deviceModel,
      };
      if (!bugDetail) {
        setIsSubmitLoading(false);
        setIsErrorAlert(true);
        setAlertMsg('Please add something in bug description!');
      } else {
        await reportBug.mutateAsync(payload).then(() => {
          toggleSuccessSheet();
          setBugFiles([]);
          setBugDetail('');
          setIsSubmitLoading(false);
        });
      }
    } catch (e) {
      setIsSubmitLoading(false);
      setIsErrorAlert(true);
      setAlertMsg(e.message || 'Something went wrong, please try again!');
      console.log('--------submit bug----', e);
    }
  };

  const getDeviceInfo = async () => {
    const name = await getDeviceName();
    const info = getModel();
    if (Platform.OS === 'ios') {
      setDeviceModel(info);
    } else {
      setDeviceModel(name);
    }
  };

  const checkBioExist = () => {
    rnBiometrics.isSensorAvailable().then(res => {
      const {available, biometryType} = res;
      if (available && biometryType === BiometryTypes.FaceID) {
        setIsBioSupported(true);
      } else if (available && biometryType === BiometryTypes.TouchID) {
        setIsBioSupported(true);
      } else if (available && biometryType === BiometryTypes.Biometrics) {
        setIsBioSupported(true);
      } else {
        console.log('Biometric not found');
        setIsBioSupported(false);
      }
    });
  };

  React.useEffect(() => {
    getDeviceInfo();
    checkBioExist();
  }, []);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{backgroundColor: colors.bg}}>
        <StatusBar />
        <View style={styles.bg}>
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.navigate('Help Settings Screen')}>
              {theme === 'dark' ? (
                <ArrowSqrLeftWhiteIcon />
              ) : (
                <ArrowSqrLeftBlackIcon />
              )}
            </Pressable>
            <Text style={styles.headerHeading}>Report a Bug</Text>
            <Text style={{width: 40}}></Text>
          </View>
          <Image
            source={require('../../../assets/img/new-design/bg-gradient.png')}
            style={styles.greenShadow}
          />

          <ScrollView
            automaticallyAdjustKeyboardInsets={true}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 20}}>
            <Text style={[styles.problemLabel, {marginTop: 24}]}>
              Problem Explanation
            </Text>
            <View style={styles.problemContainer}>
              <TextInput
                multiline
                value={bugDetail}
                onChangeText={e => {
                  setBugDetail(e);
                }}
                style={styles.problemInput}
                placeholder="Type here..."
                placeholderTextColor={colors.dark_gray}
              />
            </View>
            <Text style={[styles.problemLabel, {marginTop: 24}]}>
              Attach Image/Video Files
            </Text>
            <View style={[styles.mediaContainer, {marginTop: 16}]}>
              {theme === 'dark' ? (
                <FolderIconW height={26} width={28} style={styles.folderIco} />
              ) : (
                <FolderIcon height={26} width={28} style={styles.folderIco} />
              )}
              <TouchableOpacity
                style={styles.browseButton}
                onPress={browseFiles}>
                <Text style={styles.browseButtonText}>Browse Files</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.infoText}>
              10 files maximum, each less than 10 MB
            </Text>
            {bugFiles?.length > 0 && (
              <View style={{marginTop: 8, flexDirection: 'row', gap: 20}}>
                {bugFiles?.length > 4 ? (
                  <View style={{flexDirection: 'row', gap: 10}}>
                    {bugFiles.slice(0, 3).map((file, idx) => (
                      <View style={{height: 80, width: 80}} key={idx}>
                        <Image
                          source={{uri: file?.uri}}
                          style={styles.preview}
                          key={idx}
                        />
                        <TouchableOpacity
                          style={styles.clearIcon}
                          onPress={() => {
                            removeImage(idx);
                          }}>
                          <MaterialCommunityIcons
                            name={'close-circle'}
                            color={colors.text}
                            size={20}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <LinearGradient
                      colors={['#37C3A6', '#AF45EE']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={styles.extraPreview}>
                      <Text style={styles.extraPreviewText}>
                        {bugFiles.length - 3}+
                      </Text>
                    </LinearGradient>
                  </View>
                ) : (
                  bugFiles?.map((file, idx) => (
                    <View style={{height: 80, width: 80}} key={idx}>
                      <Image
                        source={{uri: file?.uri}}
                        style={styles.preview}
                        key={idx}
                      />
                      <TouchableOpacity
                        style={styles.clearIcon}
                        onPress={() => {
                          removeImage(idx);
                        }}>
                        <MaterialCommunityIcons
                          name={'close-circle'}
                          color={colors.text}
                          size={20}
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}
            {/* <View>
              <TextInput
                style={styles.modelInput}
                placeholder="Your phone model"
                value={Platform.OS == 'ios' ? 'IOS' : 'Android'}
                readOnly
              />
            </View>
            <TextInput
              style={styles.modelInput}
              placeholder="Your phone model"
              readOnly
              value={deviceModel}
            />
            <Text style={[styles.infoText, {marginBottom: 10}]}>
              Found in your Settings {'>'} About
            </Text> */}
          </ScrollView>
          <View style={{paddingHorizontal: 20}}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => (isSubmitLoading ? () => {} : submitBug())}>
              {isSubmitLoading ? (
                <ActivityIndicator size={25} color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <BugSuccessSheet
          isSuccessSheet={isSuccessSheet}
          setIsSuccessSheet={setIsSuccessSheet}
        />
        <Alert
          isOpen={isErrorAlert ? isErrorAlert : isSuccessAlert}
          type={isErrorAlert ? 'error' : 'success'}
          message={alertMsg}
          icon={isErrorAlert ? 'close' : 'check'}
          setIsOpen={isErrorAlert ? setIsErrorAlert : setIsSuccessAlert}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styling = (colors, theme) =>
  StyleSheet.create({
    safeView: {
      backgroundColor: colors.dark_bg,
    },
    bg: {
      backgroundColor: colors.dark_bg,
      //   alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 37,
      backgroundColor:
        theme === 'dark'
          ? 'rgba(26, 26, 26, 0.77)'
          : 'rgba(255, 255, 255, 0.77)',
      borderBottomEndRadius: 40,
      borderBottomStartRadius: 40,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    greenShadow: {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: -1,
      marginTop: -250,
      marginLeft: -120,
    },
    headerHeading: {
      fontSize: 18,
      fontWeight: '700',
      fontFamily:
        Platform.OS === 'ios' ? 'LeagueSpartanMedium' : 'LeagueSpartanMedium',
      color: colors.text,
    },
    headerTitle: {
      fontSize: 24,
      color: colors.text,
      fontWeight: '700',
    },
    problemContainer: {
      marginTop: 18,
      paddingHorizontal: 14,
      paddingVertical: 15,
      borderRadius: 8,
      backgroundColor: theme === 'dark' ? '#202020' : '#fff',
    },
    problemLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme === 'dark' ? '#f8f8f8' : '#636363',
    },
    problemInput: {
      fontSize: 14,
      fontWeight: '400',
      color: theme === 'dark' ? '#8F92A1' : '#8F92A1',
      paddingTop: 0,
      paddingHorizontal: 0,
      paddingBottom: 10,
    },
    mediaContainer: {
      marginTop: 20,
      paddingHorizontal: 16,
      paddingVertical: 24,
      backgroundColor:
        theme === 'dark'
          ? 'rgba(26, 26, 26, 0.77)'
          : 'rgba(255, 255, 255, 0.62)',
      borderWidth: 1,
      borderColor: colors.primary,
      borderStyle: 'dashed',
      borderRadius: 12,
    },
    folderIco: {
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    placeholder: {
      marginTop: 12,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '500',
      color: colors.dark_gray,
    },
    browseButton: {
      maxWidth: 115,
      width: '100%',
      height: 30,
      marginTop: 16,
      borderRadius: 8,
      marginLeft: 'auto',
      marginRight: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    browseButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: '#fff',
    },
    infoText: {
      color: theme === 'dark' ? '#636363' : '#636363',
      fontSize: 12,
      fontWeight: 'normal',
      marginTop: 8,
    },
    typeDropdownButton: {
      width: '100%',
      height: 50,
      borderRadius: 8,
      backgroundColor: colors.light_gray_bg,
    },
    typeDropdownButtonText: {
      textAlign: 'left',
      fontSize: 14,
      color: colors.dark_gray,
      fontWeight: 'normal',
    },
    modelInput: {
      marginTop: 20,
      paddingHorizontal: 19,
      paddingVertical: 15,
      backgroundColor: colors.light_gray_bg,
      color: colors.dark_gray,
      fontSize: 14,
      fontWeight: 'normal',
      borderRadius: 8,
      textTransform: 'capitalize',
    },
    submitButton: {
      width: '100%',
      borderRadius: 8,
      height: 44,
      marginBottom: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '400',
      color: '#fff',
    },
    preview: {
      height: 80,
      width: 80,
      borderRadius: 12,
    },
    clearIcon: {
      position: 'absolute',
      right: 0,
      marginRight: 7,
      marginTop: 3,
    },
    extraPreview: {
      height: 80,
      width: 80,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    extraPreviewText: {
      fontSize: 30,
      fontWeight: Platform.OS == 'ios' ? '600' : '600',
      color: '#fff',
    },
  });

export default BugReportScreen;
