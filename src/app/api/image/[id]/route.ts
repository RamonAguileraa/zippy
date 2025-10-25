import { NextRequest, NextResponse } from 'next/server';
import getPoolMySQL from '../../../../../lib/database';
import getPoolSupabase from '../../../../../lib/database-supabase';
import { obtenerFotoDemo } from '../../../../../lib/demo-data';

const DEMO_MODE = process.env.DEMO_MODE === 'true' || true;
const USE_SUPABASE = process.env.USE_SUPABASE === 'true';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alumnoId = parseInt(id);
    if (isNaN(alumnoId) || alumnoId <= 0) {
      return new NextResponse('ID de alumno inválido. Debe ser un número entero positivo.', { status: 400 });
    }

    // En modo DEMO, obtener foto de memoria o mostrar placeholder
    if (DEMO_MODE) {
      const fotoBuffer = obtenerFotoDemo(alumnoId);
      if (fotoBuffer) {
        // Determinar el tipo de contenido basado en los primeros bytes
        let contentType = 'image/jpeg'; // Por defecto
        if (fotoBuffer.length >= 4) {
          const header = fotoBuffer.subarray(0, 4);
          if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
            contentType = 'image/png';
          } else if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
            contentType = 'image/gif';
          }
        }

        return new NextResponse(new Uint8Array(fotoBuffer), {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000',
          },
        });
      } else {
        // Si no hay foto guardada, mostrar placeholder
        return NextResponse.redirect(new URL('/zippy logo.png', request.url));
      }
    }

    let imageBuffer: Buffer;

    // Obtener imagen de la base de datos
    if (USE_SUPABASE) {
      const pool = getPoolSupabase();
      const result = await pool.query(
        'SELECT Foto_perfil FROM usuarios_tb WHERE id_usuario = $1',
        [alumnoId]
      );
      
      if (!result.rows.length || !result.rows[0].Foto_perfil) {
        return new NextResponse('Imagen no encontrada', { status: 404 });
      }
      imageBuffer = result.rows[0].Foto_perfil as Buffer;
    } else {
      const pool = getPoolMySQL();
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute(
          'SELECT Foto_perfil FROM usuarios_tb WHERE id_usuario = ?',
          [alumnoId]
        );

        interface ImageRow {
          Foto_perfil: Buffer;
        }
        
        const result = rows as ImageRow[];
        if (!result.length || !result[0].Foto_perfil) {
          return new NextResponse('Imagen no encontrada', { status: 404 });
        }

        imageBuffer = result[0].Foto_perfil;
      } finally {
        connection.release();
      }
    }
    
    // Determinar el tipo de contenido basado en los primeros bytes
    let contentType = 'image/jpeg'; // Por defecto
    if (imageBuffer.length >= 4) {
      const header = imageBuffer.subarray(0, 4);
      if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
        contentType = 'image/png';
      } else if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
        contentType = 'image/gif';
      }
    }

    return new NextResponse(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache por 1 año
      },
    });
  } catch (error) {
    console.error('Error obteniendo imagen:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}


