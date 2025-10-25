import mysql from 'mysql2/promise';

// Configuración de la base de datos - EDITABLE
const dbConfig = {
  host: 'localhost',
  port: 3310,
  user: 'root', // Cambiar según tu configuración
  password: '', // Cambiar según tu configuración
  database: 'educacionnin', // Base de datos actualizada
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 segundos timeout para conexión
  acquireTimeout: 10000, // 10 segundos timeout para adquirir conexión
  timeout: 10000 // 10 segundos timeout general
};

// Pool de conexiones (lazy initialization)
let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    console.log('🔌 Creando pool de conexiones a la base de datos...');
    pool = mysql.createPool(dbConfig);
    console.log('✅ Pool de conexiones creado');
  }
  return pool;
}

export default getPool;

// Función para probar la conexión
export async function testConnection() {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos exitosa');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    return false;
  }
}
