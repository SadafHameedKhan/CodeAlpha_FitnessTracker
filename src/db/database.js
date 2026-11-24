import * as SQLite from 'expo-sqlite';

export const DEFAULT_GOALS = { steps: 10000, calories: 500, minutes: 30 };

let dbPromise;
const getDb = () => {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('fitness.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          type TEXT NOT NULL,
          duration INTEGER NOT NULL DEFAULT 0,
          calories INTEGER NOT NULL DEFAULT 0,
          steps INTEGER NOT NULL DEFAULT 0,
          notes TEXT
        );
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
      return db;
    })();
  }
  return dbPromise;
};

export async function addActivity({ date, type, duration, calories, steps, notes }) {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO activities (date, type, duration, calories, steps, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [date, type, duration, calories, steps, notes || '']
  );
}

export async function updateActivity(id, { date, type, duration, calories, steps, notes }) {
  const db = await getDb();
  await db.runAsync(
    'UPDATE activities SET date = ?, type = ?, duration = ?, calories = ?, steps = ?, notes = ? WHERE id = ?',
    [date, type, duration, calories, steps, notes || '', id]
  );
}

export async function deleteActivity(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM activities WHERE id = ?', [id]);
}

export async function getAllActivities() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM activities ORDER BY date DESC, id DESC');
}

// Per-day totals between two date keys (inclusive)
export async function getDailyTotals(startKey, endKey) {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT date,
            SUM(steps) AS steps,
            SUM(calories) AS calories,
            SUM(duration) AS minutes,
            SUM(CASE WHEN type != 'Steps' THEN 1 ELSE 0 END) AS workouts
     FROM activities
     WHERE date BETWEEN ? AND ?
     GROUP BY date`,
    [startKey, endKey]
  );
}

export async function getGoals() {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT key, value FROM settings');
  const goals = { ...DEFAULT_GOALS };
  rows.forEach((r) => {
    goals[r.key] = Number(r.value);
  });
  return goals;
}

export async function saveGoals(goals) {
  const db = await getDb();
  for (const key of ['steps', 'calories', 'minutes']) {
    await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
      key,
      String(goals[key]),
    ]);
  }
}
