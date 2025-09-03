import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { useProyectosStore } from '../../stores/proyectosStore'
import type { ProjectJSON } from '../../types'

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  canalId: string
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  open,
  onClose,
  canalId
}) => {
  const [jsonContent, setJsonContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { createProyecto } = useProyectosStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const projectData: ProjectJSON = JSON.parse(jsonContent)
      
      // Basic validation
      if (!projectData.title || !projectData.scenes || !Array.isArray(projectData.scenes)) {
        throw new Error('JSON inválido: debe contener title y scenes')
      }

      await createProyecto(canalId, projectData)
      onClose()
      setJsonContent('')
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('JSON inválido: revisa la sintaxis')
      } else {
        setError((err as Error).message)
      }
    } finally {
      setLoading(false)
    }
  }

  const exampleJSON = `{
  "title": "Mi Nuevo Proyecto",
  "description": "Descripción del proyecto",
  "scenes": [
    {
      "numero_escena": 1,
      "scene_description": "Escena de introducción",
      "prompt_inicio": "Comenzamos con...",
      "prompt_fin": "Terminamos con...",
      "tiempo_inicio_seg": 0,
      "tiempo_fin_seg": 30,
      "dialogos": [
        {
          "nombre_locutor": "Narrador",
          "tipo_voz": "masculina",
          "texto": "Bienvenidos al video"
        }
      ],
      "fuentes_video": [
        {
          "url_video": "https://drive.google.com/...",
          "clip_id": "clip_001",
          "cortes_video": [
            {
              "nombre_parte": "intro",
              "rango_tiempo": "00:00-00:30"
            }
          ]
        }
      ],
      "adjuntos": [
        {
          "tipo": "image",
          "url": "https://ejemplo.com/imagen.jpg",
          "description": "Imagen de ejemplo"
        }
      ]
    }
  ]
}`

  return (
    <Modal open={open} onClose={onClose} title="Crear Nuevo Proyecto" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Datos del Proyecto (JSON)
            </label>
            <button
              type="button"
              onClick={() => setJsonContent(exampleJSON)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Usar ejemplo
            </button>
          </div>
          <textarea
            className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm"
            placeholder="Pega aquí el JSON del proyecto..."
            value={jsonContent}
            onChange={(e) => setJsonContent(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !jsonContent}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Procesando...</span>
              </div>
            ) : (
              'Crear Proyecto'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}