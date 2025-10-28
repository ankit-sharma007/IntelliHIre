import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useAdvancedHooks';

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface UserPreferences {
  theme: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  animations: boolean;
  notifications: {
    desktop: boolean;
    email: boolean;
    sound: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    widgets: string[];
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
  };
}

const defaultThemes: Record<string, Theme> = {
  light: {
    name: 'Light',
    colors: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      accent: '#8B5CF6',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: {
        primary: '#111827',
        secondary: '#6B7280',
        muted: '#9CA3AF',
      },
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#60A5FA',
      secondary: '#9CA3AF',
      accent: '#A78BFA',
      background: '#111827',
      surface: '#1F2937',
      text: {
        primary: '#F9FAFB',
        secondary: '#D1D5DB',
        muted: '#9CA3AF',
      },
      border: '#374151',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
    },
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
    },
  },
  blue: {
    name: 'Ocean Blue',
    colors: {
      primary: '#0EA5E9',
      secondary: '#64748B',
      accent: '#06B6D4',
      background: '#F8FAFC',
      surface: '#F1F5F9',
      text: {
        primary: '#0F172A',
        secondary: '#475569',
        muted: '#94A3B8',
      },
      border: '#CBD5E1',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#0EA5E9',
    },
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(14, 165, 233, 0.1)',
      md: '0 4px 6px -1px rgba(14, 165, 233, 0.15)',
      lg: '0 10px 15px -3px rgba(14, 165, 233, 0.15)',
      xl: '0 20px 25px -5px rgba(14, 165, 233, 0.15)',
    },
  },
  purple: {
    name: 'Royal Purple',
    colors: {
      primary: '#8B5CF6',
      secondary: '#6B7280',
      accent: '#A855F7',
      background: '#FEFEFE',
      surface: '#FAF9FF',
      text: {
        primary: '#1F2937',
        secondary: '#4B5563',
        muted: '#9CA3AF',
      },
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#8B5CF6',
    },
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(139, 92, 246, 0.1)',
      md: '0 4px 6px -1px rgba(139, 92, 246, 0.15)',
      lg: '0 10px 15px -3px rgba(139, 92, 246, 0.15)',
      xl: '0 20px 25px -5px rgba(139, 92, 246, 0.15)',
    },
  },
};

const defaultPreferences: UserPreferences = {
  theme: 'light',
  fontSize: 'medium',
  compactMode: false,
  animations: true,
  notifications: {
    desktop: true,
    email: true,
    sound: false,
  },
  dashboard: {
    layout: 'grid',
    widgets: ['stats', 'recent-jobs', 'recent-applications', 'calendar'],
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
  },
};

interface ThemeContextType {
  currentTheme: Theme;
  availableThemes: Record<string, Theme>;
  preferences: UserPreferences;
  setTheme: (themeName: string) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  addCustomTheme: (name: string, theme: Theme) => void;
  removeCustomTheme: (name: string) => void;
  exportPreferences: () => string;
  importPreferences: (data: string) => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>('user-preferences', defaultPreferences);
  const [customThemes, setCustomThemes] = useLocalStorage<Record<string, Theme>>('custom-themes', {});
  const [availableThemes, setAvailableThemes] = useState({ ...defaultThemes, ...customThemes });

  const currentTheme = availableThemes[preferences.theme] || defaultThemes.light;

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--color-${key}`, value);
      } else {
        Object.entries(value).forEach(([subKey, subValue]) => {
          root.style.setProperty(`--color-${key}-${subKey}`, subValue);
        });
      }
    });

    // Apply font families
    Object.entries(currentTheme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });

    // Apply spacing
    Object.entries(currentTheme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Apply border radius
    Object.entries(currentTheme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });

    // Apply shadows
    Object.entries(currentTheme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Apply font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.setProperty('--base-font-size', fontSizes[preferences.fontSize]);

    // Apply accessibility preferences
    if (preferences.accessibility.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.setProperty('--animation-duration', preferences.animations ? '0.3s' : '0s');
    }

    // Apply high contrast mode
    if (preferences.accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply compact mode
    if (preferences.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

  }, [currentTheme, preferences]);

  // Update available themes when custom themes change
  useEffect(() => {
    setAvailableThemes({ ...defaultThemes, ...customThemes });
  }, [customThemes]);

  const setTheme = useCallback((themeName: string) => {
    if (availableThemes[themeName]) {
      setPreferences(prev => ({ ...prev, theme: themeName }));
    }
  }, [availableThemes, setPreferences]);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, [setPreferences]);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, [setPreferences]);

  const addCustomTheme = useCallback((name: string, theme: Theme) => {
    setCustomThemes(prev => ({ ...prev, [name]: theme }));
  }, [setCustomThemes]);

  const removeCustomTheme = useCallback((name: string) => {
    setCustomThemes(prev => {
      const newThemes = { ...prev };
      delete newThemes[name];
      return newThemes;
    });
    
    // If the removed theme was active, switch to light theme
    if (preferences.theme === name) {
      setTheme('light');
    }
  }, [setCustomThemes, preferences.theme, setTheme]);

  const exportPreferences = useCallback(() => {
    return JSON.stringify({
      preferences,
      customThemes,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }, [preferences, customThemes]);

  const importPreferences = useCallback((data: string) => {
    try {
      const imported = JSON.parse(data);
      
      if (imported.preferences) {
        setPreferences(imported.preferences);
      }
      
      if (imported.customThemes) {
        setCustomThemes(imported.customThemes);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }, [setPreferences, setCustomThemes]);

  const value: ThemeContextType = {
    currentTheme,
    availableThemes,
    preferences,
    setTheme,
    updatePreferences,
    resetPreferences,
    addCustomTheme,
    removeCustomTheme,
    exportPreferences,
    importPreferences,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme-aware component wrapper
export const ThemedComponent: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'surface';
}> = ({ children, className = '', variant = 'surface' }) => {
  const { currentTheme } = useTheme();
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: currentTheme.colors.primary,
          color: currentTheme.colors.text.primary,
        };
      case 'secondary':
        return {
          backgroundColor: currentTheme.colors.secondary,
          color: currentTheme.colors.text.secondary,
        };
      case 'surface':
        return {
          backgroundColor: currentTheme.colors.surface,
          color: currentTheme.colors.text.primary,
        };
      default:
        return {};
    }
  };

  return (
    <div className={className} style={getVariantStyles()}>
      {children}
    </div>
  );
};