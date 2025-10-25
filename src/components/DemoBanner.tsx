'use client';

// Mostrar banner solo en modo demo
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

export default function DemoBanner() {
  // No mostrar en producción si no está en modo demo
  if (!DEMO_MODE && process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 text-center text-sm font-semibold shadow-lg">
      <span className="inline-flex items-center gap-2">
        <span className="animate-pulse">🔧</span>
        <span>MODO DEMO - Datos simulados para demostración</span>
        <span className="text-xs opacity-75">Los cambios se mantendrán durante la sesión</span>
      </span>
    </div>
  );
}
