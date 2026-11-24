import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, shadow } from '../theme';
import { getGoals, saveGoals, DEFAULT_GOALS } from '../db/database';

export default function GoalsScreen() {
  const [goals, setGoals] = useState({
    steps: String(DEFAULT_GOALS.steps),
    calories: String(DEFAULT_GOALS.calories),
    minutes: String(DEFAULT_GOALS.minutes),
  });

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const g = await getGoals();
          setGoals({ steps: String(g.steps), calories: String(g.calories), minutes: String(g.minutes) });
        } catch (e) {
          console.warn('Goals load error', e);
        }
      })();
    }, [])
  );

  const update = (key) => (t) => setGoals((p) => ({ ...p, [key]: t.replace(/[^0-9]/g, '') }));

  const save = async () => {
    const parsed = {
      steps: parseInt(goals.steps || '0', 10),
      calories: parseInt(goals.calories || '0', 10),
      minutes: parseInt(goals.minutes || '0', 10),
    };
    if (parsed.steps <= 0 || parsed.calories <= 0 || parsed.minutes <= 0) {
      Alert.alert('Invalid goals', 'Every goal must be greater than 0.');
      return;
    }
    try {
      await saveGoals(parsed);
      Alert.alert('Saved ✅', 'Your daily goals have been updated.');
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', 'Could not save goals. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
        <Text style={styles.bannerEmoji}>🎯</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Daily Goals</Text>
          <Text style={styles.sub}>These targets drive the progress bars on your dashboard.</Text>
        </View>
      </LinearGradient>

      <GoalCard icon="footsteps" color={colors.steps} label="Steps per day" unit="steps" value={goals.steps} onChange={update('steps')} />
      <GoalCard icon="flame" color={colors.calories} label="Calories to burn per day" unit="kcal" value={goals.calories} onChange={update('calories')} />
      <GoalCard icon="time" color={colors.minutes} label="Active minutes per day" unit="min" value={goals.minutes} onChange={update('minutes')} />

      <TouchableOpacity onPress={save} activeOpacity={0.85} style={{ marginTop: 12 }}>
        <LinearGradient colors={gradients.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
          <Ionicons name="save" size={20} color="#fff" />
          <Text style={styles.btnText}>Save Goals</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const GoalCard = ({ icon, color, label, unit, value, onChange }) => (
  <View style={[styles.card, shadow]}>
    <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput style={[styles.input, { color }]} value={value} onChangeText={onChange} keyboardType="number-pad" />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  banner: { flexDirection: 'row', alignItems: 'center', borderRadius: 22, padding: 18, marginBottom: 18 },
  bannerEmoji: { fontSize: 38, marginRight: 14 },
  heading: { fontSize: 22, fontWeight: '800', color: '#fff' },
  sub: { color: 'rgba(255,255,255,0.88)', marginTop: 3, fontSize: 13 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 20, padding: 16, marginBottom: 14 },
  iconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  input: { flex: 1, fontSize: 26, fontWeight: '800', paddingVertical: 4 },
  unit: { color: colors.muted, fontWeight: '700' },
  btn: { flexDirection: 'row', gap: 8, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
