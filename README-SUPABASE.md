# Migración a Supabase PostgreSQL 🚀

Esta guía te ayudará a migrar tu base de datos MySQL a Supabase (PostgreSQL) manteniendo toda la funcionalidad.

## 📋 Requisitos Previos

1. Cuenta en [Supabase](https://supabase.com)
2. Proyecto creado en Supabase
3. Credenciales de base de datos de tu proyecto

## 🔧 Pasos de Configuración

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Crea un nuevo proyecto
3. Anota tus credenciales:
   - Host
   - Puerto (5432)
   - Database name
   - Usuario
   - Contraseña

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Supabase Database
SUPABASE_DB_HOST=db.xxxxx.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=tu_contraseña
SUPABASE_DB_SSL=true

# Desactivar modo demo para usar base de datos real
DEMO_MODE=false
```

### 3. Ejecutar Script de Migración

En Supabase, ve a SQL Editor y ejecuta el contenido de `supabase-migration.sql`:

```sql
-- Copiar y pegar el contenido del archivo supabase-migration.sql
```

### 4. Actualizar el Código para Usar Supabase

El archivo `lib/alumnos.ts` ya está configurado para usar el modo demo por defecto. Para usar Supabase:

1. Cambia `DEMO_MODE = false` en `lib/alumnos.ts`
2. O configura `DEMO_MODE=false` en `.env.local`

### 5. Instalar Dependencias

```bash
npm install
```

## 🔄 Cambios Principales MySQL → PostgreSQL

### Diferencias de Sintaxis:

| MySQL | PostgreSQL |
|-------|------------|
| `AUTO_INCREMENT` | `SERIAL` |
| `LONGBLOB` | `BYTEA` |
| `datetime` | `TIMESTAMP` |
| `current_timestamp()` | `CURRENT_TIMESTAMP` |

### Funciones SQL:

- MySQL: `pool.execute()`
- PostgreSQL: `pool.query()` (mismo uso)

## 🧪 Probar la Conexión

Agrega este código temporal en `lib/alumnos.ts`:

```typescript
import { testConnection } from './database-supabase';

// Probar conexión
testConnection();
```

## 📊 Estructura de la Tabla

```sql
CREATE TABLE usuarios_tb (
  id_usuario SERIAL PRIMARY KEY,
  NombreCompleto VARCHAR(50) NOT NULL,
  dinero_disponible DECIMAL(11,2) NOT NULL DEFAULT 0,
  CodigoQR VARCHAR(20) NOT NULL,
  fecha_movimiento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tasa_interes DECIMAL(11,2) NOT NULL DEFAULT 0,
  Foto_perfil BYTEA
);
```

## 🔐 Seguridad

- **NUNCA** subas el archivo `.env.local` a Git
- Usa variables de entorno en producción
- Configura políticas de RLS en Supabase si es necesario

## 🚀 Despliegue

Para Vercel o Netlify, agrega las variables de entorno en el panel de configuración del proyecto.

## 📝 Notas Importantes

1. El modo demo sigue funcionando por defecto
2. Para activar Supabase: configura `DEMO_MODE=false`
3. Las imágenes (LONGBLOB → BYTEA) funcionan igual
4. Todas las funcionalidades existentes siguen funcionando

## ⚠️ Troubleshooting

### Error: "Connection refused"
- Verifica que el host y puerto sean correctos
- Asegúrate de que Supabase permita conexiones externas

### Error: "Authentication failed"
- Verifica usuario y contraseña
- Genera nueva contraseña en Supabase si es necesario

### Error: "relation does not exist"
- Ejecuta el script `supabase-migration.sql` primero
- Verifica que estés usando la base de datos correcta

## 🎯 Ventajas de Supabase

- ✅ Hosting gratuito
- ✅ Base de datos PostgreSQL potente
- ✅ Backup automático
- ✅ Interfaz web para gestionar datos
- ✅ APIs REST automáticas
- ✅ Autenticación incluida

---

**¿Necesitas ayuda?** Revisa la [documentación de Supabase](https://supabase.com/docs)
