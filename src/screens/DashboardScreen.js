import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow, gradients } from '../theme';
import { getDailyTotals, getGoals, DEFAULT_GOALS } from '../db/database';
import { lastNDays, shortDay, prettyDate, fmt } from '../utils';
import ProgressBar from '../components/ProgressBar';
import BarChart from '../components/BarChart';
import Fab from '../components/Fab';

const METRICS = [
  { key: 'steps', label: 'Steps', unit: 'steps', color: colors.steps },
  { key: 'calories', label: 'Calories', unit: 'kcal', color: colors.calories },
  { key: 'minutes', label: 'Minutes', unit: 'min', color: colors.minutes },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function DashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [week, setWeek] = useState([]);
  const [metric, setMetric] = useState(METRICS[0]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const days = lastNDays(7);
          const [g, rows] = await Promise.all([getGoals(), getDailyTotals(days[0], days[6])]);
          const map = Object.fromEntries(rows.map((r) => [r.date, r]));
          const filled = days.map((k) => ({
            date: k,
            steps: map[k]?.steps || 0,
            calories: map[k]?.calories || 0,
            minutes: map[k]?.minutes || 0,
            workouts: map[k]?.workouts || 0,
          }));
          if (active) {
            setGoals(g);
            setWeek(filled);
            setLoading(false);
          }
        } catch (e) {
          console.warn('Dashboard load error', e);
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  if (loading || week.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const today = week[week.length - 1];
  const weekTotal = (k) => week.reduce((s, d) => s + d[k], 0);
  const chartData = week.map((d) => ({ key: d.date, label: shortDay(d.date), value: d[metric.key] }));
  const activeDays = week.filter((d) => d.steps > 0 || d.calories > 0 || d.minutes > 0).length;

  const ratio = (v, g) => (g > 0 ? Math.min(v / g, 1) : 0);
  const overall = Math.round(
    ((ratio(today.steps, goals.steps) + ratio(today.calories, goals.calories) + ratio(today.minutes, goals.minutes)) / 3) * 100
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 18 }]}
        >
          <Text style={styles.greet}>{greeting()} 👋</Text>
          <Text style={styles.heroTitle}>Let's crush today's goals!</Text>
          <Text style={styles.heroDate}>{prettyDate(today.date)}</Text>

          <View style={styles.heroRow}>
            <HeroStat icon="footsteps" label="Steps" value={fmt(today.steps)} />
            <HeroStat icon="flame" label="Kcal" value={fmt(today.calories)} />
            <HeroStat icon="time" label="Minutes" value={fmt(today.minutes)} />
          </View>

          <View style={styles.overallRow}>
            <Text style={styles.overallText}>Overall progress</Text>
            <Text style={styles.overallText}>{overall}%</Text>
          </View>
          <View style={styles.overallTrack}>
            <View style={[styles.overallFill, { width: `${overall}%` }]} />
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={[styles.card, shadow]}>
            <Text style={styles.cardTitle}>Daily Progress</Text>
            <ProgressBar icon="footsteps" label="Steps" value={today.steps} goal={goals.steps} unit="steps" color={colors.steps} />
            <ProgressBar icon="flame" label="Calories burned" value={today.calories} goal={goals.calories} unit="kcal" color={colors.calories} />
            <ProgressBar icon="time" label="Active minutes" value={today.minutes} goal={goals.minutes} unit="min" color={colors.minutes} />
            <Text style={styles.workouts}>🏋️ Workouts today: {today.workouts}</Text>
          </View>

          <View style={[styles.card, shadow]}>
            <Text style={styles.cardTitle}>Last 7 Days</Text>
            <View style={styles.tabs}>
              {METRICS.map((m) => {
                const on = metric.key === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    onPress={() => setMetric(m)}
                    style={[styles.tab, on && { backgroundColor: m.color }]}
                  >
                    <Text style={[styles.tabText, on && { color: '#fff' }]}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <BarChart data={chartData} color={metric.color} goal={goals[metric.key]} />
          </View>

          <LinearGradient colors={gradients.orange} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.streak}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.streakTitle}>{activeDays} / 7 active days this week</Text>
              <Text style={styles.streakSub}>
                {activeDays >= 5 ? 'Amazing consistency, keep going!' : 'Log an activity today to build your streak.'}
              </Text>
            </View>
          </LinearGradient>

          <View style={[styles.card, shadow]}>
            <Text style={styles.cardTitle}>Weekly Summary</Text>
            <View style={styles.summaryRow}>
              <Summary icon="footsteps" color={colors.steps} label="Steps" value={fmt(weekTotal('steps'))} />
              <Summary icon="flame" color={colors.calories} label="Calories" value={fmt(weekTotal('calories'))} />
            </View>
            <View style={styles.summaryRow}>
              <Summary icon="time" color={colors.minutes} label="Minutes" value={fmt(weekTotal('minutes'))} />
              <Summary icon="barbell" color="#7C3AED" label="Workouts" value={fmt(weekTotal('workouts'))} />
            </View>
            <Text style={styles.avg}>Daily average steps: {fmt(weekTotal('steps') / 7)}</Text>
          </View>
        </View>
      </ScrollView>
      <Fab onPress={() => navigation.navigate('AddEntry')} />
    </View>
  );
}

const HeroStat = ({ icon, label, value }) => (
  <View style={styles.heroStat}>
    <View style={styles.heroIcon}>
      <Ionicons name={icon} size={18} color="#fff" />
    </View>
    <Text style={styles.heroStatValue}>{value}</Text>
    <Text style={styles.heroStatLabel}>{label}</Text>
  </View>
);

const Summary = ({ icon, color, label, value }) => (
  <View style={[styles.sumTile, { backgroundColor: color + '18' }]}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={[styles.sumValue, { color }]}>{value}</Text>
    <Text style={styles.sumLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { paddingHorizontal: 20, paddingBottom: 56, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  greet: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 4 },
  heroDate: { color: 'rgba(255,255,255,0.8)', marginTop: 4, marginBottom: 18 },
  heroRow: { flexDirection: 'row', gap: 10 },
  heroStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 18, padding: 12 },
  heroIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroStatValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  heroStatLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  overallRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, marginBottom: 6 },
  overallText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  overallTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  overallFill: { height: '100%', borderRadius: 4, backgroundColor: '#FBBF24' },
  body: { paddingHorizontal: 16, marginTop: -32 },
  card: { backgroundColor: colors.card, borderRadius: 22, padding: 18, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 16 },
  workouts: { color: colors.muted, marginTop: 2, fontWeight: '600' },
  tabs: { flexDirection: 'row', marginBottom: 16 },
  tab: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: 18, backgroundColor: colors.bg, marginRight: 8 },
  tabText: { fontWeight: '700', color: colors.muted, fontSize: 13 },
  streak: { flexDirection: 'row', alignItems: 'center', borderRadius: 22, padding: 18, marginBottom: 16 },
  streakEmoji: { fontSize: 34, marginRight: 14 },
  streakTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  streakSub: { color: 'rgba(255,255,255,0.95)', fontSize: 13, marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  sumTile: { flex: 1, borderRadius: 16, padding: 14 },
  sumValue: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  sumLabel: { fontSize: 12, color: colors.muted, marginTop: 2, fontWeight: '600' },
  avg: { marginTop: 6, color: colors.muted, fontSize: 13, fontWeight: '600' },
});
