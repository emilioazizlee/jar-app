// Central registry of all keyboard shortcuts in JAR

export const SHORTCUT_SECTIONS = [
  {
    id: 'global',
    label: 'Global',
    shortcuts: [
      { keys: ['⌘', '⇧', 'N'], win: ['Ctrl', '⇧', 'N'], description: 'Open universal + menu' },
      { keys: ['⌘', 'K'], win: ['Ctrl', 'K'], description: 'Focus search bar' },
      { keys: ['⌘', '/'], win: ['Ctrl', '/'], description: 'Toggle sidebar' },
      { keys: ['⌘', '⇧', ','], win: ['Ctrl', '⇧', ','], description: 'Open Settings' },
      { keys: ['⌘', '⇧', '?'], win: ['Ctrl', '⇧', '?'], description: 'Open keyboard shortcuts' },
      { keys: ['Esc'], description: 'Close any modal or dropdown' },
      { keys: ['⌘', '⇧', '1–9'], win: ['Ctrl', '⇧', '1–9'], description: 'Jump to sidebar section (1=Dashboard … 9=Groceries)' },
    ],
  },
  {
    id: 'forms',
    label: 'Forms',
    shortcuts: [
      { keys: ['Tab'], description: 'Move to next field' },
      { keys: ['⇧', 'Tab'], description: 'Move to previous field' },
      { keys: ['Enter'], description: 'Submit form / save row & create new' },
      { keys: ['⌘', 'Enter'], win: ['Ctrl', 'Enter'], description: 'Save and close form' },
      { keys: ['⌘', '⇧', 'Enter'], win: ['Ctrl', '⇧', 'Enter'], description: 'Save and create another' },
      { keys: ['Esc'], description: 'Cancel and close form' },
    ],
  },
  {
    id: 'receipt',
    label: 'Receipt Mode',
    shortcuts: [
      { keys: ['Enter'], description: 'Save row, new empty row, focus Product' },
      { keys: ['⌘', 'D'], win: ['Ctrl', 'D'], description: 'Duplicate current row' },
      { keys: ['⌘', '⌫'], win: ['Ctrl', '⌫'], description: 'Delete current row' },
      { keys: ['↑ / ↓'], description: 'Move between rows' },
      { keys: ['⌘', 'S'], win: ['Ctrl', 'S'], description: 'Save entire shop' },
    ],
  },
  {
    id: 'lists',
    label: 'Lists',
    shortcuts: [
      { keys: ['j'], description: 'Move down' },
      { keys: ['k'], description: 'Move up' },
      { keys: ['Enter'], description: 'Open selected item' },
      { keys: ['e'], description: 'Edit selected item' },
      { keys: ['⌫ / ⌘', '⌫'], description: 'Delete selected item' },
      { keys: ['Space'], description: 'Toggle complete / done' },
      { keys: ['f'], description: 'Filter' },
      { keys: ['s'], description: 'Sort' },
    ],
  },
  {
    id: 'calendar',
    label: 'Calendar',
    shortcuts: [
      { keys: ['t'], description: 'Jump to today' },
      { keys: ['←', '→'], description: 'Previous / next day' },
      { keys: ['⌘', '←'], win: ['Ctrl', '←'], description: 'Previous / next week' },
      { keys: ['m'], description: 'Switch to Month view' },
      { keys: ['w'], description: 'Switch to Week view' },
      { keys: ['d'], description: 'Switch to Day view' },
    ],
  },
  {
    id: 'dashboard',
    label: 'Dashboard Quick-Tap',
    shortcuts: [
      { keys: ['c'], description: 'Quick-tap Cigarettes' },
      { keys: ['z'], description: 'Quick-tap Zz' },
      { keys: ['o'], description: 'Quick-tap Coffee' },
      { keys: ['t'], description: 'Quick-tap Taxi' },
      { keys: ['f'], description: 'Quick-tap Food Out' },
      { keys: ['g'], description: 'Quick-tap Groceries' },
    ],
  },
];