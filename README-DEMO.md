# Zippy - Modo Demo 🎯

Sistema de gestión financiera escolar con datos simulados para demostración.

## ✨ Características del Modo Demo

- **Datos pre-cargados**: 5 alumnos de ejemplo listos para usar
- **Funcionalidad completa**: Todas las características funcionan sin base de datos
- **Cambios en sesión**: Los cambios se mantienen durante la sesión del navegador
- **Sin configuración**: Listo para usar inmediatamente

## 🚀 Inicio Rápido

### Instalación y Build

```bash
# Instalar dependencias
npm install

# Crear build de producción
npm run build

# Ejecutar en producción
npm start

# O ejecutar en desarrollo
npm run dev
```

### Modo Demo vs Base de Datos

Por defecto, el sistema está configurado en **modo demo** (sin base de datos).

Para usar la base de datos real:
1. Configura tu base de datos en `lib/database.ts`
2. Cambia `DEMO_MODE = false` en `lib/alumnos.ts`
3. Ejecuta `database-setup.sql` para crear las tablas

## 🎮 Funcionalidades Disponibles

### ✅ Panel Principal
- Ver lista de todos los alumnos
- Ver saldos actuales
- Escanear códigos QR para acceder a tienda

### ✅ Tienda del Alumno
- Agregar saldo
- Cobrar compras
- Escanear otro estudiante
- Refrescar datos

### ✅ Gestión de Fotos
- Subir fotos de perfil
- Ver todas las fotos

### ✅ Crear Nuevo Alumno
- Agregar nombre completo
- Establecer saldo inicial
- Generar código QR automático

## 📊 Datos Demo Pre-cargados

1. **Juan Pérez García** - Saldo: $150.50
2. **María López González** - Saldo: $200.00
3. **Carlos Rodríguez Martínez** - Saldo: $75.25
4. **Ana Martínez Sánchez** - Saldo: $300.00
5. **Pedro González Fernández** - Saldo: $50.00

Todos tienen códigos QR desde 1 hasta 5 respectivamente.

## 🔄 Códigos QR Demo

Para escanear códigos QR de prueba, puedes usar los archivos en la raíz del proyecto:
- `qr-prueba.png`
- `qr-simple-prueba.png`

O usar cualquier lector de QR con estos códigos:
- Código "1" para Juan Pérez García
- Código "2" para María López González
- etc.

## 🎨 Banner Demo

El banner superior indica claramente cuando estás en modo demo con datos simulados.

## 📝 Notas Importantes

- Los cambios en modo demo **NO se guardan** permanentemente
- Al refrescar la página, los datos vuelven a sus valores originales
- Para persistencia, configura la base de datos real
- Perfecto para demostraciones y pruebas

## 🚀 Despliegue

Listo para desplegar en:
- **Vercel**: `vercel --prod`
- **Netlify**: Subir carpeta `.next` 
- **Cualquier hosting Node.js**: Ejecutar `npm start`

---

**¿Preguntas?** Revisa `database-config.example.md` para configuración de base de datos real.
