# 💰 Sistema de Gestión de Dinero de Alumnos

Sistema web para que profesores puedan visualizar y gestionar el dinero disponible de cada alumno, incluyendo la gestión de fotos de perfil.

## 🚀 Características

- **Panel del Profesor**: Visualización completa del dinero de todos los alumnos
- **Gestión de Fotos**: Subida y gestión de fotos de perfil de alumnos
- **Estadísticas**: Total de dinero, promedio por alumno, etc.
- **Interfaz Responsive**: Funciona en desktop y móvil
- **Base de Datos MySQL**: Configuración flexible

## 📋 Requisitos

- Node.js 18+
- MySQL ejecutándose en puerto 3310
- npm o yarn

## 🛠️ Instalación

1. **Clonar e instalar dependencias:**
```bash
npm install
```

2. **Configurar la base de datos:**
   - Asegúrate de que MySQL esté ejecutándose en el puerto 3310
   - Ejecuta el script `database-setup.sql` en tu base de datos MySQL
   - O crea manualmente la base de datos `educacionnin` con la estructura de la tabla `usuarios_tb`

3. **Configurar conexión a la base de datos:**
   - Edita `lib/database.ts` si necesitas cambiar la configuración
   - Por defecto: host=localhost, port=3310, user=root, password='', database=educacionnin

4. **Ejecutar la aplicación:**
```bash
npm run dev
```

5. **Abrir en el navegador:**
   - Ve a [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
├── lib/
│   ├── database.ts          # Configuración de conexión a BD
│   ├── types.ts            # Tipos TypeScript
│   └── alumnos.ts          # Funciones de base de datos
├── src/app/
│   ├── api/
│   │   ├── alumnos/        # API para obtener alumnos
│   │   └── upload/         # API para subir fotos
│   ├── fotos/              # Página de gestión de fotos
│   └── page.tsx            # Página principal
├── public/
│   └── uploads/profiles/    # Carpeta para fotos de perfil
└── database-setup.sql      # Script de configuración de BD
```

## 🔧 Configuración de Base de Datos

### Configuración Actual
- **Host**: localhost
- **Puerto**: 3310
- **Usuario**: root
- **Contraseña**: (vacía)
- **Base de datos**: educacionnin

### Para modificar la configuración:
Edita el archivo `lib/database.ts` y cambia los valores en `dbConfig`.

## 📸 Gestión de Fotos

- Las fotos se guardan en `public/uploads/profiles/`
- Formatos permitidos: JPG, PNG, GIF
- Tamaño máximo: 5MB
- Nombres únicos generados automáticamente

## 🎯 Funcionalidades

### Panel Principal
- Lista de todos los alumnos con su dinero disponible
- Estadísticas generales (total, promedio, cantidad de alumnos)
- Fotos de perfil de cada alumno
- Formato de moneda en euros

### Gestión de Fotos
- Subir fotos de perfil para cada alumno
- Vista previa de fotos actuales
- Interfaz intuitiva con botones grandes

## 🚀 Despliegue

Para producción, asegúrate de:
1. Configurar variables de entorno para la base de datos
2. Configurar un servidor web para servir archivos estáticos
3. Configurar SSL para seguridad

## 📝 Notas

- La aplicación está optimizada para profesores
- Interfaz limpia y fácil de usar
- Compatible con dispositivos móviles
- Sistema de carga de archivos robusto
