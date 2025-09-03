import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { useCanalesStore } from '../../stores/canalesStore'

interface CreateChannelModalProps {
  open: boolean
  onClose: () => void
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  open,
  onClose
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    imagen1_url: '',
    imagen2_url: '',
    mail: '',
    descripcion: '',
    categorias: '',
    api_key: '',
    idioma: ''
  })
  const [loading, setLoading] = useState(false)
  const { createCanal } = useCanalesStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createCanal({
        ...formData,
        categorias: formData.categorias ? formData.categorias.split(',').map(c => c.trim()) : []
      })
      onClose()
      setFormData({
        titulo: '',
        imagen1_url: '',
        imagen2_url: '',
        mail: '',
        descripcion: '',
        categorias: '',
        api_key: '',
        idioma: ''
      })
    } catch (error) {
      console.error('Error creating channel:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Crear Nuevo Canal" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Título"
            placeholder="Nombre del canal"
            value={formData.titulo}
            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="email@ejemplo.com"
            value={formData.mail}
            onChange={(e) => setFormData(prev => ({ ...prev, mail: e.target.value }))}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Imagen Banner (16:9)"
            placeholder="https://ejemplo.com/imagen-banner.jpg"
            value={formData.imagen1_url}
            onChange={(e) => setFormData(prev => ({ ...prev, imagen1_url: e.target.value }))}
          />
          <Input
            label="Imagen Perfil (1:1)"
            placeholder="https://ejemplo.com/imagen-perfil.jpg"
            value={formData.imagen2_url}
            onChange={(e) => setFormData(prev => ({ ...prev, imagen2_url: e.target.value }))}
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Categorías"
              placeholder="tecnología, educación, entretenimiento"
              value={formData.categorias}
              onChange={(e) => setFormData(prev => ({ ...prev, categorias: e.target.value }))}
            />
            <Input
              label="Idioma"
              placeholder="es, en, fr"
              value={formData.idioma}
              onChange={(e) => setFormData(prev => ({ ...prev, idioma: e.target.value }))}
            />
          </div>
          
          <Input
            label="API Key"
            placeholder="Clave de API del canal"
            value={formData.api_key}
            onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
          />
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
              rows={3}
              placeholder="Descripción del canal..."
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !formData.titulo}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Guardando...</span>
              </div>
            ) : (
              'Guardar'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}