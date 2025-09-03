import React from 'react'
import { cn } from '../../lib/utils'

interface SkeletonLoaderProps {
  className?: string
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg',
        className
      )}
    />
  )
}

export const ChannelCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <SkeletonLoader className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <SkeletonLoader className="h-4 w-3/4" />
        <SkeletonLoader className="h-3 w-1/2" />
        <SkeletonLoader className="h-3 w-1/3" />
      </div>
    </div>
  )
}