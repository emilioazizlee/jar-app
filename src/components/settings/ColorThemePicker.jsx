// /src/components/settings/ColorThemePicker.jsx
import { useEffect } from 'react';

export function ColorThemePicker({ value, onChange, className = '' }) {
  const themeOptions = [
    { id: 'default', label: 'Default', description: 'Light neutral theme' },
    { id: 'ocean', label: 'Ocean', description: 'Cool blue and teal tones' },
    { id: 'sand', label: 'Sand', description: 'Warm earth tones' },
    { id: 'brown-yellow', label: 'Brown/Yellow', description: 'Warm browns and golds' },
    { id: 'blue-purple', label: 'Blue/Purple', description: 'Cool purples and blues' },
    { id: 'red-purple', label: 'Red/Purple', description: 'Vibrant reds and purples' },
  ];

  // LINE 19: Apply theme to HTML element when theme changes
  const applyTheme = (themeId) => {
    // Remove all theme classes from <html>
    document.documentElement.classList.remove(
      'default', 'ocean', 'sand', 'brown-yellow', 'blue-purple', 'red-purple'
    );
    
    // Add the new theme class
    if (themeId && themeId !== 'default') {
      document.documentElement.classList.add(themeId);
    }
    
    // Save to localStorage for persistence
    localStorage.setItem('jar-theme', themeId || 'default');
    
    // Call the onChange callback
    onChange?.(themeId);
  };

  // LINE 35: When component mounts, load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('jar-theme') || 'default';
    if (value !== savedTheme) {
      applyTheme(value || savedTheme);
    }
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {themeOptions.map((theme) => (
          <button
            key={theme.id}
            onClick={() => applyTheme(theme.id)}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200
              text-left group cursor-pointer
              ${
                value === theme.id
                  ? 'border-primary bg-primary bg-opacity-5'
                  : 'border-sidebar-border hover:border-sidebar-border-hover'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-slate-400" />
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
            </div>
            <p className="text-sm font-medium text-foreground group-hover:text-foreground">
              {theme.label}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{theme.description}</p>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Select a color theme to customize the appearance of JAR
      </p>
    </div>
  );
}
