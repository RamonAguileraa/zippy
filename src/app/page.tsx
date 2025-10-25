'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { AlumnoConFoto } from '../../lib/types';
import QRScanner from '../components/QRScanner';
import CreateAlumnoModal from '../components/CreateAlumnoModal';

export default function Home() {
  const [alumnos, setAlumnos] = useState<AlumnoConFoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedAlumno, setScannedAlumno] = useState<AlumnoConFoto | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const fetchAlumnos = async () => {
    try {
      console.log('🔄 Cargando alumnos desde la API...');
      const response = await fetch('/api/alumnos');
      if (!response.ok) {
        throw new Error('Error al cargar los alumnos');
      }
      const data = await response.json();
      console.log('📊 Datos recibidos de la API:', data);
      console.log('📋 Alumnos cargados:', data.map((a: AlumnoConFoto) => ({ id: a.id_usuario, codigo: a.CodigoQR, nombre: a.NombreCompleto })));
      setAlumnos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  const CurrencyDisplay = ({ amount }: { amount: number }) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Image src="/zippy-peso.png" alt="Zippy Peso" width={20} height={20} style={{ display: 'inline-block' }} />
      <span>{formatCurrency(amount)}</span>
    </span>
  );

  const handleQRCode = (qrCode: string) => {
    console.log('🔍 QR Code escaneado (raw):', qrCode);
    console.log('📊 Array de alumnos actual:', alumnos);
    console.log('📋 Cantidad de alumnos cargados:', alumnos.length);
    
    let codigoQR = '';
    
    try {
      // Intentar parsear como JSON primero
      const data = JSON.parse(qrCode);
      codigoQR = String(data.CodigoQR || data.id_usuario || qrCode).trim();
      console.log('📄 Datos JSON parseados:', data);
      console.log('🎯 Código QR extraído:', codigoQR);
    } catch (error) {
      // Si no es JSON válido, usar el texto directamente
      codigoQR = qrCode.trim();
      console.log('⚠️ No es JSON, usando texto directo:', codigoQR);
    }
    
    // Buscar alumno por código QR (normalizando valores)
    console.log('🔍 Buscando alumno con CodigoQR =', codigoQR);
    console.log('📋 Alumnos disponibles para búsqueda:', alumnos.map(a => ({ 
      id: a.id_usuario, 
      codigo: a.CodigoQR, 
      codigoString: String(a.CodigoQR).trim(),
      nombre: a.NombreCompleto,
      tipoCodigo: typeof a.CodigoQR,
      tipoBuscado: typeof codigoQR
    })));
    
    // Normalizar ambos lados para la comparación (trimmed strings)
    const alumno = alumnos.find(a => String(a.CodigoQR).trim() === codigoQR);
    console.log('🎯 Alumno encontrado:', alumno);
    
    if (alumno) {
      console.log('✅ Usuario encontrado, redirigiendo...');
      setScannedAlumno(alumno);
      setShowQRScanner(false);
      // Redirigir a la página de tienda
      window.location.href = `/tienda/${alumno.id_usuario}`;
    } else {
      console.log('❌ Usuario no encontrado');
      alert(`Código QR no reconocido: "${codigoQR}". Por favor, escanea un código válido.`);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchAlumnos}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Logo de fondo */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: 'url(/zippy logo.png?v=1)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />
      {/* Header */}
      <header className="bg-white shadow-sm border-b relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/zippy logo.png?v=1"
                alt="Zippi Logo"
                width={80}
                height={80}
                className="w-20 h-20"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Zippi
                </h1>
                <p className="mt-2 text-gray-600">
                  Aprendiendo Finanzas - Panel del Profesor
                </p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowQRScanner(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                📱 Leer Código QR
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                👤 Crear Alumno
              </button>
              <a
                href="/fotos"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                📸 Gestionar Fotos
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Alumnos</p>
                <p className="text-2xl font-semibold text-gray-900">{alumnos.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Dinero Total</p>
                <p className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Image src="/zippy-peso.png" alt="Zippy Peso" width={100} height={100} style={{ display: 'inline-block', marginRight: '10px' }} />
                  {formatCurrency(alumnos.reduce((sum, alumno) => sum + Number(alumno.dinero_disponible), 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-semibold">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Promedio</p>
                <p className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Image src="/zippy-peso.png" alt="Zippy Peso" width={100} height={100} style={{ display: 'inline-block', marginRight: '10px' }} />
                  {formatCurrency(alumnos.length > 0 ? alumnos.reduce((sum, alumno) => sum + Number(alumno.dinero_disponible), 0) / alumnos.length : 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Alumnos */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Lista de Alumnos</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Foto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dinero Disponible
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Actualización
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alumnos.map((alumno) => (
                  <tr key={alumno.id_usuario} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-12 w-12">
                        <Image
                          className="h-12 w-12 rounded-full object-cover"
                          src={alumno.foto_url || '/zippy logo.png'}
                          alt={`Foto de ${alumno.NombreCompleto}`}
                          width={48}
                          height={48}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {alumno.NombreCompleto}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${
                        Number(alumno.dinero_disponible) > 0 ? 'text-green-600' : 
                        Number(alumno.dinero_disponible) === 0 ? 'text-gray-600' : 'text-red-600'
                      } flex items-center`}>
                        <Image src="/zippy-peso.png" alt="Zippy Peso" width={80} height={80} style={{ display: 'inline-block', marginRight: '10px' }} />
                        {formatCurrency(Number(alumno.dinero_disponible))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(alumno.fecha_movimiento).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScan={handleQRCode}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* Create Alumno Modal */}
      {showCreateModal && (
        <CreateAlumnoModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchAlumnos(); // Refrescar la lista
          }}
        />
      )}
    </div>
  );
}
