export interface Canal {
  id: string
  user_id: string
  titulo: string
  imagen1_url?: string
  imagen2_url?: string
  mail?: string
  descripcion?: string
  categorias?: string[]
  api_key?: string
  idioma?: string
  fecha_creacion: string
}

export interface Proyecto {
  id: string
  canal_id: string
  title: string
  description?: string
  carpeta_drive_url?: string
  fecha_creacion: string
  status: string
}

export interface Escena {
  id: string
  proyecto_id: string
  numero_escena: number
  status: 'idle' | 'pending' | 'success'
  scene_description?: string
  prompt_inicio?: string
  prompt_fin?: string
  tiempo_inicio_seg?: number
  tiempo_fin_seg?: number
  dialogos?: Dialogo[]
  fuentes_video?: FuenteVideo[]
  adjuntos?: Adjunto[]
}

export interface Dialogo {
  id: string
  escena_id: string
  nombre_locutor?: string
  tipo_voz?: string
  texto: string
}

export interface FuenteVideo {
  id: string
  escena_id: string
  url_video: string
  clip_id?: string
  cortes_video?: CorteVideo[]
}

export interface CorteVideo {
  id: string
  fuente_id: string
  nombre_parte?: string
  rango_tiempo?: string
}

export interface Adjunto {
  id: string
  escena_id: string
  tipo?: string
  url: string
  description?: string
}

export type ViewMode = 'grid' | 'list'
export type Theme = 'light' | 'dark'

export interface ProjectJSON {
  title: string
  description: string
  scenes: {
    numero_escena: number
    scene_description: string
    prompt_inicio: string
    prompt_fin: string
    tiempo_inicio_seg: number
    tiempo_fin_seg: number
    dialogos: {
      nombre_locutor: string
      tipo_voz: string
      texto: string
    }[]
    fuentes_video: {
      url_video: string
      clip_id: string
      cortes_video: {
        nombre_parte: string
        rango_tiempo: string
      }[]
    }[]
    adjuntos: {
      tipo: string
      url: string
      description: string
    }[]
  }[]
}