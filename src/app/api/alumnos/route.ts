import { NextRequest, NextResponse } from 'next/server';
import { getAllAlumnos, createAlumno } from '../../../../lib/alumnos';

export async function GET(request: NextRequest) {
  try {
    const alumnos = await getAllAlumnos();
    return NextResponse.json(alumnos);
  } catch (error) {
    console.error('Error en API alumnos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los alumnos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const nombreCompleto = data.get('nombreCompleto') as string;
    const dineroInicial = parseFloat(data.get('dineroInicial') as string);
    const fotoFile = data.get('foto') as File | null;

    // Validaciones
    if (!nombreCompleto || isNaN(dineroInicial)) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    if (dineroInicial < 0) {
      return NextResponse.json(
        { error: 'El dinero inicial no puede ser negativo' },
        { status: 400 }
      );
    }

    let fotoBuffer: Buffer | undefined;
    if (fotoFile) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(fotoFile.type)) {
        return NextResponse.json(
          { error: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF' },
          { status: 400 }
        );
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (fotoFile.size > maxSize) {
        return NextResponse.json(
          { error: 'El archivo es demasiado grande. Máximo 5MB' },
          { status: 400 }
        );
      }

      const bytes = await fotoFile.arrayBuffer();
      fotoBuffer = Buffer.from(bytes);
    }

    // Create alumno without specifying ID (let database AUTO_INCREMENT handle it)
    const nuevoAlumno = await createAlumno(nombreCompleto, dineroInicial, fotoBuffer);
    
    if (!nuevoAlumno) {
      return NextResponse.json(
        { error: 'Error creando el alumno' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id_usuario: nuevoAlumno.id_usuario, // Return the generated ID
      alumno: nuevoAlumno,
      message: 'Alumno creado exitosamente'
    });

  } catch (error) {
    console.error('Error creando alumno:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
