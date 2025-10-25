import { NextRequest, NextResponse } from 'next/server';
import getPoolMySQL from '../../../../lib/database';
import getPoolSupabase from '../../../../lib/database-supabase';
import { guardarFotoDemo } from '../../../../lib/demo-data';

const DEMO_MODE = process.env.DEMO_MODE === 'true' || true;
const USE_SUPABASE = process.env.USE_SUPABASE === 'true';

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

    // En modo DEMO, guardar en memoria
    if (DEMO_MODE) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const guardado = guardarFotoDemo(parseInt(alumnoId), buffer);
      
      if (guardado) {
        return NextResponse.json({ 
          success: true, 
          message: 'Foto guardada en modo demo' 
        });
      } else {
        return NextResponse.json({ 
          error: 'Error guardando foto en modo demo' 
        }, { status: 500 });
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Guardar imagen en la base de datos
    if (USE_SUPABASE) {
      const pool = getPoolSupabase();
      await pool.query(
        'UPDATE usuarios_tb SET Foto_perfil = $1 WHERE id_usuario = $2',
        [buffer, parseInt(alumnoId)]
      );
    } else {
      const pool = getPoolMySQL();
      const connection = await pool.getConnection();
      try {
        await connection.execute(
          'UPDATE usuarios_tb SET Foto_perfil = ? WHERE id_usuario = ?',
          [buffer, alumnoId]
        );
      } finally {
        connection.release();
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Foto subida exitosamente a la base de datos' 
    });

  } catch (error) {
    console.error('Error subiendo archivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

