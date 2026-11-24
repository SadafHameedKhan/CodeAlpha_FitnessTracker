export const colors = {
  bg: '#F1F5FF',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  primary: '#2563EB',
  primaryDark: '#1E3A8A',
  accent: '#06B6D4',
  orange: '#F97316',
  danger: '#EF4444',
  steps: '#2563EB',
  calories: '#F97316',
  minutes: '#10B981',
};

export const gradients = {
  hero: ['#1E3A8A', '#2563EB', '#06B6D4'],
  orange: ['#F97316', '#FBBF24'],
  button: ['#2563EB', '#06B6D4'],
};

export const shadow = {
  shadowColor: '#1E3A8A',
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

export const ACTIVITY_TYPES = [
  { name: 'Steps', icon: 'footsteps', color: '#2563EB' },
  { name: 'Walking', icon: 'walk', color: '#10B981' },
  { name: 'Running', icon: 'speedometer', color: '#EF4444' },
  { name: 'Cycling', icon: 'bicycle', color: '#F59E0B' },
  { name: 'Gym', icon: 'barbell', color: '#7C3AED' },
  { name: 'Yoga', icon: 'body', color: '#EC4899' },
  { name: 'Swimming', icon: 'water', color: '#06B6D4' },
  { name: 'Other', icon: 'fitness', color: '#64748B' },
];

export const iconFor = (type) =>
  ACTIVITY_TYPES.find((t) => t.name === type)?.icon || 'fitness';

export const colorFor = (type) =>
  ACTIVITY_TYPES.find((t) => t.name === type)?.color || colors.primary;
