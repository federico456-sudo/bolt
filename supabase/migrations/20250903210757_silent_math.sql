/*
  # Channel and Project Management Database Schema

  1. New Tables
    - `canales` - Main channel information
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `titulo` (text, channel title)
      - `imagen1_url` (text, external banner image URL)
      - `imagen2_url` (text, external profile image URL)  
      - `mail` (text, channel email)
      - `descripcion` (text, channel description)
      - `categorias` (text array, channel categories)
      - `api_key` (text, channel API key)
      - `idioma` (text, channel language)
      - `fecha_creacion` (timestamptz, creation date)

    - `proyectos` - Project information
      - `id` (uuid, primary key)
      - `canal_id` (uuid, foreign key to canales)
      - `title` (text, project title)
      - `description` (text, project description)
      - `carpeta_drive_url` (text, Google Drive folder URL)
      - `fecha_creacion` (timestamptz, creation date)
      - `status` (text, project status)

    - `escenas` - Scene information with custom status enum
      - `id` (uuid, primary key)
      - `proyecto_id` (uuid, foreign key to proyectos)
      - `numero_escena` (integer, scene number)
      - `status` (scene_status enum: idle, pending, success)
      - `scene_description` (text, scene description)
      - `prompt_inicio` (text, start prompt)
      - `prompt_fin` (text, end prompt)
      - `tiempo_inicio_seg` (integer, start time in seconds)
      - `tiempo_fin_seg` (integer, end time in seconds)

    - `dialogos` - Dialogue entries for scenes
      - `id` (uuid, primary key)
      - `escena_id` (uuid, foreign key to escenas)
      - `nombre_locutor` (text, speaker name)
      - `tipo_voz` (text, voice type)
      - `texto` (text, dialogue text)

    - `fuentes_video` - Video sources for scenes
      - `id` (uuid, primary key)
      - `escena_id` (uuid, foreign key to escenas)
      - `url_video` (text, Google Drive video URL)
      - `clip_id` (text, clip identifier)

    - `cortes_video` - Video cuts for video sources
      - `id` (uuid, primary key)
      - `fuente_id` (uuid, foreign key to fuentes_video)
      - `nombre_parte` (text, part name)
      - `rango_tiempo` (text, time range)

    - `adjuntos` - Attachments for scenes
      - `id` (uuid, primary key)
      - `escena_id` (uuid, foreign key to escenas)
      - `tipo` (text, attachment type)
      - `url` (text, attachment URL)
      - `description` (text, attachment description)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Cascade delete policies for data integrity

  3. Functions
    - create_project_from_json() - Parse JSON and create project with all related data
    - update_escenas_status() - Update multiple scene statuses
    - update_escena_complete() - Update complete scene data with related tables
*/

-- Create custom enum for scene status
CREATE TYPE scene_status AS ENUM ('idle', 'pending', 'success');

-- Create canales table
CREATE TABLE IF NOT EXISTS canales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    imagen1_url TEXT, -- External URL for 16:9 banner image
    imagen2_url TEXT, -- External URL for 1:1 profile image
    mail VARCHAR(255),
    descripcion TEXT,
    categorias TEXT[], -- Array of category strings
    api_key TEXT,
    idioma VARCHAR(5),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create proyectos table
CREATE TABLE IF NOT EXISTS proyectos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canal_id UUID REFERENCES canales(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    carpeta_drive_url TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL 
);

-- Create escenas table
CREATE TABLE IF NOT EXISTS escenas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE NOT NULL,
    numero_escena INT NOT NULL,
    status scene_status DEFAULT 'idle' NOT NULL,
    scene_description TEXT,
    prompt_inicio TEXT,
    prompt_fin TEXT,
    tiempo_inicio_seg INT DEFAULT 0,
    tiempo_fin_seg INT DEFAULT 0,
    UNIQUE(proyecto_id, numero_escena)
);

-- Create dialogos table
CREATE TABLE IF NOT EXISTS dialogos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escena_id UUID REFERENCES escenas(id) ON DELETE CASCADE NOT NULL,
    nombre_locutor VARCHAR(100),
    tipo_voz VARCHAR(100),
    texto TEXT NOT NULL
);

-- Create fuentes_video table
CREATE TABLE IF NOT EXISTS fuentes_video (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escena_id UUID REFERENCES escenas(id) ON DELETE CASCADE NOT NULL,
    url_video TEXT NOT NULL,
    clip_id VARCHAR(100)
);

