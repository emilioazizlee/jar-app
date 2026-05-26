// /src/components/settings/ColorThemePicker.jsx
import { useEffect } from 'react';

export function ColorThemePicker({ value, onChange, className = '' }) {
  const themeOptions = [
    { id: 'default', label: 'Default', description: 'Dark neutral theme' },
    { id: 'brown', label: 'Brown', description: 'Warm browns and beige' },
    { id: 'grape', label: 'Grape', description: 'Purple and lilac tones' },
    { id: 'tropic', label: 'Tropic', description: 'Vibrant reds and purples' },
  ];

  const applyTheme = (themeId) => {
    console.log('🎨 Applying theme:', themeId);
    
    const allThemes = ['default', 'brown', 'grape', 'tropic'];
    allThemes.forEach(t => {
      document.documentElement.classList.remove(t);
      console.log('❌ Removed:', t);
    });
    
    if (themeId && themeId !== 'default') {
      document.documentElement.classList.add(themeId);
      console.log('✅ Added:', themeId);
    } else {
      console.log('✅ Using default theme');
    }
    
    console.log('📌 HTML classes now:', document.documentElement.className);
    
    localStorage.setItem('jar-theme', themeId || 'default');
    console.log('💾 Saved to localStorage:', themeId);
    
    onChange?.(themeId);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('jar-theme') || 'default';
    console.log('🔄 Component mounted, saved theme:', savedTheme);
    applyTheme(savedTheme);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {themeOptions.map((theme) => (
          <button
            key={theme.id}
            onClick={() => {
              console.log('🖱️ Clicked theme:', theme.id);
              applyTheme(theme.id);
            }}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200
              text-left group cursor-pointer
              ${
                value === theme.id
                  ? 'border-primary bg-primary bg-opacity-10'
                  : 'border-sidebar-border hover:border-sidebar-border-hover'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-slate-400" />
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
            </div>
            <p className="text-sm font-medium text-foreground">
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
