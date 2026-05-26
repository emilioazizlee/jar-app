// /src/components/settings/SettingsRow.jsx
export function SettingsRow({
  icon: Icon,
  title,
  subtitle,
  control,
  last = false,
  onClick,
  danger = false,
  className = ''
}) {
  const classes = `
    flex items-center justify-between gap-4 px-4 py-3.5
    ${!last ? 'border-b border-sidebar-border' : ''}
    ${onClick ? 'cursor-pointer hover:bg-opacity-50 hover:bg-sidebar-muted transition-colors' : ''}
    ${danger ? 'text-red-500' : ''}
    ${className}
  `.trim();

  const content = (
    <div className="flex items-center gap-3 flex-1">
      {Icon && (
        <Icon
          size={20}
          className={`flex-shrink-0 ${danger ? 'text-red-500' : 'text-muted-foreground'}`}
        />
      )}
      <div className="flex-1">
        <p className={`text-sm font-medium ${danger ? 'text-red-500' : 'text-foreground'}`}>
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className={classes} onClick={onClick}>
      {content}
      {control && <div className="flex-shrink-0">{control}</div>}
    </div>
  );
}
