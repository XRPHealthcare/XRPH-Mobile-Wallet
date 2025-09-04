import { Linking } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';

export const openInAppBrowser = async (url,color) => {
  try {
    if (await InAppBrowser.isAvailable()) {
      await InAppBrowser.open(url, {
        dismissButtonStyle: 'close',
        preferredBarTintColor: color.bg,
        preferredControlTintColor:color.text,
        modalPresentationStyle: 'fullScreen',
        readerMode: false,
        animated: true,
        modalEnabled: true,
        enableBarCollapsing: true,
      });
    } else {
      // If in-app browser is not available, open in default browser
      await Linking.openURL(url);
    }
  } catch (error) {
    console.error('Error opening in-app browser:', error);
  }
};
