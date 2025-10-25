import { Pool } from 'pg';

// Configuración para Supabase (PostgreSQL)
const supabaseConfig = {
  user: process.env.SUPABASE_DB_USER || 'postgres',
  host: process.env.SUPABASE_DB_HOST || 'localhost',
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || '',
  port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
  ssl: process.env.SUPABASE_DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    console.log('🔌 Creando pool de conexiones a Supabase...');
    pool = new Pool(supabaseConfig);
    console.log('✅ Pool de Supabase creado');
  }
  return pool;
}

export default getPool;

// Función para probar la conexión
export async function testConnection() {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexión a Supabase exitosa:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a Supabase:', error);
    return false;
  }
}
