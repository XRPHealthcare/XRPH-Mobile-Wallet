import {firebase} from '@react-native-firebase/dynamic-links';
import {NETWORK} from '../../config';

export const getRpcs = async () => {
  const res = await firebase
    .firestore()
    .collection('rpcs')
    .where('network', '==', NETWORK)
    .get();

  if (res['_docs'].length === 0) {
    return [];
  } else {
    return res['_docs'][0]['_data'];
  }
};
