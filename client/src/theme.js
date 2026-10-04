// Theme color definitions and CSS variable applicator

export const THEMES = {
  rose: {
    id: 'rose',
    name: 'Rose Beauty',
    colorHex: '#e11d48',
    primary: 'bg-rose-600 hover:bg-rose-700 text-white',
    primarySolid: 'bg-rose-600',
    primaryText: 'text-rose-600',
    primaryBorder: 'border-rose-200',
    lightBg: 'bg-rose-50',
    activeTab: 'bg-rose-50 text-rose-700 border-rose-200',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    shadow: 'shadow-rose-200',
    ring: 'focus:ring-rose-500',
    badgeDark: 'bg-rose-600 text-white',
    iconBg: 'bg-rose-100 text-rose-700'
  },
  teal: {
    id: 'teal',
    name: 'Clinical Teal',
    colorHex: '#0d9488',
    primary: 'bg-teal-600 hover:bg-teal-700 text-white',
    primarySolid: 'bg-teal-600',
    primaryText: 'text-teal-600',
    primaryBorder: 'border-teal-200',
    lightBg: 'bg-teal-50',
    activeTab: 'bg-teal-50 text-teal-700 border-teal-200',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    shadow: 'shadow-teal-200',
    ring: 'focus:ring-teal-500',
    badgeDark: 'bg-teal-600 text-white',
    iconBg: 'bg-teal-100 text-teal-700'
  },
  blue: {
    id: 'blue',
    name: 'Royal Blue',
    colorHex: '#2563eb',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    primarySolid: 'bg-blue-600',
    primaryText: 'text-blue-600',
    primaryBorder: 'border-blue-200',
    lightBg: 'bg-blue-50',
    activeTab: 'bg-blue-50 text-blue-700 border-blue-200',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    shadow: 'shadow-blue-200',
    ring: 'focus:ring-blue-500',
    badgeDark: 'bg-blue-600 text-white',
    iconBg: 'bg-blue-100 text-blue-700'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Green',
    colorHex: '#059669',
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    primarySolid: 'bg-emerald-600',
    primaryText: 'text-emerald-600',
    primaryBorder: 'border-emerald-200',
    lightBg: 'bg-emerald-50',
    activeTab: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    shadow: 'shadow-emerald-200',
    ring: 'focus:ring-emerald-500',
    badgeDark: 'bg-emerald-600 text-white',
    iconBg: 'bg-emerald-100 text-emerald-700'
  },
  violet: {
    id: 'violet',
    name: 'Lavender Violet',
    colorHex: '#7c3aed',
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    primarySolid: 'bg-purple-600',
    primaryText: 'text-purple-600',
    primaryBorder: 'border-purple-200',
    lightBg: 'bg-purple-50',
    activeTab: 'bg-purple-50 text-purple-700 border-purple-200',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    shadow: 'shadow-purple-200',
    ring: 'focus:ring-purple-500',
    badgeDark: 'bg-purple-600 text-white',
    iconBg: 'bg-purple-100 text-purple-700'
  },
  slate: {
    id: 'slate',
    name: 'Slate Gray',
    colorHex: '#334155',
    primary: 'bg-slate-800 hover:bg-slate-900 text-white',
    primarySolid: 'bg-slate-800',
    primaryText: 'text-slate-800',
    primaryBorder: 'border-slate-300',
    lightBg: 'bg-slate-100',
    activeTab: 'bg-slate-100 text-slate-900 border-slate-300',
    badge: 'bg-slate-200 text-slate-800 border-slate-300',
    shadow: 'shadow-slate-300',
    ring: 'focus:ring-slate-500',
    badgeDark: 'bg-slate-800 text-white',
    iconBg: 'bg-slate-200 text-slate-800'
  }
};

export function getTheme(themeId) {
  return THEMES[themeId] || THEMES.rose;
}
