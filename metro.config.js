const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const {
  withSentryConfig
} = require("@sentry/react-native/metro");

const customConfig = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    // Assuming getDefaultConfig is now synchronous in the latest metro-config
    assetExts: getDefaultConfig(__dirname).resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json', 'svg'],
  },
};

module.exports = withSentryConfig(withSentryConfig(mergeConfig(getDefaultConfig(__dirname), customConfig)));