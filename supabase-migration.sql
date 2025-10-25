-- Migración de base de datos a Supabase (PostgreSQL)
-- Este script convierte la estructura de MySQL a PostgreSQL

-- Crear tabla usuarios_tb
CREATE TABLE IF NOT EXISTS usuarios_tb (
  id_usuario SERIAL PRIMARY KEY,
  NombreCompleto VARCHAR(50) NOT NULL,
  dinero_disponible DECIMAL(11,2) NOT NULL DEFAULT 0,
  CodigoQR VARCHAR(20) NOT NULL,
  fecha_movimiento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tasa_interes DECIMAL(11,2) NOT NULL DEFAULT 0,
  Foto_perfil BYTEA
);

-- Insertar datos de ejemplo desde educacionnin.sql
INSERT INTO usuarios_tb (id_usuario, NombreCompleto, dinero_disponible, CodigoQR, fecha_movimiento, Foto_perfil) VALUES
(1, 'Saul Ivan Ramos Morales', 30.00, '123523dfs213', '2025-10-24 19:06:56', NULL),
(2, 'kikin gonzales', 10.00, '1234', '2025-10-24 21:38:07', NULL),
(3, 'juan', 10.00, 'QR001', '2025-10-25 00:24:35', NULL),
(4, 'mauricio', 10.00, '4', '2025-10-25 11:27:57', NULL),
(5, 'alumno test 2', 1.00, '5', '2025-10-25 11:44:47', NULL);

-- Establecer el sequence de id_usuario al siguiente valor disponible
SELECT setval('usuarios_tb_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuarios_tb));

-- Verificar datos
SELECT id_usuario, NombreCompleto, dinero_disponible, CodigoQR, fecha_movimiento 
FROM usuarios_tb 
ORDER BY id_usuario;
