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
import SelectDropdown from 'react-native-select-dropdown';
import BugSuccessSheet from './BusSuccessSheet';
import {launchImageLibrary} from 'react-native-image-picker';
import Alert from '../../../components/Alert';
import {getDeviceName, getModel, getVersion} from 'react-native-device-info';
import storage from '@react-native-firebase/storage';
import {useAddTrelloCard} from '../../../utils/wallet.api';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';

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
  const styles = styling(colors);

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
      let payload = {
        name: `[${
          Platform.OS == 'ios' ? 'IOS' : 'Android'
        }] [${deviceModel}] [${appVersion}] [${
          isBioSupported ? 'Biometric Supported' : 'Biometric Not Supported'
        }] ${bugDetail}`,
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
            <TouchableOpacity onPress={goToSettings}>
              <MaterialCommunityIcons
                name={'chevron-left'}
                color={colors.text}
                size={30}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bug Report</Text>
            <View></View>
          </View>
          <ScrollView
            automaticallyAdjustKeyboardInsets={true}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}>
            <View style={styles.problemContainer}>
              <Text style={styles.problemLabel}>Problem Explanation</Text>
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
            <View style={styles.mediaContainer}>
              {theme === 'dark' ? (
                <FolderIconW height={26} width={28} style={styles.folderIco} />
              ) : (
                <FolderIcon height={26} width={28} style={styles.folderIco} />
              )}
              <Text style={styles.placeholder}>Attach Image/Video Files</Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={browseFiles}>
                <LinearGradient
                  colors={['#37C3A6', '#AF45EE']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.browseButton}>
                  <Text style={styles.browseButtonText}>Browse Files</Text>
                </LinearGradient>
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
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => (isSubmitLoading ? () => {} : submitBug())}>
            <LinearGradient
              colors={['#37C3A6', '#AF45EE']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.submitGradient}>
              {isSubmitLoading ? (
                <ActivityIndicator size={25} color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
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

const styling = colors =>
  StyleSheet.create({
    safeView: {
      backgroundColor: colors.dark_bg,
    },
    bg: {
      backgroundColor: colors.dark_bg,
      //   alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
      paddingHorizontal: 16,
    },
    header: {
      width: '100%',
      marginTop: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: colors.text,
    },
    headerTitle: {
      fontSize: 24,
      color: colors.text,
      fontWeight: 700,
    },
    problemContainer: {
      marginTop: 32,
      paddingHorizontal: 19,
      paddingVertical: 15,
      borderRadius: 8,
      backgroundColor: colors.light_gray_bg,
    },
    problemLabel: {
      fontSize: 16,
      fontWeight: Platform.OS == 'ios' ? 'normal' : '500',
      color: colors.dark_text,
    },
    problemInput: {
      marginTop: 4,
      fontSize: 16,
      fontWeight: Platform.OS == 'ios' ? 'normal' : '500',
      color: colors.dark_text,
      paddingTop: 0,
      paddingHorizontal: 0,
      paddingBottom: 10,
    },
    mediaContainer: {
      marginTop: 20,
      paddingHorizontal: 16,
      paddingVertical: 24,
      backgroundColor: colors.light_gray_bg,
      borderWidth: 1,
      borderColor: colors.dark_gray,
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
      fontWeight: Platform.OS == 'ios' ? 'normal' : '500',
      color: colors.dark_gray,
    },
    browseButton: {
      maxWidth: 141,
      width: '100%',
      height: 36,
      marginTop: 8,
      borderRadius: 10,
      marginLeft: 'auto',
      marginRight: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    browseButtonText: {
      fontSize: 14,
      fontWeight: Platform.OS == 'ios' ? 'normal' : '500',
      color: '#fff',
    },
    infoText: {
      color: colors.dark_gray,
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
      borderRadius: 18,
      height: 58,
      marginBottom: 15,
    },
    submitGradient: {
      width: '100%',
      height: '100%',
      borderRadius: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButtonText: {
      fontSize: 18,
      fontWeight: 500,
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
