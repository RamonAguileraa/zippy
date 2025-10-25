import { AlumnoConFoto } from './types';

// Datos demo en memoria
const demoAlumnos: AlumnoConFoto[] = [
  {
    id_usuario: 1,
    NombreCompleto: 'Juan Pérez García',
    dinero_disponible: 150.50,
    CodigoQR: '1',
    fecha_movimiento: new Date(),
    foto_url: '/zippy logo.png'
  },
  {
    id_usuario: 2,
    NombreCompleto: 'María López González',
    dinero_disponible: 200.00,
    CodigoQR: '2',
    fecha_movimiento: new Date(),
    foto_url: '/zippy logo.png'
  },
  {
    id_usuario: 3,
    NombreCompleto: 'Carlos Rodríguez Martínez',
    dinero_disponible: 75.25,
    CodigoQR: '3',
    fecha_movimiento: new Date(),
    foto_url: '/zippy logo.png'
  },
  {
    id_usuario: 4,
    NombreCompleto: 'Ana Martínez Sánchez',
    dinero_disponible: 300.00,
    CodigoQR: '4',
    fecha_movimiento: new Date(),
    foto_url: '/zippy logo.png'
  },
  {
    id_usuario: 5,
    NombreCompleto: 'Pedro González Fernández',
    dinero_disponible: 50.00,
    CodigoQR: '5',
    fecha_movimiento: new Date(),
    foto_url: '/zippy logo.png'
  }
];

let nextId = 6;

// Simular operaciones con datos en memoria
export async function getAllAlumnosDemo(): Promise<AlumnoConFoto[]> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 100));
  return [...demoAlumnos];
}

export async function getAlumnoByIdDemo(id: number): Promise<AlumnoConFoto | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return demoAlumnos.find(a => a.id_usuario === id) || null;
}

export async function updateDineroDisponibleDemo(id: number, nuevoMonto: number): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const alumno = demoAlumnos.find(a => a.id_usuario === id);
  if (alumno) {
    alumno.dinero_disponible = nuevoMonto;
    alumno.fecha_movimiento = new Date();
    return true;
  }
  return false;
}

export async function createAlumnoDemo(
  nombreCompleto: string,
  dineroInicial: number
): Promise<AlumnoConFoto> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const nuevoAlumno: AlumnoConFoto = {
    id_usuario: nextId++,
    NombreCompleto: nombreCompleto,
    dinero_disponible: dineroInicial,
    CodigoQR: (nextId - 1).toString(),
    fecha_movimiento: new Date(),
    foto_url: '/zippy logo.png'
  };
  demoAlumnos.push(nuevoAlumno);
  return nuevoAlumno;
}
