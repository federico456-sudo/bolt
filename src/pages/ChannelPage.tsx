import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Grid3X3, List, Mail, Key, Calendar } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { ProjectCard } from '../components/projects/ProjectCard'
import { CreateProjectModal } from '../components/projects/CreateProjectModal'
import { FloatingActionButton } from '../components/ui/FloatingActionButton'
import { LoadingSpinner, SkeletonLoader } from '../components/ui/SkeletonLoader'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { supabase } from '../lib/supabase'
import { useProyectosStore } from '../stores/proyectosStore'
import { formatDate } from '../lib/utils'
import type { Canal } from '../types'

export const ChannelPage: React.FC = () => {
  const { canalId } = useParams({ from: '/canal/$canalId' })
  const navigate = useNavigate()
  const [canal, setCanal] = useState<Canal | null>(null)
  const [canalLoading, setCanalLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState('')
  const [projectStatuses, setProjectStatuses] = useState<Record<string, boolean>>({})

  const {
    proyectos,
    loading: proyectosLoading,
    viewMode,
    setViewMode,
    fetchProyectos,
    deleteProyecto
  } = useProyectosStore()

  useEffect(() => {
    fetchChannelData()
    fetchProyectos(canalId)
    checkProjectStatuses()
  }, [canalId])

  const fetchChannelData = async () => {
    try {
      const { data, error } = await supabase
        .from('canales')
        .select('*')
        .eq('id', canalId)
        .single()

      if (error) throw error
      setCanal(data)
    } catch (error) {
      console.error('Error fetching channel:', error)
      navigate({ to: '/' })
    } finally {
      setCanalLoading(false)
    }
  }

  const checkProjectStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('proyectos')
        .select('id, escenas(status)')
        .eq('canal_id', canalId)

      if (error) throw error

      const statuses: Record<string, boolean> = {}
      data.forEach(proyecto => {
        const allCompleted = proyecto.escenas.length > 0 && 
          proyecto.escenas.every((escena: any) => escena.status === 'success')
        statuses[proyecto.id] = allCompleted
      })

      setProjectStatuses(statuses)
    } catch (error) {
      console.error('Error checking project statuses:', error)
    }
  }

  const handleDeleteProject = (id: string) => {
    setProjectToDelete(id)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    await deleteProyecto(projectToDelete)
    setDeleteModalOpen(false)
    setProjectToDelete('')
  }

  if (canalLoading) {
    return (
      <div className="min-h-screen">
        <Header showBackButton onBackClick={() => navigate({ to: '/' })} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonLoader className="h-64 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonLoader key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!canal) {
    return (
      <div className="min-h-screen">
        <Header showBackButton onBackClick={() => navigate({ to: '/' })} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 dark:text-gray-400">Canal no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header showBackButton onBackClick={() => navigate({ to: '/' })} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Channel Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden mb-8 shadow-2xl">
          {canal.imagen1_url && (
            <img
              src={canal.imagen1_url}
              alt={canal.titulo}
              className="absolute inset-0 w-full h-64 object-cover opacity-30"
            />
          )}
          
          <div className="relative p-8 h-64 flex items-end">
            <div className="flex items-end space-x-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm border-4 border-white/30">
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
              
              <div className="flex-1 text-white">
                <h1 className="text-3xl font-bold mb-2">{canal.titulo}</h1>
                <div className="flex flex-wrap items-center space-x-4 text-sm opacity-90">
                  {canal.mail && (
                    <div className="flex items-center space-x-1">
                      <Mail size={16} />
                      <span>{canal.mail}</span>
                    </div>
                  )}
                  {canal.api_key && (
                    <div className="flex items-center space-x-1">
                      <Key size={16} />
                      <span>API configurada</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>{formatDate(canal.fecha_creacion)}</span>
                  </div>
                </div>
                {canal.categorias && canal.categorias.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {canal.categorias.map((categoria) => (
                      <span key={categoria} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                        {categoria}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Proyectos</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''}
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

        {/* Projects List/Grid */}
        {proyectosLoading ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonLoader key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : proyectos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No hay proyectos en este canal
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Haz clic en el botón + para crear tu primer proyecto
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }>
            {proyectos.map((proyecto) => (
              <ProjectCard
                key={proyecto.id}
                proyecto={proyecto}
                canalId={canalId}
                viewMode={viewMode}
                allScenesCompleted={projectStatuses[proyecto.id] || false}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </main>

      <FloatingActionButton onClick={() => setCreateModalOpen(true)} />
      
      <CreateProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        canalId={canalId}
      />
      
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Eliminar Proyecto"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            ¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.
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