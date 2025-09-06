/**
 * Ana uygulama komponenti
 */

import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { WebViewContainer } from '@components/WebViewContainer';

const App: React.FC = () => {
  useEffect(() => {
    // Splash screen'i gizle
    if (Platform.OS === 'android') {
      setTimeout(() => {
        SplashScreen.hide();
      }, 1000);
    } else {
      SplashScreen.hide();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <WebViewContainer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default App;