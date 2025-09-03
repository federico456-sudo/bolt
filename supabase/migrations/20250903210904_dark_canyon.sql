/*
  # RPC Functions for Complex Operations

  1. Functions
    - create_project_from_json() - Parse JSON and create project with all related data atomically
    - update_escenas_status() - Update multiple scene statuses
    - update_escena_complete() - Update complete scene data with related tables

  2. Security
    - All functions check user ownership through RLS policies
    - Functions use SECURITY DEFINER for proper permission handling
*/

-- Function to create a complete project from JSON data
CREATE OR REPLACE FUNCTION create_project_from_json(
  p_canal_id UUID,
  p_project_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_proyecto_id UUID;
  v_escena_id UUID;
  v_fuente_id UUID;
  v_scene JSONB;
  v_dialogo JSONB;
  v_fuente JSONB;
  v_corte JSONB;
  v_adjunto JSONB;
BEGIN
  -- Verify user owns the channel
  IF NOT EXISTS (
    SELECT 1 FROM canales 
    WHERE id = p_canal_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Canal no encontrado o no autorizado';
  END IF;

  -- Create the project
  INSERT INTO proyectos (canal_id, title, description, carpeta_drive_url)
  VALUES (
    p_canal_id,
    p_project_data->>'title',
    p_project_data->>'description',
    p_project_data->>'carpeta_drive_url'
  )
  RETURNING id INTO v_proyecto_id;

  -- Process each scene
  FOR v_scene IN SELECT * FROM jsonb_array_elements(p_project_data->'scenes')
  LOOP
    -- Create the scene
    INSERT INTO escenas (
      proyecto_id,
      numero_escena,
      scene_description,
      prompt_inicio,
      prompt_fin,
      tiempo_inicio_seg,
      tiempo_fin_seg
    )
    VALUES (
      v_proyecto_id,
      (v_scene->>'numero_escena')::INT,
      v_scene->>'scene_description',
      v_scene->>'prompt_inicio',
      v_scene->>'prompt_fin',
      COALESCE((v_scene->>'tiempo_inicio_seg')::INT, 0),
      COALESCE((v_scene->>'tiempo_fin_seg')::INT, 0)
    )
    RETURNING id INTO v_escena_id;

    -- Process dialogos
    IF v_scene ? 'dialogos' THEN
      FOR v_dialogo IN SELECT * FROM jsonb_array_elements(v_scene->'dialogos')
      LOOP
        INSERT INTO dialogos (escena_id, nombre_locutor, tipo_voz, texto)
        VALUES (
          v_escena_id,
          v_dialogo->>'nombre_locutor',
          v_dialogo->>'tipo_voz',
          v_dialogo->>'texto'
        );
      END LOOP;
    END IF;

    -- Process fuentes_video
    IF v_scene ? 'fuentes_video' THEN
      FOR v_fuente IN SELECT * FROM jsonb_array_elements(v_scene->'fuentes_video')
      LOOP
        INSERT INTO fuentes_video (escena_id, url_video, clip_id)
        VALUES (
          v_escena_id,
          v_fuente->>'url_video',
          v_fuente->>'clip_id'
        )
        RETURNING id INTO v_fuente_id;

        -- Process cortes_video for this fuente
        IF v_fuente ? 'cortes_video' THEN
          FOR v_corte IN SELECT * FROM jsonb_array_elements(v_fuente->'cortes_video')
          LOOP
            INSERT INTO cortes_video (fuente_id, nombre_parte, rango_tiempo)
            VALUES (
              v_fuente_id,
              v_corte->>'nombre_parte',
              v_corte->>'rango_tiempo'
            );
          END LOOP;
        END IF;
      END LOOP;
    END IF;

    -- Process adjuntos
    IF v_scene ? 'adjuntos' THEN
      FOR v_adjunto IN SELECT * FROM jsonb_array_elements(v_scene->'adjuntos')
      LOOP
        INSERT INTO adjuntos (escena_id, tipo, url, description)
        VALUES (
          v_escena_id,
          v_adjunto->>'tipo',
          v_adjunto->>'url',
          v_adjunto->>'description'
        );
      END LOOP;
    END IF;
  END LOOP;

  RETURN v_proyecto_id;
END;
$$;

-- Function to update multiple scene statuses
CREATE OR REPLACE FUNCTION update_escenas_status(
  p_proyecto_id UUID,
  p_escenas_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_escena JSONB;
BEGIN
  -- Verify user owns the project
  IF NOT EXISTS (
    SELECT 1 FROM proyectos p
    JOIN canales c ON c.id = p.canal_id
    WHERE p.id = p_proyecto_id AND c.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Proyecto no encontrado o no autorizado';
  END IF;

  -- Update each scene status
  FOR v_escena IN SELECT * FROM jsonb_array_elements(p_escenas_data)
  LOOP
    UPDATE escenas 
    SET status = (v_escena->>'status')::scene_status
    WHERE id = (v_escena->>'id')::UUID
    AND proyecto_id = p_proyecto_id;
  END LOOP;
END;
$$;

-- Function to update complete scene data
CREATE OR REPLACE FUNCTION update_escena_complete(
  p_escena_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_escena_id UUID;
  v_dialogo JSONB;
  v_fuente JSONB;
  v_corte JSONB;
  v_adjunto JSONB;
  v_fuente_id UUID;
BEGIN
  v_escena_id := (p_escena_data->>'id')::UUID;

  -- Verify user owns the scene
  IF NOT EXISTS (
    SELECT 1 FROM escenas e
    JOIN proyectos p ON p.id = e.proyecto_id
    JOIN canales c ON c.id = p.canal_id
    WHERE e.id = v_escena_id AND c.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Escena no encontrada o no autorizada';
  END IF;

  -- Update scene basic data
  UPDATE escenas SET
    scene_description = p_escena_data->>'scene_description',
    prompt_inicio = p_escena_data->>'prompt_inicio',
    prompt_fin = p_escena_data->>'prompt_fin',
    tiempo_inicio_seg = COALESCE((p_escena_data->>'tiempo_inicio_seg')::INT, 0),
    tiempo_fin_seg = COALESCE((p_escena_data->>'tiempo_fin_seg')::INT, 0)
  WHERE id = v_escena_id;

  -- Delete existing related data and recreate
  DELETE FROM dialogos WHERE escena_id = v_escena_id;
  DELETE FROM adjuntos WHERE escena_id = v_escena_id;
  DELETE FROM cortes_video WHERE fuente_id IN (
    SELECT id FROM fuentes_video WHERE escena_id = v_escena_id
  );
  DELETE FROM fuentes_video WHERE escena_id = v_escena_id;

  -- Insert dialogos
  IF p_escena_data ? 'dialogos' THEN
    FOR v_dialogo IN SELECT * FROM jsonb_array_elements(p_escena_data->'dialogos')
    LOOP
      INSERT INTO dialogos (escena_id, nombre_locutor, tipo_voz, texto)
      VALUES (
        v_escena_id,
        v_dialogo->>'nombre_locutor',
        v_dialogo->>'tipo_voz',
        v_dialogo->>'texto'
      );
    END LOOP;
  END IF;

  -- Insert fuentes_video
  IF p_escena_data ? 'fuentes_video' THEN
    FOR v_fuente IN SELECT * FROM jsonb_array_elements(p_escena_data->'fuentes_video')
    LOOP
      INSERT INTO fuentes_video (escena_id, url_video, clip_id)
      VALUES (
        v_escena_id,
        v_fuente->>'url_video',
        v_fuente->>'clip_id'
      )
      RETURNING id INTO v_fuente_id;

      -- Insert cortes_video for this fuente
      IF v_fuente ? 'cortes_video' THEN
        FOR v_corte IN SELECT * FROM jsonb_array_elements(v_fuente->'cortes_video')
        LOOP
          INSERT INTO cortes_video (fuente_id, nombre_parte, rango_tiempo)
          VALUES (
            v_fuente_id,
            v_corte->>'nombre_parte',
            v_corte->>'rango_tiempo'
          );
        END LOOP;
      END IF;
    END LOOP;
  END IF;

  -- Insert adjuntos
  IF p_escena_data ? 'adjuntos' THEN
    FOR v_adjunto IN SELECT * FROM jsonb_array_elements(p_escena_data->'adjuntos')
    LOOP
      INSERT INTO adjuntos (escena_id, tipo, url, description)
      VALUES (
        v_escena_id,
        v_adjunto->>'tipo',
        v_adjunto->>'url',
        v_adjunto->>'description'
      );
    END LOOP;
  END IF;
END;
$$;