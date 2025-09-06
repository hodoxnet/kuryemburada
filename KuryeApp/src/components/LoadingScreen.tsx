/**
 * Yükleme ekranı komponenti
 */

import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Yükleniyor...' 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.message}>{message}</Text>
        
        {/* Logo veya uygulama adı */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Kurye</Text>
          <Text style={styles.appTagline}>Hızlı ve Güvenilir Teslimat</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontFamily: 'System',
  },
  appInfo: {
    position: 'absolute',
    bottom: -100,
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});