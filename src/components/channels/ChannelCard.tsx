import React from 'react'
import { Trash2, Calendar } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { Canal } from '../../types'
import { formatDate } from '../../lib/utils'

interface ChannelCardProps {
  canal: Canal
  onDelete: (id: string) => void
  viewMode: 'grid' | 'list'
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ 
  canal, 
  onDelete,
  viewMode 
}) => {
  if (viewMode === 'list') {
    return (
      <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 dark:border-gray-700">
        <Link
          to="/canal/$canalId"
          params={{ canalId: canal.id }}
          className="flex items-center p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
            {canal.imagen2_url ? (
              <img
                src={canal.imagen2_url}
                alt={canal.titulo}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
            )}
          </div>
          <div className="ml-6 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {canal.titulo}
            </h3>
            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              {canal.categorias && canal.categorias.length > 0 && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                  {canal.categorias[0]}
                </span>
              )}
              {canal.idioma && (
                <span className="uppercase font-medium">{canal.idioma}</span>
              )}
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{formatDate(canal.fecha_creacion)}</span>
              </div>
            </div>
          </div>
        </Link>
        <div className="absolute top-4 right-4">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete(canal.id)
            }}
            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-all duration-200"
          >
            <Trash2 size={16} className="text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 dark:border-gray-700">
      <Link
        to="/canal/$canalId"
        params={{ canalId: canal.id }}
        className="block"
      >
        <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          {canal.imagen1_url ? (
            <img
              src={canal.imagen1_url}
              alt={canal.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500" />
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {canal.titulo}
          </h3>
          <div className="mt-2 space-y-1">
            {canal.categorias && canal.categorias.length > 0 && (
              <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                {canal.categorias[0]}
              </span>
            )}
            {canal.idioma && (
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium">
                {canal.idioma}
              </p>
            )}
          </div>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDelete(canal.id)
        }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-all duration-200 backdrop-blur-sm"
      >
        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
      </button>
    </div>
  )
}