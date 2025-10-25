'use client';

import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const startScanner = async () => {
      try {
        if (videoRef.current) {
          // Crear instancia del QR Scanner
          qrScannerRef.current = new QrScanner(
            videoRef.current,
            (result) => {
              try {
                console.log('🔍 QR Code detectado por el escáner:', result.data);
                console.log('📄 Tipo de dato:', typeof result.data);
                console.log('📏 Longitud:', result.data.length);
                console.log('📝 Contenido completo:', JSON.stringify(result.data));
                
                // Validar que el resultado tenga contenido
                if (result.data && result.data.trim().length > 0) {
                  onScan(result.data);
                  stopScanner();
                } else {
                  console.warn('⚠️ QR Code vacío o inválido');
                }
              } catch (error) {
                console.error('❌ Error procesando QR Code:', error);
              }
            },
            {
              onDecodeError: (error) => {
                // No mostrar errores de decodificación, es normal que no detecte constantemente
                console.log('Buscando código QR...');
              },
              highlightScanRegion: true,
              highlightCodeOutline: true,
            }
          );

          // Iniciar el escáner
          await qrScannerRef.current.start();
          setHasPermission(true);
          setIsScanning(true);
        }
      } catch (err) {
        console.error('Error iniciando QR Scanner:', err);
        setError('No se pudo acceder a la cámara. Verifica los permisos.');
        setHasPermission(false);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScan]);

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const handleManualInput = () => {
    const qrCode = prompt('Ingresa el código QR del alumno (ej: QR001, QR002, etc.):');
    if (qrCode && qrCode.trim()) {
      console.log('📝 Código ingresado manualmente:', qrCode.trim());
      console.log('📄 Tipo de dato:', typeof qrCode.trim());
      console.log('📏 Longitud:', qrCode.trim().length);
      onScan(qrCode.trim());
      handleClose();
    }
  };

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold mb-4 text-black">📱 Error de Cámara</h3>
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <p className="text-black font-bold mb-4">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-black">📱 Escanear Código QR</h3>
        <div className="text-center">
          <div className="relative bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              playsInline
              muted
              autoPlay
            />
            <div className="absolute inset-0 border-4 border-green-500 rounded-lg pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
            </div>
          </div>
          <p className="text-black font-bold mb-4">
            Apunta la cámara al código QR del alumno
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleManualInput}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              📝 Ingresar Manualmente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
