import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Proyecto, ProjectJSON } from '../types'

interface ProyectosState {
  proyectos: Proyecto[]
  loading: boolean
  error: string | null
  viewMode: 'grid' | 'list'
  
  fetchProyectos: (canalId: string) => Promise<void>
  createProyecto: (canalId: string, jsonData: ProjectJSON) => Promise<void>
  deleteProyecto: (id: string) => Promise<void>
  setViewMode: (mode: 'grid' | 'list') => void
}

export const useProyectosStore = create<ProyectosState>((set, get) => ({
  proyectos: [],
  loading: false,
  error: null,
  viewMode: 'grid',

  fetchProyectos: async (canalId: string) => {
    set({ loading: true, error: null })

    try {
      const { data, error } = await supabase
        .from('proyectos')
        .select('*')
        .eq('canal_id', canalId)
        .order('fecha_creacion', { ascending: false })

      if (error) throw error

      set({ proyectos: data || [], loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  createProyecto: async (canalId: string, jsonData: ProjectJSON) => {
    try {
      // Call RPC function to create project with all related data
      const { data, error } = await supabase.rpc('create_project_from_json', {
        p_canal_id: canalId,
        p_project_data: jsonData
      })

      if (error) throw error

      // Refresh projects list
      get().fetchProyectos(canalId)
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  deleteProyecto: async (id: string) => {
    try {
      const { error } = await supabase
        .from('proyectos')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        proyectos: state.proyectos.filter(proyecto => proyecto.id !== id)
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  setViewMode: (mode) => set({ viewMode: mode }),
}))