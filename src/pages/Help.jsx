import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SHORTCUT_SECTIONS } from '@/lib/shortcuts';
import KbdKey from '@/components/help/KbdKey';

// ─── DATA ────────────────────────────────────────────────────────────────────

const MODULE_GUIDES = [
  {
    id: 'spends', title: 'Daily Spends',
    content: `Daily Spends is your real-time expense feed. Every time you spend money — coffee, taxi, groceries — you log it here. The jar mechanic turns each entry into a visible unit of "life activity", not just a number.\n\nUse Quick-Tap tiles on the Dashboard for the fastest logging experience. One tap opens a pre-configured form for common categories like Cigarettes or Coffee. The form auto-focuses the amount field so you can type and hit Enter in under 2 seconds.\n\nCategories help you see where your money goes. At month end, Insights breaks down your category distribution automatically. You can add custom categories via the spend form's free-text field.\n\nThe "Repeat last" feature (available from the form) lets you re-log the same item with one click — great for daily recurring habits like transit or coffee.\n\nAll spend entries feed into the Insights dashboard, where trends, averages, and jar stacking give you a month-over-month view of your habits.`,
  },
  {
    id: 'subscriptions', title: 'Subscriptions',
    content: `Subscriptions tracks everything you pay for on a recurring basis — streaming, SaaS tools, gym memberships. Unlike one-off spends, these have a billing cycle and a renewal date.\n\nAdd a subscription from the catalog (Netflix, Spotify, etc.) or create a custom one. Set the billing cycle (monthly, quarterly, yearly) and your next renewal date. JAR reminds you before renewals hit.\n\nThe burn rate calculation on the Dashboard shows how much your subscriptions cost per day, helping you feel the true weight of recurring charges.\n\nYou can mark subscriptions as inactive when you pause or cancel them. They stay in your history for reference.\n\nCurrency conversion is handled automatically when you set your home currency in Settings. Subscriptions in foreign currencies are converted for the burn rate display.`,
  },
  {
    id: 'payments', title: 'Payments',
    content: `Payments covers one-time financial obligations and installment plans — rent, insurance, loan repayments, and any irregular but important outflows.\n\nFor installments, set the total amount and number of periods. JAR tracks how many payments you've made and how many remain, giving you a progress view rather than just a list.\n\nPayments differ from subscriptions in that they have a defined end. A subscription is ongoing; a payment has a finish line.\n\nYou can link payments to projects or goals for a full financial picture of what something is costing you across time.\n\nThe Payments page shows upcoming obligations sorted by due date so you're never caught off guard.`,
  },
  {
    id: 'tasks', title: 'Tasks',
    content: `Tasks is a minimalist but powerful task system designed for personal productivity, not team management. Every task can have steps, a priority, a deadline, and a time estimate.\n\nThe step sequencer breaks tasks into ordered micro-steps. This is especially useful for complex deliverables where you need a clear path through the work.\n\nPriority 1–5 lets you rank tasks, and the "time fitting" feature shows you whether today's available hours can accommodate your active tasks.\n\nTasks are linked to a category (work, personal, study, etc.) and optionally to a Project. Use Projects for multi-task initiatives; use Tasks for single-action items.\n\nThe "assigned by" and "for whom" fields make JAR useful for freelancers and students tracking client or professor requests alongside personal goals.`,
  },
  {
    id: 'calendar', title: 'Calendar',
    content: `The Calendar shows all your time-based items — tasks with deadlines, meetings, payments due, and any events you add directly.\n\nFlexible events sit anywhere in a time window (e.g., "this week"). Fixed events have a specific time and are shown on the hour grid in week/day view.\n\nUse keyboard shortcuts t (today), m/w/d (month/week/day view), and arrow keys to navigate fast without touching the mouse.\n\nCalendar entries auto-populate from Tasks (via deadline), Payments (via due date), and Subscriptions (via renewal date). You can also add standalone events with free-text notes.\n\nIn week view, drag events to reschedule them. All changes sync back to the underlying item automatically.`,
  },
  {
    id: 'diet', title: 'Diet',
    content: `The Diet module tracks what you eat across four meal slots: Breakfast, Lunch, Dinner, and Snack. Each entry pulls nutritional data from the Items Database or Open Food Facts.\n\nThe Today tab shows your macro progress bars (calories, protein, carbs, fat) and water intake against your daily goals. Log water in quick increments using the +250ml / +500ml buttons.\n\nThe Eating Out tab lets you log restaurant visits. When you save an eating-out entry, it automatically creates a Food Out spend entry and a Diet Log entry so both your finances and nutrition stay accurate.\n\nRecipes let you build meals from multiple ingredients. When you log a recipe, all its ingredients' macros are summed automatically.\n\nSet your diet goals (Cut / Bulk / Maintain) in the Goals tab. These set your daily calorie and macro targets that appear as progress bars in Today view.`,
  },
  {
    id: 'groceries', title: 'Groceries',
    content: `Groceries is a smart shopping and spending tracker. At its core is Receipt Mode — a fast, keyboard-navigable form for entering every line item from a receipt.\n\nReceipt Mode remembers every product you've bought, building an Items Database over time. Each product stores its price history by store, so you can see where things are cheapest.\n\nThe Shopping List tab lets you plan your next trip. Items from staple products auto-suggest based on your purchase frequency.\n\nThe At Home tab is an opt-in inventory. Only items you manually flag as "Track at home" appear here — it's not auto-populated. This keeps the view clean and useful.\n\nThe Stores tab shows your spending by store over time, helping you optimize where you shop. The Items Database tab lets you browse, search, and edit every product's nutritional and pricing data.`,
  },
  {
    id: 'health', title: 'Health',
    content: `The Health module tracks the physical and emotional metrics that matter to you: weight, mood, sleep duration, and custom health markers.\n\nLog your weight daily to see a trend line over weeks and months. The chart uses a rolling 7-day average to smooth out noise.\n\nSleep tracking works by logging your bed time and wake time. JAR calculates duration and shows it against your sleep goal.\n\nMood logging is a 1–5 scale with optional notes. Over time, mood correlates with other data like sleep and spend patterns in Insights.\n\nCustom health markers let you track anything specific to your routine — blood pressure, HRV, steps, or anything else with a numeric value.`,
  },
  {
    id: 'projects', title: 'Projects',
    content: `Projects are containers for multi-item work initiatives. Each project has a name, icon, color, and a set of custom work types.\n\nWork types define what kinds of entries exist in a project. For a football club project, work types might be Match, Training, and Analysis. For a university project, they might be Lecture, Assignment, and Exam.\n\nEach work type can have custom fields — dropdowns, text fields, numbers — so entries are structured exactly as you need them.\n\nProject pages show stats per work type: total time logged, count of entries, and progress toward milestones. Use milestones to mark major checkpoints in a project.\n\nProjects appear in the sidebar for quick access. Archive completed projects to keep the sidebar clean without losing the data.`,
  },
  {
    id: 'insights', title: 'Insights',
    content: `Insights is your analytics hub. It aggregates data from Spends, Subscriptions, Diet, Health, and Tasks to give you cross-module views of your life patterns.\n\nThe spending dashboard shows monthly totals, category breakdowns, and trend lines over 3, 6, or 12 months. Use the period selector to zoom in or out.\n\nComparisons let you benchmark this month against last month across any metric. Spend more on food? Sleep less? The comparison cards make it immediately visible.\n\nJar stacking in Insights shows how your activity density has changed over time. A dense jar month means lots of logged activity; a sparse one means less engagement with tracking.\n\nUse Insights at the end of each week or month as a 5-minute review ritual. It's designed to surface patterns, not overwhelm you with raw numbers.`,
  },
];

