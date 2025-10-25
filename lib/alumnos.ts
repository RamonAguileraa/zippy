import getPoolMySQL from './database';
import getPoolSupabase from './database-supabase';
import { AlumnoConFoto } from './types';
import {
  getAllAlumnosDemo,
  getAlumnoByIdDemo,
  updateDineroDisponibleDemo,
  createAlumnoDemo,
  guardarFotoDemo
} from './demo-data';

// Configuración de base de datos
const DEMO_MODE = process.env.DEMO_MODE === 'true' || true; // Activar modo demo por defecto
const USE_SUPABASE = process.env.USE_SUPABASE === 'true';

// Helper para ejecutar queries compatibles con MySQL y PostgreSQL
async function executeQuery(sql: string, params?: unknown[]) {
  if (USE_SUPABASE) {
    const pool = getPoolSupabase();
    // PostgreSQL usa ? para parámetros igual que MySQL
    const result = await pool.query(sql, params);
    return [result.rows, result] as const;
  } else {
    const pool = getPoolMySQL();
    return await pool.execute(sql, params);
  }
}

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
    const [rows] = await executeQuery(
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
    const [rows] = await executeQuery(
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
    await executeQuery(
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
    const nuevoAlumno = await createAlumnoDemo(nombreCompleto, dineroInicial);
    
    // Si hay foto, guardarla en memoria
    if (fotoPerfil && nuevoAlumno) {
      guardarFotoDemo(nuevoAlumno.id_usuario, fotoPerfil);
    }
    
    return nuevoAlumno;
  }
  
  try {
    if (USE_SUPABASE) {
      // PostgreSQL: Insertar con RETURNING para obtener el ID
      const result = await executeQuery(
        'INSERT INTO usuarios_tb (NombreCompleto, dinero_disponible, CodigoQR, fecha_movimiento, Foto_perfil) VALUES (?, ?, ?, NOW(), ?) RETURNING id_usuario',
        [nombreCompleto, dineroInicial, '', fotoPerfil || null]
      );
      
      // @ts-expect-error - Los tipos están bien pero TypeScript no los infiere correctamente
      const generatedId = result[0][0].id_usuario;
      
      // Actualizar CodigoQR
      await executeQuery(
        'UPDATE usuarios_tb SET CodigoQR = ? WHERE id_usuario = ?',
        [generatedId.toString(), generatedId]
      );
    } else {
      // MySQL: Insertar nuevo alumno (let AUTO_INCREMENT handle the ID)
      const pool = getPoolMySQL();
      const connection = await pool.getConnection();
      try {
        const [result] = await connection.execute(
          'INSERT INTO usuarios_tb (NombreCompleto, dinero_disponible, CodigoQR, fecha_movimiento, Foto_perfil) VALUES (?, ?, ?, NOW(), ?)',
          [nombreCompleto, dineroInicial, '', fotoPerfil || null]
        );

        const insertResult = result as InsertResult;
        const generatedId = insertResult.insertId;

        await connection.execute(
          'UPDATE usuarios_tb SET CodigoQR = ? WHERE id_usuario = ?',
          [generatedId.toString(), generatedId]
        );
      } finally {
        connection.release();
      }
    }
    
    // Obtener el alumno creado (usamos executeQuery para compatibilidad)
    const [rows] = await executeQuery(
      'SELECT id_usuario, NombreCompleto, dinero_disponible, CodigoQR, fecha_movimiento, CASE WHEN Foto_perfil IS NOT NULL THEN 1 ELSE 0 END as tiene_foto FROM usuarios_tb ORDER BY id_usuario DESC LIMIT 1'
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
    console.error('Error creando alumno:', error);
    throw error;
  }
}
