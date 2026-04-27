import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.patungan.nyok',
  appName: 'PatunganNyok',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      androidSplashResourceName: 'launch_splash',
      showSpinner: false
    }
  }
};

export default config;
