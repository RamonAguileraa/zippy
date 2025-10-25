-- Script de configuración de la base de datos
-- Ejecutar en MySQL en el puerto 3310

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS educacionnin;
USE educacionnin;

-- Crear tabla usuarios_tb
CREATE TABLE IF NOT EXISTS usuarios_tb (
  id_usuario int(11) NOT NULL AUTO_INCREMENT,
  NombreCompleto varchar(50) NOT NULL,
  dinero_disponible decimal(11,0) NOT NULL,
  CodigoQR varchar(20) NOT NULL,
  fecha_movimiento datetime NOT NULL DEFAULT current_timestamp(),
  tasa_interes decimal(11,0) NOT NULL DEFAULT 0,
  Foto_perfil longblob DEFAULT NULL,
  PRIMARY KEY (id_usuario)
);

-- Insertar datos de ejemplo
INSERT INTO usuarios_tb (NombreCompleto, dinero_disponible, CodigoQR, tasa_interes, Foto_perfil) VALUES
('Ana García López', 150.00, '1', 0, NULL),
('Carlos Martínez Ruiz', 75.50, '2', 0, NULL),
('María Fernández Sánchez', 200.00, '3', 0, NULL),
('José Rodríguez Pérez', 0.00, '4', 0, NULL),
('Laura Jiménez Torres', 300.25, '5', 0, NULL),
('David López García', 125.75, '6', 0, NULL),
('Sofía Martín Díaz', 80.00, '7', 0, NULL),
('Miguel Sánchez Ruiz', 250.00, '8', 0, NULL),
('Elena González Pérez', 175.50, '9', 0, NULL),
('Antonio Moreno López', 90.25, '10', 0, NULL);

-- Verificar datos
SELECT * FROM usuarios_tb;
