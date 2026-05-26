// /src/components/settings/ActionBtn.jsx
export function ActionBtn({ text, onClick, danger = false, className = '' }) {
  const baseClasses = `
    px-3 py-1.5 rounded
    text-xs font-medium
    transition-colors duration-200
    border border-sidebar-border
    cursor-pointer
    hover:bg-opacity-80
  `;

  const variantClasses = danger
    ? 'bg-red-500 bg-opacity-10 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500'
    : 'bg-sidebar-muted text-foreground hover:bg-sidebar-muted-hover';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {text}
    </button>
  );
}
