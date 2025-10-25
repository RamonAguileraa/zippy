import getPool from './database';
import { AlumnoConFoto } from './types';
import {
  getAllAlumnosDemo,
  getAlumnoByIdDemo,
  updateDineroDisponibleDemo,
  createAlumnoDemo
} from './demo-data';

// Modo DEMO: usar datos en memoria en lugar de base de datos
const DEMO_MODE = process.env.DEMO_MODE === 'true' || true; // Activar modo demo por defecto

interface AlumnoRow {
  id_usuario: number;
  NombreCompleto: string;
  dinero_disponible: number;
  CodigoQR: string;
  fecha_movimiento: Date;
  tiene_foto: number;
}

interface InsertResult {
  insertId: number;
}

// Obtener todos los alumnos
export async function getAllAlumnos(): Promise<AlumnoConFoto[]> {
  if (DEMO_MODE) {
    console.log('🔧 Modo DEMO activado - usando datos en memoria');
    return getAllAlumnosDemo();
  }
  
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id_usuario, NombreCompleto, dinero_disponible, CodigoQR, fecha_movimiento, CASE WHEN Foto_perfil IS NOT NULL THEN 1 ELSE 0 END as tiene_foto FROM usuarios_tb ORDER BY NombreCompleto ASC'
    );
    
    const alumnos = rows as AlumnoRow[];
    
    // Agregar URL de la foto de perfil
    return alumnos.map(alumno => ({
      id_usuario: alumno.id_usuario,
      NombreCompleto: alumno.NombreCompleto,
      dinero_disponible: alumno.dinero_disponible,
      CodigoQR: alumno.CodigoQR,
      fecha_movimiento: alumno.fecha_movimiento,
      foto_url: alumno.tiene_foto ? `/api/image/${alumno.id_usuario}` : '/zippy logo.png'
    }));
  } catch (error) {
    console.error('Error obteniendo alumnos:', error);
    throw new Error('Error al obtener la lista de alumnos');
  }
}

// Obtener un alumno por ID
export async function getAlumnoById(id: number): Promise<AlumnoConFoto | null> {
  if (DEMO_MODE) {
    return getAlumnoByIdDemo(id);
  }
  
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id_usuario, NombreCompleto, dinero_disponible, CodigoQR, fecha_movimiento, CASE WHEN Foto_perfil IS NOT NULL THEN 1 ELSE 0 END as tiene_foto FROM usuarios_tb WHERE id_usuario = ?',
      [id]
    );
    
    const alumnos = rows as AlumnoRow[];
    if (alumnos.length === 0) return null;
    
    const alumno = alumnos[0];
    return {
      id_usuario: alumno.id_usuario,
      NombreCompleto: alumno.NombreCompleto,
      dinero_disponible: alumno.dinero_disponible,
      CodigoQR: alumno.CodigoQR,
      fecha_movimiento: alumno.fecha_movimiento,
      foto_url: alumno.tiene_foto ? `/api/image/${alumno.id_usuario}` : '/zippy logo.png'
    };
  } catch (error) {
    console.error('Error obteniendo alumno:', error);
    throw new Error('Error al obtener el alumno');
  }
}

// Actualizar dinero disponible de un alumno
export async function updateDineroDisponible(id: number, nuevoMonto: number): Promise<boolean> {
  if (DEMO_MODE) {
    return updateDineroDisponibleDemo(id, nuevoMonto);
  }
  
  try {
    const pool = getPool();
    await pool.execute(
      'UPDATE usuarios_tb SET dinero_disponible = ?, fecha_movimiento = NOW() WHERE id_usuario = ?',
      [nuevoMonto, id]
    );
    return true;
  } catch (error) {
    console.error('Error actualizando dinero:', error);
    return false;
  }
}

// Crear nuevo alumno
export async function createAlumno(
  nombreCompleto: string, 
  dineroInicial: number, 
  fotoPerfil?: Buffer
): Promise<AlumnoConFoto | null> {
  if (DEMO_MODE) {
    return createAlumnoDemo(nombreCompleto, dineroInicial);
  }
  
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      // Insertar nuevo alumno (let AUTO_INCREMENT handle the ID)
      const [result] = await connection.execute(
        'INSERT INTO usuarios_tb (NombreCompleto, dinero_disponible, CodigoQR, fecha_movimiento, Foto_perfil) VALUES (?, ?, ?, NOW(), ?)',
        [nombreCompleto, dineroInicial, '', fotoPerfil || null] // CodigoQR will be updated after getting the generated ID
      );

      // Get the generated ID
      const insertResult = result as InsertResult;
      const generatedId = insertResult.insertId;

      // Update CodigoQR with the generated ID
      await connection.execute(
        'UPDATE usuarios_tb SET CodigoQR = ? WHERE id_usuario = ?',
        [generatedId.toString(), generatedId]
      );

      // Obtener el alumno creado usando el ID generado
      const [rows] = await connection.execute(
        'SELECT id_usuario, NombreCompleto, dinero_disponible, CodigoQR, fecha_movimiento, CASE WHEN Foto_perfil IS NOT NULL THEN 1 ELSE 0 END as tiene_foto FROM usuarios_tb WHERE id_usuario = ?',
        [generatedId]
      );

      const alumnos = rows as AlumnoRow[];
      if (alumnos.length === 0) return null;

      const alumno = alumnos[0];
      return {
        id_usuario: alumno.id_usuario,
        NombreCompleto: alumno.NombreCompleto,
        dinero_disponible: alumno.dinero_disponible,
        CodigoQR: alumno.CodigoQR,
        fecha_movimiento: alumno.fecha_movimiento,
        foto_url: alumno.tiene_foto ? `/api/image/${alumno.id_usuario}` : '/zippy logo.png'
      };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creando alumno:', error);
    throw error;
  }
}
