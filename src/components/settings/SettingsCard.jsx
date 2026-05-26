// /src/components/settings/SettingsCard.jsx
export function SettingsCard({ children, className = '' }) {
  return (
    <div className={`bg-card rounded-lg border border-sidebar-border p-4 space-y-0 ${className}`}>
      {children}
    </div>
  );
}
