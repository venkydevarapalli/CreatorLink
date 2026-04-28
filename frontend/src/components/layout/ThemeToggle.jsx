import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:bg-[var(--hover-bg)]"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{ '--hover-bg': theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
    >
      {theme === 'dark' ? (
        <Sun size={16} className="text-[var(--color-muted-foreground)]" />
      ) : (
        <Moon size={16} className="text-[var(--color-muted-foreground)]" />
      )}
    </button>
  );
}
