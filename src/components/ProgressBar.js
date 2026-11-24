import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { fmt } from '../utils';

export default function ProgressBar({ label, value, goal, unit, color, icon }) {
  const pct = goal > 0 ? Math.min(value / goal, 1) : 0;
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.pct, { color }]}>{Math.round(pct * 100)}%</Text>
        </View>
        <View style={[styles.track, { backgroundColor: color + '22' }]}>
          <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.value}>
          {fmt(value)} / {fmt(goal)} {unit}
          {pct >= 1 ? '   🎉 Goal reached!' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontWeight: '700', color: colors.text, fontSize: 15 },
  pct: { fontWeight: '800', fontSize: 14 },
  track: { height: 10, borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
  value: { marginTop: 5, fontSize: 12, color: colors.muted },
});
