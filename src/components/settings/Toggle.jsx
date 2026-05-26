// /src/components/settings/Toggle.jsx
import { useState } from 'react';

export function Toggle({ checked = false, onChange, className = '' }) {
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer
        rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${isChecked ? 'bg-green-600' : 'bg-sidebar-muted'}
        ${className}
      `}
    >
      <span
        className={`
          inline-block h-5 w-5 transform rounded-full bg-white
          transition-transform duration-200 ease-in-out
          ${isChecked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
}
