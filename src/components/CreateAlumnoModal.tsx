'use client';

import { useState, useRef } from 'react';
import QRCode from 'qrcode';

interface CreateAlumnoModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAlumnoModal({ onClose, onSuccess }: CreateAlumnoModalProps) {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    dineroInicial: '',
    grado: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('El archivo es demasiado grande. Máximo 5MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Send to API first (let database generate the ID with AUTO_INCREMENT)
      const formDataToSend = new FormData();
      formDataToSend.append('nombreCompleto', formData.nombreCompleto);
      formDataToSend.append('dineroInicial', formData.dineroInicial);
      
      if (selectedFile) {
        formDataToSend.append('foto', selectedFile);
      }

      console.log("Enviando datos a la API para crear usuario...");

      const response = await fetch('/api/alumnos', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error creando el alumno');
      }

      console.log("Usuario creado en la base de datos:", result);

      // Get the generated ID from the database response
      const userId = result.id_usuario;
      const qrCodeString = userId.toString();
      
      // Create user data for QR code (with the real ID from database)
      const userData = {
        id_usuario: userId,
        CodigoQR: qrCodeString, // Include CodigoQR for QR scanning
        nombre: formData.nombreCompleto,
        grado: formData.grado || 'N/A',
        saldo: parseFloat(formData.dineroInicial)
      };

      console.log("Creando QR con ID real de la base de datos:", userData);

      // Generate QR code with the user data
      const qrCodeDataURL = await generateQRCode(userData);
      setGeneratedQR(qrCodeDataURL);
      setShowQR(true);

      // Save to localStorage with the real ID as CodigoQR
      saveToLocalStorage(userData, qrCodeString);

      // Don't close immediately, show QR code first
      // onSuccess(); // This will be called after user sees QR
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseWithSuccess = () => {
    setShowQR(false);
    setGeneratedQR(null);
    onSuccess();
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const generateQRCode = async (userData: { id_usuario: number; CodigoQR: string; nombre: string; grado: string; saldo: number }) => {
    try {
      const qrData = JSON.stringify(userData);
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Error generando código QR');
    }
  };

  const saveToLocalStorage = (userData: { id_usuario: number; CodigoQR: string; nombre: string; grado: string; saldo: number }, qrCodeString: string) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem('zippy_users') || '[]');
      const userWithQR = {
        ...userData,
        CodigoQR: qrCodeString,  // Store the real ID from database as string
        fecha_movimiento: new Date().toISOString()
      };
      existingUsers.push(userWithQR);
      localStorage.setItem('zippy_users', JSON.stringify(existingUsers));
      
      console.log("Nuevo usuario guardado:", userWithQR);
      console.log("Usuarios en localStorage:", existingUsers);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-black">👤 Crear Nuevo Alumno</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre Completo */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Ej: Juan Pérez García"
            />
          </div>

          {/* Dinero Inicial */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Dinero Inicial (Zippy Pesos) *
            </label>
            <input
              type="number"
              name="dineroInicial"
              value={formData.dineroInicial}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="0.00"
            />
          </div>

          {/* Grado */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Grado (Opcional)
            </label>
            <input
              type="text"
              name="grado"
              value={formData.grado}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Ej: 3A, 4B, 5C"
            />
          </div>

          {/* Foto de Perfil */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Foto de Perfil (Opcional)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleFileSelect}
                className="bg-gray-100 text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                📷 Seleccionar Foto
              </button>
              {selectedFile && (
                <span className="text-sm text-green-600">
                  ✓ {selectedFile.name}
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message and QR Code Display */}
          {showQR && generatedQR && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="mb-3">
                <p className="text-lg font-semibold text-green-800 mb-2">
                  ✅ Usuario creado con éxito
                </p>
                <p className="text-sm text-green-700">
                  Código QR generado automáticamente
                </p>
              </div>
              
              {/* QR Code Container */}
              <div id="qrContainer" className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-green-300">
                  <img 
                    src={generatedQR} 
                    alt="Código QR del usuario" 
                    className="w-48 h-48 rounded-lg"
                  />
                </div>
              </div>
              
              <p className="text-xs text-green-600 mb-3">
                Este código QR contiene los datos del usuario y se ha guardado automáticamente.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            {!showQR ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? '⏳ Creando...' : '✅ Crear Alumno'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleCloseWithSuccess}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                ✅ Finalizar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
