import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kryso.academy',
  appName: 'Kryso',
  webDir: 'public',
  server: {
    url: 'https://krysoapp.vercel.app',
    cleartext: false,
    allowNavigation: [
      'krysoapp.vercel.app',
      '*.razorpay.com',
      'api.razorpay.com',
      'checkout.razorpay.com',
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#09090b',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#09090b',
    },
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#09090b',
  },
};

export default config;
