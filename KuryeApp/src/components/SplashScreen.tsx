/**
 * Animasyonlu Splash Ekranı
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

export const AnimatedSplashScreen: React.FC<SplashScreenProps> = ({
  onAnimationComplete,
}) => {
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(width)).current; // Sağdan başla

  useEffect(() => {
    // Animasyon sequence'i
    Animated.sequence([
      // Fade in ve sağdan sola kayma
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0, // Ortada dur
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Biraz bekle
      Animated.delay(2000),
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animasyon tamamlandığında
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      {/* Logo metin */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <Text style={styles.logoText}>
          KuryemBurada
        </Text>
      </Animated.View>

      {/* Alt slogan */}
      <Animated.View
        style={[
          styles.sloganContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.slogan}>Hızlı, Güvenli, Profesyonel</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  sloganContainer: {
    position: 'absolute',
    bottom: height * 0.25,
  },
  slogan: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
    letterSpacing: 1,
  },
});