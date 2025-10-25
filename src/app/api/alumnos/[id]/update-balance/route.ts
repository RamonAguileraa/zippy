import { NextRequest, NextResponse } from 'next/server';
import { updateDineroDisponible } from '../../../../../../lib/alumnos';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'ID de alumno inválido. Debe ser un número entero positivo.' },
        { status: 400 }
      );
    }

    const { newBalance } = await request.json();
    if (typeof newBalance !== 'number' || newBalance < 0) {
      return NextResponse.json(
        { error: 'Saldo inválido' },
        { status: 400 }
      );
    }

    const success = await updateDineroDisponible(id, newBalance);
    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar el saldo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      newBalance,
      message: 'Saldo actualizado exitosamente' 
    });
  } catch (error) {
    console.error('Error actualizando saldo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
