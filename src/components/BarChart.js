import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { compact } from '../utils';

// data: [{ key, label, value }]
export default function BarChart({ data, color, height = 160, goal }) {
  const max = Math.max(...data.map((d) => d.value), goal || 0, 1);
  const barArea = height - 18;
  const goalBottom = goal ? (goal / max) * barArea : null;
  const lastIndex = data.length - 1;

  return (
    <View>
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end' }}>
        {goalBottom !== null && <View style={[styles.goalLine, { bottom: goalBottom }]} />}
        {data.map((d, i) => {
          const h = d.value > 0 ? Math.max((d.value / max) * barArea, 6) : 3;
          const isToday = i === lastIndex;
          return (
            <View key={d.key} style={styles.col}>
              <Text style={[styles.valText, isToday && { color, fontWeight: '700' }]}>
                {d.value > 0 ? compact(d.value) : ''}
              </Text>
              <View
                style={{
                  width: '58%',
                  height: h,
                  backgroundColor: d.value > 0 ? (isToday ? color : color + '66') : colors.border,
                  borderRadius: 8,
                }}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {data.map((d, i) => (
          <Text key={d.key} style={[styles.label, i === lastIndex && { color, fontWeight: '800' }]}>
            {d.label}
          </Text>
        ))}
      </View>
      {goal ? <Text style={styles.legend}>- - -  your daily goal</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  valText: { fontSize: 10, color: colors.muted, marginBottom: 2, height: 14 },
  labels: { flexDirection: 'row', marginTop: 6 },
  label: { flex: 1, textAlign: 'center', fontSize: 12, color: colors.muted },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderColor: colors.orange,
    borderStyle: 'dashed',
  },
  legend: { marginTop: 8, fontSize: 11, color: colors.orange, textAlign: 'right', fontWeight: '600' },
});
