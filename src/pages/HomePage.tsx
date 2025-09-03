import React, { useEffect, useState } from 'react'
import { Header } from '../components/layout/Header'
import { ChannelFilters } from '../components/channels/ChannelFilters'
import { ChannelCard } from '../components/channels/ChannelCard'
import { CreateChannelModal } from '../components/channels/CreateChannelModal'
import { FloatingActionButton } from '../components/ui/FloatingActionButton'
import { ChannelCardSkeleton } from '../components/ui/SkeletonLoader'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { useCanalesStore } from '../stores/canalesStore'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'

export const HomePage: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [channelToDelete, setChannelToDelete] = useState<string>('')
  
  const {
    canales,
    loading,
    viewMode,
    hasMore,
    fetchCanales,
    deleteCanal,
    searchTerm,
    selectedCategory,
    selectedLanguage
  } = useCanalesStore()

  const [sentryRef] = useIntersectionObserver({
    onIntersect: () => {
      if (!loading && hasMore) {
        fetchCanales()
      }
    }
  })

  useEffect(() => {
    fetchCanales(true)
  }, [searchTerm, selectedCategory, selectedLanguage])

  const handleDeleteChannel = (id: string) => {
    setChannelToDelete(id)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    await deleteCanal(channelToDelete)
    setDeleteModalOpen(false)
    setChannelToDelete('')
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mis Canales
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona y organiza todos tus canales de contenido
          </p>
        </div>

        <ChannelFilters />

        {/* Channels Grid/List */}
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
        }>
          {canales.map((canal) => (
            <ChannelCard
              key={canal.id}
              canal={canal}
              viewMode={viewMode}
              onDelete={handleDeleteChannel}
            />
          ))}
          
          {loading && (
            Array.from({ length: 8 }).map((_, i) => (
              <ChannelCardSkeleton key={i} />
            ))
          )}
        </div>

        {/* Infinite scroll sentinel */}
        <div ref={sentryRef} className="h-4" />

        {canales.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No hay canales creados aún
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Haz clic en el botón + para crear tu primer canal
            </p>
          </div>
        )}
      </main>

      <FloatingActionButton onClick={() => setCreateModalOpen(true)} />
      
      <CreateChannelModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
      
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Eliminar Canal"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            ¿Estás seguro de que quieres eliminar este canal? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}