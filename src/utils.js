const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const toDateKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const fromDateKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (key, n) => {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + n);
  return toDateKey(d);
};

// Last n days ending today, oldest first
export const lastNDays = (n) => {
  const today = toDateKey();
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)));
};

export const shortDay = (key) => DAYS[fromDateKey(key).getDay()];

export const prettyDate = (key) => {
  const d = fromDateKey(key);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// 12345 -> "12,345"
export const fmt = (n) => String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// 12345 -> "12.3k" (for chart labels)
export const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
