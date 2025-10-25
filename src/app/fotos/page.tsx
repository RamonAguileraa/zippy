'use client';

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import Link from "next/link";
import { AlumnoConFoto } from '../../../lib/types';

export default function FotosPage() {
  const [alumnos, setAlumnos] = useState<AlumnoConFoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const fetchAlumnos = async () => {
    try {
      const response = await fetch('/api/alumnos');
      if (!response.ok) {
        throw new Error('Error al cargar los alumnos');
      }
      const data = await response.json();
      setAlumnos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (alumnoId: number, file: File) => {
    setUploading(alumnoId);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alumnoId', alumnoId.toString());

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error subiendo archivo');
      }

      // Actualizar la lista de alumnos
      await fetchAlumnos();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error subiendo archivo');
    } finally {
      setUploading(null);
    }
  };

  const handleFileSelect = (alumnoId: number) => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          handleFileUpload(alumnoId, target.files[0]);
        }
      };
      fileInputRef.current.click();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando alumnos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/zippy logo.png"
                alt="Zippy Logo"
                width={60}
                height={60}
                className="w-15 h-15"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  📸 Gestión de Fotos de Perfil
                </h1>
                <p className="mt-2 text-gray-600">
                  Subir y gestionar las fotos de perfil de los alumnos
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Volver al Panel
            </Link>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">❌</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Alumnos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {alumnos.map((alumno) => (
            <div key={alumno.id_usuario} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col items-center">
                  {/* Foto de Perfil */}
                  <div className="relative mb-4">
                    <Image
                      className="h-24 w-24 rounded-full object-cover border-4 border-gray-200"
                      src={alumno.foto_url || '/zippy logo.png'}
                      alt={`Foto de ${alumno.NombreCompleto}`}
                      width={96}
                      height={96}
                    />
                    {uploading === alumno.id_usuario && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>

                  {/* Información del Alumno */}
                  <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                    {alumno.NombreCompleto}
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    ID: {alumno.id_usuario}
                  </p>

                  {/* Botón de Subir Foto */}
                  <button
                    onClick={() => handleFileSelect(alumno.id_usuario)}
                    disabled={uploading === alumno.id_usuario}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploading === alumno.id_usuario ? 'Subiendo...' : '📷 Cambiar Foto'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input oculto para seleccionar archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        className="hidden"
      />
    </div>
  );
}
