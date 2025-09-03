import React from 'react'
import { Plus } from 'lucide-react'
import { cn } from '../../lib/utils'

interface FABProps {
  onClick: () => void
  className?: string
}

export const FloatingActionButton: React.FC<FABProps> = ({ 
  onClick, 
  className 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'w-14 h-14 rounded-full',
        'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
        'text-white shadow-lg hover:shadow-xl',
        'transition-all duration-200 transform hover:scale-105',
        'focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800',
        className
      )}
    >
      <Plus size={24} className="mx-auto" />
    </button>
  )
}