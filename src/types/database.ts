export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      canales: {
        Row: {
          id: string
          user_id: string
          titulo: string
          imagen1_url: string | null
          imagen2_url: string | null
          mail: string | null
          descripcion: string | null
          categorias: string[] | null
          api_key: string | null
          idioma: string | null
          fecha_creacion: string
        }
        Insert: {
          id?: string
          user_id: string
          titulo: string
          imagen1_url?: string | null
          imagen2_url?: string | null
          mail?: string | null
          descripcion?: string | null
          categorias?: string[] | null
          api_key?: string | null
          idioma?: string | null
          fecha_creacion?: string
        }
        Update: {
          id?: string
          user_id?: string
          titulo?: string
          imagen1_url?: string | null
          imagen2_url?: string | null
          mail?: string | null
          descripcion?: string | null
          categorias?: string[] | null
          api_key?: string | null
          idioma?: string | null
          fecha_creacion?: string
        }
      }
      proyectos: {
        Row: {
          id: string
          canal_id: string
          title: string
          description: string | null
          carpeta_drive_url: string | null
          fecha_creacion: string
          status: string
        }
        Insert: {
          id?: string
          canal_id: string
          title: string
          description?: string | null
          carpeta_drive_url?: string | null
          fecha_creacion?: string
          status?: string
        }
        Update: {
          id?: string
          canal_id?: string
          title?: string
          description?: string | null
          carpeta_drive_url?: string | null
          fecha_creacion?: string
          status?: string
        }
      }
      escenas: {
        Row: {
          id: string
          proyecto_id: string
          numero_escena: number
          status: 'idle' | 'pending' | 'success'
          scene_description: string | null
          prompt_inicio: string | null
          prompt_fin: string | null
          tiempo_inicio_seg: number | null
          tiempo_fin_seg: number | null
        }
        Insert: {
          id?: string
          proyecto_id: string
          numero_escena: number
          status?: 'idle' | 'pending' | 'success'
          scene_description?: string | null
          prompt_inicio?: string | null
          prompt_fin?: string | null
          tiempo_inicio_seg?: number | null
          tiempo_fin_seg?: number | null
        }
        Update: {
          id?: string
          proyecto_id?: string
          numero_escena?: number
          status?: 'idle' | 'pending' | 'success'
          scene_description?: string | null
          prompt_inicio?: string | null
          prompt_fin?: string | null
          tiempo_inicio_seg?: number | null
          tiempo_fin_seg?: number | null
        }
      }
      dialogos: {
        Row: {
          id: string
          escena_id: string
          nombre_locutor: string | null
          tipo_voz: string | null
          texto: string
        }
        Insert: {
          id?: string
          escena_id: string
          nombre_locutor?: string | null
          tipo_voz?: string | null
          texto: string
        }
        Update: {
          id?: string
          escena_id?: string
          nombre_locutor?: string | null
          tipo_voz?: string | null
          texto?: string
        }
      }
      fuentes_video: {
        Row: {
          id: string
          escena_id: string
          url_video: string
          clip_id: string | null
        }
        Insert: {
          id?: string
          escena_id: string
          url_video: string
          clip_id?: string | null
        }
        Update: {
          id?: string
          escena_id?: string
          url_video?: string
          clip_id?: string | null
        }
      }
      cortes_video: {
        Row: {
          id: string
          fuente_id: string
          nombre_parte: string | null
          rango_tiempo: string | null
        }
        Insert: {
          id?: string
          fuente_id: string
          nombre_parte?: string | null
          rango_tiempo?: string | null
        }
        Update: {
          id?: string
          fuente_id?: string
          nombre_parte?: string | null
          rango_tiempo?: string | null
        }
      }
      adjuntos: {
        Row: {
          id: string
          escena_id: string
          tipo: string | null
          url: string
          description: string | null
        }
        Insert: {
          id?: string
          escena_id: string
          tipo?: string | null
          url: string
          description?: string | null
        }
        Update: {
          id?: string
          escena_id?: string
          tipo?: string | null
          url?: string
          description?: string | null
        }
      }
    }
  }
}