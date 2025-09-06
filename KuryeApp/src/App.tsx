/**
 * Ana uygulama komponenti
 */

import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { WebViewContainer } from './components/WebViewContainer';
import { AnimatedSplashScreen } from './components/SplashScreen';

const App: React.FC = () => {
  const [isShowingSplash, setIsShowingSplash] = useState(true);

  useEffect(() => {
    // Native splash screen'i hemen gizle
    SplashScreen.hide();
  }, []);

  const handleSplashComplete = () => {
    setIsShowingSplash(false);
  };

  if (isShowingSplash) {
    return <AnimatedSplashScreen onAnimationComplete={handleSplashComplete} />;
  }

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