import { NextRequest, NextResponse } from 'next/server';
import getPool from '../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const alumnoId = data.get('alumnoId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No se ha subido ningún archivo' }, { status: 400 });
    }

    if (!alumnoId) {
      return NextResponse.json({ error: 'ID de alumno requerido' }, { status: 400 });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF' 
      }, { status: 400 });
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'El archivo es demasiado grande. Máximo 5MB' 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Guardar imagen en la base de datos como LONGBLOB
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE usuarios_tb SET Foto_perfil = ? WHERE id_usuario = ?',
        [buffer, alumnoId]
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Foto subida exitosamente a la base de datos' 
      });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error subiendo archivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

