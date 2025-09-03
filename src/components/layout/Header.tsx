import React from 'react'
import { Layers3 } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'

interface HeaderProps {
  showBackButton?: boolean
  onBackClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({ 
  showBackButton, 
  onBackClick 
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <Layers3 size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              ChannelFlow
            </h1>
          </div>
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Atrás
            </button>
          )}
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}