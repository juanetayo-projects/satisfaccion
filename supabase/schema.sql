-- ============================================================
-- CAC Santa Bárbara - Satisfacción del Usuario
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Tabla de perfiles (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email     TEXT,
  nombre    TEXT,
  rol       TEXT NOT NULL DEFAULT 'encuestador'
              CHECK (rol IN ('administrador', 'encuestador')),
  activo    BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabla principal de respuestas
CREATE TABLE IF NOT EXISTS public.satisfaccion_respuestas (
  id                        BIGSERIAL PRIMARY KEY,
  fecha                     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  nombre_completo           TEXT,
  numero_identificacion     TEXT,
  telefono                  TEXT,
  sede                      TEXT NOT NULL,
  entidad_salud             TEXT NOT NULL,
  servicio                  TEXT NOT NULL,
  p1_recepcion              SMALLINT CHECK (p1_recepcion BETWEEN 1 AND 5),
  p2_personal_asistencial   SMALLINT CHECK (p2_personal_asistencial BETWEEN 1 AND 5),
  p3_comodidad              SMALLINT CHECK (p3_comodidad BETWEEN 1 AND 5),
  p4_experiencia_global     TEXT CHECK (
    p4_experiencia_global IN ('Muy buena', 'Buena', 'Regular', 'Mala', 'Muy mala')
  ),
  p5_motivo_insatisfaccion  TEXT,
  p6_recomendaria           TEXT CHECK (p6_recomendaria IN ('Si', 'No')),
  comentarios               TEXT,
  created_by                UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_resp_fecha       ON public.satisfaccion_respuestas (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_resp_sede        ON public.satisfaccion_respuestas (sede);
CREATE INDEX IF NOT EXISTS idx_resp_servicio    ON public.satisfaccion_respuestas (servicio);
CREATE INDEX IF NOT EXISTS idx_resp_experiencia ON public.satisfaccion_respuestas (p4_experiencia_global);

-- 4. Row Level Security
ALTER TABLE public.profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satisfaccion_respuestas  ENABLE ROW LEVEL SECURITY;

-- profiles: cada usuario ve y edita su propio perfil
-- los administradores pueden ver todos
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para admins (requiere función helper)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND rol = 'administrador'
  );
$$;

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.is_admin());

-- satisfaccion_respuestas: inserción pública (la encuesta no tiene login)
CREATE POLICY "respuestas_insert_public" ON public.satisfaccion_respuestas
  FOR INSERT WITH CHECK (true);

-- lectura y modificación solo para usuarios autenticados
CREATE POLICY "respuestas_select_auth" ON public.satisfaccion_respuestas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "respuestas_update_auth" ON public.satisfaccion_respuestas
  FOR UPDATE USING (auth.role() = 'authenticated');

-- eliminación solo para administradores
CREATE POLICY "respuestas_delete_admin" ON public.satisfaccion_respuestas
  FOR DELETE USING (public.is_admin());

-- 5. Trigger: crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'encuestador')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Vista resumen para dashboards
CREATE OR REPLACE VIEW public.v_satisfaccion_resumen AS
SELECT
  COUNT(*)::INT                                           AS total,
  COUNT(*) FILTER (WHERE p4_experiencia_global IS NOT NULL)::INT AS completadas,
  ROUND(AVG(p1_recepcion)::NUMERIC, 2)                   AS avg_recepcion,
  ROUND(AVG(p2_personal_asistencial)::NUMERIC, 2)        AS avg_personal,
  ROUND(AVG(p3_comodidad)::NUMERIC, 2)                   AS avg_comodidad,
  ROUND(COUNT(*) FILTER (WHERE p6_recomendaria = 'Si') * 100.0 / NULLIF(COUNT(*), 0), 1) AS pct_recomienda
FROM public.satisfaccion_respuestas;

-- 7. Función RPC para métricas por mes
CREATE OR REPLACE FUNCTION public.get_monthly_stats()
RETURNS TABLE (
  mes TEXT,
  total BIGINT,
  avg_recepcion NUMERIC,
  avg_personal NUMERIC,
  avg_comodidad NUMERIC
) LANGUAGE sql STABLE AS $$
  SELECT
    TO_CHAR(fecha, 'YYYY-MM')          AS mes,
    COUNT(*)                           AS total,
    ROUND(AVG(p1_recepcion), 2)        AS avg_recepcion,
    ROUND(AVG(p2_personal_asistencial), 2) AS avg_personal,
    ROUND(AVG(p3_comodidad), 2)        AS avg_comodidad
  FROM public.satisfaccion_respuestas
  GROUP BY mes
  ORDER BY mes DESC
  LIMIT 12;
$$;
