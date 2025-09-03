import React from 'react'
import { Calendar, Edit, Clock, Check, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { Proyecto } from '../../types'
import { formatDate } from '../../lib/utils'

interface ProjectCardProps {
  proyecto: Proyecto
  canalId: string
  onDelete: (id: string) => void
  viewMode: 'grid' | 'list'
  allScenesCompleted: boolean
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  proyecto, 
  canalId,
  onDelete,
  viewMode,
  allScenesCompleted
}) => {
  const StatusIcon = allScenesCompleted ? Check : Clock

  if (viewMode === 'list') {
    return (
      <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {proyecto.title}
            </h3>
            {proyecto.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {proyecto.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group/tooltip relative">
              <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap">
                {formatDate(proyecto.fecha_creacion)}
              </div>
            </div>
            
            <Link
              to="/canal/$canalId/edicion/$proyectoId"
              params={{ canalId, proyectoId: proyecto.id }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Edit size={16} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
            </Link>
            
            {allScenesCompleted ? (
              <Link
                to="/proyecto/$proyectoId/video"
                params={{ proyectoId: proyecto.id }}
                className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
              >
                <StatusIcon size={16} className="text-green-600 dark:text-green-400" />
              </Link>
            ) : (
              <div className="p-2">
                <StatusIcon size={16} className="text-orange-500 dark:text-orange-400" />
              </div>
            )}
            
            <button
              onClick={() => onDelete(proyecto.id)}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
            >
              <Trash2 size={16} className="text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {proyecto.title}
        </h3>
        <div className="flex space-x-1">
          <div className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group/tooltip relative">
            <Calendar size={14} className="text-gray-500 dark:text-gray-400" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap">
              {formatDate(proyecto.fecha_creacion)}
            </div>
          </div>
          
          <Link
            to="/canal/$canalId/edicion/$proyectoId"
            params={{ canalId, proyectoId: proyecto.id }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Edit size={14} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
          </Link>
          
          {allScenesCompleted ? (
            <Link
              to="/proyecto/$proyectoId/video"
              params={{ proyectoId: proyecto.id }}
              className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
            >
              <StatusIcon size={14} className="text-green-600 dark:text-green-400" />
            </Link>
          ) : (
            <div className="p-1.5">
              <StatusIcon size={14} className="text-orange-500 dark:text-orange-400" />
            </div>
          )}
          
          <button
            onClick={() => onDelete(proyecto.id)}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
          >
            <Trash2 size={14} className="text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
      
      {proyecto.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {proyecto.description}
        </p>
      )}
    </div>
  )
}