-- Script completo para Supabase: Eliminar todo y crear estructura limpia

-- ==========================================
-- PASO 1: ELIMINAR TODAS LAS TABLAS EXISTENTES
-- ==========================================

-- Eliminar tabla si existe
DROP TABLE IF EXISTS usuarios_tb CASCADE;

-- Eliminar cualquier otra tabla que pueda existir (ajusta según tus necesidades)
-- DROP TABLE IF EXISTS otra_tabla CASCADE;

-- ==========================================
-- PASO 2: CREAR TABLA FRESCA
-- ==========================================

CREATE TABLE usuarios_tb (
  id_usuario SERIAL PRIMARY KEY,
  NombreCompleto VARCHAR(50) NOT NULL,
  dinero_disponible DECIMAL(11,2) NOT NULL DEFAULT 0,
  CodigoQR VARCHAR(20) NOT NULL,
  fecha_movimiento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tasa_interes DECIMAL(11,2) NOT NULL DEFAULT 0,
  Foto_perfil BYTEA
);

-- ==========================================
-- PASO 3: INSERTAR DATOS DE EJEMPLO
-- ==========================================

INSERT INTO usuarios_tb (NombreCompleto, dinero_disponible, CodigoQR, fecha_movimiento, Foto_perfil) VALUES
('Saul Ivan Ramos Morales', 30.00, '123523dfs213', '2025-10-24 19:06:56', NULL),
('kikin gonzales', 10.00, '1234', '2025-10-24 21:38:07', NULL),
('juan', 10.00, 'QR001', '2025-10-25 00:24:35', NULL),
('mauricio', 10.00, '4', '2025-10-25 11:27:57', NULL),
('alumno test 2', 1.00, '5', '2025-10-25 11:44:47', NULL);

-- ==========================================
-- PASO 4: CONFIGURAR SEQUENCE
-- ==========================================

-- Establecer el sequence de id_usuario al siguiente valor disponible
SELECT setval('usuarios_tb_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuarios_tb));

-- ==========================================
-- PASO 5: VERIFICAR DATOS
-- ==========================================

SELECT 
  id_usuario, 
  NombreCompleto, 
  dinero_disponible, 
  CodigoQR, 
  fecha_movimiento,
  CASE WHEN Foto_perfil IS NOT NULL THEN 'Tiene foto' ELSE 'Sin foto' END as foto_status
FROM usuarios_tb 
ORDER BY id_usuario;

-- Mostrar conteo de registros
SELECT COUNT(*) as total_alumnos FROM usuarios_tb;
