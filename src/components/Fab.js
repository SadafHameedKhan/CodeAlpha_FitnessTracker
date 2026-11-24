import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { gradients } from '../theme';

export default function Fab({ onPress }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient colors={gradients.orange} style={styles.inner}>
        <Ionicons name="add" size={32} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#F97316',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  inner: { flex: 1, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
});
