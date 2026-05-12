CREATE SCHEMA IF NOT EXISTS penca;

-- Grant usage to the schema for the API roles
GRANT USAGE ON SCHEMA penca TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA penca TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA penca TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA penca TO anon, authenticated;

-- Custom Admin Users Table
CREATE TABLE IF NOT EXISTS penca.usuarios_admin (
  usuario   varchar PRIMARY KEY,
  password  varchar NOT NULL,
  creado_en timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS penca.partidos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etapa         varchar NOT NULL,
  fecha_partido timestamptz NOT NULL,
  equipo_a      varchar NOT NULL,
  equipo_b      varchar NOT NULL,
  bandera_a     varchar NOT NULL,
  bandera_b     varchar NOT NULL,
  grupo         varchar,
  estado        varchar NOT NULL DEFAULT 'proximo'
                  CHECK (estado IN ('proximo', 'abierto', 'cerrado', 'finalizado')),
  resultado_a   int,
  resultado_b   int,
  creado_en     timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS penca.predicciones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id      uuid NOT NULL REFERENCES penca.partidos(id),
  ci              varchar NOT NULL,
  nombre_completo varchar NOT NULL,
  sucursal        varchar NOT NULL,
  prediccion_a    int NOT NULL CHECK (prediccion_a >= 0),
  prediccion_b    int NOT NULL CHECK (prediccion_b >= 0),
  puntos_ganados  int DEFAULT NULL,
  enviado_en      timestamptz DEFAULT NOW(),
  UNIQUE (partido_id, ci)
);

CREATE OR REPLACE VIEW penca.ranking AS
SELECT
  ci,
  nombre_completo,
  sucursal,
  COUNT(*) FILTER (WHERE puntos_ganados IS NOT NULL) AS partidos_puntuados,
  SUM(COALESCE(puntos_ganados, 0)) AS puntos_totales,
  COUNT(*) FILTER (WHERE puntos_ganados = 3) AS resultados_exactos,
  COUNT(*) FILTER (WHERE puntos_ganados = 1) AS aciertos_ganador
FROM penca.predicciones
GROUP BY ci, nombre_completo, sucursal
ORDER BY puntos_totales DESC, resultados_exactos DESC;

CREATE OR REPLACE FUNCTION penca.calcular_puntos()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.resultado_a IS NOT NULL AND NEW.resultado_b IS NOT NULL
     AND (OLD.resultado_a IS NULL OR OLD.resultado_b IS NULL) THEN

    UPDATE penca.predicciones
    SET puntos_ganados =
      CASE
        WHEN prediccion_a = NEW.resultado_a AND prediccion_b = NEW.resultado_b THEN 3
        WHEN (prediccion_a > prediccion_b AND NEW.resultado_a > NEW.resultado_b) THEN 1
        WHEN (prediccion_a < prediccion_b AND NEW.resultado_a < NEW.resultado_b) THEN 1
        WHEN (prediccion_a = prediccion_b AND NEW.resultado_a = NEW.resultado_b) THEN 1
        ELSE 0
      END
    WHERE partido_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_puntos ON penca.partidos;
CREATE TRIGGER trigger_calcular_puntos
  AFTER UPDATE ON penca.partidos
  FOR EACH ROW EXECUTE FUNCTION penca.calcular_puntos();

CREATE OR REPLACE FUNCTION penca.check_prediction_time()
RETURNS TRIGGER AS $$
DECLARE
  v_fecha_partido timestamptz;
BEGIN
  SELECT fecha_partido INTO v_fecha_partido FROM penca.partidos WHERE id = NEW.partido_id;
  IF NOW() >= v_fecha_partido THEN
    RAISE EXCEPTION 'El partido ya ha comenzado. No se aceptan más predicciones.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_prediction_time ON penca.predicciones;
CREATE TRIGGER trigger_check_prediction_time
  BEFORE INSERT ON penca.predicciones
  FOR EACH ROW EXECUTE FUNCTION penca.check_prediction_time();

ALTER TABLE penca.partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE penca.predicciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE penca.usuarios_admin ENABLE ROW LEVEL SECURITY;

-- POLICIES
DROP POLICY IF EXISTS "public_read_matches" ON penca.partidos;
CREATE POLICY "public_read_matches" ON penca.partidos FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_insert_predictions" ON penca.predicciones;
CREATE POLICY "public_insert_predictions" ON penca.predicciones FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_predictions" ON penca.predicciones;
CREATE POLICY "public_read_predictions" ON penca.predicciones FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_admin_users" ON penca.usuarios_admin;
CREATE POLICY "public_read_admin_users" ON penca.usuarios_admin FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_manage_all" ON penca.partidos;
CREATE POLICY "admin_manage_all" ON penca.partidos FOR ALL USING (true);

DROP POLICY IF EXISTS "admin_manage_predictions" ON penca.predicciones;
CREATE POLICY "admin_manage_predictions" ON penca.predicciones FOR ALL USING (true);

-- INITIAL DATA
INSERT INTO penca.usuarios_admin (usuario, password) 
VALUES ('jorge.avezada', 'Agrotec2026')
ON CONFLICT (usuario) DO NOTHING;

INSERT INTO penca.partidos (etapa, fecha_partido, equipo_a, equipo_b, bandera_a, bandera_b, grupo, estado)
VALUES
  ('Grupos - Fecha 1', '2026-06-13 18:00:00-03', 'Paraguay', 'Alemania', '🇵🇾', '🇩🇪', 'Grupo B', 'abierto'),
  ('Grupos - Fecha 1', '2026-06-14 15:00:00-03', 'Brasil', 'México', '🇧🇷', '🇲🇽', 'Grupo C', 'abierto')
ON CONFLICT DO NOTHING;
