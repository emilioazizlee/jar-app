// /src/components/settings/SettingsLabel.jsx
export function SettingsLabel({ children, className = '' }) {
  return (
    <div className={`px-1 py-3 ${className}`}>
      <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
        {children}
      </p>
    </div>
  );
}
