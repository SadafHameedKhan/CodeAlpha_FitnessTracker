import React, { useLayoutEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, shadow, ACTIVITY_TYPES } from '../theme';
import { addActivity, updateActivity } from '../db/database';
import { toDateKey, addDays, prettyDate } from '../utils';

export default function AddEntryScreen({ navigation, route }) {
  const entry = route.params?.entry;
  const isEdit = !!entry;
  const todayKey = toDateKey();

  const [date, setDate] = useState(entry?.date || todayKey);
  const [type, setType] = useState(entry?.type || 'Walking');
  const [duration, setDuration] = useState(entry?.duration ? String(entry.duration) : '');
  const [calories, setCalories] = useState(entry?.calories ? String(entry.calories) : '');
  const [steps, setSteps] = useState(entry?.steps ? String(entry.steps) : '');
  const [notes, setNotes] = useState(entry?.notes || '');
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit Activity' : 'Log Activity' });
  }, [navigation, isEdit]);

  const digits = (t) => t.replace(/[^0-9]/g, '');

  const save = async () => {
    const d = parseInt(duration || '0', 10);
    const c = parseInt(calories || '0', 10);
    const s = parseInt(steps || '0', 10);

    if (d <= 0 && c <= 0 && s <= 0) {
      Alert.alert('Missing data', 'Enter at least steps, duration, or calories.');
      return;
    }
    if (s > 200000 || c > 20000 || d > 1440) {
      Alert.alert('Check values', 'One of the numbers looks too large. Please re-check.');
      return;
    }

    const payload = { date, type, duration: d, calories: c, steps: s, notes: notes.trim() };
    try {
      setSaving(true);
      if (isEdit) await updateActivity(entry.id, payload);
      else await addActivity(payload);
      navigation.goBack();
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', 'Could not save. Please try again.');
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>📅 Date</Text>
        <View style={[styles.dateRow, shadow]}>
          <TouchableOpacity onPress={() => setDate(addDays(date, -1))} hitSlop={10}>
            <Ionicons name="chevron-back-circle" size={30} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.dateText}>{prettyDate(date)}</Text>
          <TouchableOpacity
            onPress={() => date < todayKey && setDate(addDays(date, 1))}
            hitSlop={10}
            disabled={date >= todayKey}
          >
            <Ionicons
              name="chevron-forward-circle"
              size={30}
              color={date >= todayKey ? colors.border : colors.primary}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>💪 Activity type</Text>
        <View style={styles.chips}>
          {ACTIVITY_TYPES.map((t) => {
            const selected = type === t.name;
            return (
              <TouchableOpacity
                key={t.name}
                onPress={() => setType(t.name)}
                style={[styles.chip, selected && { backgroundColor: t.color, borderColor: t.color }]}
              >
                <Ionicons name={t.icon} size={16} color={selected ? '#fff' : t.color} />
                <Text style={[styles.chipText, selected && { color: '#fff' }]}>{t.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Field icon="footsteps" color={colors.steps} label="Steps" value={steps} onChange={(t) => setSteps(digits(t))} placeholder="e.g. 6500" />
        <Field icon="time" color={colors.minutes} label="Duration (minutes)" value={duration} onChange={(t) => setDuration(digits(t))} placeholder="e.g. 45" />
        <Field icon="flame" color={colors.calories} label="Calories burned (kcal)" value={calories} onChange={(t) => setCalories(digits(t))} placeholder="e.g. 300" />

        <Text style={styles.label}>📝 Notes (optional)</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="How did it go?"
          placeholderTextColor={colors.muted}
          multiline
        />

        <TouchableOpacity onPress={save} disabled={saving} activeOpacity={0.85} style={{ marginTop: 28, opacity: saving ? 0.6 : 1 }}>
          <LinearGradient colors={gradients.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.saveText}>{isEdit ? 'Update' : 'Save Activity'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const Field = ({ icon, color, label, value, onChange, placeholder }) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.fieldRow, shadow]}>
      <View style={[styles.fieldIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType="number-pad"
      />
    </View>
  </>
);

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 18, marginBottom: 8 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
  },
  dateText: { fontSize: 16, fontWeight: '700', color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { marginLeft: 6, color: colors.text, fontWeight: '700' },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 8,
  },
  fieldIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  fieldInput: { flex: 1, fontSize: 17, fontWeight: '600', color: colors.text, paddingVertical: 8 },
  saveBtn: { flexDirection: 'row', gap: 8, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
