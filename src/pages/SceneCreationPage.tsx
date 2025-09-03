import React from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Header } from '../components/layout/Header'
import { SceneEditor } from '../components/scenes/SceneEditor'

export const SceneCreationPage: React.FC = () => {
  const { canalId, proyectoId, escenaId } = useParams({ 
    from: '/canal/$canalId/edicion/$proyectoId/creacion/$escenaId' 
  })
  const navigate = useNavigate()

  const handleSave = () => {
    navigate({ 
      to: '/canal/$canalId/edicion/$proyectoId', 
      params: { canalId, proyectoId } 
    })
  }

  const handleCancel = () => {
    navigate({ 
      to: '/canal/$canalId/edicion/$proyectoId', 
      params: { canalId, proyectoId } 
    })
  }

  return (
    <div className="min-h-screen">
      <Header />
      <SceneEditor
        escenaId={escenaId}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}