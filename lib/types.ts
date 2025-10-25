// Tipos para el sistema de alumnos
export interface Alumno {
  id_usuario: number;  // Integer ID (max 4 digits: 1-9999)
  NombreCompleto: string;
  dinero_disponible: number;
  CodigoQR: string;  // Integer ID as string (for QR scanning)
  fecha_movimiento: Date;
  Foto_perfil?: string;
}

// Interface for localStorage users (simplified structure)
export interface LocalStorageUser {
  id_usuario: number;  // Integer ID (max 4 digits: 1-9999)
  nombre: string;
  grado: string;
  saldo: number;
  CodigoQR: string;  // Integer ID as string
  fecha_movimiento: string;
}

export interface AlumnoConFoto extends Alumno {
  foto_url?: string;
}

