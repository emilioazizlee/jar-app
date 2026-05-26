// /src/components/settings/SettingsCard.jsx
export function SettingsCard({ children, className = '' }) {
  return (
    <div className={`bg-card rounded-xl border border-sidebar-border p-4 space-y-0 ${className}`}>
      {children}
    </div>
  );
}