'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AlumnoConFoto } from '../../../../lib/types';
import QRScanner from '../../../components/QRScanner';

export default function TiendaPage() {
  const params = useParams();
  const alumnoId = parseInt(params.id as string);
  
  const [alumno, setAlumno] = useState<AlumnoConFoto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => {
    if (alumnoId) {
      fetchAlumno();
    }
  }, [alumnoId]);

  const fetchAlumno = async () => {
    try {
      const response = await fetch(`/api/alumnos/${alumnoId}`);
      if (!response.ok) {
        throw new Error('Error al cargar el alumno');
      }
      const data = await response.json();
      setAlumno(data);
      setCurrentBalance(Number(data.dinero_disponible) || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = async () => {
    const amount = parseFloat(addAmount);
    if (amount && amount > 0) {
      const newBalance = currentBalance + amount;
      setIsUpdating(true);
      
      try {
        // Actualizar en la base de datos primero
        const response = await fetch(`/api/alumnos/${alumnoId}/update-balance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newBalance })
        });
        
        if (!response.ok) {
          throw new Error('Error al actualizar en la base de datos');
        }
        
        // Solo actualizar el estado local si la BD se actualizó correctamente
        setCurrentBalance(newBalance);
        showSuccessAnimation('💰');
        setShowAddModal(false);
        setAddAmount('');
      } catch (error) {
        console.error('Error actualizando saldo:', error);
        showInlineMessage('Error al actualizar el saldo en la base de datos', 'error');
      } finally {
        setIsUpdating(false);
      }
    } else {
      showInlineMessage('Por favor ingresa una cantidad válida', 'error');
    }
  };

  const handleCharge = async () => {
    const amount = parseFloat(chargeAmount);
    if (amount && amount > 0) {
      if (amount <= currentBalance) {
        const newBalance = currentBalance - amount;
        setIsUpdating(true);
        
        try {
          // Actualizar en la base de datos primero
          const response = await fetch(`/api/alumnos/${alumnoId}/update-balance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newBalance })
          });
          
          if (!response.ok) {
            throw new Error('Error al actualizar en la base de datos');
          }
          
          // Solo actualizar el estado local si la BD se actualizó correctamente
          setCurrentBalance(newBalance);
          showSuccessAnimation('🛒');
          setShowChargeModal(false);
          setChargeAmount('');
        } catch (error) {
          console.error('Error actualizando saldo:', error);
          showInlineMessage('Error al actualizar el saldo en la base de datos', 'error');
        } finally {
          setIsUpdating(false);
        }
      } else {
        showSuccessAnimation('❌');
        setTimeout(() => {
          showInlineMessage('¡Saldo insuficiente! El alumno necesita más dinero.', 'error');
        }, 500);
      }
    } else {
      showInlineMessage('Por favor ingresa una cantidad válida', 'error');
    }
  };

  const showSuccessAnimation = (emoji: string) => {
    const animation = document.createElement('div');
    animation.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 100px;
      z-index: 2000;
      animation: successPop 2s ease;
      pointer-events: none;
    `;
    animation.textContent = emoji;
    document.body.appendChild(animation);
    
    setTimeout(() => {
      document.body.removeChild(animation);
    }, 2000);
  };

  const showInlineMessage = (message: string, type: string) => {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'error' ? '#ff6b6b' : '#38ef7d'};
      color: white;
      padding: 15px 25px;
      border-radius: 15px;
      font-weight: bold;
      z-index: 3000;
      animation: slideDown 0.3s ease;
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
      document.body.removeChild(messageDiv);
    }, 3000);
  };

  const handleQRScan = async (qrCode: string) => {
    try {
      console.log('QR Code escaneado en tienda (raw):', qrCode);
      
      let codigoQR = '';
      
      try {
        // Intentar parsear como JSON primero
        const data = JSON.parse(qrCode);
        codigoQR = String(data.CodigoQR || data.id_usuario || qrCode).trim();
        console.log('Datos JSON parseados:', data);
        console.log('Código QR extraído:', codigoQR);
      } catch (error) {
        // Si no es JSON válido, usar el texto directamente
        codigoQR = qrCode.trim();
        console.log('No es JSON, usando texto directo:', codigoQR);
      }
      
      // Buscar el alumno por código QR
      const response = await fetch('/api/alumnos');
      if (!response.ok) {
        throw new Error('Error al cargar los alumnos');
      }
      const alumnos = await response.json();
      
      console.log('Alumnos disponibles:', alumnos.map((a: AlumnoConFoto) => ({ id: a.id_usuario, codigo: a.CodigoQR, codigoString: String(a.CodigoQR).trim() })));
      console.log('Buscando código:', codigoQR);
      
      // Buscar el alumno con el código QR escaneado (normalizando valores)
      const alumnoEncontrado = alumnos.find((alumno: AlumnoConFoto) => String(alumno.CodigoQR).trim() === codigoQR);
      
      console.log('Alumno encontrado:', alumnoEncontrado);
      
      if (alumnoEncontrado) {
        // Redirigir a la página de tienda del nuevo alumno usando su ID
        window.location.href = `/tienda/${alumnoEncontrado.id_usuario}`;
      } else {
        alert(`Código QR no reconocido: "${codigoQR}". Por favor, escanea un código válido.`);
      }
    } catch (error) {
      console.error('Error buscando alumno:', error);
      alert('Error al buscar el alumno. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando alumno...</p>
        </div>
      </div>
    );
  }

  if (error || !alumno) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <p className="text-red-600 mb-4">{error || 'Alumno no encontrado'}</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Volver al Panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes backgroundShift {
          0% { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          100% { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        }
        
        @keyframes containerBounce {
          0% { transform: scale(0.8) translateY(-50px); opacity: 0; }
          50% { transform: scale(1.05) translateY(0); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        
        @keyframes sparkleMove {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes logoSpin {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
        }
        
        @keyframes textGlow {
          0% { text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
          100% { text-shadow: 2px 2px 20px rgba(255,255,255,0.8); }
        }
        
        @keyframes photoFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        
        @keyframes nameShine {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }
        
        @keyframes balancePulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.02); }
        }
        
        @keyframes coinRain {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes amountBounce {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        
        @keyframes buttonFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes buttonPress {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        
        @keyframes modalFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes modalSlideIn {
          0% { transform: translate(-50%, -70%) scale(0.8); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        
        @keyframes successPop {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        }
        
        @keyframes slideDown {
          0% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        
        body {
          box-sizing: border-box;
          margin: 0;
          padding: 20px;
          font-family: 'Comic Sans MS', cursive, Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          height: 100%;
          min-height: 100%;
          animation: backgroundShift 10s ease-in-out infinite alternate;
        }
        
        html {
          height: 100%;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 25px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          min-height: calc(100% - 40px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: containerBounce 2s ease-out;
        }
        
        .header {
          background: linear-gradient(45deg, #ff6b6b, #feca57);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '⭐✨🌟✨⭐';
          position: absolute;
          top: -10px;
          left: -100%;
          font-size: 20px;
          animation: sparkleMove 3s linear infinite;
        }
        
        .logo-placeholder {
          width: 60px;
          height: 60px;
          background: linear-gradient(45deg, #ff9a9e, #fecfef);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          animation: logoSpin 4s ease-in-out infinite;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .header-text {
          font-size: 28px;
          font-weight: bold;
          color: white;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          animation: textGlow 2s ease-in-out infinite alternate;
        }
        
        .main-content {
          flex: 1;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
          background: linear-gradient(180deg, #fff 0%, #f8f9ff 100%);
        }
        
        .student-photo {
          width: 140px;
          height: 140px;
          background: linear-gradient(45deg, #ff9a9e, #fecfef, #ffecd2);
          border: 5px solid #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: #666;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          animation: photoFloat 3s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }
        
        .student-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
        
        .student-name {
          font-size: 32px;
          font-weight: bold;
          text-align: center;
          color: #000;
          padding: 15px 25px;
          border-radius: 20px;
          background-color: #f0f8ff;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          animation: nameShine 2s ease-in-out infinite alternate;
        }
        
        .balance-section {
          background: linear-gradient(45deg, #56ab2f, #a8e6cf);
          padding: 25px;
          text-align: center;
          border-radius: 20px;
          min-width: 280px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          animation: balancePulse 2s ease-in-out infinite alternate;
          position: relative;
          overflow: hidden;
        }
        
        .balance-section::before {
          content: '💰💎💰💎💰';
          position: absolute;
          top: -5px;
          left: -100%;
          font-size: 16px;
          animation: coinRain 4s linear infinite;
        }
        
        .balance-label {
          font-size: 20px;
          color: white;
          margin-bottom: 10px;
          font-weight: bold;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        .balance-amount {
          font-size: 36px;
          font-weight: bold;
          color: white;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          animation: amountBounce 1s ease-in-out infinite alternate;
        }
        
        .action-buttons {
          display: flex;
          gap: 30px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .action-button {
          border: none;
          padding: 25px 35px;
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
          min-width: 200px;
          text-align: center;
          border-radius: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          animation: buttonFloat 3s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }
        
        .action-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255,255,255,0.3);
          border-radius: 50%;
          transition: all 0.5s ease;
          transform: translate(-50%, -50%);
        }
        
        .action-button:hover::before {
          width: 300px;
          height: 300px;
        }
        
        .action-button:hover {
          transform: translateY(-10px) scale(1.05);
          box-shadow: 0 15px 35px rgba(0,0,0,0.3);
        }
        
        .action-button:active {
          transform: translateY(-5px) scale(0.98);
          animation: buttonPress 0.2s ease;
        }
        
        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .action-button:disabled:hover {
          transform: none;
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }
        
        .add-balance {
          background: linear-gradient(45deg, #11998e, #38ef7d);
          color: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        .charge-purchase {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        .footer {
          background: linear-gradient(45deg, #ffecd2, #fcb69f);
          padding: 15px;
          text-align: center;
          font-size: 14px;
          color: #000;
          font-weight: bold;
        }
        
        @media (max-width: 768px) {
          .footer div {
            flex-direction: column;
            text-align: center;
          }
          
          .footer a {
            margin-top: 10px;
          }
        }
        
        .modal {
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.8);
          z-index: 1000;
          animation: modalFadeIn 0.3s ease;
        }
        
        .modal-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 40px;
          border-radius: 25px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          animation: modalSlideIn 0.5s ease;
          max-width: 400px;
          width: 90%;
        }
        
        .modal h2 {
          color: #000;
          margin-bottom: 20px;
          font-size: 24px;
          font-weight: bold;
        }
        
        .amount-input {
          font-size: 24px;
          padding: 15px;
          border: 3px solid #ddd;
          border-radius: 15px;
          text-align: center;
          width: 150px;
          margin: 20px 0;
          font-family: inherit;
          color: #000;
          font-weight: bold;
        }
        
        .modal-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 25px;
        }
        
        .modal-button {
          padding: 15px 25px;
          border: none;
          border-radius: 15px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .confirm-btn {
          background: linear-gradient(45deg, #11998e, #38ef7d);
          color: white;
        }
        
        .cancel-btn {
          background: linear-gradient(45deg, #ff6b6b, #feca57);
          color: white;
        }
        
        .modal-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        @media (max-width: 768px) {
          .action-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .action-button {
            width: 100%;
            max-width: 300px;
          }
          
          .header {
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }
          
          .student-name {
            font-size: 28px;
          }
          
          .modal-content {
            padding: 30px 20px;
          }
        }
      `}</style>

      <main className="container">
        {/* Header Section */}
        <header className="header">
          <div className="logo-placeholder">
            🏫
          </div>
          <div>
            <h1 className="header-text">✅ ¡Escaneo exitoso!</h1>
            <button 
              onClick={fetchAlumno}
              className="text-white text-sm bg-black bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30 transition-all"
              disabled={isUpdating}
            >
              🔄 Refrescar datos
            </button>
          </div>
        </header>
        
        {/* Main Content */}
        <section className="main-content">
          {/* Student Photo */}
          <div className="student-photo">
            <Image
              src={alumno.foto_url || '/zippy logo.png'}
              alt={`Foto de ${alumno.NombreCompleto}`}
              width={140}
              height={140}
              className="w-full h-full object-cover rounded-full"
              style={{ borderRadius: '50%' }}
            />
          </div>
          
          {/* Student Name */}
          <div className="student-name">
            {alumno.NombreCompleto}
          </div>
          
          {/* Balance Section */}
          <div className="balance-section">
            <div className="balance-label">💰 Saldo actual:</div>
            <div className="balance-amount" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image src="/zippy-peso.png" alt="Zippy Peso" width={150} height={150} style={{ display: 'inline-block', marginRight: '20px' }} />
              {(currentBalance || 0).toFixed(2)}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="action-button add-balance" 
              onClick={() => setShowAddModal(true)}
              disabled={isUpdating}
            >
              {isUpdating ? '⏳ Actualizando...' : '🟢 Agregar saldo'}
            </button>
            <button 
              className="action-button charge-purchase" 
              onClick={() => setShowChargeModal(true)}
              disabled={isUpdating}
            >
              {isUpdating ? '⏳ Actualizando...' : '🔵 Cobrar compra'}
            </button>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <button 
              onClick={() => setShowQRScanner(true)}
              style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '15px',
                border: 'none',
                fontWeight: 'bold',
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
              }}
            >
              📱 Escanear otro estudiante
            </button>
            <Link 
              href="/" 
              style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '15px',
                textDecoration: 'none',
                fontWeight: 'bold',
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
              }}
            >
              ← Volver al Panel
            </Link>
          </div>
        </footer>
      </main>

      {/* Add Balance Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>💰 Agregar Saldo</h2>
            <p style={{ color: '#000', fontWeight: 'bold' }}>¿Cuánto dinero quieres agregar?</p>
            <input 
              type="number" 
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              className="amount-input" 
              placeholder="0.00" 
              step="0.01" 
              min="0"
            />
            <div className="modal-buttons">
              <button className="modal-button confirm-btn" onClick={handleAddBalance}>
                ✅ Agregar
              </button>
              <button className="modal-button cancel-btn" onClick={() => setShowAddModal(false)}>
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charge Purchase Modal */}
      {showChargeModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>🛒 Cobrar Compra</h2>
            <p style={{ color: '#000', fontWeight: 'bold' }}>¿Cuánto cuesta el producto?</p>
            <input 
              type="number" 
              value={chargeAmount}
              onChange={(e) => setChargeAmount(e.target.value)}
              className="amount-input" 
              placeholder="0.00" 
              step="0.01" 
              min="0"
            />
            <div className="modal-buttons">
              <button className="modal-button confirm-btn" onClick={handleCharge}>
                💳 Cobrar
              </button>
              <button className="modal-button cancel-btn" onClick={() => setShowChargeModal(false)}>
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </>
  );
}
