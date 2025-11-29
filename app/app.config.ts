import { ExpoConfig } from '@expo/config-types';
import 'dotenv/config';

const config: ExpoConfig = {
  name: "Photon Decode",
  slug: "photon-decode",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "photon",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.lindan.photondecode",
  },

  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.lindan.photondecode",
  },

  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  plugins: [
    "expo-router",
    [
      "react-native-vision-camera",
      {
        cameraPermissionText: "Photon Decode needs access to your camera for image scanning.",
        enableMicrophonePermission: false,
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    API_URL: process.env.API_URL,
  },
};

export default config;