import { NextRequest, NextResponse } from 'next/server';
import { getAlumnoById } from '../../../../../lib/alumnos';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de alumno inválido' },
        { status: 400 }
      );
    }

    const alumno = await getAlumnoById(id);
    if (!alumno) {
      return NextResponse.json(
        { error: 'Alumno no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(alumno);
  } catch (error) {
    console.error('Error en API alumno individual:', error);
    return NextResponse.json(
      { error: 'Error al obtener el alumno' },
      { status: 500 }
    );
  }
}
