import './shim'

/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import './globals.js';

AppRegistry.registerComponent(appName, () => App);