const FAQ = [
  { q: 'Can I use JAR on multiple devices?', a: 'Yes. JAR is a web app with a cloud backend. Sign in from any device and your data syncs automatically.' },
  { q: 'How do I export my data?', a: 'Go to Settings → Data Management → Export. You can export all entities as JSON or CSV.' },
  { q: 'How do I back up my data?', a: 'Your data is automatically stored in the cloud. For a local backup, use the Export option in Settings.' },
  { q: "Why doesn't this need an internet connection?", a: 'JAR requires an internet connection for sync. However, most views load cached data instantly so the app feels fast even on slow connections.' },
  { q: 'How do I delete my data?', a: 'Go to Settings → Data Management → Danger Zone. You can delete individual entity types or all data at once. This is irreversible.' },
  { q: 'How do I customize categories?', a: 'Spend categories are fixed for now but custom tags can be added to any item. Project work types are fully customizable per project.' },
  { q: "What's the difference between a Project and a Task?", a: 'A Task is a single action item. A Project is a container for many related entries (tasks, sessions, meetings) that share a theme and often span weeks or months.' },
  { q: "What's the jar system actually measuring?", a: "Each logged item fills a portion of a virtual jar. It's a rhythm indicator — not a limit. A full jar means you've had a dense, logged day. Stacked completed jars show your streak of activity." },
];

