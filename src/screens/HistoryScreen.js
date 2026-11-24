import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow, gradients, iconFor, colorFor } from '../theme';
import { getAllActivities, deleteActivity } from '../db/database';
import { prettyDate, fmt } from '../utils';
import Fab from '../components/Fab';

export default function HistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    try {
      setItems(await getAllActivities());
    } catch (e) {
      console.warn('History load error', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const confirmDelete = (item) => {
    Alert.alert('Delete entry', `Delete this ${item.type} entry?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteActivity(item.id);
          load();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const c = colorFor(item.type);
    const parts = [];
    if (item.steps > 0) parts.push({ icon: 'footsteps', text: `${fmt(item.steps)} steps` });
    if (item.duration > 0) parts.push({ icon: 'time', text: `${item.duration} min` });
    if (item.calories > 0) parts.push({ icon: 'flame', text: `${fmt(item.calories)} kcal` });
    return (
      <TouchableOpacity
        style={[styles.item, shadow, { borderLeftColor: c }]}
        onPress={() => navigation.navigate('AddEntry', { entry: item })}
        activeOpacity={0.8}
      >
        <View style={[styles.iconWrap, { backgroundColor: c + '22' }]}>
          <Ionicons name={iconFor(item.type)} size={24} color={c} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.type}</Text>
          <Text style={styles.sub}>{prettyDate(item.date)}</Text>
          <View style={styles.metaRow}>
            {parts.map((p) => (
              <View key={p.icon} style={styles.metaChip}>
                <Ionicons name={p.icon} size={12} color={c} />
                <Text style={[styles.metaText, { color: c }]}>{p.text}</Text>
              </View>
            ))}
          </View>
        </View>
        <TouchableOpacity onPress={() => confirmDelete(item)} hitSlop={10}>
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        ListHeaderComponent={
          items.length > 0 ? (
            <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
              <Text style={styles.bannerEmoji}>📒</Text>
              <View>
                <Text style={styles.bannerTitle}>{items.length} activities logged</Text>
                <Text style={styles.bannerSub}>Tap an entry to edit it</Text>
              </View>
            </LinearGradient>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🏃‍♂️</Text>
            <Text style={styles.empty}>No entries yet.{'\n'}Tap + to log your first activity!</Text>
          </View>
        }
      />
      <Fab onPress={() => navigation.navigate('AddEntry')} />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 16, marginBottom: 16 },
  bannerEmoji: { fontSize: 30, marginRight: 14 },
  bannerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  bannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 5,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: { fontSize: 17, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.muted, marginTop: 1 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    gap: 4,
  },
  metaText: { fontSize: 12, fontWeight: '700' },
  emptyWrap: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 56 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 12, fontSize: 15, lineHeight: 22 },
});
