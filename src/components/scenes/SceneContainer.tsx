import React from 'react'
import { Clock, Image, Video, File } from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatDuration } from '../../lib/utils'
import type { Escena } from '../../types'

interface SceneContainerProps {
  escena: Escena
  isSelected: boolean
  onSelect: () => void
  onStatusChange: (status: 'idle' | 'pending' | 'success') => void
}

export const SceneContainer: React.FC<SceneContainerProps> = ({
  escena,
  isSelected,
  onSelect,
  onStatusChange
}) => {
  const duration = escena.tiempo_fin_seg && escena.tiempo_inicio_seg 
    ? escena.tiempo_fin_seg - escena.tiempo_inicio_seg 
    : 0

  const hasImage = escena.adjuntos?.some(adj => adj.tipo === 'image')
  const hasVideo = escena.fuentes_video && escena.fuentes_video.length > 0

  return (
    <div
      onClick={onSelect}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 transition-all duration-200 cursor-pointer group hover:shadow-xl',
        isSelected 
          ? 'border-blue-500 dark:border-blue-400' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {escena.numero_escena}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDuration(duration)}
            </span>
          </div>
          
          <div className="flex space-x-1">
            {hasVideo && (
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Video size={14} className="text-blue-600 dark:text-blue-400" />
              </div>
            )}
            {hasImage && (
              <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-lg">
                <Image size={14} className="text-green-600 dark:text-green-400" />
              </div>
            )}
            {escena.adjuntos && escena.adjuntos.length > 0 && (
              <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <File size={14} className="text-gray-600 dark:text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
          {hasImage ? (
            <Image size={32} className="text-gray-400" />
          ) : hasVideo ? (
            <Video size={32} className="text-gray-400" />
          ) : (
            <File size={32} className="text-gray-400" />
          )}
        </div>

        <div className="flex justify-center space-x-2">
          {['idle', 'pending', 'success'].map((status) => (
            <button
              key={status}
              onClick={(e) => {
                e.stopPropagation()
                onStatusChange(status as any)
              }}
              className={cn(
                'w-4 h-4 rounded-full border-2 transition-all duration-200',
                escena.status === status
                  ? {
                      idle: 'bg-red-500 border-red-500',
                      pending: 'bg-orange-500 border-orange-500',
                      success: 'bg-green-500 border-green-500'
                    }[status]
                  : 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}