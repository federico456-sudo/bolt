import React, { useEffect } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { Grid3X3, List, Plus, Trash2, Save, Edit } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { SceneContainer } from '../components/scenes/SceneContainer'
import { LoadingSpinner, SkeletonLoader } from '../components/ui/SkeletonLoader'
import { Button } from '../components/ui/Button'
import { useEscenasStore } from '../stores/escenasStore'

export const ProjectEditionPage: React.FC = () => {
  const { canalId, proyectoId } = useParams({ 
    from: '/canal/$canalId/edicion/$proyectoId' 
  })
  const navigate = useNavigate()
  
  const {
    escenas,
    selectedEscena,
    loading,
    viewMode,
    fetchEscenas,
    updateEscenaStatus,
    saveChanges,
    addEscena,
    deleteEscena,
    selectEscena,
    setViewMode
  } = useEscenasStore()

  useEffect(() => {
    fetchEscenas(proyectoId)
  }, [proyectoId])

  const handleSave = async () => {
    await saveChanges(proyectoId)
  }

  const handleAdd = () => {
    addEscena(proyectoId)
  }

  const handleDelete = () => {
    if (selectedEscena) {
      deleteEscena(selectedEscena)
    }
  }

  const selectedEscenaData = escenas.find(e => e.id === selectedEscena)

  return (
    <div className="min-h-screen">
      <Header 
        showBackButton 
        onBackClick={() => navigate({ to: '/canal/$canalId', params: { canalId } })} 
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Editar Proyecto
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Organiza y gestiona las escenas del proyecto
            </p>
          </div>
          
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Grid3X3 size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Scenes Container */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonLoader key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : escenas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No hay escenas en este proyecto
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Haz clic en + para añadir la primera escena
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {escenas.map((escena) => (
              <SceneContainer
                key={escena.id}
                escena={escena}
                isSelected={selectedEscena === escena.id}
                onSelect={() => selectEscena(escena.id)}
                onStatusChange={(status) => updateEscenaStatus(escena.id, status)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={handleAdd}
            className="flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Añadir</span>
          </Button>
          
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={!selectedEscena}
            className="flex items-center space-x-2"
          >
            <Trash2 size={16} />
            <span>Eliminar</span>
          </Button>
          
          <Button
            onClick={handleSave}
            className="flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Guardar</span>
          </Button>
          
          {selectedEscenaData && (
            <Link
              to="/canal/$canalId/edicion/$proyectoId/creacion/$escenaId"
              params={{ canalId, proyectoId, escenaId: selectedEscenaData.id }}
            >
              <Button
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <Edit size={16} />
                <span>Editar</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}