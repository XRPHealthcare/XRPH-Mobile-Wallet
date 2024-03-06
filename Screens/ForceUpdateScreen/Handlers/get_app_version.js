import {firebase} from '@react-native-firebase/dynamic-links';
const firestore = require('@react-native-firebase/firestore');

export const getAppVersion = async () => {
  const res = await firebase.firestore().collection('app_info').get();
  if (res['_docs'].length === 0) {
    return [];
  } else {
    return res['_docs'][0]['_data'];
  }
};
