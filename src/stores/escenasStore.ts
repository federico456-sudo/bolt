import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Escena } from '../types'

interface EscenasState {
  escenas: Escena[]
  selectedEscena: string | null
  loading: boolean
  error: string | null
  viewMode: 'grid' | 'list'
  
  fetchEscenas: (proyectoId: string) => Promise<void>
  updateEscenaStatus: (id: string, status: 'idle' | 'pending' | 'success') => void
  saveChanges: (proyectoId: string) => Promise<void>
  addEscena: (proyectoId: string) => void
  deleteEscena: (id: string) => void
  selectEscena: (id: string) => void
  setViewMode: (mode: 'grid' | 'list') => void
}

export const useEscenasStore = create<EscenasState>((set, get) => ({
  escenas: [],
  selectedEscena: null,
  loading: false,
  error: null,
  viewMode: 'grid',

  fetchEscenas: async (proyectoId: string) => {
    set({ loading: true, error: null })

    try {
      const { data, error } = await supabase
        .from('escenas')
        .select(`
          *,
          dialogos (*),
          fuentes_video (*, cortes_video (*)),
          adjuntos (*)
        `)
        .eq('proyecto_id', proyectoId)
        .order('numero_escena', { ascending: true })

      if (error) throw error

      set({ escenas: data || [], loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  updateEscenaStatus: (id: string, status: 'idle' | 'pending' | 'success') => {
    set((state) => ({
      escenas: state.escenas.map(escena =>
        escena.id === id ? { ...escena, status } : escena
      )
    }))
  },

  saveChanges: async (proyectoId: string) => {
    try {
      const { escenas } = get()
      
      const { error } = await supabase.rpc('update_escenas_status', {
        p_proyecto_id: proyectoId,
        p_escenas_data: escenas.map(e => ({
          id: e.id,
          status: e.status
        }))
      })

      if (error) throw error
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  addEscena: (proyectoId: string) => {
    const state = get()
    const nextNumero = Math.max(...state.escenas.map(e => e.numero_escena), 0) + 1
    
    const newEscena: Escena = {
      id: `temp_${Date.now()}`,
      proyecto_id: proyectoId,
      numero_escena: nextNumero,
      status: 'idle',
      scene_description: '',
      prompt_inicio: '',
      prompt_fin: '',
      tiempo_inicio_seg: 0,
      tiempo_fin_seg: 0
    }

    set((state) => ({
      escenas: [...state.escenas, newEscena],
      selectedEscena: newEscena.id
    }))
  },

  deleteEscena: (id: string) => {
    set((state) => ({
      escenas: state.escenas.filter(escena => escena.id !== id),
      selectedEscena: state.selectedEscena === id ? null : state.selectedEscena
    }))
  },

  selectEscena: (id: string) => set({ selectedEscena: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
}))