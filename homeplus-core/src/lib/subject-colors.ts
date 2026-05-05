// ============================================
// Subject Color System - Home Plus LMS
// ============================================
// Consistent color palette for subject areas.
// Used across all student-facing pages.

export interface SubjectColors {
  /** Primary accent color */
  primary: string;
  /** Lighter background tint */
  bg: string;
  /** Light border / progress track */
  light: string;
  /** Darker shade for hover / active states */
  dark: string;
  /** Gradient for buttons and accents */
  gradient: string;
}

/** Central color map - keyed by lowercase subject name */
const SUBJECT_COLOR_MAP: Record<string, SubjectColors> = {
  science: {
    primary: '#059669',
    bg: '#ecfdf5',
    light: '#a7f3d0',
    dark: '#047857',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
  },
  math: {
    primary: '#7c3aed',
    bg: '#f5f3ff',
    light: '#c4b5fd',
    dark: '#6d28d9',
    gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
  },
  'language arts': {
    primary: '#2563eb',
    bg: '#eff6ff',
    light: '#93c5fd',
    dark: '#1d4ed8',
    gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
  },
  ela: {
    primary: '#2563eb',
    bg: '#eff6ff',
    light: '#93c5fd',
    dark: '#1d4ed8',
    gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
  },
  english: {
    primary: '#2563eb',
    bg: '#eff6ff',
    light: '#93c5fd',
    dark: '#1d4ed8',
    gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
  },
  'social studies': {
    primary: '#d97706',
    bg: '#fffbeb',
    light: '#fcd34d',
    dark: '#b45309',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
  },
  art: {
    primary: '#db2777',
    bg: '#fdf2f8',
    light: '#f9a8d4',
    dark: '#be185d',
    gradient: 'linear-gradient(135deg, #db2777, #ec4899)',
  },
  music: {
    primary: '#e11d48',
    bg: '#fff1f2',
    light: '#fda4af',
    dark: '#be123c',
    gradient: 'linear-gradient(135deg, #e11d48, #f43f5e)',
  },
  'physical education': {
    primary: '#ea580c',
    bg: '#fff7ed',
    light: '#fdba74',
    dark: '#c2410c',
    gradient: 'linear-gradient(135deg, #ea580c, #f97316)',
  },
  health: {
    primary: '#0891b2',
    bg: '#ecfeff',
    light: '#67e8f9',
    dark: '#0e7490',
    gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
  },
  french: {
    primary: '#4f46e5',
    bg: '#eef2ff',
    light: '#a5b4fc',
    dark: '#4338ca',
    gradient: 'linear-gradient(135deg, #4f46e5, #6366f1)',
  },
  phonics: {
    primary: '#ec4899',
    bg: 'linear-gradient(90deg, #ef4444, #f97316, #f59e0b, #10b981, #3b82f6, #a855f7)',
    light: '#fbcfe8',
    dark: '#be185d',
    gradient: 'linear-gradient(90deg, #ef4444, #f97316, #f59e0b, #10b981, #3b82f6, #a855f7)',
  },
};

/** Default colors for unrecognized subjects */
const DEFAULT_COLORS: SubjectColors = {
  primary: '#475569',
  bg: '#f8fafc',
  light: '#cbd5e1',
  dark: '#334155',
  gradient: 'linear-gradient(135deg, #475569, #64748b)',
};

/**
 * Resolve subject colors from a subject name.
 * Matches against common subject names case-insensitively.
 */
export function getSubjectColors(subjectName: string): SubjectColors {
  const name = subjectName.toLowerCase().trim();

  // Check for exact matches first
  if (SUBJECT_COLOR_MAP[name]) {
    return SUBJECT_COLOR_MAP[name];
  }

  // Fuzzy match: check if any key is contained in the subject name
  for (const [key, colors] of Object.entries(SUBJECT_COLOR_MAP)) {
    if (name.includes(key) || key.includes(name)) {
      return colors;
    }
  }

  return DEFAULT_COLORS;
}

/**
 * Generate CSS custom-property style object for a subject.
 * Use in component style props to cascade subject colors.
 */
export function subjectColorVars(subjectName: string): React.CSSProperties {
  const c = getSubjectColors(subjectName);
  return {
    '--subject-primary': c.primary,
    '--subject-bg': c.bg,
    '--subject-light': c.light,
    '--subject-dark': c.dark,
    '--subject-gradient': c.gradient,
  } as React.CSSProperties;
}
