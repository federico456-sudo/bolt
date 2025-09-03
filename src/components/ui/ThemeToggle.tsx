import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../../stores/themeStore'
import { Button } from './Button'

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="p-2"
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-gray-700 dark:text-gray-300" />
      ) : (
        <Sun size={20} className="text-gray-700 dark:text-gray-300" />
      )}
    </Button>
  )
}