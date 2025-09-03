import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Copy, ArrowLeft } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { supabase } from '../lib/supabase'
import type { Proyecto, Canal } from '../types'

export const VideoPage: React.FC = () => {
  const { proyectoId } = useParams({ from: '/proyecto/$proyectoId/video' })
  const navigate = useNavigate()
  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [canal, setCanal] = useState<Canal | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchProjectData()
  }, [proyectoId])

  const fetchProjectData = async () => {
    try {
      const { data: proyectoData, error: proyectoError } = await supabase
        .from('proyectos')
        .select('*, canales(*)')
        .eq('id', proyectoId)
        .single()

      if (proyectoError) throw proyectoError

      setProyecto(proyectoData)
      setCanal(proyectoData.canales)
    } catch (error) {
      console.error('Error fetching project data:', error)
      navigate({ to: '/' })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyUrl = async () => {
    if (!proyecto?.carpeta_drive_url) return
    
    await navigator.clipboard.writeText(proyecto.carpeta_drive_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleBackToChannel = () => {
    if (canal) {
      navigate({ to: '/canal/$canalId', params: { canalId: canal.id } })
    } else {
      navigate({ to: '/' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!proyecto) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <p className="text-gray-600 dark:text-gray-400">Proyecto no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8 text-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎬</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">¡Proyecto Completado!</h1>
              <p className="opacity-90">
                Todas las escenas han sido procesadas exitosamente
              </p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {proyecto.title}
              </h2>
              {proyecto.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {proyecto.description}
                </p>
              )}
            </div>

            {proyecto.carpeta_drive_url && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  URL del Video Final
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={proyecto.carpeta_drive_url}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyUrl}
                    className="flex items-center space-x-2"
                  >
                    <Copy size={16} />
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleBackToChannel}
                className="flex items-center space-x-2"
              >
                <ArrowLeft size={16} />
                <span>Volver al Canal</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}