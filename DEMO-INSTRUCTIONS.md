# 🎯 Instrucciones para Demostración en Vivo

## Datos de Prueba Listos
- **Jesús Emilio Zubía Valdez** (ID: 13) con **100 monedas**
- Otros alumnos demo con diferentes saldos

## Pasos para la Demostración

### 1. Iniciar la Aplicación
```bash
npm run dev
```
- La aplicación estará en `http://localhost:3000`
- Verás el banner "MODO DEMO" en la parte superior

### 2. Demostrar Funcionalidad de Fotos
1. **Buscar al alumno**: Busca "Jesús Emilio" en la lista
2. **Subir foto**: 
   - Haz clic en el botón de editar/actualizar foto
   - Selecciona una imagen del niño (JPG, PNG, GIF)
   - La foto se guardará en memoria
3. **Verificar foto**: 
   - La foto aparecerá inmediatamente en la interfaz
   - Se mantendrá durante toda la sesión
4. **Gestión de fotos**: 
   - Ir a la página "Gestión de Fotos" (/fotos)
   - Ver todas las fotos de los alumnos
   - Cambiar fotos desde ahí

### 3. Demostrar Transacciones
1. **Ver saldo**: Jesús Emilio tiene 100 monedas
2. **Simular compra**: 
   - Ir a la tienda del alumno
   - Hacer una compra (ej: -20 monedas)
   - Ver el saldo actualizado
3. **Ver historial**: Mostrar el movimiento de dinero

### 4. Funcionalidades Adicionales
- **Crear nuevo alumno**: Con foto y saldo inicial
  - Al crear un alumno nuevo, seleccionar foto
  - La foto se guarda automáticamente en memoria
  - Se muestra inmediatamente en la lista de alumnos
- **Escanear QR**: Usar el código QR del alumno
- **Gestión de fotos**: Subir, ver, cambiar fotos

## Características del Modo Demo
✅ **Datos en memoria**: Se mantienen durante la sesión  
✅ **Fotos funcionales**: Se suben y muestran correctamente  
✅ **Transacciones reales**: Los cambios se reflejan inmediatamente  
✅ **Sin base de datos**: Todo funciona sin conexión a BD  
✅ **Reset automático**: Al reiniciar se pierden los cambios (comportamiento demo)

## Notas Importantes
- Las fotos se guardan en memoria (se pierden al reiniciar)
- Los datos demo están pre-cargados
- La aplicación funciona completamente offline
- Perfecto para demostraciones en vivo

## Troubleshooting
- Si no aparece la foto: refrescar la página
- Si hay errores: verificar que esté en modo demo
- Para reset completo: reiniciar el servidor
