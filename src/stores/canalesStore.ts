import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Canal } from '../types'

interface CanalesState {
  canales: Canal[]
  loading: boolean
  error: string | null
  viewMode: 'grid' | 'list'
  searchTerm: string
  selectedCategory: string
  selectedLanguage: string
  page: number
  hasMore: boolean
  
  fetchCanales: (reset?: boolean) => Promise<void>
  createCanal: (data: Omit<Canal, 'id' | 'user_id' | 'fecha_creacion'>) => Promise<void>
  deleteCanal: (id: string) => Promise<void>
  setViewMode: (mode: 'grid' | 'list') => void
  setSearchTerm: (term: string) => void
  setSelectedCategory: (category: string) => void
  setSelectedLanguage: (language: string) => void
  resetFilters: () => void
}

export const useCanalesStore = create<CanalesState>((set, get) => ({
  canales: [],
  loading: false,
  error: null,
  viewMode: 'grid',
  searchTerm: '',
  selectedCategory: '',
  selectedLanguage: '',
  page: 0,
  hasMore: true,

  fetchCanales: async (reset = false) => {
    const state = get()
    if (state.loading || (!reset && !state.hasMore)) return

    set({ loading: true, error: null })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user authenticated')

      const from = reset ? 0 : state.page * 16
      const to = from + 15

      let query = supabase
        .from('canales')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha_creacion', { ascending: false })
        .range(from, to)

      if (state.searchTerm) {
        query = query.or(`titulo.ilike.%${state.searchTerm}%,descripcion.ilike.%${state.searchTerm}%`)
      }

      if (state.selectedCategory) {
        query = query.contains('categorias', [state.selectedCategory])
      }

      if (state.selectedLanguage) {
        query = query.eq('idioma', state.selectedLanguage)
      }

      const { data, error } = await query

      if (error) throw error

      set((state) => ({
        canales: reset ? data || [] : [...state.canales, ...(data || [])],
        page: reset ? 1 : state.page + 1,
        hasMore: (data || []).length === 16,
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  createCanal: async (data) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user authenticated')

      const { data: newCanal, error } = await supabase
        .from('canales')
        .insert({ ...data, user_id: user.id })
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        canales: [newCanal, ...state.canales]
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  deleteCanal: async (id: string) => {
    try {
      const { error } = await supabase
        .from('canales')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        canales: state.canales.filter(canal => canal.id !== id)
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),
  resetFilters: () => set({
    searchTerm: '',
    selectedCategory: '',
    selectedLanguage: '',
    page: 0,
    hasMore: true,
    canales: []
  })
}))