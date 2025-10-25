import { NextRequest, NextResponse } from 'next/server';
import getPool from '../../../../../lib/database';

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

    const pool = getPool();
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

      const imageBuffer = result[0].Foto_perfil;
      
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
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error obteniendo imagen:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}