const TIPS = [
  'Bulk import data via Settings → Bulk Import using CSV files.',
  'Brand autocomplete in Receipt Mode learns your brands over time and suggests them as you type.',
  'Frequency-based suggestions: staple items auto-appear in the shopping list based on how often you buy them.',
  'Jar overflow stacking: once a jar hits 100%, a new one starts. Completed jars stack next to the current one.',
  'Cross-module linking: tasks can be linked to spending items, projects, and calendar events via the linked_items field.',
  'Repeat last entry: in any spend form, the last-used category and amount are pre-filled to save time.',
  'Custom work types in Projects let you define exactly what fields each work entry captures — no bloat.',
];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="font-mono font-semibold text-sm tracking-wide">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

function CopyShortcut({ keys }) {
  const [copied, setCopied] = useState(false);
  const text = keys.join('+');
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-2 text-muted-foreground hover:text-primary transition-colors"
      title="Copy shortcut"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Help() {
  const [query, setQuery] = useState('');
  const q = query.toLowerCase();

  const filteredGuides = useMemo(() =>
    MODULE_GUIDES.filter(g => !q || g.title.toLowerCase().includes(q) || g.content.toLowerCase().includes(q)),
    [q]);

  const filteredFaq = useMemo(() =>
    FAQ.filter(f => !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)),
    [q]);

  const filteredShortcuts = useMemo(() =>
    SHORTCUT_SECTIONS.map(s => ({
      ...s,
      shortcuts: s.shortcuts.filter(sc => !q || sc.description.toLowerCase().includes(q) || sc.keys.join(' ').toLowerCase().includes(q)),
    })).filter(s => s.shortcuts.length > 0),
    [q]);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="font-mono text-2xl font-bold text-primary tracking-widest uppercase mb-1">Help & Tutorials</h1>
        <p className="text-muted-foreground text-sm">Everything you need to get the most out of JAR.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search guides, shortcuts, FAQs..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-10 bg-muted border-none"
        />
      </div>

      {/* Quick Start */}
      {!q && (
        <Section title="Quick Start" defaultOpen={true}>
          <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
            <li><strong className="text-foreground">Add your first spend in 3 taps</strong> — Click the green + button, choose "Spend", pick a category, enter the amount, press Enter.</li>
            <li><strong className="text-foreground">Create your first task</strong> — Click +, choose "Task", give it a title and a due date, hit save.</li>
            <li><strong className="text-foreground">Set up your first project</strong> — In the sidebar, click the + next to PROJECTS. Pick a template or start from scratch.</li>
            <li><strong className="text-foreground">Import your subscription list</strong> — Go to Subscriptions, click +, choose from the catalog of popular services.</li>
            <li><strong className="text-foreground">Learn the jar</strong> — Every logged item fills your jar a little. It's not a limit — it's your daily rhythm, visible.</li>
            <li><strong className="text-foreground">Press ⌘?</strong> — Anytime, anywhere, to see all keyboard shortcuts.</li>
          </ol>
        </Section>
      )}

      {/* Keyboard Shortcuts */}
      <Section title="Keyboard Shortcuts" defaultOpen={!!q}>
        <div className="space-y-5">
          {filteredShortcuts.map(section => (
            <div key={section.id}>
              <p className="mono-header text-[10px] text-primary mb-2">{section.label}</p>
              {section.shortcuts.map((s, i) => {
                const isMacCtx = typeof navigator !== 'undefined' && navigator.platform.startsWith('Mac');
                const keys = (isMacCtx || !s.win) ? s.keys : s.win;
                return (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-sm text-muted-foreground">{s.description}</span>
                    <div className="flex items-center gap-1 ml-4 shrink-0">
                      {keys.map((k, ki) => (
                        <React.Fragment key={ki}>
                          <KbdKey>{k}</KbdKey>
                          {ki < keys.length - 1 && <span className="text-muted-foreground text-xs">+</span>}
                        </React.Fragment>
                      ))}
                      <CopyShortcut keys={keys} />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Section>

      {/* Module Guides */}
      {filteredGuides.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-mono text-xs text-primary tracking-widest uppercase">Module Guides</h2>
          {filteredGuides.map(g => (
            <Section key={g.id} title={g.title}>
              <div className="space-y-3">
                {g.content.split('\n\n').map((para, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
                ))}
              </div>
            </Section>
          ))}
        </div>
      )}

      {/* Tips & Tricks */}
      {(!q || filteredGuides.length > 0 || 'tips tricks power'.includes(q)) && (
        <Section title="Tips & Tricks">
          <ul className="space-y-2">
            {TIPS.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">→</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* FAQ */}
      {filteredFaq.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-mono text-xs text-primary tracking-widest uppercase">FAQ</h2>
          {filteredFaq.map((f, i) => (
            <Section key={i} title={f.q}>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </Section>
          ))}
        </div>
      )}
    </div>
  );
}