-- Create cortes_video table
CREATE TABLE IF NOT EXISTS cortes_video (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fuente_id UUID REFERENCES fuentes_video(id) ON DELETE CASCADE NOT NULL,
    nombre_parte VARCHAR(100),
    rango_tiempo VARCHAR(50)
);

-- Create adjuntos table
CREATE TABLE IF NOT EXISTS adjuntos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escena_id UUID REFERENCES escenas(id) ON DELETE CASCADE NOT NULL,
    tipo VARCHAR(50) DEFAULT 'image',
    url TEXT NOT NULL,
    description TEXT
);

-- Enable Row Level Security
ALTER TABLE canales ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE escenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuentes_video ENABLE ROW LEVEL SECURITY;
ALTER TABLE cortes_video ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjuntos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for canales
CREATE POLICY "Users can manage their own canales"
  ON canales
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for proyectos
CREATE POLICY "Users can manage their own proyectos"
  ON proyectos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM canales 
      WHERE canales.id = proyectos.canal_id 
      AND canales.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM canales 
      WHERE canales.id = proyectos.canal_id 
      AND canales.user_id = auth.uid()
    )
  );

-- RLS Policies for escenas
CREATE POLICY "Users can manage their own escenas"
  ON escenas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proyectos p
      JOIN canales c ON c.id = p.canal_id
      WHERE p.id = escenas.proyecto_id 
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proyectos p
      JOIN canales c ON c.id = p.canal_id
      WHERE p.id = escenas.proyecto_id 
      AND c.user_id = auth.uid()
    )
  );

-- RLS Policies for dialogos
CREATE POLICY "Users can manage their own dialogos"
  ON dialogos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM escenas e
      JOIN proyectos p ON p.id = e.proyecto_id
      JOIN canales c ON c.id = p.canal_id
      WHERE e.id = dialogos.escena_id 
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM escenas e
      JOIN proyectos p ON p.id = e.proyecto_id
      JOIN canales c ON c.id = p.canal_id
      WHERE e.id = dialogos.escena_id 
      AND c.user_id = auth.uid()
    )
  );

-- RLS Policies for fuentes_video
CREATE POLICY "Users can manage their own fuentes_video"
  ON fuentes_video
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM escenas e
      JOIN proyectos p ON p.id = e.proyecto_id
      JOIN canales c ON c.id = p.canal_id
      WHERE e.id = fuentes_video.escena_id 
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM escenas e
      JOIN proyectos p ON p.id = e.proyecto_id
      JOIN canales c ON c.id = p.canal_id
      WHERE e.id = fuentes_video.escena_id 
      AND c.user_id = auth.uid()
    )
  );

-- RLS Policies for cortes_video
CREATE POLICY "Users can manage their own cortes_video"
  ON cortes_video
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fuentes_video fv
      JOIN escenas e ON e.id = fv.escena_id
      JOIN proyectos p ON p.id = e.proyecto_id
      JOIN canales c ON c.id = p.canal_id
      WHERE fv.id = cortes_video.fuente_id 
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fuentes_video fv
      JOIN escenas e ON e.id = fv.escena_id
      JOIN proyectos p ON p.id = e.proyecto_id
      JOIN canales c ON c.id = p.canal_id
      WHERE fv.id = cortes_video.fuente_id 
      AND c.user_id = auth.uid()
    )
  );

-- RLS Policies for adjuntos
CREATE POLICY "Users can manage their own adjuntos"
  ON adjuntos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM escenas e
      JOIN proyectos p ON p.id = e.proyecto_id
      JOIN canales c ON c.id = p.canal_id
      WHERE e.id = adjuntos.escena_id 
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM escenas e
      JOIN proyectos p ON p.id = e.proyecto_id
      JOIN canales c ON c.id = p.canal_id
      WHERE e.id = adjuntos.escena_id 
      AND c.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_canales_user_id ON canales(user_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_canal_id ON proyectos(canal_id);
CREATE INDEX IF NOT EXISTS idx_escenas_proyecto_id ON escenas(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_dialogos_escena_id ON dialogos(escena_id);
CREATE INDEX IF NOT EXISTS idx_fuentes_video_escena_id ON fuentes_video(escena_id);
CREATE INDEX IF NOT EXISTS idx_cortes_video_fuente_id ON cortes_video(fuente_id);
CREATE INDEX IF NOT EXISTS idx_adjuntos_escena_id ON adjuntos(escena_id);