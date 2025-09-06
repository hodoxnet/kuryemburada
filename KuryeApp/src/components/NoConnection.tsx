/**
 * İnternet bağlantısı yok ekranı
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

interface NoConnectionProps {
  onRetry: () => void;
}

export const NoConnection: React.FC<NoConnectionProps> = ({ onRetry }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* İkon yerine basit bir WiFi off sembolü */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📡</Text>
          <View style={styles.crossLine} />
        </View>
        
        <Text style={styles.title}>Bağlantı Hatası</Text>
        <Text style={styles.message}>
          İnternet bağlantınızı kontrol edip{'\n'}tekrar deneyin
        </Text>
        
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
        
        <Text style={styles.hint}>
          WiFi veya mobil veri bağlantınızın{'\n'}açık olduğundan emin olun
        </Text>
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
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 80,
    height: 80,
    marginBottom: 24,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 60,
  },
  crossLine: {
    position: 'absolute',
    width: 80,
    height: 3,
    backgroundColor: '#EF4444',
    transform: [{ rotate: '45deg' }],
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});