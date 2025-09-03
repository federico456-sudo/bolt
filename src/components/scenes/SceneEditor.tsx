import React, { useState, useEffect } from 'react'
import { Plus, X, Save, RotateCcw } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { supabase } from '../../lib/supabase'
import type { Escena, Dialogo, FuenteVideo, Adjunto, CorteVideo } from '../../types'

interface SceneEditorProps {
  escenaId: string
  onSave: () => void
  onCancel: () => void
}

export const SceneEditor: React.FC<SceneEditorProps> = ({
  escenaId,
  onSave,
  onCancel
}) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [originalData, setOriginalData] = useState<Escena | null>(null)
  const [escena, setEscena] = useState<Escena | null>(null)

  useEffect(() => {
    fetchEscenaDetails()
  }, [escenaId])

  const fetchEscenaDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('escenas')
        .select(`
          *,
          dialogos (*),
          fuentes_video (*, cortes_video (*)),
          adjuntos (*)
        `)
        .eq('id', escenaId)
        .single()

      if (error) throw error

      setEscena(data)
      setOriginalData(data)
    } catch (error) {
      console.error('Error fetching scene details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!escena) return

    setSaving(true)
    try {
      const { error } = await supabase.rpc('update_escena_complete', {
        p_escena_data: escena
      })

      if (error) throw error

      onSave()
    } catch (error) {
      console.error('Error saving scene:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setEscena(originalData)
  }

  const addDialogo = () => {
    if (!escena) return
    
    const newDialogo: Dialogo = {
      id: `temp_${Date.now()}`,
      escena_id: escena.id,
      nombre_locutor: '',
      tipo_voz: '',
      texto: ''
    }

    setEscena({
      ...escena,
      dialogos: [...(escena.dialogos || []), newDialogo]
    })
  }

  const removeDialogo = (index: number) => {
    if (!escena) return
    
    setEscena({
      ...escena,
      dialogos: escena.dialogos?.filter((_, i) => i !== index) || []
    })
  }

  const updateDialogo = (index: number, field: keyof Dialogo, value: string) => {
    if (!escena) return
    
    setEscena({
      ...escena,
      dialogos: escena.dialogos?.map((dialogo, i) => 
        i === index ? { ...dialogo, [field]: value } : dialogo
      ) || []
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!escena) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Error al cargar la escena</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Editar Escena {escena.numero_escena}
            </h2>
          </div>

          <div className="p-6 space-y-8">
            {/* Basic Scene Data */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Datos de la Escena</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Número de Escena"
                  value={escena.numero_escena}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-700"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Tiempo Inicio (seg)"
                    type="number"
                    value={escena.tiempo_inicio_seg || 0}
                    onChange={(e) => setEscena({
                      ...escena,
                      tiempo_inicio_seg: parseInt(e.target.value) || 0
                    })}
                  />
                  <Input
                    label="Tiempo Fin (seg)"
                    type="number"
                    value={escena.tiempo_fin_seg || 0}
                    onChange={(e) => setEscena({
                      ...escena,
                      tiempo_fin_seg: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción de la Escena
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                  rows={3}
                  value={escena.scene_description || ''}
                  onChange={(e) => setEscena({
                    ...escena,
                    scene_description: e.target.value
                  })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Prompt Inicio
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    rows={2}
                    value={escena.prompt_inicio || ''}
                    onChange={(e) => setEscena({
                      ...escena,
                      prompt_inicio: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Prompt Fin
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    rows={2}
                    value={escena.prompt_fin || ''}
                    onChange={(e) => setEscena({
                      ...escena,
                      prompt_fin: e.target.value
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Dialogues Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Diálogos</h3>
                <Button variant="outline" size="sm" onClick={addDialogo}>
                  <Plus size={16} className="mr-2" />
                  Añadir Diálogo
                </Button>
              </div>
              
              <div className="space-y-3">
                {escena.dialogos?.map((dialogo, index) => (
                  <div key={dialogo.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Nombre del locutor"
                          value={dialogo.nombre_locutor || ''}
                          onChange={(e) => updateDialogo(index, 'nombre_locutor', e.target.value)}
                        />
                        <Input
                          placeholder="Tipo de voz"
                          value={dialogo.tipo_voz || ''}
                          onChange={(e) => updateDialogo(index, 'tipo_voz', e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => removeDialogo(index)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                      >
                        <X size={16} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                    <div className="mt-3">
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        rows={2}
                        placeholder="Texto del diálogo..."
                        value={dialogo.texto}
                        onChange={(e) => updateDialogo(index, 'texto', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Action Bar */}
      <div className="fixed bottom-0 right-0 p-6 z-40">
        <div className="flex space-x-3 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw size={16} className="mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Guardando...</span>
              </div>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}