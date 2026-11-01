import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gkoo.app',
  appName: 'Gkoo',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 15000,
      launchAutoHide: false,
      backgroundColor: "#FF5F6D",
      androidSplashResourceName: "splash",
      androidScaleType: "FIT_CENTER",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      launchFadeOutDuration: 150
    },
    StatusBar: {
      backgroundColor: '#FF5F6D',
    }
  }
};

export default config;
